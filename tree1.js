
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

[part=row] { display:flex; padding:.15em 0; padding-left:calc( var(--indent) * (var(--level) - 1) ); }

.arrow {
    font-weight:normal !important;
    min-width:1.1em;
    text-align:center;
}
.arrow::after { content:'▸'; }
.arrow::after { display:inline-block;  }
:host([aria-expanded=true]) .arrow::after { content:'▾' }
:host(:not([aria-expanded])) .arrow { opacity:0; }
:host([aria-expanded=true][aria-busy=true]) .arrow::after {
    content:'◠'; /* ◝↻⭮⍉🔾◠◡◕◖◝ */
    font-weight:bold;
    animation: spinner .5s linear infinite;
    line-height:1;
    font-size:.8em;
}
@keyframes spinner {
    to { transform:rotate(360deg) }
}

[name=icon] { display:flex; min-width:1.7em; justify-content:center; font-weight:400; }
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
            <slot></slot>
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
                Enter:      ()=> this._select(),
                ' ':        ()=> this._select(),
            }[e.key];

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
        const myLevel = this.root() === this ? 1 : parseInt(this.parentNode.getAttribute('aria-level')) + 1;
        this.setAttribute('aria-level', myLevel);
        this.style.setProperty('--level', myLevel);

        // slot subnodes
        for (const child of this.children) {
            child.tagName === this.tagName && child.setAttribute('slot', 'children');
        }
        this.setAttribute('role', this.root() === this ? 'tree' : 'treeitem');

        // if has children, its expandable
        if (this.items().length && !this.hasAttribute('aria-expanded')) this.setAttribute('aria-expanded', 'false');
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
            if (!next) next = item.nextElementSibling;
            if (!next) next = item.parentNode?.nextElementSibling;
            if (next) return next; // todo: check if it is disabled
            item = next;
        }
    }
    prevFocusable(){
        let item = this;
        while (item) {
            let next = item.previousElementSibling;
            if (next) {
                if (next.isExpanded()) {
                    next = next.items().at(-1);
                }
            }
            if (!next) next = item.parentNode;
            if (next) return next; // todo: check if it is disabled
            item = next;
        }
    }
    isExpanded() {
        return this.getAttribute('aria-expanded') === 'true';
    }
    isExpandable() {
        return this.hasAttribute('aria-expanded') || this.items().length;
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
                }).catch(data=>{
                    console.warn('todo: u1-tree: failed to load')
                });
            }
        }
        this.dispatchEvent(event);

        this.setAttribute('aria-expanded', doit?'true':'false');
    }
    root(){
        return this.parentNode.tagName === this.tagName ? this.parentNode.root() : this;
    }

    select(){
        let old = this.root()._selected;
        if (old) old.setAttribute('aria-selected', 'false');
        this.setAttribute('aria-selected', 'true');
        this.root()._selected = this;
    }
    _select(el){ // like selected but also fires event
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
}

customElements.define('u1-tree1', tree);

/*

    /* * todo
    this.addEventListener('dragover', e => {
        const dropTargets = this.querySelectorAll('[droppable]');
        const el = closestElementVertically(dropTargets, e.clientY);
        el && this.setFocus(el);
    });
    this.addEventListener('dragend', e => {
        const dropTargets = this.querySelectorAll('[droppable]');
        const el = closestElementVertically(dropTargets, e.clientY);
        console.log(e.dataTransfer.mozSourceNode)
        el && el.append( e.dataTransfer.mozSourceNode )
    });




function minDistanceToElementVertically(element, y) {
    let rect = element.getBoundingClientRect();
    return Math.min(Math.abs(rect.top - y), Math.abs(rect.bottom - y));
}

function closestElementVertically(elements, y) {
    let closest = null;
    let minDistance = Infinity;
    for (let el of elements) {
        if (el.nodeType !== 1) continue;
        let distance = minDistanceToElementVertically(el, y);
        if (distance < minDistance) {
            minDistance = distance;
            closest = el;
        }
    }
    return closest;
}
*/