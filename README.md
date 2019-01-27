> As of version `1.0.0` this library exposes ES modules. Use an ES module aware transpiler such as Webpack, Rollup or Browserify + babelify to bundle it for the browser.

# drag-tabs

[![Build Status](https://travis-ci.org/bpmn-io/drag-tabs.svg?branch=master)](https://travis-ci.org/bpmn-io/drag-tabs)

A tiny utility that makes tabs inside a container draggable.

<img src="https://raw.githubusercontent.com/bpmn-io/drag-tabs/master/screencast.gif" alt="drag-tabs in action" height="50">


## Features

* Makes elements inside a drag container draggable
* Supports ignored elements
* Emits `drag`, `start`, `cancel` and `end` events
* Does not perform actual dragging
* Singleton (per element)


## How it Works

Given you got an element with the following HTML markup:

```javascript
var $el = (
  <div>
    <ul class="my-tabs-container">
      <li class="my-tab"></li>
      <li class="my-tab"></li>
      <li class="my-tab ignore-me"></li>
    </ul>
  </div>
);
```

Create the dragger:

```javascript
var dragger = dragTabs($el, {
  selectors: {
    tabsContainer: '.my-tabs-container',
    tab: '.my-tab',
    ignore: '.ignore-me'
  }
});
```

Listen to drag events emitted via the `DragTabs` instance and use the updates to move the tabs to the appropriate position:

```javascript
dragger.on('drag', function(context) {
    var dragTab = context.dragTab,
        newIdx = context.newIdx;

  // move the tab to the new position
});

// move the tab to the initial position
dragger.on('cancel', function(context) {});
```


## Emitted Events

The `DragTabs` instance is an event emitter that fires the following events:

- `start`: tab dragging starts
- `drag`: fired on every position update
- `end`: always fired at the end of the drag
- `cancel`: only fired when the dragging is canceled

The events `drag`, `end` and `cancel` are emitted with the following context:

```js
{
  dragTab: {HTMLElement},
  newIndex: {Number}
}
```

The event `start` is fired with the following context:

```js
{
  dragTab: {HTMLElement},
  initialIndex: {Number}
}
```


## Manually Update Dragger

To trigger a manual update on the `DragTabs` instance, i.e. because the displayed tabs change call `DragTabs#update`:

```javascript
dragger.update();
```


## How to Test

```
npm run test
```

## License

MIT
