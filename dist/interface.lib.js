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

var gui = require('./interface.js');

module.exports = {
  panel: 'hooray'
};

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

  __mousedown: function __mousedown(e) {
    this.active = true;
    window.addEventListener('mousemove', this.__mousemove);
    window.addEventListener('mouseup', this.__mouseup);
  },
  __mouseup: function __mouseup(e) {
    window.removeEventListener('mousemove', this.__mousemove);
    window.removeEventListener('mouseup', this.__mouseup);
    this.active = false;
  },
  __mousemove: function __mousemove(e) {
    if (this.active) {
      this.__value = this.style === 'horizontal' ? e.offsetX / this.__width : 1 - e.offsetY / this.__height;
      this.draw();
    }
  },
  create: function create(props) {
    var container = arguments.length <= 1 || arguments[1] === undefined ? window : arguments[1];

    var slider = Object.create(this);

    Object.assign(slider, Widget.defaults, Slider.defaults, props);

    slider.init(); // inherited from widget, places canvas obj on screen

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

    if (this.style === 'horizontal') this.ctx.fillRect(0, 0, this.__width * this.__value, this.__height);else this.ctx.fillRect(0, this.__height - this.__height * this.__value, this.__width, this.__height);
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
    var width = this.container.innerWidth * this.width,
        height = this.container.innerHeight * this.height,
        x = this.container.innerWidth * this.x,
        y = this.container.innerHeight * this.y;

    if (!this.attached && this.container === window) {
      document.querySelector('body').appendChild(this.canvas);
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
          if (handlerName !== 'mousemove') console.log(event);
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
    mouse: ['click', 'mousedown', 'mouseup', 'mousemove'],
    touch: []
  }
};

module.exports = Widget;

},{"./interface.js":2}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL2ludGVyZmFjZS5qcyIsImpzL3BhbmVsLmpzIiwianMvc2xpZGVyLmpzIiwianMvd2lkZ2V0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FDQ0EsSUFBSSxNQUFNO0FBQ1IsYUFBVyxRQUFTLGdCQUFULENBREg7QUFFUixTQUFPLFFBQVMsWUFBVCxDQUZDO0FBR1IsVUFBUSxRQUFTLGFBQVQ7QUFIQSxDQUFWOztBQU1BLE9BQU8sT0FBUCxHQUFpQixHQUFqQjs7Ozs7QUNQQSxJQUFJLFlBQVk7QUFDZCxXQUFRLEVBRE07QUFFZCxpQkFBYyxJQUZBO0FBR2QsU0FIYyxxQkFHSjtBQUNSLFdBQU8sa0JBQWtCLFNBQVMsZUFBM0IsR0FBNkMsT0FBN0MsR0FBdUQsT0FBOUQ7QUFDRDtBQUxhLENBQWhCOztBQVFBLE9BQU8sT0FBUCxHQUFpQixTQUFqQjs7Ozs7QUNSQSxJQUFJLE1BQU0sUUFBUyxnQkFBVCxDQUFWOztBQUVBLE9BQU8sT0FBUCxHQUFpQjtBQUNmLFNBQU07QUFEUyxDQUFqQjs7Ozs7QUNGQSxJQUFJLE1BQVMsUUFBUyxnQkFBVCxDQUFiO0FBQUEsSUFDSSxTQUFTLFFBQVMsYUFBVCxDQURiO0FBQUEsSUFFSSxTQUFTLE9BQU8sTUFBUCxDQUFlLE1BQWYsQ0FGYjs7Ozs7OztBQVNBLE9BQU8sTUFBUCxDQUFlLE1BQWYsRUFBdUI7QUFDckIsWUFBVTtBQUNSLGFBQVEsRUFEQSxFO0FBRVIsV0FBTSxFQUZFLEU7QUFHUixnQkFBVyxPQUhIO0FBSVIsVUFBSyxNQUpHO0FBS1IsWUFBUSxLQUxBO0FBTVIsV0FBTTtBQU5FLEdBRFc7O0FBVXJCLGFBVnFCLHVCQVVSLENBVlEsRUFVSjtBQUNmLFNBQUssTUFBTCxHQUFjLElBQWQ7QUFDQSxXQUFPLGdCQUFQLENBQXlCLFdBQXpCLEVBQXNDLEtBQUssV0FBM0M7QUFDQSxXQUFPLGdCQUFQLENBQXlCLFNBQXpCLEVBQW9DLEtBQUssU0FBekM7QUFDRCxHQWRvQjtBQWdCckIsV0FoQnFCLHFCQWdCVixDQWhCVSxFQWdCSjtBQUNmLFdBQU8sbUJBQVAsQ0FBNEIsV0FBNUIsRUFBeUMsS0FBSyxXQUE5QztBQUNBLFdBQU8sbUJBQVAsQ0FBNEIsU0FBNUIsRUFBdUMsS0FBSyxTQUE1QztBQUNBLFNBQUssTUFBTCxHQUFjLEtBQWQ7QUFDRCxHQXBCb0I7QUFzQnJCLGFBdEJxQix1QkFzQlIsQ0F0QlEsRUFzQko7QUFDZixRQUFJLEtBQUssTUFBVCxFQUFrQjtBQUNoQixXQUFLLE9BQUwsR0FBZSxLQUFLLEtBQUwsS0FBZSxZQUFmLEdBQThCLEVBQUUsT0FBRixHQUFZLEtBQUssT0FBL0MsR0FBeUQsSUFBTSxFQUFFLE9BQUYsR0FBWSxLQUFLLFFBQS9GO0FBQ0EsV0FBSyxJQUFMO0FBQ0Q7QUFDRixHQTNCb0I7QUE2QnJCLFFBN0JxQixrQkE2QmIsS0E3QmEsRUE2QmU7QUFBQSxRQUFyQixTQUFxQix5REFBVCxNQUFTOztBQUNsQyxRQUFJLFNBQVMsT0FBTyxNQUFQLENBQWUsSUFBZixDQUFiOztBQUVBLFdBQU8sTUFBUCxDQUFlLE1BQWYsRUFBdUIsT0FBTyxRQUE5QixFQUF3QyxPQUFPLFFBQS9DLEVBQXlELEtBQXpEOztBQUVBLFdBQU8sSUFBUCxHOztBQUVBLFdBQU8sV0FBUCxHQUFxQixPQUFPLFdBQVAsQ0FBbUIsSUFBbkIsQ0FBeUIsTUFBekIsQ0FBckI7QUFDQSxXQUFPLFNBQVAsR0FBbUIsT0FBTyxTQUFQLENBQWlCLElBQWpCLENBQXVCLE1BQXZCLENBQW5CO0FBQ0EsV0FBTyxNQUFQO0FBQ0QsR0F2Q29CO0FBeUNyQixNQXpDcUIsa0JBeUNkOztBQUVMLFNBQUssR0FBTCxDQUFTLFNBQVQsR0FBcUIsS0FBSyxVQUExQjtBQUNBLFNBQUssR0FBTCxDQUFTLFFBQVQsQ0FBbUIsQ0FBbkIsRUFBcUIsQ0FBckIsRUFBdUIsS0FBSyxPQUE1QixFQUFzQyxLQUFLLFFBQTNDOzs7QUFHQSxTQUFLLEdBQUwsQ0FBUyxTQUFULEdBQXFCLEtBQUssSUFBMUI7O0FBRUEsUUFBSSxLQUFLLEtBQUwsS0FBZSxZQUFuQixFQUNFLEtBQUssR0FBTCxDQUFTLFFBQVQsQ0FBbUIsQ0FBbkIsRUFBcUIsQ0FBckIsRUFBd0IsS0FBSyxPQUFMLEdBQWUsS0FBSyxPQUE1QyxFQUFxRCxLQUFLLFFBQTFELEVBREYsS0FHRSxLQUFLLEdBQUwsQ0FBUyxRQUFULENBQW1CLENBQW5CLEVBQXFCLEtBQUssUUFBTCxHQUFpQixLQUFLLFFBQUwsR0FBZ0IsS0FBSyxPQUEzRCxFQUFzRSxLQUFLLE9BQTNFLEVBQW9GLEtBQUssUUFBekY7QUFDSDtBQXJEb0IsQ0FBdkI7O0FBd0RBLE9BQU8sT0FBUCxHQUFpQixNQUFqQjs7Ozs7QUNqRUEsSUFBSSxNQUFNLFFBQVMsZ0JBQVQsQ0FBVjs7QUFFQSxJQUFJLFNBQVM7O0FBRVgsWUFBVTtBQUNSLE9BQUUsQ0FETSxFQUNKLEdBQUUsQ0FERSxFQUNBLE9BQU0sR0FETixFQUNVLFFBQU8sR0FEakI7QUFFUixjQUFTO0FBRkQsR0FGQzs7QUFPWCxNQVBXLGtCQU9nQjtBQUFBLFFBQXJCLFNBQXFCLHlEQUFULE1BQVM7O0FBQ3pCLFFBQUksaUJBQWlCLElBQUksT0FBSixPQUFrQixPQUF2Qzs7QUFFQSxTQUFLLFNBQUwsR0FBaUIsU0FBakI7QUFDQSxTQUFLLE1BQUwsR0FBYyxLQUFLLFlBQUwsRUFBZDtBQUNBLFNBQUssR0FBTCxHQUFXLEtBQUssTUFBTCxDQUFZLFVBQVosQ0FBdUIsSUFBdkIsQ0FBWDs7QUFFQSxTQUFLLGFBQUwsQ0FBb0IsY0FBcEI7QUFDQSxTQUFLLEtBQUw7O0FBRUEsV0FBTyxJQUFQO0FBQ0QsR0FsQlU7QUFvQlgsY0FwQlcsMEJBb0JJO0FBQ2IsUUFBSSxTQUFTLFNBQVMsYUFBVCxDQUF3QixRQUF4QixDQUFiO0FBQ0EsV0FBTyxLQUFQLENBQWEsUUFBYixHQUF3QixVQUF4QjtBQUNBLFdBQU8sS0FBUCxDQUFhLE9BQWIsR0FBd0IsT0FBeEI7O0FBRUEsV0FBTyxNQUFQO0FBQ0QsR0ExQlU7Ozs7QUE2QlgsT0E3QlcsbUJBNkJIO0FBQ04sUUFBSSxRQUFTLEtBQUssU0FBTCxDQUFlLFVBQWYsR0FBNkIsS0FBSyxLQUEvQztBQUFBLFFBQ0ksU0FBUyxLQUFLLFNBQUwsQ0FBZSxXQUFmLEdBQTZCLEtBQUssTUFEL0M7QUFBQSxRQUVJLElBQVMsS0FBSyxTQUFMLENBQWUsVUFBZixHQUE2QixLQUFLLENBRi9DO0FBQUEsUUFHSSxJQUFTLEtBQUssU0FBTCxDQUFlLFdBQWYsR0FBNkIsS0FBSyxDQUgvQzs7QUFLQSxRQUFJLENBQUMsS0FBSyxRQUFOLElBQWtCLEtBQUssU0FBTCxLQUFtQixNQUF6QyxFQUFrRDtBQUNoRCxlQUFTLGFBQVQsQ0FBdUIsTUFBdkIsRUFBK0IsV0FBL0IsQ0FBNEMsS0FBSyxNQUFqRDtBQUNBLFdBQUssUUFBTCxHQUFnQixJQUFoQjtBQUNEOztBQUVELFNBQUssT0FBTCxHQUFlLEtBQWY7QUFDQSxTQUFLLFFBQUwsR0FBZ0IsTUFBaEI7O0FBRUEsU0FBSyxNQUFMLENBQVksS0FBWixHQUFxQixLQUFyQjtBQUNBLFNBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsS0FBbEIsR0FBMEIsUUFBUSxJQUFsQztBQUNBLFNBQUssTUFBTCxDQUFZLE1BQVosR0FBcUIsTUFBckI7QUFDQSxTQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLE1BQWxCLEdBQTJCLFNBQVMsSUFBcEM7QUFDQSxTQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLElBQWxCLEdBQXlCLENBQXpCO0FBQ0EsU0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFsQixHQUF5QixDQUF6QjtBQUNELEdBakRVO0FBbURYLGVBbkRXLDJCQW1EMkI7QUFBQTs7QUFBQSxRQUF2QixjQUF1Qix5REFBUixLQUFROztBQUNwQyxRQUFJLFdBQVcsaUJBQWlCLE9BQU8sUUFBUCxDQUFnQixLQUFqQyxHQUF5QyxPQUFPLFFBQVAsQ0FBZ0IsS0FBeEU7Ozs7O0FBRG9DO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsWUFNM0IsV0FOMkI7O0FBT2xDLGNBQUssTUFBTCxDQUFZLGdCQUFaLENBQThCLFdBQTlCLEVBQTJDLGlCQUFTO0FBQ2xELGNBQUksZ0JBQWdCLFdBQXBCLEVBQWtDLFFBQVEsR0FBUixDQUFhLEtBQWI7QUFDbEMsY0FBSSxPQUFPLE1BQU0sT0FBTyxXQUFiLENBQVAsS0FBc0MsVUFBMUMsRUFBdUQsTUFBTSxPQUFPLFdBQWIsRUFBNEIsS0FBNUI7QUFDdkQsY0FBSSxPQUFPLE1BQU0sT0FBTyxXQUFiLENBQVAsS0FBdUMsVUFBM0MsRUFBeUQsTUFBTSxPQUFPLFdBQWIsRUFBNEIsS0FBNUI7QUFDMUQsU0FKRDtBQVBrQzs7QUFNcEMsMkJBQXdCLFFBQXhCLDhIQUFtQztBQUFBO0FBTWxDO0FBWm1DO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFjckMsR0FqRVU7OztBQW1FWCxZQUFVO0FBQ1IsV0FBTyxDQUNMLE9BREssRUFFTCxXQUZLLEVBR0wsU0FISyxFQUlMLFdBSkssQ0FEQztBQU9SLFdBQU87QUFQQztBQW5FQyxDQUFiOztBQThFQSxPQUFPLE9BQVAsR0FBaUIsTUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gRXZlcnl0aGluZyB3ZSBuZWVkIHRvIGluY2x1ZGUgZ29lcyBoZXJlIGFuZCBpcyBmZWQgdG8gYnJvd3NlcmlmeSBpbiB0aGUgZ3VscGZpbGUuanNcbmxldCBsaWIgPSB7XG4gIEludGVyZmFjZTogcmVxdWlyZSggJy4vaW50ZXJmYWNlLmpzJyApLFxuICBQYW5lbDogcmVxdWlyZSggJy4vcGFuZWwuanMnICksXG4gIFNsaWRlcjogcmVxdWlyZSggJy4vc2xpZGVyLmpzJyApXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGliXG4iLCJsZXQgSW50ZXJmYWNlID0ge1xuICB3aWRnZXRzOltdLFxuICBsYXlvdXRNYW5hZ2VyOm51bGwsXG4gIGdldE1vZGUoKSB7XG4gICAgcmV0dXJuICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA/ICd0b3VjaCcgOiAnbW91c2UnXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmZhY2VcbiIsImxldCBndWkgPSByZXF1aXJlKCAnLi9pbnRlcmZhY2UuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHBhbmVsOidob29yYXknXG59XG4iLCJsZXQgZ3VpICAgID0gcmVxdWlyZSggJy4vaW50ZXJmYWNlLmpzJyApLFxuICAgIFdpZGdldCA9IHJlcXVpcmUoICcuL3dpZGdldC5qcycgKSxcbiAgICBTbGlkZXIgPSBPYmplY3QuY3JlYXRlKCBXaWRnZXQgKSBcblxuLy8gdmFsdWUgY2hhbmdlcyBjYW4gYmUgcHJvY2Vzc2VkIGJ5IGZpbHRlcnNcbi8vIGZsZXhpYmxlIHRhcmdldGluZyg/KSBzeXN0ZW1cbi8vIHRoZW1pbmc/XG4vLyB1bml0IHRlc3RzXG5cbk9iamVjdC5hc3NpZ24oIFNsaWRlciwge1xuICBkZWZhdWx0czoge1xuICAgIF9fdmFsdWU6LjUsIC8vIGFsd2F5cyAwLTEsIG5vdCBmb3IgZW5kLXVzZXJzXG4gICAgdmFsdWU6LjUsICAgLy8gZW5kLXVzZXIgdmFsdWUgdGhhdCBtYXkgYmUgZmlsdGVyZWRcbiAgICBiYWNrZ3JvdW5kOidibGFjaycsXG4gICAgZmlsbDonZ3JleScsXG4gICAgYWN0aXZlOiBmYWxzZSxcbiAgICBzdHlsZTonaG9yaXpvbnRhbCdcbiAgfSxcbiAgXG4gIF9fbW91c2Vkb3duKCBlICkgeyBcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCB0aGlzLl9fbW91c2Vtb3ZlIClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCB0aGlzLl9fbW91c2V1cCApXG4gIH0sXG5cbiAgX19tb3VzZXVwKCBlICkgICB7IFxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgdGhpcy5fX21vdXNlbW92ZSApOyBcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCB0aGlzLl9fbW91c2V1cCApOyBcbiAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlIFxuICB9LFxuXG4gIF9fbW91c2Vtb3ZlKCBlICkge1xuICAgIGlmKCB0aGlzLmFjdGl2ZSApIHtcbiAgICAgIHRoaXMuX192YWx1ZSA9IHRoaXMuc3R5bGUgPT09ICdob3Jpem9udGFsJyA/IGUub2Zmc2V0WCAvIHRoaXMuX193aWR0aCA6IDEgLSAoIGUub2Zmc2V0WSAvIHRoaXMuX19oZWlnaHQgKVxuICAgICAgdGhpcy5kcmF3KClcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlKCBwcm9wcywgY29udGFpbmVyID0gd2luZG93ICkge1xuICAgIGxldCBzbGlkZXIgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcblxuICAgIE9iamVjdC5hc3NpZ24oIHNsaWRlciwgV2lkZ2V0LmRlZmF1bHRzLCBTbGlkZXIuZGVmYXVsdHMsIHByb3BzIClcbiAgICBcbiAgICBzbGlkZXIuaW5pdCgpIC8vIGluaGVyaXRlZCBmcm9tIHdpZGdldCwgcGxhY2VzIGNhbnZhcyBvYmogb24gc2NyZWVuXG5cbiAgICBzbGlkZXIuX19tb3VzZW1vdmUgPSBzbGlkZXIuX19tb3VzZW1vdmUuYmluZCggc2xpZGVyIClcbiAgICBzbGlkZXIuX19tb3VzZXVwID0gc2xpZGVyLl9fbW91c2V1cC5iaW5kKCBzbGlkZXIgKVxuICAgIHJldHVybiBzbGlkZXJcbiAgfSxcblxuICBkcmF3KCkge1xuICAgIC8vIGRyYXcgYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLDAsdGhpcy5fX3dpZHRoLCAgdGhpcy5fX2hlaWdodCApXG5cbiAgICAvLyBkcmF3IGZpbGwgKHNsaWRlciB2YWx1ZSByZXByZXNlbnRhdGlvbilcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxcblxuICAgIGlmKCB0aGlzLnN0eWxlID09PSAnaG9yaXpvbnRhbCcgKVxuICAgICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsMCwgdGhpcy5fX3dpZHRoICogdGhpcy5fX3ZhbHVlLCB0aGlzLl9faGVpZ2h0IClcbiAgICBlbHNlXG4gICAgICB0aGlzLmN0eC5maWxsUmVjdCggMCx0aGlzLl9faGVpZ2h0IC0gKHRoaXMuX19oZWlnaHQgKiB0aGlzLl9fdmFsdWUgKSwgdGhpcy5fX3dpZHRoLCB0aGlzLl9faGVpZ2h0IClcbiAgfSxcbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2xpZGVyXG4iLCJsZXQgaWpzID0gcmVxdWlyZSggJy4vaW50ZXJmYWNlLmpzJyApXG5cbmxldCBXaWRnZXQgPSB7XG5cbiAgZGVmYXVsdHM6IHtcbiAgICB4OjAseTowLHdpZHRoOi4yNSxoZWlnaHQ6LjI1LFxuICAgIGF0dGFjaGVkOmZhbHNlXG4gIH0sXG5cbiAgaW5pdCggY29udGFpbmVyID0gd2luZG93ICkge1xuICAgIGxldCBzaG91bGRVc2VUb3VjaCA9IGlqcy5nZXRNb2RlKCkgPT09ICd0b3VjaCdcbiAgICBcbiAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lclxuICAgIHRoaXMuY2FudmFzID0gdGhpcy5jcmVhdGVDYW52YXMoKVxuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuXG4gICAgdGhpcy5hcHBseUhhbmRsZXJzKCBzaG91bGRVc2VUb3VjaCApXG4gICAgdGhpcy5wbGFjZSgpXG4gICAgXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgXG4gIGNyZWF0ZUNhbnZhcygpIHtcbiAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKVxuICAgIGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbiAgICBjYW52YXMuc3R5bGUuZGlzcGxheSAgPSAnYmxvY2snXG4gICAgXG4gICAgcmV0dXJuIGNhbnZhc1xuICB9LFxuXG4gIC8vIHVzZSBDU1MgdG8gcG9zaXRpb24gY2FudmFzIGVsZW1lbnQgb2Ygd2lkZ2V0XG4gIHBsYWNlKCkge1xuICAgIGxldCB3aWR0aCAgPSB0aGlzLmNvbnRhaW5lci5pbm5lcldpZHRoICAqIHRoaXMud2lkdGgsXG4gICAgICAgIGhlaWdodCA9IHRoaXMuY29udGFpbmVyLmlubmVySGVpZ2h0ICogdGhpcy5oZWlnaHQsXG4gICAgICAgIHggICAgICA9IHRoaXMuY29udGFpbmVyLmlubmVyV2lkdGggICogdGhpcy54LFxuICAgICAgICB5ICAgICAgPSB0aGlzLmNvbnRhaW5lci5pbm5lckhlaWdodCAqIHRoaXMueVxuXG4gICAgaWYoICF0aGlzLmF0dGFjaGVkICYmIHRoaXMuY29udGFpbmVyID09PSB3aW5kb3cgKSB7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYXBwZW5kQ2hpbGQoIHRoaXMuY2FudmFzIClcbiAgICAgIHRoaXMuYXR0YWNoZWQgPSB0cnVlXG4gICAgfVxuXG4gICAgdGhpcy5fX3dpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5fX2hlaWdodCA9IGhlaWdodDtcblxuICAgIHRoaXMuY2FudmFzLndpZHRoICA9IHdpZHRoXG4gICAgdGhpcy5jYW52YXMuc3R5bGUud2lkdGggPSB3aWR0aCArICdweCdcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHRcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnXG4gICAgdGhpcy5jYW52YXMuc3R5bGUubGVmdCA9IHhcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS50b3AgID0geSBcbiAgfSxcblxuICBhcHBseUhhbmRsZXJzKCBzaG91bGRVc2VUb3VjaD1mYWxzZSApIHtcbiAgICBsZXQgaGFuZGxlcnMgPSBzaG91bGRVc2VUb3VjaCA/IFdpZGdldC5oYW5kbGVycy50b3VjaCA6IFdpZGdldC5oYW5kbGVycy5tb3VzZVxuICAgIFxuICAgIC8vIHdpZGdldHMgaGF2ZSBpanMgZGVmaW5lZCBoYW5kbGVycyBzdG9yZWQgaW4gdGhlIF9ldmVudHMgYXJyYXksXG4gICAgLy8gYW5kIHVzZXItZGVmaW5lZCBldmVudHMgc3RvcmVkIHdpdGggJ29uJyBwcmVmaXhlcyAoZS5nLiBvbmNsaWNrLCBvbm1vdXNlZG93bilcblxuICAgIGZvciggbGV0IGhhbmRsZXJOYW1lIG9mIGhhbmRsZXJzICkge1xuICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lciggaGFuZGxlck5hbWUsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYoIGhhbmRsZXJOYW1lICE9PSAnbW91c2Vtb3ZlJyApIGNvbnNvbGUubG9nKCBldmVudCApXG4gICAgICAgIGlmKCB0eXBlb2YgdGhpc1sgJ19fJyArIGhhbmRsZXJOYW1lIF0gPT09ICdmdW5jdGlvbicgKSB0aGlzWyAnX18nICsgaGFuZGxlck5hbWUgXSggZXZlbnQgKVxuICAgICAgICBpZiggdHlwZW9mIHRoaXNbICdvbicgKyBoYW5kbGVyTmFtZSBdICA9PT0gJ2Z1bmN0aW9uJyAgKSB0aGlzWyAnb24nICsgaGFuZGxlck5hbWUgXSggZXZlbnQgKVxuICAgICAgfSlcbiAgICB9XG5cbiAgfSxcblxuICBoYW5kbGVyczoge1xuICAgIG1vdXNlOiBbXG4gICAgICAnY2xpY2snLFxuICAgICAgJ21vdXNlZG93bicsXG4gICAgICAnbW91c2V1cCcsXG4gICAgICAnbW91c2Vtb3ZlJ1xuICAgIF0sXG4gICAgdG91Y2g6IFtdXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gV2lkZ2V0XG4iXX0=
