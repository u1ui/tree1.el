# &lt;u1-tree1&gt; - element
Treeview component

## Features

- Keyboard navigation
- Focus on the next item that starts with the pressed key
- Expand/collapse events
- Lazy loading of children

## Ussage

```html
<u1-tree1 aria-expanded=true>root
    <u1-tree1>Folder 1
        <u1-tree1>File 1.1</u1-tree1>
    </u1-tree1>
    <u1-tree1>Folder 3
        <u1-tree1>File 3.1</u1-tree1>
        <u1-tree1>File 3.2</u1-tree1>
    </u1-tree1>
</u1-tree1>
```

```css
u1-tree1::part(row):hover {
    background:#00000004;
}
u1-tree1[aria-selected=true]::part(row) {
    background:#00000008;
}
u1-tree1::part(row):focus {
    outline:1px dotted;
}
```

## API

### Javascript

```js
el.select();
el.toggleExpand(true/false);
el.path(); // returns path to element
el.root(); // returns root element of the tree-item
```

### Attributes

#### aria-expanded
This will initialy expand the tree:
```<u1-tree1 aria-expanded="true">...</u1-tree1>```

This is either not expandable or like aria-expanded="false" if it has children.
`<u1-tree1></u1-tree1>

#### aria-live
`<u1-tree1 aria-live></u1-tree1>`
This indicates, that the node has to be loaded.  
The `u1-tree1-collapse` event will get a property `event.load(promise)` to load their children.

### Events

#### expand / collapse
```js
treeElement.addEventListener('u1-tree1-expand', (e) => {
    e.load && e.load(promise);
});
treeElement.addEventListener('u1-tree1-collapse', (e) => {...});
```

#### select
```js
treeElement.addEventListener('u1-tree1-select', (e) => { ... });
```

### CSS

| Selector | Description |
|:----|:-----|
| u1-tree1::part(row) | The row of the tree-item |
| u1-tree1[aria-selected=true] | Item when selected |
| u1-tree1:focus | Item has focus |

## Install

```html
<link href="https://cdn.jsdelivr.net/gh/u1ui/tree1.el@1.4.1/tree1.min.css" rel=stylesheet>
<script src="https://cdn.jsdelivr.net/gh/u1ui/tree1.el@1.4.1/tree1.min.js" type=module>
```

## Demos

[custom.html](http://gcdn.li/u1ui/tree1.el@main/tests/custom.html)  
[minimal.html](http://gcdn.li/u1ui/tree1.el@main/tests/minimal.html)  
[test.html](http://gcdn.li/u1ui/tree1.el@main/tests/test.html)  

## Todo

Ask me if you need it!
- Add support for multiple selection
- Drag and drop

## About

- MIT License, Copyright (c) 2022 <u1> (like all repositories in this organization) <br>
- Suggestions, ideas, finding bugs and making pull requests make us very happy. ♥

