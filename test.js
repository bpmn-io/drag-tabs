import dragTabs from '.';

import {
  domify
} from 'min-dom';


insertCSS('test',
  '.my-tab { display: inline-block; text-align: center; margin-right: 5px; }'
);

var TEST_MARKUP =
  '<div>' +
    '<ul class="my-tabs-container">' +
      '<li class="my-tab i-am-active" style="width: 30px; background: lightblue">A</li>' +
      '<li class="my-tab" style="width: 15px; background: green">B</li>' +
      '<li class="my-tab" style="width: 50px; background: yellow">C</li>' +
      '<li class="my-tab" style="width: 80px; background: orange">D</li>' +
      '<li class="my-tab" style="width: 50px; background: fuchsia">E</li>' +
      '<li class="my-tab" style="width: 80px; background: lightgreen">F</li>' +
      '<li class="my-tab" style="width: 80px; background: lime">G</li>' +
      '<li class="my-tab" style="width: 80px; background: red">H</li>' +
      '<li class="my-tab" style="width: 80px; background: aliceblue">I</li>' +
      '<li class="my-tab" style="width: 80px; background: cadetblue">J</li>' +
      '<li class="my-tab ignore-me" style="width: 80px; background: grey">IGNORE</li>' +
    '</ul>' +
  '</div>';


describe('dragTabs', function() {

  var node;

  beforeEach(function() {
    node = domify(TEST_MARKUP);

    document.body.appendChild(node);
  });


  it('should create dragger', function() {

    // when
    var dragger = dragTabs(node, {
      selectors: {
        tabsContainer: '.my-tabs-container',
        tab: '.my-tab',
        ignore: '.ignore-me',
        active: '.i-am-active'
      }
    });

    // then
    expect(dragger).to.exist;
  });


  it('should create without drag preview', function() {

    // when
    var dragger = dragTabs(node, {
      selectors: {
        tabsContainer: '.my-tabs-container',
        tab: '.my-tab',
        ignore: '.ignore-me',
        active: '.i-am-active'
      },
      showPreview: false
    });

    // then
    expect(dragger).to.exist;
  });


  it('should act as singleton', function() {

    // given
    var dragger = dragTabs(node, {
      selectors: {
        tabsContainer: '.my-tabs-container',
        tab: '.my-tab',
        ignore: '.ignore-me',
        active: '.i-am-active'
      }
    });

    // when
    var cachedDragger = dragTabs(node, false);

    // then
    expect(cachedDragger).to.equal(dragger);
  });


  it('should emit events', function() {

    // given
    var dragger = dragTabs(node, {
      selectors: {
        tabsContainer: '.my-tabs-container',
        tab: '.my-tab',
        ignore: '.ignore-me',
        active: '.i-am-active'
      }
    });

    function logger(name) {

      return function(obj) {
        console.log(name, 'newIndex' in obj ? obj.newIndex : obj.initialIndex);
      };

    }

    function moveTab(event) {
      var newIndex = event.newIndex;
      var dragTab = event.dragTab;

      var parentNode = dragTab.parentNode;

      parentNode.removeChild(dragTab);

      parentNode.insertBefore(dragTab, parentNode.children[newIndex]);
    }

    // then
    expect(function() {
      dragger.on('start', logger('start'));
      dragger.on('drag', logger('drag'));
      dragger.on('end', logger('end'));
      dragger.on('cancel', logger('cancel'));

      dragger.on('drag', moveTab);
      dragger.on('cancel', moveTab);
    }).not.to.throw();

  });


  it('scrolling');

  it('update');

});



// helpers //////////////////////

function insertCSS(name, css) {
  if (document.querySelector('[data-css-file="' + name + '"]')) {
    return;
  }

  var head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');
  style.setAttribute('data-css-file', name);

  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
}