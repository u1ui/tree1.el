
customElements.define('u1-tree', class extends HTMLElement {
    constructor() {
        super();

        this._focus = null;

        this.addEventListener('click',e=>{
            if (!getSelection()?.isCollapsed) return;
            this.toggleExpand(e.target);
            this.setFocus(e.target);
            this.setSelected(e.target);
        });
        this.addEventListener('keydown',e=>{
            if (!this._focus) return;
            if (e.key === 'ArrowUp') this.setFocus( this.getPrevFocusableOf(this._focus) );
            if (e.key === 'ArrowDown') this.setFocus( this.getNextFocusableOf(this._focus) );
            if (e.key === 'ArrowRight') {
                !this.isExpanded(this._focus) ? this.toggleExpand(this._focus, true) : this.setFocus( this.getNextFocusableOf(this._focus) );
            }
            if (e.key === 'ArrowLeft') {
                this.isExpanded(this._focus) ? this.toggleExpand(this._focus, false) : this.setFocus( this._focus.parentNode.closest('[role=treeitem]') );
            }
            if (e.key === 'Enter' || e.key === ' ') {
                this.setSelected(this._focus);
            }
        });


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
        /* */

        this.addEventListener('mousedown',e=>{ // prevent dbl-click selection
            if (e.detail >= 2) e.preventDefault();
        });
    }
    connectedCallback() {
        console.log(11)
        this._markup(this);
        let mObs = new MutationObserver(mutations => {
            for (let m of mutations) {
                if (m.type === 'childList') {
                    for (let c of m.addedNodes) {
                        if (c.nodeType === 1) {
                            this._markup(c);
                        }
                    }
                }
            }
        });
        mObs.observe(this, {childList: true});
    }
    _markup(el){
        for (let el of this.querySelectorAll('ul')) {
            el.setAttribute('role', 'group');
            if (el.children.length === 0) {
                el.parentNode.removeAttribute('aria-expanded');
            } else if(!el.parentNode.hasAttribute('aria-expanded')) {
                el.parentNode.setAttribute('aria-expanded','false');
            }
        }
        for (let el of this.querySelectorAll('li')) {
            el.setAttribute('role', 'treeitem');
            !this.hasAttribute('tabindex') && this.setAttribute('tabindex', '-1');
        }
        this.firstElementChild.setAttribute('role', 'tree');
    }
    getNextFocusableOf(item){
        while (item) {
            let next = null;
            if (item.getAttribute('aria-expanded') === 'true') {
                let group = item.querySelector('[role=group]');
                next = group && group.querySelector('[role=treeitem]');
            }
            if (!next) next = item.nextElementSibling;
            if (!next) next = item.parentNode.closest('[role=treeitem]')?.nextElementSibling;
            if (next && next.matches('[role=treeitem]')) return next; // todo: check if it is disabled
            item = next;
        }
    }
    getPrevFocusableOf(item){
        while (item) {
            let next = null;
            if (!next) next = item.previousElementSibling;
            if (next) {
                if (next.getAttribute('aria-expanded') === 'true') {
                    let group = next.querySelector('[role=group]');
                    next = group && group.lastElementChild;
                }
            }
            if (!next) next = item.parentNode.closest('[role=treeitem]');
            if (next && next.matches('[role=treeitem]')) return next; // todo: check if it is disabled
            item = next;
        }
    }
    xgetPrevFocusableOf(item){ // todo
        return this._focus.previousElementSibling || this._focus.parentNode.closest('[role=treeitem]');
    }
    isExpanded(item) {
        return item.getAttribute('aria-expanded') === 'true';
    }
    toggleExpand(item, doit) {
        item = item.closest('[role=treeitem]');
        if (doit == null) doit = !this.isExpanded(item);
        if (item.querySelector('ul > li')) item.setAttribute('aria-expanded', doit?'true':'false');
    }
    setSelected(item) {
        this._selected && this._selected.setAttribute('aria-selected', 'false');
        this._selected = item;
        item.setAttribute('aria-selected', 'true');
    }
    setFocus(item) {
        if (!item) return;
        if (this._focus) {
            this._focus.setAttribute('tabindex', '-1');
            this._focus.classList.remove('focus');
        }
        item.setAttribute('tabindex', '0');
        item.classList.add('focus');
        item.focus();
        this._focus = item;
    }
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
