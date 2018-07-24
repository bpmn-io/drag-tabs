import dragTabs from '.';

import {
  domify
} from 'min-dom';

var TEST_MARKUP =
  '<div>' +
    '<ul class="my-tabs-container">' +
      '<li class="my-tab i-am-active" data-id="A" style="display: inline-block">A</li>' +
      '<li class="my-tab" data-id="B" style="display: inline-block">B</li>' +
      '<li class="my-tab" data-id="C" style="display: inline-block">C</li>' +
      '<li class="my-tab" data-id="D" style="display: inline-block">D</li>' +
      '<li class="my-tab" data-id="E" style="display: inline-block">E</li>' +
      '<li class="my-tab ignore-me" data-id="IGNORE" style="display: inline-block">IGNORE</li>' +
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
    var cachedDragger = dragTabs.get(node);

    // then
    expect(cachedDragger).to.equal(dragger);
  });


  it('should allow event registration', function() {

    // given
    var dragger = dragTabs(node, {
      selectors: {
        tabsContainer: '.my-tabs-container',
        tab: '.my-tab',
        ignore: '.ignore-me',
        active: '.i-am-active'
      }
    });

    // then
    expect(function() {
      dragger.on('drag', function() {
        console.log('drag');
      });

      dragger.on('end', function() {
        console.log('end');
      });

      dragger.on('cancel', function() {
        console.log('cancel');
      });
    }).not.to.throw();
  });


  it('scrolling');

  it('update');

});
