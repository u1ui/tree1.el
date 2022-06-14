


customElements.define('u1-tree1', class extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open', delegatesFocus: true});
        shadow.innerHTML = `
        <div part=row tabindex=-1>
            <span class=spacer></span>
            <span class=arrow></span>
            <slot name=icon>📁</slot>
            <slot></slot>
            <style>
            [part=row] { display:flex; align-items:center; gap:.3rem; outline:0; padding:.2rem 0; }
            .spacer { width:calc(var(--indent) * var(--level)); }
            [name=icon] { margin:0 .4rem; }
            .arrow { font-weight:normal !important; }
            .arrow::after { content:'▸' }
            :host([aria-expanded=true]) .arrow::after { content:'▾' }
            :host(:not([aria-expanded])) .arrow { opacity:0; }
            </style>
        </div>
        <slot part=children name=children role=group></slot>`

        this.row = shadow.querySelector('[part=row]');

        this.addEventListener('click',e=>{
            if (e.target !== this) return;
            if (!getSelection()?.isCollapsed) return;
            this.toggleExpand();
            this.activeElement = this;
            this.selected = this;
        });
        this.addEventListener('keydown',e=>{
            if (e.target !== this) return;

            let fn = {
                ArrowUp:    ()=> this.prevFocusable()?.setFocus(),
                ArrowDown:  ()=> this.nextFocusable()?.setFocus(),
                ArrowRight: ()=> !this.isExpanded() ? this.toggleExpand(true) : this.nextFocusable()?.setFocus(),
                ArrowLeft:  ()=> this.isExpanded() ? this.toggleExpand(false) : this.parentNode.setFocus?.(),
                Enter:      ()=> this.selected = this,
                ' ':        ()=> this.selected = this,
            }[e.key];

            if (fn) {
                fn();
                e.preventDefault();
            }
            /*
            if (e.key === 'ArrowUp')     this.prevFocusable()?.setFocus();
            if (e.key === 'ArrowDown')   this.nextFocusable()?.setFocus();
            if (e.key === 'ArrowRight') !this.isExpanded() ? this.toggleExpand(true) : this.nextFocusable()?.setFocus();
            if (e.key === 'ArrowLeft')   this.isExpanded() ? this.toggleExpand(false) : this.parentNode.setFocus?.();
            if (e.key === 'Enter' || e.key === ' ') this.selected = this;
            */
        });

        this.addEventListener('mousedown',e=>{ // prevent dbl-click selection
            if (e.detail >= 2) e.preventDefault();
        });
    }
    connectedCallback() {
        this._markup();
    }
    _markup(){
        for (const child of this.children) {
            child.tagName === 'U1-TREE1' && child.setAttribute('slot', 'children');
        }
        if (this.items().length === 0) {
            this.removeAttribute('aria-expanded');
        } else if(!this.hasAttribute('aria-expanded')) {
            this.setAttribute('aria-expanded','false');
        }
        this.setAttribute('role', this.root() === this ? 'tree' : 'treeitem');
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
    toggleExpand(doit) {
        if (doit == null) doit = !this.isExpanded();
        this.items().length && this.setAttribute('aria-expanded', doit?'true':'false');
    }
    root(){
        return this.parentNode.tagName === 'U1-TREE1' ? this.parentNode.root() : this;
    }

    get selected(){
        return this.root()._selected;
    }
    set selected(el){
        let old = this.root()._selected;
        if (old) old.setAttribute('aria-selected', 'false');
        el.setAttribute('aria-selected', 'true');
        this.root()._selected = el;
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
});

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