(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Interface = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Filters = {
  Scale: function Scale() {
    var inmin = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var inmax = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
    var outmin = arguments.length <= 2 || arguments[2] === undefined ? -1 : arguments[2];
    var outmax = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

    var inrange = inmax - inmin,
        outrange = outmax - outmin,
        rangeRatio = outrange / inrange;

    return function (input) {
      return outmin + input * rangeRatio;
    };
  }
};

module.exports = Filters;

},{}],2:[function(require,module,exports){
'use strict';

// Everything we need to include goes here and is fed to browserify in the gulpfile.js
var lib = {
  Interface: require('./interface.js'),
  Panel: require('./panel.js'),
  Slider: require('./slider.js')
};

module.exports = lib;

},{"./interface.js":3,"./panel.js":4,"./slider.js":5}],3:[function(require,module,exports){
'use strict';

var Interface = {
  widgets: [],
  layoutManager: null,
  getMode: function getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse';
  },

  Filters: require('./filters.js')
};

module.exports = Interface;

},{"./filters.js":1}],4:[function(require,module,exports){
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

},{"./interface.js":3}],5:[function(require,module,exports){
'use strict';

var Widget = require('./widget.js'),
    Slider = Object.create(Widget);

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

    // register event handlers
    slider.addEvents();

    return slider;
  },
  addEvents: function addEvents() {
    // only listen for mousedown intially; mousemove and mouseup are registered
    // on mousedown
    this.canvas.addEventListener('mousedown', this.__mousedown.bind(this));

    // bind event handlers to slider instance
    this.__mousemove = this.__mousemove.bind(this);
    this.__mouseup = this.__mouseup.bind(this);
  },
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.background;
    this.ctx.fillRect(0, 0, this.__width, this.__height);

    // draw fill (slider value representation)
    this.ctx.fillStyle = this.fill;

    if (this.style === 'horizontal') this.ctx.fillRect(0, 0, this.__width * this.__value, this.__height);else this.ctx.fillRect(0, this.__height - this.__value * this.__height, this.__width, this.__height * this.__value);
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
        this.__value = 1 - (e.clientY - this.rect.top) / this.__height;
      }

      if (this.__value > 1) this.__value = 1;
      if (this.__value < 0) this.__value = 0;

      if (prevValue !== this.__value) this.draw();
    }
  }
});

module.exports = Slider;

},{"./widget.js":7}],6:[function(require,module,exports){
'use strict';

var Utilities = {
  getMode: function getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse';
  }
};

module.exports = Utilities;

},{}],7:[function(require,module,exports){
'use strict';

var Utilities = require('./utilities.js'),
    Filters = require('./filters.js');

var Widget = {

  defaults: {
    x: 0, y: 0, width: .25, height: .25,
    attached: false,
    min: 0, max: 1,
    scaleOutput: true },

  init: function init() {
    var container = arguments.length <= 0 || arguments[0] === undefined ? window : arguments[0];

    var shouldUseTouch = Utilities.getMode() === 'touch';

    this.container = container;
    this.canvas = this.createCanvas();
    this.ctx = this.canvas.getContext('2d');

    this.applyHandlers(shouldUseTouch);

    if (container !== null) {
      // do not place accelerometer, gyro etc.
      this.place();
      this.draw();
    }

    this.filters = [];

    // if min/max are not 0-1 and scaling is not disabled
    if (this.scaleOutput && (this.min !== 0 || this.max !== 1)) {
      this.filters.push(Filters.Scale(0, 1, this.min, this.max));
    }

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
  calculateOutput: function calculateOutput() {
    var value = this.__value;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.filters[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var filter = _step.value;
        value = filter(value);
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

    this.value = value;

    return this.value;
  },
  applyHandlers: function applyHandlers() {
    var _this = this;

    var shouldUseTouch = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var handlers = shouldUseTouch ? Widget.handlers.touch : Widget.handlers.mouse;

    // widgets have ijs defined handlers stored in the _events array,
    // and user-defined events stored with 'on' prefixes (e.g. onclick, onmousedown)

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      var _loop = function _loop() {
        var handlerName = _step2.value;

        _this.canvas.addEventListener(handlerName, function (event) {
          if (typeof _this['on' + handlerName] === 'function') _this['on' + handlerName](event);
        });
      };

      for (var _iterator2 = handlers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  },


  handlers: {
    mouse: ['mouseup', 'mousemove', 'mousedown'],
    touch: []
  }
};

module.exports = Widget;

},{"./filters.js":1,"./utilities.js":6}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9maWx0ZXJzLmpzIiwianMvaW5kZXguanMiLCJqcy9pbnRlcmZhY2UuanMiLCJqcy9wYW5lbC5qcyIsImpzL3NsaWRlci5qcyIsImpzL3V0aWxpdGllcy5qcyIsImpzL3dpZGdldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxVQUFVO0FBQ1osT0FEWSxtQkFDbUM7QUFBQSxRQUF4QyxLQUF3Qyx5REFBbEMsQ0FBa0M7QUFBQSxRQUEvQixLQUErQix5REFBekIsQ0FBeUI7QUFBQSxRQUF0QixNQUFzQix5REFBZixDQUFDLENBQWM7QUFBQSxRQUFYLE1BQVcseURBQUosQ0FBSTs7QUFDN0MsUUFBSSxVQUFXLFFBQVEsS0FBdkI7QUFBQSxRQUNJLFdBQVcsU0FBUyxNQUR4QjtBQUFBLFFBRUksYUFBYSxXQUFXLE9BRjVCOztBQUlBLFdBQU87QUFBQSxhQUFTLFNBQVMsUUFBUSxVQUExQjtBQUFBLEtBQVA7QUFDRDtBQVBXLENBQWQ7O0FBVUEsT0FBTyxPQUFQLEdBQWlCLE9BQWpCOzs7Ozs7QUNUQSxJQUFJLE1BQU07QUFDUixhQUFXLFFBQVMsZ0JBQVQsQ0FESDtBQUVSLFNBQU8sUUFBUyxZQUFULENBRkM7QUFHUixVQUFRLFFBQVMsYUFBVDtBQUhBLENBQVY7O0FBTUEsT0FBTyxPQUFQLEdBQWlCLEdBQWpCOzs7OztBQ1BBLElBQUksWUFBWTtBQUNkLFdBQVEsRUFETTtBQUVkLGlCQUFjLElBRkE7QUFHZCxTQUhjLHFCQUdKO0FBQ1IsV0FBTyxrQkFBa0IsU0FBUyxlQUEzQixHQUE2QyxPQUE3QyxHQUF1RCxPQUE5RDtBQUNELEdBTGE7O0FBTWQsV0FBUyxRQUFRLGNBQVI7QUFOSyxDQUFoQjs7QUFTQSxPQUFPLE9BQVAsR0FBaUIsU0FBakI7Ozs7O0FDVEEsSUFBSSxNQUFNLFFBQVMsZ0JBQVQsQ0FBVjtBQUFBLElBQ0ksY0FESjs7QUFHQSxR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QWpCOztBQURnQjtBQUFBO0FBQUE7O0FBQUE7QUFHaEIsMkJBQW1CLEtBQUssT0FBeEI7QUFBQSxZQUFTLE1BQVQ7QUFBa0MsZ0JBQVEsT0FBUSxLQUFSLENBQVI7QUFBbEM7QUFIZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFLaEIsU0FBSyxLQUFMLEdBQWEsS0FBYjs7QUFFQSxXQUFPLEtBQUssS0FBWjtBQUNELEdBOUVVO0FBZ0ZYLGVBaEZXLDJCQWdGMkI7QUFBQTs7QUFBQSxRQUF2QixjQUF1Qix5REFBUixLQUFROztBQUNwQyxRQUFJLFdBQVcsaUJBQWlCLE9BQU8sUUFBUCxDQUFnQixLQUFqQyxHQUF5QyxPQUFPLFFBQVAsQ0FBZ0IsS0FBeEU7Ozs7O0FBRG9DO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsWUFNM0IsV0FOMkI7O0FBT2xDLGNBQUssTUFBTCxDQUFZLGdCQUFaLENBQThCLFdBQTlCLEVBQTJDLGlCQUFTO0FBQ2xELGNBQUksT0FBTyxNQUFNLE9BQU8sV0FBYixDQUFQLEtBQXVDLFVBQTNDLEVBQXlELE1BQU0sT0FBTyxXQUFiLEVBQTRCLEtBQTVCO0FBQzFELFNBRkQ7QUFQa0M7O0FBTXBDLDRCQUF3QixRQUF4QixtSUFBbUM7QUFBQTtBQUlsQztBQVZtQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBWXJDLEdBNUZVOzs7QUE4RlgsWUFBVTtBQUNSLFdBQU8sQ0FDTCxTQURLLEVBRUwsV0FGSyxFQUdMLFdBSEssQ0FEQztBQU1SLFdBQU87QUFOQztBQTlGQyxDQUFiOztBQXdHQSxPQUFPLE9BQVAsR0FBaUIsTUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibGV0IEZpbHRlcnMgPSB7XG4gIFNjYWxlKCBpbm1pbj0wLCBpbm1heD0xLCBvdXRtaW49LTEsIG91dG1heD0xICkge1xuICAgIGxldCBpbnJhbmdlICA9IGlubWF4IC0gaW5taW4sXG4gICAgICAgIG91dHJhbmdlID0gb3V0bWF4IC0gb3V0bWluLFxuICAgICAgICByYW5nZVJhdGlvID0gb3V0cmFuZ2UgLyBpbnJhbmdlXG5cbiAgICByZXR1cm4gaW5wdXQgPT4gb3V0bWluICsgaW5wdXQgKiByYW5nZVJhdGlvXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWx0ZXJzXG4iLCIvLyBFdmVyeXRoaW5nIHdlIG5lZWQgdG8gaW5jbHVkZSBnb2VzIGhlcmUgYW5kIGlzIGZlZCB0byBicm93c2VyaWZ5IGluIHRoZSBndWxwZmlsZS5qc1xubGV0IGxpYiA9IHtcbiAgSW50ZXJmYWNlOiByZXF1aXJlKCAnLi9pbnRlcmZhY2UuanMnICksXG4gIFBhbmVsOiByZXF1aXJlKCAnLi9wYW5lbC5qcycgKSxcbiAgU2xpZGVyOiByZXF1aXJlKCAnLi9zbGlkZXIuanMnIClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaWJcbiIsImxldCBJbnRlcmZhY2UgPSB7XG4gIHdpZGdldHM6W10sXG4gIGxheW91dE1hbmFnZXI6bnVsbCxcbiAgZ2V0TW9kZSgpIHtcbiAgICByZXR1cm4gJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ID8gJ3RvdWNoJyA6ICdtb3VzZSdcbiAgfSxcbiAgRmlsdGVyczogcmVxdWlyZSgnLi9maWx0ZXJzLmpzJylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmZhY2VcbiIsImxldCBndWkgPSByZXF1aXJlKCAnLi9pbnRlcmZhY2UuanMnICksXG4gICAgUGFuZWxcblxuUGFuZWwgPSB7XG4gIGRlZmF1bHRzOiB7XG4gICAgZnVsbHNjcmVlbjpmYWxzZVxuICB9LFxuXG4gIGNyZWF0ZSggcHJvcHMgPSBudWxsICkge1xuICAgIGxldCBwYW5lbCA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIC8vIGRlZmF1bHQ6IGZ1bGwgd2luZG93IGludGVyZmFjZVxuICAgIGlmKCBwcm9wcyA9PT0gbnVsbCApIHtcbiAgICAgICAgXG4gICAgICBPYmplY3QuYXNzaWduKCBwYW5lbCwgUGFuZWwuZGVmYXVsdHMsIHtcbiAgICAgICAgeDowLFxuICAgICAgICB5OjAsXG4gICAgICAgIHdpZHRoOjEsXG4gICAgICAgIGhlaWdodDoxLFxuICAgICAgICBfX3g6IDAsXG4gICAgICAgIF9feTogMCxcbiAgICAgICAgX193aWR0aDogbnVsbCxcbiAgICAgICAgX19oZWlnaHQ6bnVsbCxcbiAgICAgICAgZnVsbHNjcmVlbjogdHJ1ZSxcbiAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICB9KVxuICAgICAgXG4gICAgICBwYW5lbC5kaXYgPSBQYW5lbC5fX2NyZWF0ZUhUTUxFbGVtZW50KClcbiAgICAgIHBhbmVsLmxheW91dCgpXG5cbiAgICAgIGxldCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJ2JvZHknIClcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoIHBhbmVsLmRpdiApXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhbmVsXG4gIH0sXG4gIFxuICBfX2NyZWF0ZUhUTUxFbGVtZW50KCkge1xuICAgIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApXG4gICAgZGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICAgIGRpdi5zdHlsZS5kaXNwbGF5ICA9ICdibG9jaydcbiAgICBcbiAgICByZXR1cm4gZGl2XG4gIH0sXG5cbiAgbGF5b3V0KCkge1xuICAgIGlmKCB0aGlzLmZ1bGxzY3JlZW4gKSB7XG4gICAgICB0aGlzLl9fd2lkdGggID0gd2luZG93LmlubmVyV2lkdGhcbiAgICAgIHRoaXMuX19oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgIHRoaXMuX194ICAgICAgPSB0aGlzLnggKiB0aGlzLl9fd2lkdGhcbiAgICAgIHRoaXMuX195ICAgICAgPSB0aGlzLnkgKiB0aGlzLl9faGVpZ2h0XG5cbiAgICAgIHRoaXMuZGl2LnN0eWxlLndpZHRoICA9IHRoaXMuX193aWR0aCArICdweCdcbiAgICAgIHRoaXMuZGl2LnN0eWxlLmhlaWdodCA9IHRoaXMuX19oZWlnaHQgKyAncHgnXG4gICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ICAgPSB0aGlzLl9feCArICdweCdcbiAgICAgIHRoaXMuZGl2LnN0eWxlLnRvcCAgICA9IHRoaXMuX195ICsgJ3B4J1xuICAgIH1cbiAgfSxcblxuICBnZXRXaWR0aCgpICB7IHJldHVybiB0aGlzLl9fd2lkdGggfSxcbiAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5fX2hlaWdodCB9LFxuXG4gIGFkZCggd2lkZ2V0ICkge1xuICAgIC8vIGNoZWNrIHRvIG1ha2Ugc3VyZSB3aWRnZXQgaGFzIG5vdCBiZWVuIGFscmVhZHkgYWRkZWRcbiAgICBpZiggdGhpcy5jaGlsZHJlbi5pbmRleE9mKCB3aWRnZXQgKSA9PT0gLTEgKSB7XG4gICAgICB0aGlzLmRpdi5hcHBlbmRDaGlsZCggd2lkZ2V0LmNhbnZhcyApXG4gICAgICB0aGlzLmNoaWxkcmVuLnB1c2goIHdpZGdldCApXG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBFcnJvciggJ1dpZGdldCBpcyBhbHJlYWR5IGFkZGVkIHRvIHBhbmVsLicgKVxuICAgIH1cbiAgfSxcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhbmVsIFxuIiwibGV0IFdpZGdldCA9IHJlcXVpcmUoICcuL3dpZGdldC5qcycgKSxcbiAgICBTbGlkZXIgPSBPYmplY3QuY3JlYXRlKCBXaWRnZXQgKSBcblxuLy8gZmxleGlibGUgdGFyZ2V0aW5nKD8pIHN5c3RlbVxuLy8gdGhlbWluZz9cbi8vIHVuaXQgdGVzdHNcblxuT2JqZWN0LmFzc2lnbiggU2xpZGVyLCB7XG4gIGRlZmF1bHRzOiB7XG4gICAgX192YWx1ZTouNSwgLy8gYWx3YXlzIDAtMSwgbm90IGZvciBlbmQtdXNlcnNcbiAgICB2YWx1ZTouNSwgICAvLyBlbmQtdXNlciB2YWx1ZSB0aGF0IG1heSBiZSBmaWx0ZXJlZFxuICAgIGJhY2tncm91bmQ6J2JsYWNrJyxcbiAgICBmaWxsOidncmV5JyxcbiAgICBhY3RpdmU6IGZhbHNlLFxuICAgIHN0eWxlOidob3Jpem9udGFsJ1xuICB9LFxuICBcbiAgY3JlYXRlKCBwcm9wcywgY29udGFpbmVyID0gd2luZG93ICkge1xuICAgIGxldCBzbGlkZXIgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcblxuICAgIE9iamVjdC5hc3NpZ24oIHNsaWRlciwgV2lkZ2V0LmRlZmF1bHRzLCBTbGlkZXIuZGVmYXVsdHMsIHByb3BzIClcblxuICAgIC8vIGluaGVyaXRlZCBmcm9tIHdpZGdldCwgcGxhY2VzIGNhbnZhcyBvYmogb24gc2NyZWVuXG4gICAgc2xpZGVyLmluaXQoIGNvbnRhaW5lciApXG5cbiAgICAvLyByZWdpc3RlciBldmVudCBoYW5kbGVyc1xuICAgIHNsaWRlci5hZGRFdmVudHMoKVxuICAgIFxuICAgIHJldHVybiBzbGlkZXJcbiAgfSxcblxuICBhZGRFdmVudHMoKSB7XG4gICAgLy8gb25seSBsaXN0ZW4gZm9yIG1vdXNlZG93biBpbnRpYWxseTsgbW91c2Vtb3ZlIGFuZCBtb3VzZXVwIGFyZSByZWdpc3RlcmVkXG4gICAgLy8gb24gbW91c2Vkb3duXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIHRoaXMuX19tb3VzZWRvd24uYmluZCggdGhpcyApIClcblxuICAgIC8vIGJpbmQgZXZlbnQgaGFuZGxlcnMgdG8gc2xpZGVyIGluc3RhbmNlXG4gICAgdGhpcy5fX21vdXNlbW92ZSA9IHRoaXMuX19tb3VzZW1vdmUuYmluZCggdGhpcyApXG4gICAgdGhpcy5fX21vdXNldXAgICA9IHRoaXMuX19tb3VzZXVwLmJpbmQoIHRoaXMgKVxuICB9LFxuXG4gIGRyYXcoKSB7XG4gICAgLy8gZHJhdyBiYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5iYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsMCx0aGlzLl9fd2lkdGgsICB0aGlzLl9faGVpZ2h0IClcblxuICAgIC8vIGRyYXcgZmlsbCAoc2xpZGVyIHZhbHVlIHJlcHJlc2VudGF0aW9uKVxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuZmlsbFxuXG4gICAgaWYoIHRoaXMuc3R5bGUgPT09ICdob3Jpem9udGFsJyApXG4gICAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwwLCB0aGlzLl9fd2lkdGggKiB0aGlzLl9fdmFsdWUsIHRoaXMuX19oZWlnaHQgKVxuICAgIGVsc2VcbiAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLCB0aGlzLl9faGVpZ2h0IC0gdGhpcy5fX3ZhbHVlICogdGhpcy5fX2hlaWdodCwgdGhpcy5fX3dpZHRoLCB0aGlzLl9faGVpZ2h0ICogdGhpcy5fX3ZhbHVlIClcbiAgfSxcblxuICBfX21vdXNlZG93biggZSApIHsgXG4gICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgdGhpcy5fX21vdXNlbW92ZSApXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgICB0aGlzLl9fbW91c2V1cCApXG4gIH0sXG5cbiAgX19tb3VzZXVwKCBlICkgICB7XG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZSAgXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCB0aGlzLl9fbW91c2Vtb3ZlICkgXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgICB0aGlzLl9fbW91c2V1cCApIFxuICB9LFxuXG4gIF9fbW91c2Vtb3ZlKCBlICkge1xuICAgIGlmKCB0aGlzLmFjdGl2ZSApIHtcbiAgICAgIGxldCBwcmV2VmFsdWUgPSB0aGlzLl9fdmFsdWVcblxuICAgICAgaWYoIHRoaXMuc3R5bGUgPT09ICdob3Jpem9udGFsJyApIHtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gKCBlLmNsaWVudFggLSB0aGlzLnJlY3QubGVmdCApIC8gdGhpcy5fX3dpZHRoXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gMSAtICggZS5jbGllbnRZIC0gdGhpcy5yZWN0LnRvcCAgKSAvIHRoaXMuX19oZWlnaHQgIFxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiggdGhpcy5fX3ZhbHVlID4gMSApIHRoaXMuX192YWx1ZSA9IDFcbiAgICAgIGlmKCB0aGlzLl9fdmFsdWUgPCAwICkgdGhpcy5fX3ZhbHVlID0gMFxuXG4gICAgICBpZiggcHJldlZhbHVlICE9PSB0aGlzLl9fdmFsdWUgKSB0aGlzLmRyYXcoKVxuICAgIH1cbiAgfSxcbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2xpZGVyXG4iLCJsZXQgVXRpbGl0aWVzID0ge1xuXG4gIGdldE1vZGUoKSB7XG4gICAgcmV0dXJuICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA/ICd0b3VjaCcgOiAnbW91c2UnXG4gIH0sXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBVdGlsaXRpZXNcbiIsImxldCBVdGlsaXRpZXMgPSByZXF1aXJlKCAnLi91dGlsaXRpZXMuanMnICksXG4gICAgRmlsdGVycyA9IHJlcXVpcmUoICcuL2ZpbHRlcnMuanMnIClcblxubGV0IFdpZGdldCA9IHtcblxuICBkZWZhdWx0czoge1xuICAgIHg6MCx5OjAsd2lkdGg6LjI1LGhlaWdodDouMjUsXG4gICAgYXR0YWNoZWQ6ZmFsc2UsXG4gICAgbWluOjAsIG1heDoxLFxuICAgIHNjYWxlT3V0cHV0OnRydWUsIC8vIGFwcGx5IHNjYWxlIGZpbHRlciBieSBkZWZhdWx0IGZvciBtaW4gLyBtYXggcmFuZ2VzXG4gIH0sXG5cbiAgaW5pdCggY29udGFpbmVyID0gd2luZG93ICkge1xuICAgIGxldCBzaG91bGRVc2VUb3VjaCA9IFV0aWxpdGllcy5nZXRNb2RlKCkgPT09ICd0b3VjaCdcbiAgICBcbiAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lclxuICAgIHRoaXMuY2FudmFzID0gdGhpcy5jcmVhdGVDYW52YXMoKVxuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCggJzJkJyApXG5cbiAgICB0aGlzLmFwcGx5SGFuZGxlcnMoIHNob3VsZFVzZVRvdWNoIClcblxuICAgIGlmKCBjb250YWluZXIgIT09IG51bGwgKSB7IC8vIGRvIG5vdCBwbGFjZSBhY2NlbGVyb21ldGVyLCBneXJvIGV0Yy5cbiAgICAgIHRoaXMucGxhY2UoKVxuICAgICAgdGhpcy5kcmF3KClcbiAgICB9XG4gICAgXG4gICAgdGhpcy5maWx0ZXJzID0gW11cblxuICAgIC8vIGlmIG1pbi9tYXggYXJlIG5vdCAwLTEgYW5kIHNjYWxpbmcgaXMgbm90IGRpc2FibGVkXG4gICAgaWYoIHRoaXMuc2NhbGVPdXRwdXQgJiYgKHRoaXMubWluICE9PSAwIHx8IHRoaXMubWF4ICE9PSAxICkpIHsgICAgICBcbiAgICAgIHRoaXMuZmlsdGVycy5wdXNoKCBcbiAgICAgICAgRmlsdGVycy5TY2FsZSggMCwxLHRoaXMubWluLHRoaXMubWF4ICkgXG4gICAgICApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiB0aGlzXG4gIH0sXG4gIFxuICBjcmVhdGVDYW52YXMoKSB7XG4gICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnIClcbiAgICBjYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG4gICAgY2FudmFzLnN0eWxlLmRpc3BsYXkgID0gJ2Jsb2NrJ1xuICAgIFxuICAgIHJldHVybiBjYW52YXNcbiAgfSxcblxuICAvLyB1c2UgQ1NTIHRvIHBvc2l0aW9uIGNhbnZhcyBlbGVtZW50IG9mIHdpZGdldFxuICBwbGFjZSgpIHtcbiAgICBsZXQgY29udGFpbmVyV2lkdGggPSB0aGlzLmNvbnRhaW5lci5nZXRXaWR0aCgpLFxuICAgICAgICBjb250YWluZXJIZWlnaHQ9IHRoaXMuY29udGFpbmVyLmdldEhlaWdodCgpLFxuICAgICAgICB3aWR0aCAgPSBjb250YWluZXJXaWR0aCAgKiB0aGlzLndpZHRoLFxuICAgICAgICBoZWlnaHQgPSBjb250YWluZXJIZWlnaHQgKiB0aGlzLmhlaWdodCxcbiAgICAgICAgeCAgICAgID0gY29udGFpbmVyV2lkdGggICogdGhpcy54LFxuICAgICAgICB5ICAgICAgPSBjb250YWluZXJIZWlnaHQgKiB0aGlzLnlcblxuICAgIGlmKCAhdGhpcy5hdHRhY2hlZCApIHtcbiAgICAgIHRoaXMuY29udGFpbmVyLmFkZCggdGhpcyApXG4gICAgICB0aGlzLmF0dGFjaGVkID0gdHJ1ZVxuICAgIH1cblxuICAgIHRoaXMuX193aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuX19oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICB0aGlzLmNhbnZhcy53aWR0aCAgPSB3aWR0aFxuICAgIHRoaXMuY2FudmFzLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnXG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgdGhpcy5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4J1xuICAgIHRoaXMuY2FudmFzLnN0eWxlLmxlZnQgPSB4XG4gICAgdGhpcy5jYW52YXMuc3R5bGUudG9wICA9IHlcblxuICAgIHRoaXMucmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIFxuICB9LFxuXG4gIGNhbGN1bGF0ZU91dHB1dCgpIHtcbiAgICBsZXQgdmFsdWUgPSB0aGlzLl9fdmFsdWVcblxuICAgIGZvciggbGV0IGZpbHRlciBvZiB0aGlzLmZpbHRlcnMgKSB2YWx1ZSA9IGZpbHRlciggdmFsdWUgKVxuXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXG4gICAgXG4gICAgcmV0dXJuIHRoaXMudmFsdWVcbiAgfSxcblxuICBhcHBseUhhbmRsZXJzKCBzaG91bGRVc2VUb3VjaD1mYWxzZSApIHtcbiAgICBsZXQgaGFuZGxlcnMgPSBzaG91bGRVc2VUb3VjaCA/IFdpZGdldC5oYW5kbGVycy50b3VjaCA6IFdpZGdldC5oYW5kbGVycy5tb3VzZVxuICAgIFxuICAgIC8vIHdpZGdldHMgaGF2ZSBpanMgZGVmaW5lZCBoYW5kbGVycyBzdG9yZWQgaW4gdGhlIF9ldmVudHMgYXJyYXksXG4gICAgLy8gYW5kIHVzZXItZGVmaW5lZCBldmVudHMgc3RvcmVkIHdpdGggJ29uJyBwcmVmaXhlcyAoZS5nLiBvbmNsaWNrLCBvbm1vdXNlZG93bilcblxuICAgIGZvciggbGV0IGhhbmRsZXJOYW1lIG9mIGhhbmRsZXJzICkge1xuICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lciggaGFuZGxlck5hbWUsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYoIHR5cGVvZiB0aGlzWyAnb24nICsgaGFuZGxlck5hbWUgXSAgPT09ICdmdW5jdGlvbicgICkgdGhpc1sgJ29uJyArIGhhbmRsZXJOYW1lIF0oIGV2ZW50IClcbiAgICAgIH0pXG4gICAgfVxuXG4gIH0sXG5cbiAgaGFuZGxlcnM6IHtcbiAgICBtb3VzZTogW1xuICAgICAgJ21vdXNldXAnLFxuICAgICAgJ21vdXNlbW92ZScsXG4gICAgICAnbW91c2Vkb3duJyxcbiAgICBdLFxuICAgIHRvdWNoOiBbXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdpZGdldFxuIl19
