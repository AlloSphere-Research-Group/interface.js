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