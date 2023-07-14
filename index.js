import {
  matches as domMatches,
  event as domEvent,
  query as domQuery,
  queryAll as domQueryAll,
  attr as domAttr
} from 'min-dom';

import {
  forEach,
  assign,
  bind
} from 'min-dash';

import createEmitter from 'mitt';

var EFFECT_ALLOWED = 'move';
var DROP_EFFECT = 'move';


/**
 * This component provides the infrastructure needed to move tabs around by dragging.
 *
 * It's not this component's responsibility to the actual moving of the tab, but exposing an event based
 * interface that communicates when and where the tab dragging should happen.
 *
 * It makes sure all the tabs inside the intended container are draggable,
 * ignoring the ones that are declared as so.
 *
 * The component is an event emitter and it emits the following events:
 * - 'drag' is fired everytime there is a new position
 * - 'end' is always fired at the end of the drag
 * - 'cancel' is only fired when the dragging is canceled
 *
 * The three events are emitted with the following context:
 *
 * ```js
 * var context = {
 * 	 dragTab: {HTMLElement},
 * 	 newIndex: {Number}
 * };
 * ```
 *
 * @example:
 * (1) provide a tabs-container:
 *
 * var $el = (
 *   <div>
 *     <ul class="my-tabs-container">
 *       <li class="my-tab"></li>
 *       <li class="my-tab"></li>
 *       <li class="my-tab ignore-me"></li>
 *     </ul>
 *   </div>
 * );
 *
 *
 * (2) initialize dragTabs:
 *
 *  var dragger = dragTabs(tabBarNode, {
 *    selectors: {
 *      tabsContainer: '.my-tabs-container',
 *      tab: '.my-tab',
 *      ignore: '.ignore-me'
 *    }
 *  });
 *
 *
 * (3) listen to the drag event:
 *
 * dragger.on('drag', function(context) {
 * 	 var dragTab = context.dragTab,
 * 	 		 newIndex = context.newIndex;
 *
 *   // tab dragging logic
 * });
 *
 *
 * (4) update the dragger if tabs change and or the tab container resizes:
 *
 * dragger.update();
 *
 *
 * @param  {DOMElement} el
 * @param  {Object} options
 * @param  {Object} options.selectors
 * @param  {String} options.selectors.tabsContainer the container all tabs are contained in
 * @param  {String} options.selectors.tab a single tab inside the tab container
 * @param  {String} options.selectors.ignore tabs that should be ignored during scroll left/right
 * @param  {String} [options.showPreview=true] whether to show or hide the drag preview
 */
function DragTabs($el, options) {

  // we are an event emitter
  assign(this, createEmitter());

  this.options = options || {};
  this.$el = $el;

  this._moveTab = bind(this._moveTab, this);

  this._onDragstart = bind(this._onDragstart, this);
  this._onDragend = bind(this._onDragend, this);
  this._onDrop = bind(this._onDrop, this);

  this._init();

  this.update();
}


/**
 * Get the current active tab
 *
 * @return {DOMElement}
 */
DragTabs.prototype.getActiveTabNode = function() {
  return domQuery(this.options.selectors.active, this.$el);
};


/**
 * Get the container all tabs are contained in
 *
 * @return {DOMElement}
 */
DragTabs.prototype.getTabsContainerNode = function() {
  return domQuery(this.options.selectors.tabsContainer, this.$el);
};


/**
 * Get all tabs (visible and invisible ones)
 *
 * @return {Array<DOMElement>}
 */
DragTabs.prototype.getAllTabNodes = function() {
  return domQueryAll(this.options.selectors.tab, this.$el);
};


/**
 * Sets draggable attribute for all tabs.
 * Has ignored tabs into account.
 */
DragTabs.prototype._setDraggable = function() {
  var allTabs = this.getAllTabNodes();

  var ignore = this.options.selectors.ignore;

  forEach(allTabs, function(tabNode) {
    if (domMatches(tabNode, ignore)) {
      domAttr(tabNode, 'draggable', false);
    } else {
      domAttr(tabNode, 'draggable', true);
    }
  });
};


/**
 * React on tab changes from outside.
 */
DragTabs.prototype.update = function() {
  this._setDraggable();
};


/**
 * Binds the necessary dragging events.
 *
 * @param {DOMElement}
 */
DragTabs.prototype._init = function() {
  this._bind('dragstart', this._onDragstart, this.$el);
};

DragTabs.prototype._bind = function(eventName, fn, parent) {
  domEvent.bind(parent || document.body, eventName, fn);
};

DragTabs.prototype._unbind = function(eventName, fn, parent) {
  domEvent.unbind(parent || document.body, eventName, fn);
};


/**
 * Takes care of broadcasting the new position of the dragged tab.
 *
 * @param  {DOMEvent} event
 *
 * @return {Boolean} False
 */
DragTabs.prototype._moveTab = function(event) {
  var context = this._context,
      initialIndex = context.initialIndex,
      tabContainer = this.getTabsContainerNode();

  var currentIndex = 'newIndex' in context ? context.newIndex : initialIndex;

  var target = event.target,
      dragTab = context.dragTab,

      newIndex;

  if (
    !tabContainer.contains(target) ||
    !domAttr(target, 'draggable') ||
    !target.draggable ||
    target === dragTab
  ) {
    return cancelEvent(event);
  }

  // we emit a drag update only if:
  //
  // (1) the actual tab order changed
  // (2) the change is stable, i.e. the tabs would not immediately
  //     swap back (if we drag a smaller element over a bigger one)
  //
  var targetWidth = target.offsetWidth;

  // do not emit drag event, unless the result is stable, i.e. it
  // would not immediately swap back (when dragging a small element
  // over a bigger one)
  var delta = targetWidth - dragTab.offsetWidth;

  var offset;

  if (delta > 0) {
    offset = delta / 2;

    // we'd see a
    if (offset > event.offsetX || (targetWidth - offset) < event.offsetX) {
      return cancelEvent(event);
    }
  }

  newIndex = indexOf(tabContainer.children, target);

  if (newIndex !== currentIndex) {
    context.newIndex = newIndex;

    this.emit('drag', {
      dragTab: dragTab,
      newIndex: newIndex
    });

  }

  return cancelEvent(event);
};


/**
 * Takes care of setting up the drag context.
 *
 * @param  {DOMEvent} event
 */
DragTabs.prototype._onDragstart = function(event) {
  var $el = this.$el;

  var options = this.options;

  var tabContainer = this.getTabsContainerNode(),
      target = event.target;

  // disallow the drag on tabs that don't allow it
  if (!target.draggable) {
    return cancelEvent(event);
  }

  var initialIndex = indexOf(tabContainer.children, target);

  this._context = {
    dragTab: target,
    initialIndex: initialIndex
  };

  this.emit('start', this._context);

  // register drag events
  this._bind('dragenter', cancelEvent);
  this._bind('dragleave', cancelEvent);
  this._bind('dragover', this._moveTab);
  this._bind('dragend', this._onDragend);

  this._bind('drop', this._onDrop);

  // add a class to the dragger el to indicate dragging is active
  $el.classList.add('dragging-active');

  var dataTransfer = event.dataTransfer;

  dataTransfer.dropEffect = DROP_EFFECT;
  dataTransfer.effectAllowed = EFFECT_ALLOWED;

  if (options.showPreview === false && 'setDragImage' in dataTransfer) {
    dataTransfer.setDragImage(emptyImage(), 0, 0);
  }

  // make dragging work in Firefox
  // must be set to 'text' for IE11 compatibility
  event.dataTransfer.setData('text', '');
};


/**
 * Makes sure to broadcast the initial dragging tab's position,
 * if the dragging was canceled.
 *
 * @param {DOMEvent} event
 */
DragTabs.prototype._onDragend = function(event) {
  var $el = this.$el,
      context = this._context,
      dropped = context.dropped;

  // cleanup the added active class
  $el.classList.remove('dragging-active');

  // de-register drag events
  this._unbind('dragenter', cancelEvent);
  this._unbind('dragleave', cancelEvent);
  this._unbind('dragover', this._moveTab);
  this._unbind('dragend', this._onDragend);

  this._unbind('drop', this._onDrop);

  this.emit('end', {
    dragTab: context.dragTab,
    newIndex: context.newIndex
  });

  if (!dropped) {

    // if this is a cancel, send the relevant information
    // to allow listeners to restore the tab's position
    this.emit('cancel', {
      dragTab: context.dragTab,
      newIndex: context.initialIndex
    });
  }

  this._context = null;
};


/**
 * Confirms that the dragging was successful.
 *
 * @param  {DOMEvent} event
 */
DragTabs.prototype._onDrop = function(event) {
  this._context.dropped = true;
};


// exports //////////////////

/**
 * Get or create the dragTabs instance bound to $el.
 *
 * @param {DOMElement} $el
 * @param {Object|Boolean} options
 *
 * @return {DragTabs}
 */
export default function create($el, options) {

  var dragTabs = get($el);

  if (!dragTabs && options !== false) {
    dragTabs = new DragTabs($el, options);

    $el.__dragTabs = dragTabs;
  }

  return dragTabs;
}

/**
 * Return the dragTabs instance that has been previously
 * initialized on the element.
 *
 * @param {DOMElement} $el
 *
 * @return {DragTabs}
 */
function get($el) {
  return $el.__dragTabs;
}



// helpers //////////////////

function indexOf(nodeList, el) {
  return Array.prototype.slice.call(nodeList).indexOf(el);
}

function cancelEvent(event) {
  event.preventDefault();
  event.stopPropagation();

  return false;
}

function emptyImage() {
  var img = document.createElement('img');
  img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  return img;
}