(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.interface = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// Everything we need to include goes here and is fed to browserify in the gulpfile.js
var lib = {
  Interface: require('./interface.js'),
  Panel: require('./panel.js'),
  Slider: require('./slider.js')
};

module.exports = lib;

},{"./interface.js":2,"./panel.js":3,"./slider.js":4}],2:[function(require,module,exports){
'use strict';

var Interface = {
  widgets: [],
  layoutManager: null,
  getMode: function getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse';
  }
};

module.exports = Interface;

},{}],3:[function(require,module,exports){
'use strict';

var gui = require('./interface.js'),
    Panel = void 0;

Panel = {
  defaults: {
    fullscreen: false
  },

  create: function create() {
    var props = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    var panel = Object.create(this);

    // default: full window interface
    if (props === null) {

      Object.assign(panel, Panel.defaults, {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        __x: 0,
        __y: 0,
        __width: null,
        __height: null,
        fullscreen: true,
        children: []
      });

      panel.div = Panel.__createHTMLElement();
      panel.layout();

      var body = document.querySelector('body');
      body.appendChild(panel.div);
    }

    return panel;
  },
  __createHTMLElement: function __createHTMLElement() {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.display = 'block';

    return div;
  },
  layout: function layout() {
    if (this.fullscreen) {
      this.__width = window.innerWidth;
      this.__height = window.innerHeight;
      this.__x = this.x * this.__width;
      this.__y = this.y * this.__height;

      this.div.style.width = this.__width + 'px';
      this.div.style.height = this.__height + 'px';
      this.div.style.left = this.__x + 'px';
      this.div.style.top = this.__y + 'px';
    }
  },
  getWidth: function getWidth() {
    return this.__width;
  },
  getHeight: function getHeight() {
    return this.__height;
  },
  add: function add(widget) {
    // check to make sure widget has not been already added
    if (this.children.indexOf(widget) === -1) {
      this.div.appendChild(widget.canvas);
      this.children.push(widget);
    } else {
      throw Error('Widget is already added to panel.');
    }
  }
};

module.exports = Panel;

},{"./interface.js":2}],4:[function(require,module,exports){
'use strict';

var gui = require('./interface.js'),
    Widget = require('./widget.js'),
    Slider = Object.create(Widget);

// value changes can be processed by filters
// flexible targeting(?) system
// theming?
// unit tests

Object.assign(Slider, {
  defaults: {
    __value: .5, // always 0-1, not for end-users
    value: .5, // end-user value that may be filtered
    background: 'black',
    fill: 'grey',
    active: false,
    style: 'horizontal'
  },

  create: function create(props) {
    var container = arguments.length <= 1 || arguments[1] === undefined ? window : arguments[1];

    var slider = Object.create(this);

    Object.assign(slider, Widget.defaults, Slider.defaults, props);

    // inherited from widget, places canvas obj on screen
    slider.init(container);
    slider.draw();

    // bind event handlers to slider instance
    slider.__mousemove = slider.__mousemove.bind(slider);
    slider.__mouseup = slider.__mouseup.bind(slider);

    return slider;
  },
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.background;
    this.ctx.fillRect(0, 0, this.__width, this.__height);

    // draw fill (slider value representation)
    this.ctx.fillStyle = this.fill;

    if (this.style === 'horizontal') this.ctx.fillRect(0, 0, this.__width * this.__value, this.__height);else this.ctx.fillRect(0, this.__height * this.__value, this.__width, this.__height);
  },
  __mousedown: function __mousedown(e) {
    this.active = true;
    window.addEventListener('mousemove', this.__mousemove);
    window.addEventListener('mouseup', this.__mouseup);
  },
  __mouseup: function __mouseup(e) {
    this.active = false;
    window.removeEventListener('mousemove', this.__mousemove);
    window.removeEventListener('mouseup', this.__mouseup);
  },
  __mousemove: function __mousemove(e) {
    if (this.active) {
      var prevValue = this.__value;

      if (this.style === 'horizontal') {
        this.__value = (e.clientX - this.rect.left) / this.__width;
      } else {
        this.__value = (e.clientY - this.rect.top) / this.__height;
      }

      if (this.__value > 1) this.__value = 1;
      if (this.__value < 0) this.__value = 0;

      if (prevValue !== this.__value) this.draw();
    }
  }
});

module.exports = Slider;

},{"./interface.js":2,"./widget.js":5}],5:[function(require,module,exports){
'use strict';

var ijs = require('./interface.js');

var Widget = {

  defaults: {
    x: 0, y: 0, width: .25, height: .25,
    attached: false
  },

  init: function init() {
    var container = arguments.length <= 0 || arguments[0] === undefined ? window : arguments[0];

    var shouldUseTouch = ijs.getMode() === 'touch';

    this.container = container;
    this.canvas = this.createCanvas();
    this.ctx = this.canvas.getContext('2d');
    //this.ctx.scale( window.devicePixelRatio, window.devicePixelRatio )

    this.applyHandlers(shouldUseTouch);
    this.place();

    return this;
  },
  createCanvas: function createCanvas() {
    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.display = 'block';

    return canvas;
  },


  // use CSS to position canvas element of widget
  place: function place() {
    var containerWidth = this.container.getWidth(),
        containerHeight = this.container.getHeight(),
        width = containerWidth * this.width,
        height = containerHeight * this.height,
        x = containerWidth * this.x,
        y = containerHeight * this.y;

    if (!this.attached) {
      this.container.add(this);
      this.attached = true;
    }

    this.__width = width;
    this.__height = height;

    this.canvas.width = width;
    this.canvas.style.width = width + 'px';
    this.canvas.height = height;
    this.canvas.style.height = height + 'px';
    this.canvas.style.left = x;
    this.canvas.style.top = y;

    this.rect = this.canvas.getBoundingClientRect();
  },
  applyHandlers: function applyHandlers() {
    var _this = this;

    var shouldUseTouch = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var handlers = shouldUseTouch ? Widget.handlers.touch : Widget.handlers.mouse;

    // widgets have ijs defined handlers stored in the _events array,
    // and user-defined events stored with 'on' prefixes (e.g. onclick, onmousedown)

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var _loop = function _loop() {
        var handlerName = _step.value;

        _this.canvas.addEventListener(handlerName, function (event) {
          //if( handlerName !== 'mousemove' ) console.log( event )
          if (typeof _this['__' + handlerName] === 'function') _this['__' + handlerName](event);
          if (typeof _this['on' + handlerName] === 'function') _this['on' + handlerName](event);
        });
      };

      for (var _iterator = handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  },


  handlers: {
    mouse: ['mousedown'],
    touch: []
  }
};

module.exports = Widget;

},{"./interface.js":2}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL2ludGVyZmFjZS5qcyIsImpzL3BhbmVsLmpzIiwianMvc2xpZGVyLmpzIiwianMvd2lkZ2V0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FDQ0EsSUFBSSxNQUFNO0FBQ1IsYUFBVyxRQUFTLGdCQUFULENBREg7QUFFUixTQUFPLFFBQVMsWUFBVCxDQUZDO0FBR1IsVUFBUSxRQUFTLGFBQVQ7QUFIQSxDQUFWOztBQU1BLE9BQU8sT0FBUCxHQUFpQixHQUFqQjs7Ozs7QUNQQSxJQUFJLFlBQVk7QUFDZCxXQUFRLEVBRE07QUFFZCxpQkFBYyxJQUZBO0FBR2QsU0FIYyxxQkFHSjtBQUNSLFdBQU8sa0JBQWtCLFNBQVMsZUFBM0IsR0FBNkMsT0FBN0MsR0FBdUQsT0FBOUQ7QUFDRDtBQUxhLENBQWhCOztBQVFBLE9BQU8sT0FBUCxHQUFpQixTQUFqQjs7Ozs7QUNSQSxJQUFJLE1BQU0sUUFBUyxnQkFBVCxDQUFWO0FBQUEsSUFDSSxjQURKOztBQUdBLFFBQVE7QUFDTixZQUFVO0FBQ1IsZ0JBQVc7QUFESCxHQURKOztBQUtOLFFBTE0sb0JBS2lCO0FBQUEsUUFBZixLQUFlLHlEQUFQLElBQU87O0FBQ3JCLFFBQUksUUFBUSxPQUFPLE1BQVAsQ0FBZSxJQUFmLENBQVo7OztBQUdBLFFBQUksVUFBVSxJQUFkLEVBQXFCOztBQUVuQixhQUFPLE1BQVAsQ0FBZSxLQUFmLEVBQXNCLE1BQU0sUUFBNUIsRUFBc0M7QUFDcEMsV0FBRSxDQURrQztBQUVwQyxXQUFFLENBRmtDO0FBR3BDLGVBQU0sQ0FIOEI7QUFJcEMsZ0JBQU8sQ0FKNkI7QUFLcEMsYUFBSyxDQUwrQjtBQU1wQyxhQUFLLENBTitCO0FBT3BDLGlCQUFTLElBUDJCO0FBUXBDLGtCQUFTLElBUjJCO0FBU3BDLG9CQUFZLElBVHdCO0FBVXBDLGtCQUFVO0FBVjBCLE9BQXRDOztBQWFB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Ozs7OztBQURvQztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLFlBTTNCLFdBTjJCOztBQU9sQyxjQUFLLE1BQUwsQ0FBWSxnQkFBWixDQUE4QixXQUE5QixFQUEyQyxpQkFBUzs7QUFFbEQsY0FBSSxPQUFPLE1BQU0sT0FBTyxXQUFiLENBQVAsS0FBc0MsVUFBMUMsRUFBdUQsTUFBTSxPQUFPLFdBQWIsRUFBNEIsS0FBNUI7QUFDdkQsY0FBSSxPQUFPLE1BQU0sT0FBTyxXQUFiLENBQVAsS0FBdUMsVUFBM0MsRUFBeUQsTUFBTSxPQUFPLFdBQWIsRUFBNEIsS0FBNUI7QUFDMUQsU0FKRDtBQVBrQzs7QUFNcEMsMkJBQXdCLFFBQXhCLDhIQUFtQztBQUFBO0FBTWxDO0FBWm1DO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFjckMsR0F0RVU7OztBQXdFWCxZQUFVO0FBQ1IsV0FBTyxDQUNMLFdBREssQ0FEQztBQUlSLFdBQU87QUFKQztBQXhFQyxDQUFiOztBQWdGQSxPQUFPLE9BQVAsR0FBaUIsTUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gRXZlcnl0aGluZyB3ZSBuZWVkIHRvIGluY2x1ZGUgZ29lcyBoZXJlIGFuZCBpcyBmZWQgdG8gYnJvd3NlcmlmeSBpbiB0aGUgZ3VscGZpbGUuanNcbmxldCBsaWIgPSB7XG4gIEludGVyZmFjZTogcmVxdWlyZSggJy4vaW50ZXJmYWNlLmpzJyApLFxuICBQYW5lbDogcmVxdWlyZSggJy4vcGFuZWwuanMnICksXG4gIFNsaWRlcjogcmVxdWlyZSggJy4vc2xpZGVyLmpzJyApXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGliXG4iLCJsZXQgSW50ZXJmYWNlID0ge1xuICB3aWRnZXRzOltdLFxuICBsYXlvdXRNYW5hZ2VyOm51bGwsXG4gIGdldE1vZGUoKSB7XG4gICAgcmV0dXJuICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA/ICd0b3VjaCcgOiAnbW91c2UnXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmZhY2VcbiIsImxldCBndWkgPSByZXF1aXJlKCAnLi9pbnRlcmZhY2UuanMnICksXG4gICAgUGFuZWxcblxuUGFuZWwgPSB7XG4gIGRlZmF1bHRzOiB7XG4gICAgZnVsbHNjcmVlbjpmYWxzZVxuICB9LFxuXG4gIGNyZWF0ZSggcHJvcHMgPSBudWxsICkge1xuICAgIGxldCBwYW5lbCA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIC8vIGRlZmF1bHQ6IGZ1bGwgd2luZG93IGludGVyZmFjZVxuICAgIGlmKCBwcm9wcyA9PT0gbnVsbCApIHtcbiAgICAgICAgXG4gICAgICBPYmplY3QuYXNzaWduKCBwYW5lbCwgUGFuZWwuZGVmYXVsdHMsIHtcbiAgICAgICAgeDowLFxuICAgICAgICB5OjAsXG4gICAgICAgIHdpZHRoOjEsXG4gICAgICAgIGhlaWdodDoxLFxuICAgICAgICBfX3g6IDAsXG4gICAgICAgIF9feTogMCxcbiAgICAgICAgX193aWR0aDogbnVsbCxcbiAgICAgICAgX19oZWlnaHQ6bnVsbCxcbiAgICAgICAgZnVsbHNjcmVlbjogdHJ1ZSxcbiAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICB9KVxuICAgICAgXG4gICAgICBwYW5lbC5kaXYgPSBQYW5lbC5fX2NyZWF0ZUhUTUxFbGVtZW50KClcbiAgICAgIHBhbmVsLmxheW91dCgpXG5cbiAgICAgIGxldCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJ2JvZHknIClcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoIHBhbmVsLmRpdiApXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhbmVsXG4gIH0sXG4gIFxuICBfX2NyZWF0ZUhUTUxFbGVtZW50KCkge1xuICAgIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApXG4gICAgZGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICAgIGRpdi5zdHlsZS5kaXNwbGF5ICA9ICdibG9jaydcbiAgICBcbiAgICByZXR1cm4gZGl2XG4gIH0sXG5cbiAgbGF5b3V0KCkge1xuICAgIGlmKCB0aGlzLmZ1bGxzY3JlZW4gKSB7XG4gICAgICB0aGlzLl9fd2lkdGggID0gd2luZG93LmlubmVyV2lkdGhcbiAgICAgIHRoaXMuX19oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgIHRoaXMuX194ICAgICAgPSB0aGlzLnggKiB0aGlzLl9fd2lkdGhcbiAgICAgIHRoaXMuX195ICAgICAgPSB0aGlzLnkgKiB0aGlzLl9faGVpZ2h0XG5cbiAgICAgIHRoaXMuZGl2LnN0eWxlLndpZHRoICA9IHRoaXMuX193aWR0aCArICdweCdcbiAgICAgIHRoaXMuZGl2LnN0eWxlLmhlaWdodCA9IHRoaXMuX19oZWlnaHQgKyAncHgnXG4gICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ICAgPSB0aGlzLl9feCArICdweCdcbiAgICAgIHRoaXMuZGl2LnN0eWxlLnRvcCAgICA9IHRoaXMuX195ICsgJ3B4J1xuICAgIH1cbiAgfSxcblxuICBnZXRXaWR0aCgpICB7IHJldHVybiB0aGlzLl9fd2lkdGggfSxcbiAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5fX2hlaWdodCB9LFxuXG4gIGFkZCggd2lkZ2V0ICkge1xuICAgIC8vIGNoZWNrIHRvIG1ha2Ugc3VyZSB3aWRnZXQgaGFzIG5vdCBiZWVuIGFscmVhZHkgYWRkZWRcbiAgICBpZiggdGhpcy5jaGlsZHJlbi5pbmRleE9mKCB3aWRnZXQgKSA9PT0gLTEgKSB7XG4gICAgICB0aGlzLmRpdi5hcHBlbmRDaGlsZCggd2lkZ2V0LmNhbnZhcyApXG4gICAgICB0aGlzLmNoaWxkcmVuLnB1c2goIHdpZGdldCApXG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBFcnJvciggJ1dpZGdldCBpcyBhbHJlYWR5IGFkZGVkIHRvIHBhbmVsLicgKVxuICAgIH1cbiAgfSxcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhbmVsIFxuIiwibGV0IGd1aSAgICA9IHJlcXVpcmUoICcuL2ludGVyZmFjZS5qcycgKSxcbiAgICBXaWRnZXQgPSByZXF1aXJlKCAnLi93aWRnZXQuanMnICksXG4gICAgU2xpZGVyID0gT2JqZWN0LmNyZWF0ZSggV2lkZ2V0ICkgXG5cbi8vIHZhbHVlIGNoYW5nZXMgY2FuIGJlIHByb2Nlc3NlZCBieSBmaWx0ZXJzXG4vLyBmbGV4aWJsZSB0YXJnZXRpbmcoPykgc3lzdGVtXG4vLyB0aGVtaW5nP1xuLy8gdW5pdCB0ZXN0c1xuXG5PYmplY3QuYXNzaWduKCBTbGlkZXIsIHtcbiAgZGVmYXVsdHM6IHtcbiAgICBfX3ZhbHVlOi41LCAvLyBhbHdheXMgMC0xLCBub3QgZm9yIGVuZC11c2Vyc1xuICAgIHZhbHVlOi41LCAgIC8vIGVuZC11c2VyIHZhbHVlIHRoYXQgbWF5IGJlIGZpbHRlcmVkXG4gICAgYmFja2dyb3VuZDonYmxhY2snLFxuICAgIGZpbGw6J2dyZXknLFxuICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgc3R5bGU6J2hvcml6b250YWwnXG4gIH0sXG4gIFxuICBjcmVhdGUoIHByb3BzLCBjb250YWluZXIgPSB3aW5kb3cgKSB7XG4gICAgbGV0IHNsaWRlciA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggc2xpZGVyLCBXaWRnZXQuZGVmYXVsdHMsIFNsaWRlci5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgLy8gaW5oZXJpdGVkIGZyb20gd2lkZ2V0LCBwbGFjZXMgY2FudmFzIG9iaiBvbiBzY3JlZW5cbiAgICBzbGlkZXIuaW5pdCggY29udGFpbmVyIClcbiAgICBzbGlkZXIuZHJhdygpXG4gICAgXG4gICAgLy8gYmluZCBldmVudCBoYW5kbGVycyB0byBzbGlkZXIgaW5zdGFuY2VcbiAgICBzbGlkZXIuX19tb3VzZW1vdmUgPSBzbGlkZXIuX19tb3VzZW1vdmUuYmluZCggc2xpZGVyIClcbiAgICBzbGlkZXIuX19tb3VzZXVwICAgPSBzbGlkZXIuX19tb3VzZXVwLmJpbmQoIHNsaWRlciApXG5cbiAgICByZXR1cm4gc2xpZGVyXG4gIH0sXG5cbiAgZHJhdygpIHtcbiAgICAvLyBkcmF3IGJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwwLHRoaXMuX193aWR0aCwgIHRoaXMuX19oZWlnaHQgKVxuXG4gICAgLy8gZHJhdyBmaWxsIChzbGlkZXIgdmFsdWUgcmVwcmVzZW50YXRpb24pXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5maWxsXG5cbiAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvcml6b250YWwnIClcbiAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLDAsIHRoaXMuX193aWR0aCAqIHRoaXMuX192YWx1ZSwgdGhpcy5fX2hlaWdodCApXG4gICAgZWxzZVxuICAgICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsIHRoaXMuX19oZWlnaHQgKiB0aGlzLl9fdmFsdWUsIHRoaXMuX193aWR0aCwgdGhpcy5fX2hlaWdodCApXG4gIH0sXG5cbiAgX19tb3VzZWRvd24oIGUgKSB7IFxuICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIHRoaXMuX19tb3VzZW1vdmUgKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsICAgdGhpcy5fX21vdXNldXAgKVxuICB9LFxuXG4gIF9fbW91c2V1cCggZSApICAge1xuICAgIHRoaXMuYWN0aXZlID0gZmFsc2UgIFxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgdGhpcy5fX21vdXNlbW92ZSApIFxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsICAgdGhpcy5fX21vdXNldXAgKSBcbiAgfSxcblxuICBfX21vdXNlbW92ZSggZSApIHtcbiAgICBpZiggdGhpcy5hY3RpdmUgKSB7XG4gICAgICBsZXQgcHJldlZhbHVlID0gdGhpcy5fX3ZhbHVlXG5cbiAgICAgIGlmKCB0aGlzLnN0eWxlID09PSAnaG9yaXpvbnRhbCcgKSB7XG4gICAgICAgIHRoaXMuX192YWx1ZSA9ICggZS5jbGllbnRYIC0gdGhpcy5yZWN0LmxlZnQgKSAvIHRoaXMuX193aWR0aFxuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuX192YWx1ZSA9ICggZS5jbGllbnRZIC0gdGhpcy5yZWN0LnRvcCAgKSAvIHRoaXMuX19oZWlnaHQgIFxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiggdGhpcy5fX3ZhbHVlID4gMSApIHRoaXMuX192YWx1ZSA9IDFcbiAgICAgIGlmKCB0aGlzLl9fdmFsdWUgPCAwICkgdGhpcy5fX3ZhbHVlID0gMFxuXG4gICAgICBpZiggcHJldlZhbHVlICE9PSB0aGlzLl9fdmFsdWUgKSB0aGlzLmRyYXcoKVxuICAgIH1cbiAgfSxcbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2xpZGVyXG4iLCJsZXQgaWpzID0gcmVxdWlyZSggJy4vaW50ZXJmYWNlLmpzJyApXG5cbmxldCBXaWRnZXQgPSB7XG5cbiAgZGVmYXVsdHM6IHtcbiAgICB4OjAseTowLHdpZHRoOi4yNSxoZWlnaHQ6LjI1LFxuICAgIGF0dGFjaGVkOmZhbHNlXG4gIH0sXG5cbiAgaW5pdCggY29udGFpbmVyID0gd2luZG93ICkge1xuICAgIGxldCBzaG91bGRVc2VUb3VjaCA9IGlqcy5nZXRNb2RlKCkgPT09ICd0b3VjaCdcbiAgICBcbiAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lclxuICAgIHRoaXMuY2FudmFzID0gdGhpcy5jcmVhdGVDYW52YXMoKVxuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCggJzJkJyApXG4gICAgLy90aGlzLmN0eC5zY2FsZSggd2luZG93LmRldmljZVBpeGVsUmF0aW8sIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIClcblxuICAgIHRoaXMuYXBwbHlIYW5kbGVycyggc2hvdWxkVXNlVG91Y2ggKVxuICAgIHRoaXMucGxhY2UoKVxuICAgIFxuICAgIHJldHVybiB0aGlzXG4gIH0sXG4gIFxuICBjcmVhdGVDYW52YXMoKSB7XG4gICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnIClcbiAgICBjYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG4gICAgY2FudmFzLnN0eWxlLmRpc3BsYXkgID0gJ2Jsb2NrJ1xuICAgIFxuICAgIHJldHVybiBjYW52YXNcbiAgfSxcblxuICAvLyB1c2UgQ1NTIHRvIHBvc2l0aW9uIGNhbnZhcyBlbGVtZW50IG9mIHdpZGdldFxuICBwbGFjZSgpIHtcbiAgICBsZXQgY29udGFpbmVyV2lkdGggPSB0aGlzLmNvbnRhaW5lci5nZXRXaWR0aCgpLFxuICAgICAgICBjb250YWluZXJIZWlnaHQ9IHRoaXMuY29udGFpbmVyLmdldEhlaWdodCgpLFxuICAgICAgICB3aWR0aCAgPSBjb250YWluZXJXaWR0aCAgKiB0aGlzLndpZHRoLFxuICAgICAgICBoZWlnaHQgPSBjb250YWluZXJIZWlnaHQgKiB0aGlzLmhlaWdodCxcbiAgICAgICAgeCAgICAgID0gY29udGFpbmVyV2lkdGggICogdGhpcy54LFxuICAgICAgICB5ICAgICAgPSBjb250YWluZXJIZWlnaHQgKiB0aGlzLnlcblxuICAgIGlmKCAhdGhpcy5hdHRhY2hlZCApIHtcbiAgICAgIHRoaXMuY29udGFpbmVyLmFkZCggdGhpcyApXG4gICAgICB0aGlzLmF0dGFjaGVkID0gdHJ1ZVxuICAgIH1cblxuICAgIHRoaXMuX193aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuX19oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICB0aGlzLmNhbnZhcy53aWR0aCAgPSB3aWR0aFxuICAgIHRoaXMuY2FudmFzLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnXG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgdGhpcy5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4J1xuICAgIHRoaXMuY2FudmFzLnN0eWxlLmxlZnQgPSB4XG4gICAgdGhpcy5jYW52YXMuc3R5bGUudG9wICA9IHlcblxuICAgIHRoaXMucmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIFxuICB9LFxuXG4gIGFwcGx5SGFuZGxlcnMoIHNob3VsZFVzZVRvdWNoPWZhbHNlICkge1xuICAgIGxldCBoYW5kbGVycyA9IHNob3VsZFVzZVRvdWNoID8gV2lkZ2V0LmhhbmRsZXJzLnRvdWNoIDogV2lkZ2V0LmhhbmRsZXJzLm1vdXNlXG4gICAgXG4gICAgLy8gd2lkZ2V0cyBoYXZlIGlqcyBkZWZpbmVkIGhhbmRsZXJzIHN0b3JlZCBpbiB0aGUgX2V2ZW50cyBhcnJheSxcbiAgICAvLyBhbmQgdXNlci1kZWZpbmVkIGV2ZW50cyBzdG9yZWQgd2l0aCAnb24nIHByZWZpeGVzIChlLmcuIG9uY2xpY2ssIG9ubW91c2Vkb3duKVxuXG4gICAgZm9yKCBsZXQgaGFuZGxlck5hbWUgb2YgaGFuZGxlcnMgKSB7XG4gICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCBoYW5kbGVyTmFtZSwgZXZlbnQgPT4ge1xuICAgICAgICAvL2lmKCBoYW5kbGVyTmFtZSAhPT0gJ21vdXNlbW92ZScgKSBjb25zb2xlLmxvZyggZXZlbnQgKVxuICAgICAgICBpZiggdHlwZW9mIHRoaXNbICdfXycgKyBoYW5kbGVyTmFtZSBdID09PSAnZnVuY3Rpb24nICkgdGhpc1sgJ19fJyArIGhhbmRsZXJOYW1lIF0oIGV2ZW50IClcbiAgICAgICAgaWYoIHR5cGVvZiB0aGlzWyAnb24nICsgaGFuZGxlck5hbWUgXSAgPT09ICdmdW5jdGlvbicgICkgdGhpc1sgJ29uJyArIGhhbmRsZXJOYW1lIF0oIGV2ZW50IClcbiAgICAgIH0pXG4gICAgfVxuXG4gIH0sXG5cbiAgaGFuZGxlcnM6IHtcbiAgICBtb3VzZTogW1xuICAgICAgJ21vdXNlZG93bicsXG4gICAgXSxcbiAgICB0b3VjaDogW11cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBXaWRnZXRcbiJdfQ==
