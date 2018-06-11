'use strict';

var domMatches = require('min-dom').matches,
    domDelegate = require('min-dom').delegate,
    domQuery = require('min-dom').query,
    domQueryAll = require('min-dom').queryAll,
    domAttr = require('min-dom').attr;

var forEach = require('min-dash').forEach,
    assign = require('min-dash').assign,
    bind = require('min-dash').bind;

var createEmitter = require('mitt');

var EFFECT_ALLOWED = 'move',
    DROP_EFFECT = 'move';

var THRESHOLD = 30;


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
 * @param  {Number} options.threshold affects when a smaller tab should be dragged over a bigger one
 */
function DragTabs($el, options) {
  // we are an event emitter
  assign(this, createEmitter());

  this.options = options || {};
  this.container = $el;

  this._bindEvents($el);
  this.update();
}


/**
 * Get the current active tab
 *
 * @return {DOMElement}
 */
DragTabs.prototype.getActiveTabNode = function getActiveTabNode() {
  return domQuery(this.options.selectors.active, this.container);
};


/**
 * Get the container all tabs are contained in
 *
 * @return {DOMElement}
 */
DragTabs.prototype.getTabsContainerNode = function getTabsContainerNode() {
  return domQuery(this.options.selectors.tabsContainer, this.container);
};


/**
 * Get all tabs (visible and invisible ones)
 *
 * @return {Array<DOMElement>}
 */
DragTabs.prototype.getAllTabNodes = function getAllTabNodes() {
  return domQueryAll(this.options.selectors.tab, this.container);
};


/**
 * Sets draggable attribute for all tabs.
 * Has ignored tabs into account.
 */
DragTabs.prototype._setDraggable = function _setDraggable() {
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
DragTabs.prototype._bindEvents = function _bindEvents(node) {
  var tabContainerSel = this.options.selectors.tabsContainer;

  domDelegate.bind(node, tabContainerSel, 'dragstart', bind(this._onDragstart, this));

  domDelegate.bind(node, tabContainerSel, 'dragenter', bind(this._preventDefaults, this));
  domDelegate.bind(node, tabContainerSel, 'dragover', bind(this._moveTab, this));
  domDelegate.bind(node, tabContainerSel, 'dragleave', bind(this._preventDefaults, this));

  domDelegate.bind(node, tabContainerSel, 'dragend', bind(this._onDragend, this));

  domDelegate.bind(node, tabContainerSel, 'drop', bind(this._onDrop, this));
};


DragTabs.prototype._preventDefaults = function _preventDefaults(event) {
  event.preventDefault();
  event.stopPropagation();

  return false;
};


/**
 * Takes care of broadcasting the new position of the dragged tab.
 *
 * @param  {DOMEvent} event
 *
 * @return {Boolean} False
 */
DragTabs.prototype._moveTab = function _moveTab(event) {
  var context = this._context,
      threshold = this.options.threshold || THRESHOLD,
      tabContainer = this.getTabsContainerNode();

  var target = event.target,
      dragTab = context.dragTab,
      targetIdx, lowerBounds, upperBounds;

  if (!domAttr(target, 'draggable') || !target.draggable || target === dragTab) {
    return this._preventDefaults(event);
  }

  var diffSize = target.clientWidth - dragTab.clientWidth;

  if (diffSize > 0) {
    diffSize = diffSize / 2;

    lowerBounds = target.offsetLeft + diffSize + threshold;
    upperBounds = target.offsetLeft + target.clientWidth - diffSize - threshold;

    if (Math.max(lowerBounds, event.clientX) === lowerBounds || Math.min(upperBounds, event.clientX) === upperBounds) {
      return this._preventDefaults(event);
    }
  }

  targetIdx = indexOf(tabContainer.children, target);

  context.newIndex = targetIdx;

  this.emit('drag', {
    dragTab: dragTab,
    newIndex: targetIdx
  });

  return this._preventDefaults(event);
};


/**
 * Takes care of setting up the drag context.
 *
 * @param  {DOMEvent} event
 */
DragTabs.prototype._onDragstart = function _onDragstart(event) {
  var container = this.container;

  var tabContainer = this.getTabsContainerNode(),
      target = event.target;

  // disallow the drag on tabs that don't allow it
  if (!target.draggable) {
    return this._preventDefaults(event);
  }

  this._dropped = false;

  this._context = {
    dragTab: target,
    initialIdx: indexOf(tabContainer.children, target)
  };

  // add a class to the container while the dragging is active
  container.classList.add('dragging-active');

  event.dataTransfer.dropEffect = DROP_EFFECT;
  event.dataTransfer.effectAllowed = EFFECT_ALLOWED;
};


/**
 * Makes sure to broadcast the initial dragging tab's position,
 * if the dragging was canceled.
 *
 * @param  {DOMEvent} event
 */
DragTabs.prototype._onDragend = function _onDragend(event) {
  var container = this.container,
      context = this._context,
      dropped = this._dropped;

  // cleanup the added active class
  container.classList.remove('dragging-active');

  this.emit('end', {
    dragTab: context.dragTab,
    newIndex: context.newIndex
  });

  if (dropped) {
    return;
  }

  // on cancel send the relevant information to restore the tab's position
  this.emit('cancel', {
    dragTab: context.dragTab,
    newIndex: context.initialIdx
  });
};


/**
 * Confirms that the dragging was successful.
 *
 * @param  {DOMEvent} event
 */
DragTabs.prototype._onDrop = function _onDrop(event) {
  this._dropped = true;
};


function create($el, options) {

  var dragTabs = get($el);

  if (!dragTabs) {
    dragTabs = new DragTabs($el, options);

    $el.__dragTabs = dragTabs;
  }

  return dragTabs;
}

module.exports = create;


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

/**
 * Getter to retrieve an already initialized drag tabs instance.
 */
module.exports.get = get;



// helpers //////////////////

function indexOf(nodeList, el) {
  return Array.prototype.slice.call(nodeList).indexOf(el);
}