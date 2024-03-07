
let css = `

:host {
    display:block;
}
:host([role=tree]) {
    --indent:1rem;
}
:host(:not([aria-expanded=true])) [part=children] {
    display:none;
}
:host([aria-expanded=true]) .arrow::after { content:'▾' }
:host(:not([aria-expanded])) .arrow { opacity:0; }
:host([aria-expanded=true][aria-busy=true]) .arrow::after {
    content:'◠'; /* ◝↻⭮⍉🔾◠◡◕◖◝ */
    font-weight:bold;
    animation: spinner .5s linear infinite;
    line-height:1;
    font-size:.8em;
}

[part=row] {
    display:flex;
    align-items:baseline;
    padding-block: .15em;
    padding-inline-start:calc( var(--indent) * (var(--level) - 1) );
    gap:.3em;
}

.arrow {
    font-weight:normal !important;
    min-width:1.1em;
    text-align:center;
}
.arrow::after { content:'▸'; }
.arrow::after { display:inline-block;  }
@keyframes spinner { to { transform:rotate(360deg) } }

[name=icon] {
    display:flex;
    align-items: center;
    justify-content:center;
    min-inline-size:1.7em;
    font-weight:400;
    align-self:stretch;
}
`;


export class tree extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open', delegatesFocus: true});
        shadow.innerHTML = `
        <style>${css}</style>
        <div part=row tabindex=-1>
            <span class=arrow></span>
            <slot name=icon>📁</slot>
            <slot part=content></slot>
        </div>
        <slot part=children name=children role=group></slot>`

        this.row = shadow.querySelector('[part=row]');

        this.addEventListener('click',e=>{
            if (e.target !== this) return;
            if (!getSelection()?.isCollapsed) return;
            this.toggleExpand();
            this.activeElement = this;
            this._select();
        });
        this.addEventListener('keydown',e=>{
            if (e.target !== this) return;
            let fn = {
                ArrowUp:    ()=> this.prevFocusable()?.setFocus(),
                ArrowDown:  ()=> this.nextFocusable()?.setFocus(),
                ArrowRight: ()=> !this.isExpanded() ? this.toggleExpand(true) : this.nextFocusable()?.setFocus(),
                ArrowLeft:  ()=> this.isExpanded() ? this.toggleExpand(false) : this.parentNode.setFocus?.(),
                Enter:      ()=> {this._select(); this.toggleExpand(); }, // todo toggle?
                ' ':        ()=> this._select(),
                Home:       ()=> this.root().setFocus(),
            }[e.key];
            // focus next where text starts with the key pressed
            const isChar = /^.$/u.test(e.key);
            if (isChar) {
                let current = this.nextFocusable() || this.root();
                while (current && current !== this) {
                    let text = current.shadowRoot.querySelector('[part=content]').assignedNodes().map(item=>item.textContent).join(' ').trim().toLowerCase();
                    if (text.startsWith(e.key)) {
                        current.setFocus();
                        break;
                    }
                    current = current.nextFocusable() || this.root();
                }
            }
            if (fn) {
                fn();
                e.preventDefault();
            }
        });

        this.addEventListener('mousedown',e=>{ // prevent dbl-click selection
            if (e.detail >= 2) e.preventDefault();
        });

        this.childrenObserver = new MutationObserver(mutations=>{
            this._markup();
        }).observe(this, {childList: true});


    }
    connectedCallback() {
        this._markup();
    }
    _markup(){
        // own level
        const root = this.root();
        const myLevel = root === this ? 1 : parseInt(this.parentNode.getAttribute('aria-level')) + 1;
        this.setAttribute('aria-level', myLevel);
        this.style.setProperty('--level', myLevel);

        // slot subnodes
        for (const child of this.children) {
            child.tagName === this.tagName && child.setAttribute('slot', 'children');
        }
        this.setAttribute('role', root === this ? 'tree' : 'treeitem');

        // make it selectable if its the root and no other is selected
        if (root === this && !root._activeElement) {
            this.row.setAttribute('tabindex', '0');
        }

        // if has children, its expandable
        if (!this.hasAttribute('aria-expanded')) {
            if (this.items().length) {
                this.setAttribute('aria-expanded', 'false');
            } else {
                this.removeAttribute('aria-expanded');
            }
        }
    }
    items(){
        return this.shadowRoot.querySelector('[part=children]').assignedElements();
    }
    nextFocusable(){
        let item = this;
        while (item) {
            let next = null;
            if (item.isExpanded()) {
                next = item.items().at(0);
            }
            if (!next) next = item.nextElementSibling; // todo: only next treeitem

            if (!next) {
                while (item.parentNode) {
                    item = item.parentNode;
                    if (item.nextElementSibling) {
                        next = item.nextElementSibling;
                        break;
                    }
                }
            }

            if (next.tagName !== this.tagName) return null;
            if (next) return next;
            item = next;
        }
    }
    prevFocusable(){
        let item = this;
        while (item) {
            let next = item.previousElementSibling; // todo: only next treeitem
            if (next) {
                if (next.isExpanded()) {
                    next = next.items().at(-1);
                }
            }
            if (!next) next = item.parentNode;
            if (next) return next;
            item = next;
        }
    }
    isExpanded() {
        return this.getAttribute('aria-expanded') === 'true';
    }
    isExpandable() {
        const attr = this.getAttribute('aria-expanded');
        return attr === 'true' || attr === 'false' || this.items().length;
    }
    toggleExpand(doit) {
        if (!this.isExpandable()) return;
        if (doit == null) doit = !this.isExpanded();

        const event = new CustomEvent(doit?'u1-tree1-expand':'u1-tree1-collapse', {bubbles: true});
        if (this.getAttribute('aria-live') && this.getAttribute('aria-busy') !== 'true') {
            event.load = promise=>{
                this.setAttribute('aria-busy','true');
                promise.then(data => {
                    this.removeAttribute('aria-live');
                    this.removeAttribute('aria-busy');
                    setTimeout(()=>{ // make unexpandable if no childs
                        !this.items().length && this.removeAttribute('aria-expanded');
                    },100);
                }).catch(data=>{
                    console.warn('todo: u1-tree: failed to load');
                });
            }
        }
        this.dispatchEvent(event);
        this.setAttribute('aria-expanded', doit?'true':'false');
    }
    root(){
        return this.isRoot() ? this : this.parentNode.root();
    }

    select(){
        let old = this.root()._selected;
        if (old) old.setAttribute('aria-selected', 'false');
        this.setAttribute('aria-selected', 'true');
        this.root()._selected = this;
    }
    _select(){ // like selected but also fires event
        const event = new CustomEvent('u1-tree1-select', {bubbles: true});
        this.dispatchEvent(event);
        this.select();
    }

    get activeElement(){
        return this.root()._activeElement;
    }
    set activeElement(el){
        const old = this.root()._activeElement;
        if (old) old.row.setAttribute('tabindex', '-1');
        el.row.setAttribute('tabindex', '0');
        el.row.focus();
        this.root()._activeElement = el;
    }
    setFocus() {
        this.activeElement = this;
    }
    isRoot(){
        return this.parentNode.tagName !== this.tagName;
    }

    path(){
        if (this.isRoot()) return [this];
        return this.parentNode.path().concat(this);
        // return this.isRoot() ? [this] : [...this.parentNode.path(), this];  // as we dont cache, we dont have to make a copy
    }
}

customElements.define('u1-tree1', tree);
