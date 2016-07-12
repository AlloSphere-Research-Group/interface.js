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
  Panel: require('./panel.js'),
  Slider: require('./slider.js')
};

module.exports = lib;

},{"./panel.js":3,"./slider.js":4}],3:[function(require,module,exports){
'use strict';

var Panel = {
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

},{}],4:[function(require,module,exports){
'use strict';

var Widget = require('./widget.js'),
    Slider = Object.create(Widget);

// flexible targeting(?) system
// theming?
// unit tests

Object.assign(Slider, {

  // defaults are assigned to each widget, but can be overridden by
  // user-defined properties passed to constructor
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

    // apply Widget defaults, then overwrite (if applicable) with Slider defaults
    // and then finally override with user defaults
    Object.assign(slider, Widget.defaults, Slider.defaults, props);

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) slider.__value = props.value;

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
      var prevValue = this.value;

      if (this.style === 'horizontal') {
        this.__value = (e.clientX - this.rect.left) / this.__width;
      } else {
        this.__value = 1 - (e.clientY - this.rect.top) / this.__height;
      }

      if (this.__value > 1) this.__value = 1;
      if (this.__value < 0) this.__value = 0;

      this.calculateOutput();

      if (prevValue !== this.value) {
        if (typeof this.onvaluechange === 'function') {
          this.onvaluechange(this.value, prevValue);
          this.draw();
        }
      }
    }
  }
});

module.exports = Slider;

},{"./widget.js":6}],5:[function(require,module,exports){
'use strict';

var Utilities = {
  getMode: function getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse';
  }
};

module.exports = Utilities;

},{}],6:[function(require,module,exports){
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

},{"./filters.js":1,"./utilities.js":5}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9maWx0ZXJzLmpzIiwianMvaW5kZXguanMiLCJqcy9wYW5lbC5qcyIsImpzL3NsaWRlci5qcyIsImpzL3V0aWxpdGllcy5qcyIsImpzL3dpZGdldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxVQUFVO0FBQ1osT0FEWSxtQkFDbUM7QUFBQSxRQUF4QyxLQUF3Qyx5REFBbEMsQ0FBa0M7QUFBQSxRQUEvQixLQUErQix5REFBekIsQ0FBeUI7QUFBQSxRQUF0QixNQUFzQix5REFBZixDQUFDLENBQWM7QUFBQSxRQUFYLE1BQVcseURBQUosQ0FBSTs7QUFDN0MsUUFBSSxVQUFXLFFBQVEsS0FBdkI7QUFBQSxRQUNJLFdBQVcsU0FBUyxNQUR4QjtBQUFBLFFBRUksYUFBYSxXQUFXLE9BRjVCOztBQUlBLFdBQU87QUFBQSxhQUFTLFNBQVMsUUFBUSxVQUExQjtBQUFBLEtBQVA7QUFDRDtBQVBXLENBQWQ7O0FBVUEsT0FBTyxPQUFQLEdBQWlCLE9BQWpCOzs7Ozs7QUNUQSxJQUFJLE1BQU07QUFDUixTQUFPLFFBQVMsWUFBVCxDQURDO0FBRVIsVUFBUSxRQUFTLGFBQVQ7QUFGQSxDQUFWOztBQUtBLE9BQU8sT0FBUCxHQUFpQixHQUFqQjs7Ozs7QUNOQSxJQUFJLFFBQVE7QUFDVixZQUFVO0FBQ1IsZ0JBQVc7QUFESCxHQURBOztBQUtWLFFBTFUsb0JBS2E7QUFBQSxRQUFmLEtBQWUseURBQVAsSUFBTzs7QUFDckIsUUFBSSxRQUFRLE9BQU8sTUFBUCxDQUFlLElBQWYsQ0FBWjs7O0FBR0EsUUFBSSxVQUFVLElBQWQsRUFBcUI7O0FBRW5CLGFBQU8sTUFBUCxDQUFlLEtBQWYsRUFBc0IsTUFBTSxRQUE1QixFQUFzQztBQUNwQyxXQUFFLENBRGtDO0FBRXBDLFdBQUUsQ0FGa0M7QUFHcEMsZUFBTSxDQUg4QjtBQUlwQyxnQkFBTyxDQUo2QjtBQUtwQyxh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bEM7QUFIZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFLaEIsU0FBSyxLQUFMLEdBQWEsS0FBYjs7QUFFQSxXQUFPLEtBQUssS0FBWjtBQUNELEdBOUVVO0FBZ0ZYLGVBaEZXLDJCQWdGMkI7QUFBQTs7QUFBQSxRQUF2QixjQUF1Qix5REFBUixLQUFROztBQUNwQyxRQUFJLFdBQVcsaUJBQWlCLE9BQU8sUUFBUCxDQUFnQixLQUFqQyxHQUF5QyxPQUFPLFFBQVAsQ0FBZ0IsS0FBeEU7Ozs7O0FBRG9DO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsWUFNM0IsV0FOMkI7O0FBT2xDLGNBQUssTUFBTCxDQUFZLGdCQUFaLENBQThCLFdBQTlCLEVBQTJDLGlCQUFTO0FBQ2xELGNBQUksT0FBTyxNQUFNLE9BQU8sV0FBYixDQUFQLEtBQXVDLFVBQTNDLEVBQXlELE1BQU0sT0FBTyxXQUFiLEVBQTRCLEtBQTVCO0FBQzFELFNBRkQ7QUFQa0M7O0FBTXBDLDRCQUF3QixRQUF4QixtSUFBbUM7QUFBQTtBQUlsQztBQVZtQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBWXJDLEdBNUZVOzs7QUE4RlgsWUFBVTtBQUNSLFdBQU8sQ0FDTCxTQURLLEVBRUwsV0FGSyxFQUdMLFdBSEssQ0FEQztBQU1SLFdBQU87QUFOQztBQTlGQyxDQUFiOztBQXdHQSxPQUFPLE9BQVAsR0FBaUIsTUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibGV0IEZpbHRlcnMgPSB7XG4gIFNjYWxlKCBpbm1pbj0wLCBpbm1heD0xLCBvdXRtaW49LTEsIG91dG1heD0xICkge1xuICAgIGxldCBpbnJhbmdlICA9IGlubWF4IC0gaW5taW4sXG4gICAgICAgIG91dHJhbmdlID0gb3V0bWF4IC0gb3V0bWluLFxuICAgICAgICByYW5nZVJhdGlvID0gb3V0cmFuZ2UgLyBpbnJhbmdlXG5cbiAgICByZXR1cm4gaW5wdXQgPT4gb3V0bWluICsgaW5wdXQgKiByYW5nZVJhdGlvXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWx0ZXJzXG4iLCIvLyBFdmVyeXRoaW5nIHdlIG5lZWQgdG8gaW5jbHVkZSBnb2VzIGhlcmUgYW5kIGlzIGZlZCB0byBicm93c2VyaWZ5IGluIHRoZSBndWxwZmlsZS5qc1xubGV0IGxpYiA9IHtcbiAgUGFuZWw6IHJlcXVpcmUoICcuL3BhbmVsLmpzJyApLFxuICBTbGlkZXI6IHJlcXVpcmUoICcuL3NsaWRlci5qcycgKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpYlxuIiwibGV0IFBhbmVsID0ge1xuICBkZWZhdWx0czoge1xuICAgIGZ1bGxzY3JlZW46ZmFsc2VcbiAgfSxcblxuICBjcmVhdGUoIHByb3BzID0gbnVsbCApIHtcbiAgICBsZXQgcGFuZWwgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICAvLyBkZWZhdWx0OiBmdWxsIHdpbmRvdyBpbnRlcmZhY2VcbiAgICBpZiggcHJvcHMgPT09IG51bGwgKSB7XG4gICAgICAgIFxuICAgICAgT2JqZWN0LmFzc2lnbiggcGFuZWwsIFBhbmVsLmRlZmF1bHRzLCB7XG4gICAgICAgIHg6MCxcbiAgICAgICAgeTowLFxuICAgICAgICB3aWR0aDoxLFxuICAgICAgICBoZWlnaHQ6MSxcbiAgICAgICAgX194OiAwLFxuICAgICAgICBfX3k6IDAsXG4gICAgICAgIF9fd2lkdGg6IG51bGwsXG4gICAgICAgIF9faGVpZ2h0Om51bGwsXG4gICAgICAgIGZ1bGxzY3JlZW46IHRydWUsXG4gICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgfSlcbiAgICAgIFxuICAgICAgcGFuZWwuZGl2ID0gUGFuZWwuX19jcmVhdGVIVE1MRWxlbWVudCgpXG4gICAgICBwYW5lbC5sYXlvdXQoKVxuXG4gICAgICBsZXQgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICdib2R5JyApXG4gICAgICBib2R5LmFwcGVuZENoaWxkKCBwYW5lbC5kaXYgKVxuICAgIH1cblxuICAgIHJldHVybiBwYW5lbFxuICB9LFxuICBcbiAgX19jcmVhdGVIVE1MRWxlbWVudCgpIHtcbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKVxuICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbiAgICBkaXYuc3R5bGUuZGlzcGxheSAgPSAnYmxvY2snXG4gICAgXG4gICAgcmV0dXJuIGRpdlxuICB9LFxuXG4gIGxheW91dCgpIHtcbiAgICBpZiggdGhpcy5mdWxsc2NyZWVuICkge1xuICAgICAgdGhpcy5fX3dpZHRoICA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgICB0aGlzLl9faGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICB0aGlzLl9feCAgICAgID0gdGhpcy54ICogdGhpcy5fX3dpZHRoXG4gICAgICB0aGlzLl9feSAgICAgID0gdGhpcy55ICogdGhpcy5fX2hlaWdodFxuXG4gICAgICB0aGlzLmRpdi5zdHlsZS53aWR0aCAgPSB0aGlzLl9fd2lkdGggKyAncHgnXG4gICAgICB0aGlzLmRpdi5zdHlsZS5oZWlnaHQgPSB0aGlzLl9faGVpZ2h0ICsgJ3B4J1xuICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCAgID0gdGhpcy5fX3ggKyAncHgnXG4gICAgICB0aGlzLmRpdi5zdHlsZS50b3AgICAgPSB0aGlzLl9feSArICdweCdcbiAgICB9XG4gIH0sXG5cbiAgZ2V0V2lkdGgoKSAgeyByZXR1cm4gdGhpcy5fX3dpZHRoIH0sXG4gIGdldEhlaWdodCgpIHsgcmV0dXJuIHRoaXMuX19oZWlnaHQgfSxcblxuICBhZGQoIHdpZGdldCApIHtcbiAgICAvLyBjaGVjayB0byBtYWtlIHN1cmUgd2lkZ2V0IGhhcyBub3QgYmVlbiBhbHJlYWR5IGFkZGVkXG4gICAgaWYoIHRoaXMuY2hpbGRyZW4uaW5kZXhPZiggd2lkZ2V0ICkgPT09IC0xICkge1xuICAgICAgdGhpcy5kaXYuYXBwZW5kQ2hpbGQoIHdpZGdldC5jYW52YXMgKVxuICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKCB3aWRnZXQgKVxuICAgIH1lbHNle1xuICAgICAgdGhyb3cgRXJyb3IoICdXaWRnZXQgaXMgYWxyZWFkeSBhZGRlZCB0byBwYW5lbC4nIClcbiAgICB9XG4gIH0sXG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYW5lbCBcbiIsImxldCBXaWRnZXQgPSByZXF1aXJlKCAnLi93aWRnZXQuanMnICksXG4gICAgU2xpZGVyID0gT2JqZWN0LmNyZWF0ZSggV2lkZ2V0ICkgXG5cbi8vIGZsZXhpYmxlIHRhcmdldGluZyg/KSBzeXN0ZW1cbi8vIHRoZW1pbmc/XG4vLyB1bml0IHRlc3RzXG5cbk9iamVjdC5hc3NpZ24oIFNsaWRlciwge1xuXG4gIC8vIGRlZmF1bHRzIGFyZSBhc3NpZ25lZCB0byBlYWNoIHdpZGdldCwgYnV0IGNhbiBiZSBvdmVycmlkZGVuIGJ5XG4gIC8vIHVzZXItZGVmaW5lZCBwcm9wZXJ0aWVzIHBhc3NlZCB0byBjb25zdHJ1Y3RvclxuICBkZWZhdWx0czoge1xuICAgIF9fdmFsdWU6LjUsIC8vIGFsd2F5cyAwLTEsIG5vdCBmb3IgZW5kLXVzZXJzXG4gICAgdmFsdWU6LjUsICAgLy8gZW5kLXVzZXIgdmFsdWUgdGhhdCBtYXkgYmUgZmlsdGVyZWRcbiAgICBiYWNrZ3JvdW5kOidibGFjaycsXG4gICAgZmlsbDonZ3JleScsXG4gICAgYWN0aXZlOiBmYWxzZSxcbiAgICBzdHlsZTonaG9yaXpvbnRhbCdcbiAgfSxcbiAgXG4gIGNyZWF0ZSggcHJvcHMsIGNvbnRhaW5lciA9IHdpbmRvdyApIHtcbiAgICBsZXQgc2xpZGVyID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgLy8gYXBwbHkgV2lkZ2V0IGRlZmF1bHRzLCB0aGVuIG92ZXJ3cml0ZSAoaWYgYXBwbGljYWJsZSkgd2l0aCBTbGlkZXIgZGVmYXVsdHNcbiAgICAvLyBhbmQgdGhlbiBmaW5hbGx5IG92ZXJyaWRlIHdpdGggdXNlciBkZWZhdWx0c1xuICAgIE9iamVjdC5hc3NpZ24oIHNsaWRlciwgV2lkZ2V0LmRlZmF1bHRzLCBTbGlkZXIuZGVmYXVsdHMsIHByb3BzIClcbiAgICBcbiAgICAvLyBzZXQgdW5kZXJseWluZyB2YWx1ZSBpZiBuZWNlc3NhcnkuLi4gVE9ETzogaG93IHNob3VsZCB0aGlzIGJlIHNldCBnaXZlbiBtaW4vbWF4P1xuICAgIGlmKCBwcm9wcy52YWx1ZSApIHNsaWRlci5fX3ZhbHVlID0gcHJvcHMudmFsdWVcbiAgICAgIFxuICAgIC8vIGluaGVyaXRlZCBmcm9tIHdpZGdldCwgcGxhY2VzIGNhbnZhcyBvYmogb24gc2NyZWVuXG4gICAgc2xpZGVyLmluaXQoIGNvbnRhaW5lciApXG5cbiAgICAvLyByZWdpc3RlciBldmVudCBoYW5kbGVyc1xuICAgIHNsaWRlci5hZGRFdmVudHMoKVxuXG4gICAgXG4gICAgcmV0dXJuIHNsaWRlclxuICB9LFxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICAvLyBvbmx5IGxpc3RlbiBmb3IgbW91c2Vkb3duIGludGlhbGx5OyBtb3VzZW1vdmUgYW5kIG1vdXNldXAgYXJlIHJlZ2lzdGVyZWRcbiAgICAvLyBvbiBtb3VzZWRvd25cbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgdGhpcy5fX21vdXNlZG93bi5iaW5kKCB0aGlzICkgKVxuXG4gICAgLy8gYmluZCBldmVudCBoYW5kbGVycyB0byBzbGlkZXIgaW5zdGFuY2VcbiAgICB0aGlzLl9fbW91c2Vtb3ZlID0gdGhpcy5fX21vdXNlbW92ZS5iaW5kKCB0aGlzIClcbiAgICB0aGlzLl9fbW91c2V1cCAgID0gdGhpcy5fX21vdXNldXAuYmluZCggdGhpcyApXG4gIH0sXG5cbiAgZHJhdygpIHtcbiAgICAvLyBkcmF3IGJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwwLHRoaXMuX193aWR0aCwgIHRoaXMuX19oZWlnaHQgKVxuXG4gICAgLy8gZHJhdyBmaWxsIChzbGlkZXIgdmFsdWUgcmVwcmVzZW50YXRpb24pXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5maWxsXG5cbiAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvcml6b250YWwnIClcbiAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLDAsIHRoaXMuX193aWR0aCAqIHRoaXMuX192YWx1ZSwgdGhpcy5fX2hlaWdodCApXG4gICAgZWxzZVxuICAgICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsIHRoaXMuX19oZWlnaHQgLSB0aGlzLl9fdmFsdWUgKiB0aGlzLl9faGVpZ2h0LCB0aGlzLl9fd2lkdGgsIHRoaXMuX19oZWlnaHQgKiB0aGlzLl9fdmFsdWUgKVxuICB9LFxuXG4gIF9fbW91c2Vkb3duKCBlICkgeyBcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCB0aGlzLl9fbW91c2Vtb3ZlIClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCAgIHRoaXMuX19tb3VzZXVwIClcbiAgfSxcblxuICBfX21vdXNldXAoIGUgKSAgIHtcbiAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlICBcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIHRoaXMuX19tb3VzZW1vdmUgKSBcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCAgIHRoaXMuX19tb3VzZXVwICkgXG4gIH0sXG5cbiAgX19tb3VzZW1vdmUoIGUgKSB7XG4gICAgaWYoIHRoaXMuYWN0aXZlICkge1xuICAgICAgbGV0IHByZXZWYWx1ZSA9IHRoaXMudmFsdWVcblxuICAgICAgaWYoIHRoaXMuc3R5bGUgPT09ICdob3Jpem9udGFsJyApIHtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gKCBlLmNsaWVudFggLSB0aGlzLnJlY3QubGVmdCApIC8gdGhpcy5fX3dpZHRoXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gMSAtICggZS5jbGllbnRZIC0gdGhpcy5yZWN0LnRvcCAgKSAvIHRoaXMuX19oZWlnaHQgIFxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiggdGhpcy5fX3ZhbHVlID4gMSApIHRoaXMuX192YWx1ZSA9IDFcbiAgICAgIGlmKCB0aGlzLl9fdmFsdWUgPCAwICkgdGhpcy5fX3ZhbHVlID0gMFxuXG4gICAgICB0aGlzLmNhbGN1bGF0ZU91dHB1dCgpXG5cbiAgICAgIGlmKCBwcmV2VmFsdWUgIT09IHRoaXMudmFsdWUgKXtcbiAgICAgICAgaWYoIHR5cGVvZiB0aGlzLm9udmFsdWVjaGFuZ2UgPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgdGhpcy5vbnZhbHVlY2hhbmdlKCB0aGlzLnZhbHVlLCBwcmV2VmFsdWUgKVxuICAgICAgICAgIHRoaXMuZHJhdygpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNsaWRlclxuIiwibGV0IFV0aWxpdGllcyA9IHtcblxuICBnZXRNb2RlKCkge1xuICAgIHJldHVybiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgPyAndG91Y2gnIDogJ21vdXNlJ1xuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbGl0aWVzXG4iLCJsZXQgVXRpbGl0aWVzID0gcmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApLFxuICAgIEZpbHRlcnMgPSByZXF1aXJlKCAnLi9maWx0ZXJzLmpzJyApXG5cbmxldCBXaWRnZXQgPSB7XG5cbiAgZGVmYXVsdHM6IHtcbiAgICB4OjAseTowLHdpZHRoOi4yNSxoZWlnaHQ6LjI1LFxuICAgIGF0dGFjaGVkOmZhbHNlLFxuICAgIG1pbjowLCBtYXg6MSxcbiAgICBzY2FsZU91dHB1dDp0cnVlLCAvLyBhcHBseSBzY2FsZSBmaWx0ZXIgYnkgZGVmYXVsdCBmb3IgbWluIC8gbWF4IHJhbmdlc1xuICB9LFxuXG4gIGluaXQoIGNvbnRhaW5lciA9IHdpbmRvdyApIHtcbiAgICBsZXQgc2hvdWxkVXNlVG91Y2ggPSBVdGlsaXRpZXMuZ2V0TW9kZSgpID09PSAndG91Y2gnXG4gICAgXG4gICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXJcbiAgICB0aGlzLmNhbnZhcyA9IHRoaXMuY3JlYXRlQ2FudmFzKClcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoICcyZCcgKVxuXG4gICAgdGhpcy5hcHBseUhhbmRsZXJzKCBzaG91bGRVc2VUb3VjaCApXG5cbiAgICBpZiggY29udGFpbmVyICE9PSBudWxsICkgeyAvLyBkbyBub3QgcGxhY2UgYWNjZWxlcm9tZXRlciwgZ3lybyBldGMuXG4gICAgICB0aGlzLnBsYWNlKClcbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfVxuICAgIFxuICAgIHRoaXMuZmlsdGVycyA9IFtdXG5cbiAgICAvLyBpZiBtaW4vbWF4IGFyZSBub3QgMC0xIGFuZCBzY2FsaW5nIGlzIG5vdCBkaXNhYmxlZFxuICAgIGlmKCB0aGlzLnNjYWxlT3V0cHV0ICYmICh0aGlzLm1pbiAhPT0gMCB8fCB0aGlzLm1heCAhPT0gMSApKSB7ICAgICAgXG4gICAgICB0aGlzLmZpbHRlcnMucHVzaCggXG4gICAgICAgIEZpbHRlcnMuU2NhbGUoIDAsMSx0aGlzLm1pbix0aGlzLm1heCApIFxuICAgICAgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gdGhpc1xuICB9LFxuICBcbiAgY3JlYXRlQ2FudmFzKCkge1xuICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApXG4gICAgY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICAgIGNhbnZhcy5zdHlsZS5kaXNwbGF5ICA9ICdibG9jaydcbiAgICBcbiAgICByZXR1cm4gY2FudmFzXG4gIH0sXG5cbiAgLy8gdXNlIENTUyB0byBwb3NpdGlvbiBjYW52YXMgZWxlbWVudCBvZiB3aWRnZXRcbiAgcGxhY2UoKSB7XG4gICAgbGV0IGNvbnRhaW5lcldpZHRoID0gdGhpcy5jb250YWluZXIuZ2V0V2lkdGgoKSxcbiAgICAgICAgY29udGFpbmVySGVpZ2h0PSB0aGlzLmNvbnRhaW5lci5nZXRIZWlnaHQoKSxcbiAgICAgICAgd2lkdGggID0gY29udGFpbmVyV2lkdGggICogdGhpcy53aWR0aCxcbiAgICAgICAgaGVpZ2h0ID0gY29udGFpbmVySGVpZ2h0ICogdGhpcy5oZWlnaHQsXG4gICAgICAgIHggICAgICA9IGNvbnRhaW5lcldpZHRoICAqIHRoaXMueCxcbiAgICAgICAgeSAgICAgID0gY29udGFpbmVySGVpZ2h0ICogdGhpcy55XG5cbiAgICBpZiggIXRoaXMuYXR0YWNoZWQgKSB7XG4gICAgICB0aGlzLmNvbnRhaW5lci5hZGQoIHRoaXMgKVxuICAgICAgdGhpcy5hdHRhY2hlZCA9IHRydWVcbiAgICB9XG5cbiAgICB0aGlzLl9fd2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLl9faGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5jYW52YXMud2lkdGggID0gd2lkdGhcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4J1xuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodFxuICAgIHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCdcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5sZWZ0ID0geFxuICAgIHRoaXMuY2FudmFzLnN0eWxlLnRvcCAgPSB5XG5cbiAgICB0aGlzLnJlY3QgPSB0aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSBcbiAgfSxcblxuICBjYWxjdWxhdGVPdXRwdXQoKSB7XG4gICAgbGV0IHZhbHVlID0gdGhpcy5fX3ZhbHVlXG5cbiAgICBmb3IoIGxldCBmaWx0ZXIgb2YgdGhpcy5maWx0ZXJzICkgdmFsdWUgPSBmaWx0ZXIoIHZhbHVlIClcblxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICAgIFxuICAgIHJldHVybiB0aGlzLnZhbHVlXG4gIH0sXG5cbiAgYXBwbHlIYW5kbGVycyggc2hvdWxkVXNlVG91Y2g9ZmFsc2UgKSB7XG4gICAgbGV0IGhhbmRsZXJzID0gc2hvdWxkVXNlVG91Y2ggPyBXaWRnZXQuaGFuZGxlcnMudG91Y2ggOiBXaWRnZXQuaGFuZGxlcnMubW91c2VcbiAgICBcbiAgICAvLyB3aWRnZXRzIGhhdmUgaWpzIGRlZmluZWQgaGFuZGxlcnMgc3RvcmVkIGluIHRoZSBfZXZlbnRzIGFycmF5LFxuICAgIC8vIGFuZCB1c2VyLWRlZmluZWQgZXZlbnRzIHN0b3JlZCB3aXRoICdvbicgcHJlZml4ZXMgKGUuZy4gb25jbGljaywgb25tb3VzZWRvd24pXG5cbiAgICBmb3IoIGxldCBoYW5kbGVyTmFtZSBvZiBoYW5kbGVycyApIHtcbiAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoIGhhbmRsZXJOYW1lLCBldmVudCA9PiB7XG4gICAgICAgIGlmKCB0eXBlb2YgdGhpc1sgJ29uJyArIGhhbmRsZXJOYW1lIF0gID09PSAnZnVuY3Rpb24nICApIHRoaXNbICdvbicgKyBoYW5kbGVyTmFtZSBdKCBldmVudCApXG4gICAgICB9KVxuICAgIH1cblxuICB9LFxuXG4gIGhhbmRsZXJzOiB7XG4gICAgbW91c2U6IFtcbiAgICAgICdtb3VzZXVwJyxcbiAgICAgICdtb3VzZW1vdmUnLFxuICAgICAgJ21vdXNlZG93bicsXG4gICAgXSxcbiAgICB0b3VjaDogW11cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBXaWRnZXRcbiJdfQ==
