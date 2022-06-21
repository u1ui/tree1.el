# &lt;u1-tree1&gt; - element
treeview component (beta)

## Ussage

```html
<u1-tree1 aria-expanded=true>root
    <u1-tree1 aria-expanded=true>Folder 1
        <u1-tree1>File 1.1</u1-tree1>
        <u1-tree1>File 1.2</u1-tree1>
    </u1-tree1>
    <u1-tree1>Folder 3
        <u1-tree1>File 3.1</u1-tree1>
        <u1-tree1>File 3.2</u1-tree1>
    </u1-tree1>
</u1-tree1>
```

## API

```js
el.select();
el.toggleExpand(true/false);
```

## Install

```html
<link href="https://cdn.jsdelivr.net/gh/u1ui/tree1.el@1.0.0/tree1.min.css" rel=stylesheet>
<script src="https://cdn.jsdelivr.net/gh/u1ui/tree1.el@1.0.0/tree1.min.js" type=module>
```

## Demos

[custom.html](https://raw.githack.com/u1ui/tree1.el/main/tests/custom.html)  
[minimal.html](https://raw.githack.com/u1ui/tree1.el/main/tests/minimal.html)  
[test.html](https://raw.githack.com/u1ui/tree1.el/main/tests/test.html)  

## Settings

### aria-expanded
This will initialy expand the tree:
```<u1-tree1 aria-expanded="true">...</u1-tree1>```

This is either not expandable or like aria-expanded="false" if it has children.
`<u1-tree1></u1-tree1>

### aria-live
`<u1-tree1 aria-live></u1-tree1>`
This indicates, that the node has to be loaded.  
The `u1-tree1-collapse` event will get a property `event.load(promise)` to load their children.

## Events

### expand / collapse
```js
treeElement.addEventListener('u1-tree1-expand', (e) => {
    e.load && e.load(promise);
});
treeElement.addEventListener('u1-tree1-collapse', (e) => {...});
```

### select
```js
treeElement.addEventListener('u1-tree1-select', (e) => { ... });
```

## About

- MIT License, Copyright (c) 2022 <u1> (like all repositories in this organization) <br>
- Suggestions, ideas, finding bugs and making pull requests make us very happy. ♥

