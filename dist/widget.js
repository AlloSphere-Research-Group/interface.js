'use strict';

var Utilities = require('./utilities.js'),
    Filters = require('./filters.js');

var Widget = {

  defaults: {
    x: 0, y: 0, width: .25, height: .25,
    attached: false,
    min: 0, max: 1,
    useCanvas: true,
    scaleOutput: true },

  init: function init() {
    var container = arguments.length <= 0 || arguments[0] === undefined ? window : arguments[0];

    var shouldUseTouch = Utilities.getMode() === 'touch';

    this.container = container;
    this.element = this.createElement();

    if (this.useCanvas) this.ctx = this.element.getContext('2d');

    this.applyHandlers(shouldUseTouch);

    if (container !== null) {
      // do not place accelerometer, gyro etc. TODO: should these have display widgets?
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


  // use CSS to position element element of widget
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

    this.element.width = width;
    this.element.style.width = width + 'px';
    this.element.height = height;
    this.element.style.height = height + 'px';
    this.element.style.left = x;
    this.element.style.top = y;

    this.rect = this.element.getBoundingClientRect();
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

        _this.element.addEventListener(handlerName, function (event) {
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