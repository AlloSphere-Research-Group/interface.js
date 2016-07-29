(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Interface = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _canvasWidget = require('./canvasWidget');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A Button with three different styles: 'momentary' triggers a flash and instaneous output, 
 * 'hold' outputs the buttons maximum value until it is released, and 'toggle' alternates 
 * between outputting maximum and minimum values on press. 
 * 
 * @module Button
 * @augments CanvasWidget
 */

var Button = Object.create(_canvasWidget2.default);

Object.assign(Button, {

  /** @lends Button.prototype */

  /**
   * A set of default property settings for all Button instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Button
   * @static
   */
  defaults: {
    __value: 0,
    value: 0,
    active: false,

    /**
     * The style property can be 'momentary', 'hold', or 'toggle'. This
     * determines the interaction of the Button instance.
     * @memberof Button
     * @instance
     * @type {String}
     */
    style: 'toggle'
  },

  /**
   * Create a new Button instance.
   * @memberof Button
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize a Button instance with.
   * @static
   */
  create: function create(props) {
    var button = Object.create(this);

    _canvasWidget2.default.create.call(button);

    Object.assign(button, Button.defaults, props);

    if (props.value) button.__value = props.value;

    button.init();

    return button;
  },


  /**
   * Draw the Button into its canvas context using the current .__value property and button style.
   * @memberof Button
   * @instance
   */
  draw: function draw() {
    this.ctx.fillStyle = this.__value === 1 ? this.fill : this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    this.ctx.strokeRect(0, 0, this.rect.width, this.rect.height);
  },
  addEvents: function addEvents() {
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    this.element.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      var _this = this;

      // only hold needs to listen for pointerup events; toggle and momentary only care about pointerdown
      if (this.style === 'hold') {
        this.active = true;
        this.pointerId = e.pointerId;
        window.addEventListener('pointerup', this.pointerup);
      }

      if (this.style === 'toggle') {
        this.__value = this.__value === 1 ? 0 : 1;
      } else if (this.style === 'momentary') {
        this.__value = 1;
        setTimeout(function () {
          _this.__value = 0;_this.draw();
        }, 50);
      } else if (this.style === 'hold') {
        this.__value = 1;
      }

      this.output();

      this.draw();
    },
    pointerup: function pointerup(e) {
      if (this.active && e.pointerId === this.pointerId && this.style === 'hold') {
        this.active = false;

        window.removeEventListener('pointerup', this.pointerup);

        this.__value = 0;
        this.output();

        this.draw();
      }
    }
  }
});

exports.default = Button;

},{"./canvasWidget":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _domWidget = require('./domWidget');

var _domWidget2 = _interopRequireDefault(_domWidget);

var _utilities = require('./utilities');

var _utilities2 = _interopRequireDefault(_utilities);

var _widgetLabel = require('./widgetLabel');

var _widgetLabel2 = _interopRequireDefault(_widgetLabel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * CanvasWidget is the base class for widgets that use HTML canvas elements.
 * @module CanvasWidget
 * @augments DOMWidget
 */

var CanvasWidget = Object.create(_domWidget2.default);

Object.assign(CanvasWidget, {
  /** @lends CanvasWidget.prototype */

  /**
   * A set of default colors and canvas context properties for use in CanvasWidgets
   * @type {Object}
   * @static
   */
  defaults: {
    background: '#888',
    fill: '#aaa',
    stroke: 'rgba(255,255,255,.3)',
    lineWidth: 4,
    defaultLabel: {
      x: .5, y: .5, align: 'center', width: 1, text: 'demo'
    },
    shouldDisplayValue: false
  },
  /**
   * Create a new CanvasWidget instance
   * @memberof CanvasWidget
   * @constructs
   * @static
   */
  create: function create(props) {
    var shouldUseTouch = _utilities2.default.getMode() === 'touch';

    _domWidget2.default.create.call(this);

    Object.assign(this, CanvasWidget.defaults);

    /**
     * Store a reference to the canvas 2D context.
     * @memberof CanvasWidget
     * @instance
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = this.element.getContext('2d');

    this.applyHandlers(shouldUseTouch);
  },


  /**
   * Create a the canvas element used by the widget and set
   * some default CSS values.
   * @memberof CanvasWidget
   * @static
   */
  createElement: function createElement() {
    var element = document.createElement('canvas');
    element.setAttribute('touch-action', 'none');
    element.style.position = 'absolute';
    element.style.display = 'block';

    return element;
  },
  applyHandlers: function applyHandlers() {
    var _this = this;

    var shouldUseTouch = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var handlers = shouldUseTouch ? CanvasWidget.handlers.touch : CanvasWidget.handlers.mouse;

    // widgets have ijs defined handlers stored in the _events array,
    // and user-defined events stored with 'on' prefixes (e.g. onclick, onmousedown)
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var _loop = function _loop() {
        var handlerName = _step.value;

        _this.element.addEventListener(handlerName, function (event) {
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
    mouse: ['mouseup', 'mousemove', 'mousedown'],
    touch: []
  },

  addLabel: function addLabel() {
    var props = Object.assign({ ctx: this.ctx }, this.label || this.defaultLabel),
        label = _widgetLabel2.default.create(props);

    this.label = label;
    this._draw = this.draw;
    this.draw = function () {
      this._draw();
      this.label.draw();
    };
  },
  __addToPanel: function __addToPanel(panel) {
    var _this2 = this;

    this.container = panel;

    if (typeof this.addEvents === 'function') this.addEvents();

    // called if widget uses DOMWidget as prototype; .place inherited from DOMWidget
    this.place();

    if (this.label || this.shouldDisplayValue) this.addLabel();
    if (this.shouldDisplayValue) {
      this.__postfilters.push(function (value) {
        _this2.label.text = value.toFixed(5);
        return value;
      });
    }
    this.draw();
  }
});

exports.default = CanvasWidget;

},{"./domWidget":4,"./utilities":14,"./widgetLabel":16}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _widget = require('./widget');

var _widget2 = _interopRequireDefault(_widget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Communication = {
  Socket: null,
  initialized: false,

  init: function init() {
    var _this = this;

    this.Socket = new WebSocket(this.getServerAddress());
    this.Socket.onmessage = this.onmessage;

    var fullLocation = window.location.toString(),
        locationSplit = fullLocation.split('/'),
        interfaceName = locationSplit[locationSplit.length - 1];

    this.Socket.onopen = function () {
      _this.Socket.send(JSON.stringify({ type: 'meta', interfaceName: interfaceName, key: 'register' }));
    };

    this.initialized = true;
  },
  getServerAddress: function getServerAddress() {
    var expr = void 0,
        socketIPAndPort = void 0,
        socketString = void 0,
        ip = void 0,
        port = void 0;

    expr = /[-a-zA-Z0-9.]+(:(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}))/;

    socketIPAndPort = expr.exec(window.location.toString())[0].split(':');
    ip = socketIPAndPort[0];
    port = parseInt(socketIPAndPort[1]);

    socketString = 'ws://' + ip + ':' + port;

    return socketString;
  },
  onmessage: function onmessage(e) {
    var data = JSON.parse(e.data);
    if (data.type === 'osc') {
      Communication.OSC._receive(e.data);
    } else {
      if (Communication.Socket.receive) {
        Communication.Socket.receive(data.address, data.parameters);
      }
    }
  },


  OSC: {
    callbacks: {},
    onmessage: null,

    send: function send(address, parameters) {
      if (Communication.Socket.readyState === 1) {
        if (typeof address === 'string') {
          var msg = {
            type: "osc",
            address: address,
            'parameters': Array.isArray(parameters) ? parameters : [parameters]
          };

          Communication.Socket.send(JSON.stringify(msg));
        } else {
          throw Error('Invalid osc message:', arguments);
        }
      } else {
        throw Error('Socket is not yet connected; cannot send OSC messsages.');
      }
    },
    receive: function receive(data) {
      var msg = JSON.parse(data);

      if (msg.address in this.callbacks) {
        this.callbacks[msg.address](msg.parameters);
      } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = _widget2.default.widgets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var widget = _step.value;

            //console.log( "CHECK", child.key, msg.address )
            if (widget.key === msg.address) {
              //console.log( child.key, msg.parameters )
              widget.setValue.apply(widget, msg.parameters);
              return;
            }
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

        if (this.onmessage !== null) {
          this.receive(msg.address, msg.typetags, msg.parameters);
        }
      }
    }
  }

};

exports.default = Communication;

},{"./widget":15}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _widget = require('./widget');

var _widget2 = _interopRequireDefault(_widget);

var _utilities = require('./utilities');

var _utilities2 = _interopRequireDefault(_utilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * DOMWidget is the base class for widgets that use HTML canvas elements.
 * @augments Widget
 */

var DOMWidget = Object.create(_widget2.default);

Object.assign(DOMWidget, {
  /** @lends DOMWidget.prototype */

  /**
   * A set of default property settings for all DOMWidgets
   * @type {Object}
   * @static
   */
  defaults: {
    x: 0, y: 0, width: .25, height: .25,
    attached: false
  },

  /**
   * Create a new DOMWidget instance
   * @memberof DOMWidget
   * @constructs
   * @static
   */
  create: function create() {
    var shouldUseTouch = _utilities2.default.getMode() === 'touch';

    _widget2.default.create.call(this);

    Object.assign(this, DOMWidget.defaults);

    // ALL INSTANCES OF DOMWIDGET MUST IMPLEMENT CREATE ELEMENT
    if (typeof this.createElement === 'function') {

      /**
       * The DOM element used by the DOMWidget
       * @memberof DOMWidget
       * @instance
       */
      this.element = this.createElement();
    } else {
      throw new Error('widget inheriting from DOMWidget does not implement createElement method; this is required.');
    }
  },


  /**
   * Create a DOM element to be placed in a Panel.
   * @virtual
   * @memberof DOMWidget
   * @static
   */
  createElement: function createElement() {
    throw Error('all subclasses of DOMWidget must implement createElement()');
  },


  /**
   * use CSS to position element element of widget
   * @memberof DOMWidget
   */
  place: function place() {
    var containerWidth = this.container.getWidth(),
        containerHeight = this.container.getHeight(),
        width = this.width <= 1 ? containerWidth * this.width : this.width,
        height = this.height <= 1 ? containerHeight * this.height : this.height,
        x = this.x < 1 ? containerWidth * this.x : this.x,
        y = this.y < 1 ? containerHeight * this.y : this.y;

    if (!this.attached) {
      this.attached = true;
    }

    if (this.isSquare) {
      if (height > width) {
        height = width;
      } else {
        width = height;
      }
    }

    this.element.width = width;
    this.element.style.width = width + 'px';
    this.element.height = height;
    this.element.style.height = height + 'px';
    this.element.style.left = x;
    this.element.style.top = y;

    /**
     * Bounding box, in absolute coordinates, of the DOMWidget
     * @memberof DOMWidget
     * @instance
     * @type {Object}
     */
    this.rect = this.element.getBoundingClientRect();
  }
});

exports.default = DOMWidget;

},{"./utilities":14,"./widget":15}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

exports.default = Filters;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiButton = exports.MultiSlider = exports.Knob = exports.Communication = exports.Menu = exports.Button = exports.Joystick = exports.Slider = exports.Panel = undefined;

var _panel = require('./panel');

var _panel2 = _interopRequireDefault(_panel);

var _slider = require('./slider');

var _slider2 = _interopRequireDefault(_slider);

var _joystick = require('./joystick');

var _joystick2 = _interopRequireDefault(_joystick);

var _button = require('./button');

var _button2 = _interopRequireDefault(_button);

var _menu = require('./menu');

var _menu2 = _interopRequireDefault(_menu);

var _communication = require('./communication');

var _communication2 = _interopRequireDefault(_communication);

var _pepjs = require('pepjs');

var _pepjs2 = _interopRequireDefault(_pepjs);

var _knob = require('./knob');

var _knob2 = _interopRequireDefault(_knob);

var _multislider = require('./multislider');

var _multislider2 = _interopRequireDefault(_multislider);

var _multiButton = require('./multiButton');

var _multiButton2 = _interopRequireDefault(_multiButton);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Everything we need to include goes here and is fed to browserify in the gulpfile.js

exports.Panel = _panel2.default;
exports.Slider = _slider2.default;
exports.Joystick = _joystick2.default;
exports.Button = _button2.default;
exports.Menu = _menu2.default;
exports.Communication = _communication2.default;
exports.Knob = _knob2.default;
exports.MultiSlider = _multislider2.default;
exports.MultiButton = _multiButton2.default;

},{"./button":1,"./communication":3,"./joystick":7,"./knob":8,"./menu":9,"./multiButton":10,"./multislider":11,"./panel":12,"./slider":13,"pepjs":17}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A joystick that can be used to select an XY position and then snaps back. 
 * @module Joystick
 * @augments CanvasWidget
 */

var Joystick = Object.create(_canvasWidget2.default);

Object.assign(Joystick, {
  /** @lends Joystick.prototype */

  /**
   * A set of default property settings for all Joystick instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Joystick
   * @static
   */
  defaults: {
    __value: [.5, .5], // always 0-1, not for end-users
    value: [.5, .5], // end-user value that may be filtered
    active: false
  },

  /**
   * Create a new Joystick instance.
   * @memberof Joystick
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize Slider with.
   * @static
   */
  create: function create(props) {
    var joystick = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with Slider defaults
    _canvasWidget2.default.create.call(joystick);

    // ...and then finally override with user defaults
    Object.assign(joystick, Joystick.defaults, props);

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) joystick.__value = props.value;

    // inherits from Widget
    joystick.init();

    return joystick;
  },


  /**
   * Draw the Joystick onto its canvas context using the current .__value property.
   * @memberof Joystick
   * @instance
   */
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    // draw fill (slider value representation)
    this.ctx.fillStyle = this.fill;

    this.ctx.beginPath();
    this.ctx.moveTo(this.rect.width * 0.5, this.rect.height * .5);
    this.ctx.lineTo(this.rect.width * this.__value[0], this.rect.height * this.__value[1]);
    this.ctx.stroke();
    this.ctx.fillRect(this.rect.width * this.__value[0] - 12, this.rect.height * this.__value[1] - 12, 24, 24);

    this.ctx.strokeRect(0, 0, this.rect.width, this.rect.height);
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      this.active = true;
      this.pointerId = e.pointerId;

      this.processPointerPosition(e); // change slider value on click / touchdown

      window.addEventListener('pointermove', this.pointermove); // only listen for up and move events after pointerdown
      window.addEventListener('pointerup', this.pointerup);
    },
    pointerup: function pointerup(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.active = false;
        window.removeEventListener('pointermove', this.pointermove);
        window.removeEventListener('pointerup', this.pointerup);
        this.__value = [.5, .5];
        this.output();
        this.draw();
      }
    },
    pointermove: function pointermove(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.processPointerPosition(e);
      }
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the Joystick's position, and triggers output.
   * @instance
   * @memberof Joystick
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition: function processPointerPosition(e) {

    this.__value[0] = (e.clientX - this.rect.left) / this.rect.width;
    this.__value[1] = (e.clientY - this.rect.top) / this.rect.height;

    // clamp __value, which is only used internally
    if (this.__value[0] > 1) this.__value[0] = 1;
    if (this.__value[1] > 1) this.__value[1] = 1;
    if (this.__value[0] < 0) this.__value[0] = 0;
    if (this.__value[1] < 0) this.__value[1] = 0;

    var shouldDraw = this.output();

    if (shouldDraw) this.draw();
  }
});

exports.default = Joystick;

},{"./canvasWidget.js":2}],8:[function(require,module,exports){
'use strict';

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A horizontal or vertical fader. 
 * @module Knob
 * @augments CanvasWidget
 */

var Knob = Object.create(_canvasWidget2.default);

Object.assign(Knob, {
  /** @lends Knob.prototype */

  /**
   * A set of default property settings for all Knob instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Knob
   * @static
   */
  defaults: {
    __value: .5, // always 0-1, not for end-users
    value: .5, // end-user value that may be filtered
    active: false,
    knobBuffer: 20,
    usesRotation: false,
    lastPosition: 0,
    isSquare: true,
    /**
     * The style property can be either 'horizontal' (the default) or 'vertical'. This
     * determines the orientation of the Knob instance.
     * @memberof Knob
     * @instance
     * @type {String}
     */
    style: 'horizontal'
  },

  /**
   * Create a new Knob instance.
   * @memberof Knob
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize Knob with.
   * @static
   */
  create: function create(props) {
    var knob = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with Knob defaults
    _canvasWidget2.default.create.call(knob);

    // ...and then finally override with user defaults
    Object.assign(knob, Knob.defaults, props);

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) knob.__value = props.value;

    // inherits from Widget
    knob.init();

    return knob;
  },


  /**
   * Draw the Knob onto its canvas context using the current .__value property.
   * @memberof Knob
   * @instance
   */
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.container.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;

    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    var x = 0,
        y = 0,
        width = this.rect.width,
        height = this.rect.height,
        radius = width / 2;

    this.ctx.fillRect(x, y, width, height);
    //this.ctx.strokeStyle = this.stroke

    this.ctx.fillStyle = this.background; // draw background of widget first

    var angle0 = Math.PI * .6,
        angle1 = Math.PI * .4;

    this.ctx.beginPath();
    this.ctx.arc(x + radius, y + radius, radius - this.knobBuffer, angle0, angle1, false);
    this.ctx.arc(x + radius, y + radius, (radius - this.knobBuffer) * .5, angle1, angle0, true);
    this.ctx.closePath();

    this.ctx.fill();

    var angle2 = void 0;
    if (!this.isInverted) {
      angle2 = Math.PI * .6 + this.__value * 1.8 * Math.PI;
      if (angle2 > 2 * Math.PI) angle2 -= 2 * Math.PI;
    } else {
      angle2 = Math.PI * (0.4 - 1.8 * this.__value);
    }

    this.ctx.beginPath();

    if (!this.isInverted) {
      this.ctx.arc(x + radius, y + radius, radius - this.knobBuffer, angle0, angle2, false);
      this.ctx.arc(x + radius, y + radius, (radius - this.knobBuffer) * .5, angle2, angle0, true);
    } else {
      this.ctx.arc(x + radius, y + radius, radius - this.knobBuffer, angle1, angle2, true);
      this.ctx.arc(x + radius, y + radius, (radius - this.knobBuffer) * .5, angle2, angle1, false);
    }

    this.ctx.closePath();

    this.ctx.fillStyle = this.fill;
    this.ctx.fill();
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      this.active = true;
      this.pointerId = e.pointerId;

      this.processPointerPosition(e); // change knob value on click / touchdown

      window.addEventListener('pointermove', this.pointermove); // only listen for up and move events after pointerdown
      window.addEventListener('pointerup', this.pointerup);
    },
    pointerup: function pointerup(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.active = false;
        window.removeEventListener('pointermove', this.pointermove);
        window.removeEventListener('pointerup', this.pointerup);
      }
    },
    pointermove: function pointermove(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.processPointerPosition(e);
      }
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the Knob's position, and triggers output.
   * @instance
   * @memberof Knob
   * @param {PointerEvent} e - The pointer event to be processed.
   */

  processPointerPosition: function processPointerPosition(e) {
    var xOffset = e.clientX,
        yOffset = e.clientY;

    var radius = this.rect.width / 2;
    this.lastValue = this.value;

    if (!this.usesRotation) {
      if (this.lastPosition !== -1) {
        //this.__value -= ( yOffset - this.lastPosition ) / (radius * 2);
        this.__value = 1 - yOffset / this.rect.height;
      }
    } else {
      var xdiff = radius - xOffset;
      var ydiff = radius - yOffset;
      var angle = Math.PI + Math.atan2(ydiff, xdiff);
      this.__value = (angle + Math.PI * 1.5) % (Math.PI * 2) / (Math.PI * 2);

      if (this.lastRotationValue > .8 && this.__value < .2) {
        this.__value = 1;
      } else if (this.lastRotationValue < .2 && this.__value > .8) {
        this.__value = 0;
      }
    }

    if (this.__value > 1) this.__value = 1;
    if (this.__value < 0) this.__value = 0;

    this.lastRotationValue = this.__value;
    this.lastPosition = yOffset;

    var shouldDraw = this.output();

    if (shouldDraw) this.draw();
  }
});

module.exports = Knob;

},{"./canvasWidget.js":2}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _domWidget = require('./domWidget.js');

var _domWidget2 = _interopRequireDefault(_domWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A HTML select element, for picking items from a drop-down menu. 
 * 
 * @module Menu
 * @augments DOMWidget
 */
var Menu = Object.create(_domWidget2.default);

Object.assign(Menu, {
  /** @lends Menu.prototype */

  /**
   * A set of default property settings for all Menu instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Menu
   * @static
   */
  defaults: {
    __value: 0,
    value: 0,
    background: '#333',
    fill: '#777',
    stroke: '#aaa',
    borderWidth: 4,

    /**
     * The options array stores the different possible values for the Menu
     * widget. There are used to create HTML option elements which are then
     * attached to the primary select element used by the Menu.
     * @memberof Menu
     * @instance
     * @type {Array}
     */
    options: [],
    onvaluechange: null
  },

  /**
   * Create a new Menu instance.
   * @memberof Menu
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize a Menu with.
   * @static
   */
  create: function create(props) {
    var menu = Object.create(this);

    _domWidget2.default.create.call(menu);

    Object.assign(menu, Menu.defaults, props);

    menu.createOptions();

    menu.element.addEventListener('change', function (e) {
      menu.__value = e.target.value;
      menu.output();

      if (menu.onvaluechange !== null) {
        menu.onvaluechange(menu.value);
      }
    });

    return menu;
  },


  /**
   * Create primary DOM element (select) to be placed in a Panel.
   * @memberof Menu 
   * @instance
   */
  createElement: function createElement() {
    var select = document.createElement('select');

    return select;
  },


  /**
   * Generate option elements for menu. Removes previously appended elements.
   * @memberof Menu 
   * @instance
   */
  createOptions: function createOptions() {
    this.element.innerHTML = '';

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.options[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var option = _step.value;

        var optionEl = document.createElement('option');
        optionEl.setAttribute('value', option);
        optionEl.innerText = option;
        this.element.appendChild(optionEl);
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


  /**
   * Overridden virtual method to add element to panel.
   * @private
   * @memberof Menu 
   * @instance
   */
  __addToPanel: function __addToPanel(panel) {
    this.container = panel;

    if (typeof this.addEvents === 'function') this.addEvents();

    // called if widget uses DOMWidget as prototype; .place inherited from DOMWidget
    this.place();
  }
});

exports.default = Menu;

},{"./domWidget.js":4}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _canvasWidget = require('./canvasWidget');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A MultiButton with three different styles: 'momentary' triggers a flash and instaneous output, 
 * 'hold' outputs the multiButtons maximum value until it is released, and 'toggle' alternates 
 * between outputting maximum and minimum values on press. 
 * 
 * @module MultiButton
 * @augments CanvasWidget
 */

var MultiButton = Object.create(_canvasWidget2.default);

Object.assign(MultiButton, {

  /** @lends MultiButton.prototype */

  /**
   * A set of default property settings for all MultiButton instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof MultiButton
   * @static
   */
  defaults: {
    __value: [0, 0, 0, 0],
    value: [0, 0, 0, 0],
    active: [],
    rows: 2,
    columns: 2,

    /**
     * The style property can be 'momentary', 'hold', or 'toggle'. This
     * determines the interaction of the MultiButton instance.
     * @memberof MultiButton
     * @instance
     * @type {String}
     */
    style: 'toggle'
  },

  /**
   * Create a new MultiButton instance.
   * @memberof MultiButton
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize a MultiButton instance with.
   * @static
   */
  create: function create(props) {
    var multiButton = Object.create(this);

    _canvasWidget2.default.create.call(multiButton);

    Object.assign(multiButton, MultiButton.defaults, props);

    if (props.value) multiButton.__value = props.value;

    multiButton.init();

    return multiButton;
  },


  /**
   * Draw the MultiButton into its canvas context using the current .__value property and multiButton style.
   * @memberof MultiButton
   * @instance
   */
  draw: function draw() {
    this.ctx.fillStyle = this.__value === 1 ? this.fill : this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;

    var buttonWidth = this.rect.width / this.columns,
        buttonHeight = this.rect.height / this.rows;

    for (var row = 0; row < this.rows; row++) {
      var y = row * buttonHeight;
      for (var column = 0; column < this.columns; column++) {
        var x = column * buttonWidth,
            buttonNum = row * this.columns + column;

        this.ctx.fillStyle = this.__value[buttonNum] === 1 ? this.fill : this.background;
        this.ctx.fillRect(x, y, buttonWidth, buttonHeight);
        this.ctx.strokeRect(x, y, buttonWidth, buttonHeight);
      }
    }
  },
  addEvents: function addEvents() {
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    this.element.addEventListener('pointerdown', this.pointerdown);
  },
  getButtonNumFromEvent: function getButtonNumFromEvent(e) {
    var rowSize = 1 / this.rows,
        row = Math.floor(e.clientY / this.rect.height / rowSize),
        columnSize = 1 / this.columns,
        column = Math.floor(e.clientX / this.rect.width / columnSize),
        buttonNum = row * this.columns + column;

    return buttonNum;
  },


  events: {
    pointerdown: function pointerdown(e) {
      var _this = this;

      // only hold needs to listen for pointerup events; toggle and momentary only care about pointerdown
      var buttonNum = this.getButtonNumFromEvent(e);

      if (this.style === 'hold') {
        this.active.push({ id: e.pointerId, buttonNum: buttonNum });
        this.pointerId = e.pointerId;
        window.addEventListener('pointermove', this.pointermove);
        window.addEventListener('pointerup', this.pointerup);
      }

      if (this.style === 'toggle') {
        this.__value[buttonNum] = this.__value[buttonNum] === 1 ? 0 : 1;
      } else if (this.style === 'momentary') {
        this.__value[buttonNum] = 1;
        setTimeout(function () {
          _this.__value[buttonNum] = 0;_this.draw();
        }, 50);
      } else if (this.style === 'hold') {
        this.__value[buttonNum] = 1;
      }

      this.output();

      this.draw();
    },
    pointermove: function pointermove(e) {
      var buttonNum = this.getButtonNumFromEvent(e);
    },
    pointerup: function pointerup(e) {
      if (this.active.length && this.style === 'hold') {
        var idx = this.active.findIndex(function (v) {
          return v.id === e.pointerId;
        });

        this.__value[this.active[idx].buttonNum] = 0;
        this.active.splice(idx, 1);

        window.removeEventListener('pointerup', this.pointerup);
        window.removeEventListener('pointermove', this.pointermove);

        this.output();

        this.draw();
      }
    }
  }
});

exports.default = MultiButton;

},{"./canvasWidget":2}],11:[function(require,module,exports){
'use strict';

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A horizontal or vertical fader. 
 * @module MultiSlider
 * @augments CanvasWidget
 */

var MultiSlider = Object.create(_canvasWidget2.default);

Object.assign(MultiSlider, {
  /** @lends MultiSlider.prototype */

  /**
   * A set of default property settings for all MultiSlider instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof MultiSlider
   * @static
   */
  defaults: {
    __value: [.15, .35, .5, .75], // always 0-1, not for end-users
    value: [.5, .5, .5, .5], // end-user value that may be filtered
    active: false,
    /**
     * The count property determines the number of sliders in the multislider, default 4.
     * @memberof MultiSlider
     * @instance
     * @type {Integer}
     */
    count: 4,
    lineWidth: 1,
    /**
     * The style property can be either 'horizontal' (the default) or 'vertical'. This
     * determines the orientation of the MultiSlider instance.
     * @memberof MultiSlider
     * @instance
     * @type {String}
     */
    style: 'vertical'
  },

  /**
   * Create a new MultiSlider instance.
   * @memberof MultiSlider
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize MultiSlider with.
   * @static
   */
  create: function create(props) {
    var multiSlider = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with MultiSlider defaults
    _canvasWidget2.default.create.call(multiSlider);

    // ...and then finally override with user defaults
    Object.assign(multiSlider, MultiSlider.defaults, props);

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) multiSlider.__value = props.value;

    // inherits from Widget
    multiSlider.init();

    if (props.value === undefined && multiSlider.count !== 4) {
      for (var i = 0; i < multiSlider.count; i++) {
        multiSlider.__value[i] = i / multiSlider.count;
      }
    } else if (typeof props.value === 'number') {
      for (var _i = 0; _i < multiSlider.count; _i++) {
        multiSlider.__value[_i] = props.value;
      }
    }

    return multiSlider;
  },


  /**
   * Draw the MultiSlider onto its canvas context using the current .__value property.
   * @memberof MultiSlider
   * @instance
   */
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    // draw fill (multiSlider value representation)
    this.ctx.fillStyle = this.fill;

    var sliderWidth = this.style === 'vertical' ? this.rect.width / this.count : this.rect.height / this.count;

    for (var i = 0; i < this.count; i++) {

      if (this.style === 'horizontal') {
        var ypos = Math.floor(i * sliderWidth);
        this.ctx.fillRect(0, ypos, this.rect.width * this.__value[i], Math.ceil(sliderWidth));
        this.ctx.strokeRect(0, ypos, this.rect.width, sliderWidth);
      } else {
        var xpos = Math.floor(i * sliderWidth);
        this.ctx.fillRect(xpos, this.rect.height - this.__value[i] * this.rect.height, Math.ceil(sliderWidth), this.rect.height * this.__value[i]);
        this.ctx.strokeRect(xpos, 0, sliderWidth, this.rect.height);
      }
    }
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      this.active = true;
      this.pointerId = e.pointerId;

      this.processPointerPosition(e); // change multiSlider value on click / touchdown

      window.addEventListener('pointermove', this.pointermove); // only listen for up and move events after pointerdown
      window.addEventListener('pointerup', this.pointerup);
    },
    pointerup: function pointerup(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.active = false;
        window.removeEventListener('pointermove', this.pointermove);
        window.removeEventListener('pointerup', this.pointerup);
      }
    },
    pointermove: function pointermove(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.processPointerPosition(e);
      }
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the MultiSlider's position, and triggers output.
   * @instance
   * @memberof MultiSlider
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition: function processPointerPosition(e) {
    var prevValue = this.value,
        sliderNum = void 0;

    if (this.style === 'horizontal') {
      sliderNum = Math.floor(e.clientY / this.rect.height / (1 / this.count));
      this.__value[sliderNum] = (e.clientX - this.rect.left) / this.rect.width;
    } else {
      sliderNum = Math.floor(e.clientX / this.rect.width / (1 / this.count));
      this.__value[sliderNum] = 1 - (e.clientY - this.rect.top) / this.rect.height;
    }

    for (var i = 0; i < this.count; i++) {
      if (this.__value[i] > 1) this.__value[i] = 1;
      if (this.__value[i] < 0) this.__value[i] = 0;
    }

    var shouldDraw = this.output();

    if (shouldDraw) this.draw();
  }
});

module.exports = MultiSlider;

},{"./canvasWidget.js":2}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Panel = {
  defaults: {
    fullscreen: false,
    background: '#333'
  },

  // class variable for reference to all panels
  panels: [],

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

      panel.div = panel.__createHTMLElement();
      panel.layout();

      var body = document.querySelector('body');
      body.appendChild(panel.div);
    }

    Panel.panels.push(panel);

    return panel;
  },
  __createHTMLElement: function __createHTMLElement() {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.display = 'block';
    div.style.backgroundColor = this.background;

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
  add: function add() {
    for (var _len = arguments.length, widgets = Array(_len), _key = 0; _key < _len; _key++) {
      widgets[_key] = arguments[_key];
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = widgets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var widget = _step.value;


        // check to make sure widget has not been already added
        if (this.children.indexOf(widget) === -1) {
          if (typeof widget.__addToPanel === 'function') {
            this.div.appendChild(widget.element);
            this.children.push(widget);

            widget.__addToPanel(this);
          } else {
            throw Error('Widget cannot be added to panel; it does not contain the method .__addToPanel');
          }
        } else {
          throw Error('Widget is already added to panel.');
        }
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
  }
};

exports.default = Panel;

},{}],13:[function(require,module,exports){
'use strict';

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A horizontal or vertical fader. 
 * @module Slider
 * @augments CanvasWidget
 */

var Slider = Object.create(_canvasWidget2.default);

Object.assign(Slider, {
  /** @lends Slider.prototype */

  /**
   * A set of default property settings for all Slider instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Slider
   * @static
   */
  defaults: {
    __value: .5, // always 0-1, not for end-users
    value: .5, // end-user value that may be filtered
    active: false,
    /**
     * The style property can be either 'horizontal' (the default) or 'vertical'. This
     * determines the orientation of the Slider instance.
     * @memberof Slider
     * @instance
     * @type {String}
     */
    style: 'horizontal'
  },

  /**
   * Create a new Slider instance.
   * @memberof Slider
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize Slider with.
   * @static
   */
  create: function create(props) {
    var slider = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with Slider defaults
    _canvasWidget2.default.create.call(slider);

    // ...and then finally override with user defaults
    Object.assign(slider, Slider.defaults, props);

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) slider.__value = props.value;

    // inherits from Widget
    slider.init();

    return slider;
  },


  /**
   * Draw the Slider onto its canvas context using the current .__value property.
   * @memberof Slider
   * @instance
   */
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    // draw fill (slider value representation)
    this.ctx.fillStyle = this.fill;

    if (this.style === 'horizontal') this.ctx.fillRect(0, 0, this.rect.width * this.__value, this.rect.height);else this.ctx.fillRect(0, this.rect.height - this.__value * this.rect.height, this.rect.width, this.rect.height * this.__value);

    this.ctx.strokeRect(0, 0, this.rect.width, this.rect.height);
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      this.active = true;
      this.pointerId = e.pointerId;

      this.processPointerPosition(e); // change slider value on click / touchdown

      window.addEventListener('pointermove', this.pointermove); // only listen for up and move events after pointerdown
      window.addEventListener('pointerup', this.pointerup);
    },
    pointerup: function pointerup(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.active = false;
        window.removeEventListener('pointermove', this.pointermove);
        window.removeEventListener('pointerup', this.pointerup);
      }
    },
    pointermove: function pointermove(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.processPointerPosition(e);
      }
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the Slider's position, and triggers output.
   * @instance
   * @memberof Slider
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition: function processPointerPosition(e) {
    var prevValue = this.value;

    if (this.style === 'horizontal') {
      this.__value = (e.clientX - this.rect.left) / this.rect.width;
    } else {
      this.__value = 1 - (e.clientY - this.rect.top) / this.rect.height;
    }

    // clamp __value, which is only used internally
    if (this.__value > 1) this.__value = 1;
    if (this.__value < 0) this.__value = 0;

    var shouldDraw = this.output();

    if (shouldDraw) this.draw();
  }
});

module.exports = Slider;

},{"./canvasWidget.js":2}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Utilities = {
  getMode: function getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse';
  },
  compareArrays: function compareArrays(a1, a2) {
    return a1.length === a2.length && a1.every(function (v, i) {
      return v === a2[i];
    });
  }
};

exports.default = Utilities;

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _filters = require('./filters');

var _filters2 = _interopRequireDefault(_filters);

var _communication = require('./communication.js');

var _communication2 = _interopRequireDefault(_communication);

var _utilities = require('./utilities');

var _utilities2 = _interopRequireDefault(_utilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Widget is the base class that all other UI elements inherits from. It primarily
 * includes methods for filtering / scaling output.
 * @module Widget
 */

var Widget = {
  /** @lends Widget.prototype */

  /**
   * store all instantiated widgets.
   * @type {Array.<Widget>}
   * @static
   */
  widgets: [],
  lastValue: null,
  onvaluechange: null,

  /**
   * A set of default property settings for all widgets
   * @type {Object}
   * @static
   */
  defaults: {
    min: 0, max: 1,
    scaleOutput: true, // apply scale filter by default for min / max ranges
    target: null,
    __prevValue: null
  },

  /**
   * Create a new Widget instance
   * @memberof Widget
   * @constructs
   * @static
   */
  create: function create() {
    Object.assign(this, Widget.defaults);

    /** 
     * Stores filters for transforming widget output.
     * @memberof Widget
     * @instance
     */
    this.filters = [];

    this.__prefilters = [];
    this.__postfilters = [];

    Widget.widgets.push(this);

    return this;
  },


  /**
   * Initialization method for widgets. Checks to see if widget contains
   * a 'target' property; if so, makes sure that communication with that
   * target is initialized.
   * @memberof Widget
   * @instance
   */

  init: function init() {
    if (this.target && this.target === 'osc' || this.target === 'midi') {
      if (!_communication2.default.initialized) _communication2.default.init();
    }

    // if min/max are not 0-1 and scaling is not disabled
    if (this.scaleOutput && (this.min !== 0 || this.max !== 1)) {
      this.__prefilters.push(_filters2.default.Scale(0, 1, this.min, this.max));
    }
  },
  runFilters: function runFilters(value, widget) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = widget.__prefilters[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = widget.filters[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _filter = _step2.value;
        value = _filter(value);
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

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = widget.__postfilters[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var _filter2 = _step3.value;
        value = _filter2(value);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return value;
  },


  /**
   * Calculates output of widget by running .__value property through filter chain.
   * The result is stored in the .value property of the widget, which is then
   * returned.
   * @memberof Widget
   * @instance
   */
  output: function output() {
    var _this = this;

    var value = this.__value,
        newValueGenerated = false,
        lastValue = this.valuei,
        isArray = void 0;

    isArray = Array.isArray(value);

    if (isArray) {
      value = value.map(function (v) {
        return Widget.runFilters(v, _this);
      });
    } else {
      value = this.runFilters(value, this);
    }

    this.value = value;

    if (this.target !== null) this.transmit(this.value);

    if (this.__prevValue !== null) {
      if (isArray) {
        if (!_utilities2.default.compareArrays(this.__value, this.__prevValue)) {
          newValueGenerated = true;
        }
      } else if (this.__value !== this.__prevValue) {
        newValueGenerated = true;
      }
    } else {
      newValueGenerated = true;
    }

    if (newValueGenerated) {
      if (this.onvaluechange !== null) this.onvaluechange(this.value, lastValue);

      if (Array.isArray(this.__value)) {
        this.__prevValue = this.__value.slice();
      } else {
        this.__prevValue = this.__value;
      }
    }

    // newValueGenerated can be use to determine if widget should draw
    return newValueGenerated;
  },


  /**
   * If the widget has a remote target (not a target inside the interface web page)
   * this will transmit the widgets value to the remote destination.
   * @memberof Widget
   * @instance
   */
  transmit: function transmit() {
    //looks like this should handle arrays, not tested
    if (this.target === 'osc') {
      _communication2.default.OSC.send(this.address, this.value);
    }
  }
};

exports.default = Widget;

},{"./communication.js":3,"./filters":5,"./utilities":14}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var WidgetLabel = {

  defaults: {
    size: 24,
    face: 'sans-serif',
    fill: 'white',
    align: 'center',
    background: null,
    width: 1
  },

  create: function create(props) {
    var label = Object.create(this);

    Object.assign(label, this.defaults, props);

    if (_typeof(label.ctx) === undefined) throw Error('WidgetLabels must be constructed with a canvas context (ctx) argument');

    label.font = label.size + 'px ' + label.face;

    return label;
  },
  draw: function draw() {
    var cnvs = this.ctx.canvas,
        cwidth = cnvs.width,
        cheight = cnvs.height,
        x = this.x * cwidth,
        y = this.y * cheight,
        width = this.width * cwidth;

    if (this.background !== null) {
      this.ctx.fillStyle = this.background;
      this.ctx.fillRect(x, y, width, this.size + 10);
    }

    this.ctx.fillStyle = this.fill;
    this.ctx.textAlign = this.align;
    this.ctx.font = this.font;
    this.ctx.fillText(this.text, x, y, width);
  }
};

exports.default = WidgetLabel;

},{}],17:[function(require,module,exports){
/*!
 * PEP v0.4.1 | https://github.com/jquery/PEP
 * Copyright jQuery Foundation and other contributors | http://jquery.org/license
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.PointerEventsPolyfill = factory()
}(this, function () { 'use strict';

  /**
   * This is the constructor for new PointerEvents.
   *
   * New Pointer Events must be given a type, and an optional dictionary of
   * initialization properties.
   *
   * Due to certain platform requirements, events returned from the constructor
   * identify as MouseEvents.
   *
   * @constructor
   * @param {String} inType The type of the event to create.
   * @param {Object} [inDict] An optional dictionary of initial event properties.
   * @return {Event} A new PointerEvent of type `inType`, initialized with properties from `inDict`.
   */
  var MOUSE_PROPS = [
    'bubbles',
    'cancelable',
    'view',
    'detail',
    'screenX',
    'screenY',
    'clientX',
    'clientY',
    'ctrlKey',
    'altKey',
    'shiftKey',
    'metaKey',
    'button',
    'relatedTarget',
    'pageX',
    'pageY'
  ];

  var MOUSE_DEFAULTS = [
    false,
    false,
    null,
    null,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,
    0,
    0
  ];

  function PointerEvent(inType, inDict) {
    inDict = inDict || Object.create(null);

    var e = document.createEvent('Event');
    e.initEvent(inType, inDict.bubbles || false, inDict.cancelable || false);

    // define inherited MouseEvent properties
    // skip bubbles and cancelable since they're set above in initEvent()
    for (var i = 2, p; i < MOUSE_PROPS.length; i++) {
      p = MOUSE_PROPS[i];
      e[p] = inDict[p] || MOUSE_DEFAULTS[i];
    }
    e.buttons = inDict.buttons || 0;

    // Spec requires that pointers without pressure specified use 0.5 for down
    // state and 0 for up state.
    var pressure = 0;
    if (inDict.pressure) {
      pressure = inDict.pressure;
    } else {
      pressure = e.buttons ? 0.5 : 0;
    }

    // add x/y properties aliased to clientX/Y
    e.x = e.clientX;
    e.y = e.clientY;

    // define the properties of the PointerEvent interface
    e.pointerId = inDict.pointerId || 0;
    e.width = inDict.width || 0;
    e.height = inDict.height || 0;
    e.pressure = pressure;
    e.tiltX = inDict.tiltX || 0;
    e.tiltY = inDict.tiltY || 0;
    e.pointerType = inDict.pointerType || '';
    e.hwTimestamp = inDict.hwTimestamp || 0;
    e.isPrimary = inDict.isPrimary || false;
    return e;
  }

  var _PointerEvent = PointerEvent;

  /**
   * This module implements a map of pointer states
   */
  var USE_MAP = window.Map && window.Map.prototype.forEach;
  var PointerMap = USE_MAP ? Map : SparseArrayMap;

  function SparseArrayMap() {
    this.array = [];
    this.size = 0;
  }

  SparseArrayMap.prototype = {
    set: function(k, v) {
      if (v === undefined) {
        return this.delete(k);
      }
      if (!this.has(k)) {
        this.size++;
      }
      this.array[k] = v;
    },
    has: function(k) {
      return this.array[k] !== undefined;
    },
    delete: function(k) {
      if (this.has(k)) {
        delete this.array[k];
        this.size--;
      }
    },
    get: function(k) {
      return this.array[k];
    },
    clear: function() {
      this.array.length = 0;
      this.size = 0;
    },

    // return value, key, map
    forEach: function(callback, thisArg) {
      return this.array.forEach(function(v, k) {
        callback.call(thisArg, v, k, this);
      }, this);
    }
  };

  var _pointermap = PointerMap;

  var CLONE_PROPS = [

    // MouseEvent
    'bubbles',
    'cancelable',
    'view',
    'detail',
    'screenX',
    'screenY',
    'clientX',
    'clientY',
    'ctrlKey',
    'altKey',
    'shiftKey',
    'metaKey',
    'button',
    'relatedTarget',

    // DOM Level 3
    'buttons',

    // PointerEvent
    'pointerId',
    'width',
    'height',
    'pressure',
    'tiltX',
    'tiltY',
    'pointerType',
    'hwTimestamp',
    'isPrimary',

    // event instance
    'type',
    'target',
    'currentTarget',
    'which',
    'pageX',
    'pageY',
    'timeStamp'
  ];

  var CLONE_DEFAULTS = [

    // MouseEvent
    false,
    false,
    null,
    null,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,

    // DOM Level 3
    0,

    // PointerEvent
    0,
    0,
    0,
    0,
    0,
    0,
    '',
    0,
    false,

    // event instance
    '',
    null,
    null,
    0,
    0,
    0,
    0
  ];

  var BOUNDARY_EVENTS = {
    'pointerover': 1,
    'pointerout': 1,
    'pointerenter': 1,
    'pointerleave': 1
  };

  var HAS_SVG_INSTANCE = (typeof SVGElementInstance !== 'undefined');

  /**
   * This module is for normalizing events. Mouse and Touch events will be
   * collected here, and fire PointerEvents that have the same semantics, no
   * matter the source.
   * Events fired:
   *   - pointerdown: a pointing is added
   *   - pointerup: a pointer is removed
   *   - pointermove: a pointer is moved
   *   - pointerover: a pointer crosses into an element
   *   - pointerout: a pointer leaves an element
   *   - pointercancel: a pointer will no longer generate events
   */
  var dispatcher = {
    pointermap: new _pointermap(),
    eventMap: Object.create(null),
    captureInfo: Object.create(null),

    // Scope objects for native events.
    // This exists for ease of testing.
    eventSources: Object.create(null),
    eventSourceList: [],
    /**
     * Add a new event source that will generate pointer events.
     *
     * `inSource` must contain an array of event names named `events`, and
     * functions with the names specified in the `events` array.
     * @param {string} name A name for the event source
     * @param {Object} source A new source of platform events.
     */
    registerSource: function(name, source) {
      var s = source;
      var newEvents = s.events;
      if (newEvents) {
        newEvents.forEach(function(e) {
          if (s[e]) {
            this.eventMap[e] = s[e].bind(s);
          }
        }, this);
        this.eventSources[name] = s;
        this.eventSourceList.push(s);
      }
    },
    register: function(element) {
      var l = this.eventSourceList.length;
      for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {

        // call eventsource register
        es.register.call(es, element);
      }
    },
    unregister: function(element) {
      var l = this.eventSourceList.length;
      for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {

        // call eventsource register
        es.unregister.call(es, element);
      }
    },
    contains: /*scope.external.contains || */function(container, contained) {
      try {
        return container.contains(contained);
      } catch (ex) {

        // most likely: https://bugzilla.mozilla.org/show_bug.cgi?id=208427
        return false;
      }
    },

    // EVENTS
    down: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerdown', inEvent);
    },
    move: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointermove', inEvent);
    },
    up: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerup', inEvent);
    },
    enter: function(inEvent) {
      inEvent.bubbles = false;
      this.fireEvent('pointerenter', inEvent);
    },
    leave: function(inEvent) {
      inEvent.bubbles = false;
      this.fireEvent('pointerleave', inEvent);
    },
    over: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerover', inEvent);
    },
    out: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerout', inEvent);
    },
    cancel: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointercancel', inEvent);
    },
    leaveOut: function(event) {
      this.out(event);
      if (!this.contains(event.target, event.relatedTarget)) {
        this.leave(event);
      }
    },
    enterOver: function(event) {
      this.over(event);
      if (!this.contains(event.target, event.relatedTarget)) {
        this.enter(event);
      }
    },

    // LISTENER LOGIC
    eventHandler: function(inEvent) {

      // This is used to prevent multiple dispatch of pointerevents from
      // platform events. This can happen when two elements in different scopes
      // are set up to create pointer events, which is relevant to Shadow DOM.
      if (inEvent._handledByPE) {
        return;
      }
      var type = inEvent.type;
      var fn = this.eventMap && this.eventMap[type];
      if (fn) {
        fn(inEvent);
      }
      inEvent._handledByPE = true;
    },

    // set up event listeners
    listen: function(target, events) {
      events.forEach(function(e) {
        this.addEvent(target, e);
      }, this);
    },

    // remove event listeners
    unlisten: function(target, events) {
      events.forEach(function(e) {
        this.removeEvent(target, e);
      }, this);
    },
    addEvent: /*scope.external.addEvent || */function(target, eventName) {
      target.addEventListener(eventName, this.boundHandler);
    },
    removeEvent: /*scope.external.removeEvent || */function(target, eventName) {
      target.removeEventListener(eventName, this.boundHandler);
    },

    // EVENT CREATION AND TRACKING
    /**
     * Creates a new Event of type `inType`, based on the information in
     * `inEvent`.
     *
     * @param {string} inType A string representing the type of event to create
     * @param {Event} inEvent A platform event with a target
     * @return {Event} A PointerEvent of type `inType`
     */
    makeEvent: function(inType, inEvent) {

      // relatedTarget must be null if pointer is captured
      if (this.captureInfo[inEvent.pointerId]) {
        inEvent.relatedTarget = null;
      }
      var e = new _PointerEvent(inType, inEvent);
      if (inEvent.preventDefault) {
        e.preventDefault = inEvent.preventDefault;
      }
      e._target = e._target || inEvent.target;
      return e;
    },

    // make and dispatch an event in one call
    fireEvent: function(inType, inEvent) {
      var e = this.makeEvent(inType, inEvent);
      return this.dispatchEvent(e);
    },
    /**
     * Returns a snapshot of inEvent, with writable properties.
     *
     * @param {Event} inEvent An event that contains properties to copy.
     * @return {Object} An object containing shallow copies of `inEvent`'s
     *    properties.
     */
    cloneEvent: function(inEvent) {
      var eventCopy = Object.create(null);
      var p;
      for (var i = 0; i < CLONE_PROPS.length; i++) {
        p = CLONE_PROPS[i];
        eventCopy[p] = inEvent[p] || CLONE_DEFAULTS[i];

        // Work around SVGInstanceElement shadow tree
        // Return the <use> element that is represented by the instance for Safari, Chrome, IE.
        // This is the behavior implemented by Firefox.
        if (HAS_SVG_INSTANCE && (p === 'target' || p === 'relatedTarget')) {
          if (eventCopy[p] instanceof SVGElementInstance) {
            eventCopy[p] = eventCopy[p].correspondingUseElement;
          }
        }
      }

      // keep the semantics of preventDefault
      if (inEvent.preventDefault) {
        eventCopy.preventDefault = function() {
          inEvent.preventDefault();
        };
      }
      return eventCopy;
    },
    getTarget: function(inEvent) {
      var capture = this.captureInfo[inEvent.pointerId];
      if (!capture) {
        return inEvent._target;
      }
      if (inEvent._target === capture || !(inEvent.type in BOUNDARY_EVENTS)) {
        return capture;
      }
    },
    setCapture: function(inPointerId, inTarget) {
      if (this.captureInfo[inPointerId]) {
        this.releaseCapture(inPointerId);
      }
      this.captureInfo[inPointerId] = inTarget;
      var e = document.createEvent('Event');
      e.initEvent('gotpointercapture', true, false);
      e.pointerId = inPointerId;
      this.implicitRelease = this.releaseCapture.bind(this, inPointerId);
      document.addEventListener('pointerup', this.implicitRelease);
      document.addEventListener('pointercancel', this.implicitRelease);
      e._target = inTarget;
      this.asyncDispatchEvent(e);
    },
    releaseCapture: function(inPointerId) {
      var t = this.captureInfo[inPointerId];
      if (t) {
        var e = document.createEvent('Event');
        e.initEvent('lostpointercapture', true, false);
        e.pointerId = inPointerId;
        this.captureInfo[inPointerId] = undefined;
        document.removeEventListener('pointerup', this.implicitRelease);
        document.removeEventListener('pointercancel', this.implicitRelease);
        e._target = t;
        this.asyncDispatchEvent(e);
      }
    },
    /**
     * Dispatches the event to its target.
     *
     * @param {Event} inEvent The event to be dispatched.
     * @return {Boolean} True if an event handler returns true, false otherwise.
     */
    dispatchEvent: /*scope.external.dispatchEvent || */function(inEvent) {
      var t = this.getTarget(inEvent);
      if (t) {
        return t.dispatchEvent(inEvent);
      }
    },
    asyncDispatchEvent: function(inEvent) {
      requestAnimationFrame(this.dispatchEvent.bind(this, inEvent));
    }
  };
  dispatcher.boundHandler = dispatcher.eventHandler.bind(dispatcher);

  var _dispatcher = dispatcher;

  var targeting = {
    shadow: function(inEl) {
      if (inEl) {
        return inEl.shadowRoot || inEl.webkitShadowRoot;
      }
    },
    canTarget: function(shadow) {
      return shadow && Boolean(shadow.elementFromPoint);
    },
    targetingShadow: function(inEl) {
      var s = this.shadow(inEl);
      if (this.canTarget(s)) {
        return s;
      }
    },
    olderShadow: function(shadow) {
      var os = shadow.olderShadowRoot;
      if (!os) {
        var se = shadow.querySelector('shadow');
        if (se) {
          os = se.olderShadowRoot;
        }
      }
      return os;
    },
    allShadows: function(element) {
      var shadows = [];
      var s = this.shadow(element);
      while (s) {
        shadows.push(s);
        s = this.olderShadow(s);
      }
      return shadows;
    },
    searchRoot: function(inRoot, x, y) {
      if (inRoot) {
        var t = inRoot.elementFromPoint(x, y);
        var st, sr;

        // is element a shadow host?
        sr = this.targetingShadow(t);
        while (sr) {

          // find the the element inside the shadow root
          st = sr.elementFromPoint(x, y);
          if (!st) {

            // check for older shadows
            sr = this.olderShadow(sr);
          } else {

            // shadowed element may contain a shadow root
            var ssr = this.targetingShadow(st);
            return this.searchRoot(ssr, x, y) || st;
          }
        }

        // light dom element is the target
        return t;
      }
    },
    owner: function(element) {
      var s = element;

      // walk up until you hit the shadow root or document
      while (s.parentNode) {
        s = s.parentNode;
      }

      // the owner element is expected to be a Document or ShadowRoot
      if (s.nodeType !== Node.DOCUMENT_NODE && s.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
        s = document;
      }
      return s;
    },
    findTarget: function(inEvent) {
      var x = inEvent.clientX;
      var y = inEvent.clientY;

      // if the listener is in the shadow root, it is much faster to start there
      var s = this.owner(inEvent.target);

      // if x, y is not in this root, fall back to document search
      if (!s.elementFromPoint(x, y)) {
        s = document;
      }
      return this.searchRoot(s, x, y);
    }
  };

  /**
   * This module uses Mutation Observers to dynamically adjust which nodes will
   * generate Pointer Events.
   *
   * All nodes that wish to generate Pointer Events must have the attribute
   * `touch-action` set to `none`.
   */
  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
  var map = Array.prototype.map.call.bind(Array.prototype.map);
  var toArray = Array.prototype.slice.call.bind(Array.prototype.slice);
  var filter = Array.prototype.filter.call.bind(Array.prototype.filter);
  var MO = window.MutationObserver || window.WebKitMutationObserver;
  var SELECTOR = '[touch-action]';
  var OBSERVER_INIT = {
    subtree: true,
    childList: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['touch-action']
  };

  function Installer(add, remove, changed, binder) {
    this.addCallback = add.bind(binder);
    this.removeCallback = remove.bind(binder);
    this.changedCallback = changed.bind(binder);
    if (MO) {
      this.observer = new MO(this.mutationWatcher.bind(this));
    }
  }

  Installer.prototype = {
    watchSubtree: function(target) {

      // Only watch scopes that can target find, as these are top-level.
      // Otherwise we can see duplicate additions and removals that add noise.
      //
      // TODO(dfreedman): For some instances with ShadowDOMPolyfill, we can see
      // a removal without an insertion when a node is redistributed among
      // shadows. Since it all ends up correct in the document, watching only
      // the document will yield the correct mutations to watch.
      if (this.observer && targeting.canTarget(target)) {
        this.observer.observe(target, OBSERVER_INIT);
      }
    },
    enableOnSubtree: function(target) {
      this.watchSubtree(target);
      if (target === document && document.readyState !== 'complete') {
        this.installOnLoad();
      } else {
        this.installNewSubtree(target);
      }
    },
    installNewSubtree: function(target) {
      forEach(this.findElements(target), this.addElement, this);
    },
    findElements: function(target) {
      if (target.querySelectorAll) {
        return target.querySelectorAll(SELECTOR);
      }
      return [];
    },
    removeElement: function(el) {
      this.removeCallback(el);
    },
    addElement: function(el) {
      this.addCallback(el);
    },
    elementChanged: function(el, oldValue) {
      this.changedCallback(el, oldValue);
    },
    concatLists: function(accum, list) {
      return accum.concat(toArray(list));
    },

    // register all touch-action = none nodes on document load
    installOnLoad: function() {
      document.addEventListener('readystatechange', function() {
        if (document.readyState === 'complete') {
          this.installNewSubtree(document);
        }
      }.bind(this));
    },
    isElement: function(n) {
      return n.nodeType === Node.ELEMENT_NODE;
    },
    flattenMutationTree: function(inNodes) {

      // find children with touch-action
      var tree = map(inNodes, this.findElements, this);

      // make sure the added nodes are accounted for
      tree.push(filter(inNodes, this.isElement));

      // flatten the list
      return tree.reduce(this.concatLists, []);
    },
    mutationWatcher: function(mutations) {
      mutations.forEach(this.mutationHandler, this);
    },
    mutationHandler: function(m) {
      if (m.type === 'childList') {
        var added = this.flattenMutationTree(m.addedNodes);
        added.forEach(this.addElement, this);
        var removed = this.flattenMutationTree(m.removedNodes);
        removed.forEach(this.removeElement, this);
      } else if (m.type === 'attributes') {
        this.elementChanged(m.target, m.oldValue);
      }
    }
  };

  var installer = Installer;

  function shadowSelector(v) {
    return 'body /shadow-deep/ ' + selector(v);
  }
  function selector(v) {
    return '[touch-action="' + v + '"]';
  }
  function rule(v) {
    return '{ -ms-touch-action: ' + v + '; touch-action: ' + v + '; touch-action-delay: none; }';
  }
  var attrib2css = [
    'none',
    'auto',
    'pan-x',
    'pan-y',
    {
      rule: 'pan-x pan-y',
      selectors: [
        'pan-x pan-y',
        'pan-y pan-x'
      ]
    }
  ];
  var styles = '';

  // only install stylesheet if the browser has touch action support
  var hasNativePE = window.PointerEvent || window.MSPointerEvent;

  // only add shadow selectors if shadowdom is supported
  var hasShadowRoot = !window.ShadowDOMPolyfill && document.head.createShadowRoot;

  function applyAttributeStyles() {
    if (hasNativePE) {
      attrib2css.forEach(function(r) {
        if (String(r) === r) {
          styles += selector(r) + rule(r) + '\n';
          if (hasShadowRoot) {
            styles += shadowSelector(r) + rule(r) + '\n';
          }
        } else {
          styles += r.selectors.map(selector) + rule(r.rule) + '\n';
          if (hasShadowRoot) {
            styles += r.selectors.map(shadowSelector) + rule(r.rule) + '\n';
          }
        }
      });

      var el = document.createElement('style');
      el.textContent = styles;
      document.head.appendChild(el);
    }
  }

  var mouse__pointermap = _dispatcher.pointermap;

  // radius around touchend that swallows mouse events
  var DEDUP_DIST = 25;

  // left, middle, right, back, forward
  var BUTTON_TO_BUTTONS = [1, 4, 2, 8, 16];

  var HAS_BUTTONS = false;
  try {
    HAS_BUTTONS = new MouseEvent('test', { buttons: 1 }).buttons === 1;
  } catch (e) {}

  // handler block for native mouse events
  var mouseEvents = {
    POINTER_ID: 1,
    POINTER_TYPE: 'mouse',
    events: [
      'mousedown',
      'mousemove',
      'mouseup',
      'mouseover',
      'mouseout'
    ],
    register: function(target) {
      _dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      _dispatcher.unlisten(target, this.events);
    },
    lastTouches: [],

    // collide with the global mouse listener
    isEventSimulatedFromTouch: function(inEvent) {
      var lts = this.lastTouches;
      var x = inEvent.clientX;
      var y = inEvent.clientY;
      for (var i = 0, l = lts.length, t; i < l && (t = lts[i]); i++) {

        // simulated mouse events will be swallowed near a primary touchend
        var dx = Math.abs(x - t.x);
        var dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DIST && dy <= DEDUP_DIST) {
          return true;
        }
      }
    },
    prepareEvent: function(inEvent) {
      var e = _dispatcher.cloneEvent(inEvent);

      // forward mouse preventDefault
      var pd = e.preventDefault;
      e.preventDefault = function() {
        inEvent.preventDefault();
        pd();
      };
      e.pointerId = this.POINTER_ID;
      e.isPrimary = true;
      e.pointerType = this.POINTER_TYPE;
      return e;
    },
    prepareButtonsForMove: function(e, inEvent) {
      var p = mouse__pointermap.get(this.POINTER_ID);
      e.buttons = p ? p.buttons : 0;
      inEvent.buttons = e.buttons;
    },
    mousedown: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = mouse__pointermap.get(this.POINTER_ID);
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) {
          e.buttons = BUTTON_TO_BUTTONS[e.button];
          if (p) { e.buttons |= p.buttons; }
          inEvent.buttons = e.buttons;
        }
        mouse__pointermap.set(this.POINTER_ID, inEvent);
        if (!p) {
          _dispatcher.down(e);
        } else {
          _dispatcher.move(e);
        }
      }
    },
    mousemove: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        _dispatcher.move(e);
      }
    },
    mouseup: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = mouse__pointermap.get(this.POINTER_ID);
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) {
          var up = BUTTON_TO_BUTTONS[e.button];

          // Produces wrong state of buttons in Browsers without `buttons` support
          // when a mouse button that was pressed outside the document is released
          // inside and other buttons are still pressed down.
          e.buttons = p ? p.buttons & ~up : 0;
          inEvent.buttons = e.buttons;
        }
        mouse__pointermap.set(this.POINTER_ID, inEvent);

        // Support: Firefox <=44 only
        // FF Ubuntu includes the lifted button in the `buttons` property on
        // mouseup.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1223366
        if (e.buttons === 0 || e.buttons === BUTTON_TO_BUTTONS[e.button]) {
          this.cleanupMouse();
          _dispatcher.up(e);
        } else {
          _dispatcher.move(e);
        }
      }
    },
    mouseover: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        _dispatcher.enterOver(e);
      }
    },
    mouseout: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        _dispatcher.leaveOut(e);
      }
    },
    cancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.cancel(e);
      this.cleanupMouse();
    },
    cleanupMouse: function() {
      mouse__pointermap.delete(this.POINTER_ID);
    }
  };

  var mouse = mouseEvents;

  var captureInfo = _dispatcher.captureInfo;
  var findTarget = targeting.findTarget.bind(targeting);
  var allShadows = targeting.allShadows.bind(targeting);
  var touch__pointermap = _dispatcher.pointermap;

  // This should be long enough to ignore compat mouse events made by touch
  var DEDUP_TIMEOUT = 2500;
  var CLICK_COUNT_TIMEOUT = 200;
  var ATTRIB = 'touch-action';
  var INSTALLER;

  // The presence of touch event handlers blocks scrolling, and so we must be careful to
  // avoid adding handlers unnecessarily.  Chrome plans to add a touch-action-delay property
  // (crbug.com/329559) to address this, and once we have that we can opt-in to a simpler
  // handler registration mechanism.  Rather than try to predict how exactly to opt-in to
  // that we'll just leave this disabled until there is a build of Chrome to test.
  var HAS_TOUCH_ACTION_DELAY = false;

  // handler block for native touch events
  var touchEvents = {
    events: [
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel'
    ],
    register: function(target) {
      if (HAS_TOUCH_ACTION_DELAY) {
        _dispatcher.listen(target, this.events);
      } else {
        INSTALLER.enableOnSubtree(target);
      }
    },
    unregister: function(target) {
      if (HAS_TOUCH_ACTION_DELAY) {
        _dispatcher.unlisten(target, this.events);
      } else {

        // TODO(dfreedman): is it worth it to disconnect the MO?
      }
    },
    elementAdded: function(el) {
      var a = el.getAttribute(ATTRIB);
      var st = this.touchActionToScrollType(a);
      if (st) {
        el._scrollType = st;
        _dispatcher.listen(el, this.events);

        // set touch-action on shadows as well
        allShadows(el).forEach(function(s) {
          s._scrollType = st;
          _dispatcher.listen(s, this.events);
        }, this);
      }
    },
    elementRemoved: function(el) {
      el._scrollType = undefined;
      _dispatcher.unlisten(el, this.events);

      // remove touch-action from shadow
      allShadows(el).forEach(function(s) {
        s._scrollType = undefined;
        _dispatcher.unlisten(s, this.events);
      }, this);
    },
    elementChanged: function(el, oldValue) {
      var a = el.getAttribute(ATTRIB);
      var st = this.touchActionToScrollType(a);
      var oldSt = this.touchActionToScrollType(oldValue);

      // simply update scrollType if listeners are already established
      if (st && oldSt) {
        el._scrollType = st;
        allShadows(el).forEach(function(s) {
          s._scrollType = st;
        }, this);
      } else if (oldSt) {
        this.elementRemoved(el);
      } else if (st) {
        this.elementAdded(el);
      }
    },
    scrollTypes: {
      EMITTER: 'none',
      XSCROLLER: 'pan-x',
      YSCROLLER: 'pan-y',
      SCROLLER: /^(?:pan-x pan-y)|(?:pan-y pan-x)|auto$/
    },
    touchActionToScrollType: function(touchAction) {
      var t = touchAction;
      var st = this.scrollTypes;
      if (t === 'none') {
        return 'none';
      } else if (t === st.XSCROLLER) {
        return 'X';
      } else if (t === st.YSCROLLER) {
        return 'Y';
      } else if (st.SCROLLER.exec(t)) {
        return 'XY';
      }
    },
    POINTER_TYPE: 'touch',
    firstTouch: null,
    isPrimaryTouch: function(inTouch) {
      return this.firstTouch === inTouch.identifier;
    },
    setPrimaryTouch: function(inTouch) {

      // set primary touch if there no pointers, or the only pointer is the mouse
      if (touch__pointermap.size === 0 || (touch__pointermap.size === 1 && touch__pointermap.has(1))) {
        this.firstTouch = inTouch.identifier;
        this.firstXY = { X: inTouch.clientX, Y: inTouch.clientY };
        this.scrolling = false;
        this.cancelResetClickCount();
      }
    },
    removePrimaryPointer: function(inPointer) {
      if (inPointer.isPrimary) {
        this.firstTouch = null;
        this.firstXY = null;
        this.resetClickCount();
      }
    },
    clickCount: 0,
    resetId: null,
    resetClickCount: function() {
      var fn = function() {
        this.clickCount = 0;
        this.resetId = null;
      }.bind(this);
      this.resetId = setTimeout(fn, CLICK_COUNT_TIMEOUT);
    },
    cancelResetClickCount: function() {
      if (this.resetId) {
        clearTimeout(this.resetId);
      }
    },
    typeToButtons: function(type) {
      var ret = 0;
      if (type === 'touchstart' || type === 'touchmove') {
        ret = 1;
      }
      return ret;
    },
    touchToPointer: function(inTouch) {
      var cte = this.currentTouchEvent;
      var e = _dispatcher.cloneEvent(inTouch);

      // We reserve pointerId 1 for Mouse.
      // Touch identifiers can start at 0.
      // Add 2 to the touch identifier for compatibility.
      var id = e.pointerId = inTouch.identifier + 2;
      e.target = captureInfo[id] || findTarget(e);
      e.bubbles = true;
      e.cancelable = true;
      e.detail = this.clickCount;
      e.button = 0;
      e.buttons = this.typeToButtons(cte.type);
      e.width = inTouch.radiusX || inTouch.webkitRadiusX || 0;
      e.height = inTouch.radiusY || inTouch.webkitRadiusY || 0;
      e.pressure = inTouch.force || inTouch.webkitForce || 0.5;
      e.isPrimary = this.isPrimaryTouch(inTouch);
      e.pointerType = this.POINTER_TYPE;

      // forward touch preventDefaults
      var self = this;
      e.preventDefault = function() {
        self.scrolling = false;
        self.firstXY = null;
        cte.preventDefault();
      };
      return e;
    },
    processTouches: function(inEvent, inFunction) {
      var tl = inEvent.changedTouches;
      this.currentTouchEvent = inEvent;
      for (var i = 0, t; i < tl.length; i++) {
        t = tl[i];
        inFunction.call(this, this.touchToPointer(t));
      }
    },

    // For single axis scrollers, determines whether the element should emit
    // pointer events or behave as a scroller
    shouldScroll: function(inEvent) {
      if (this.firstXY) {
        var ret;
        var scrollAxis = inEvent.currentTarget._scrollType;
        if (scrollAxis === 'none') {

          // this element is a touch-action: none, should never scroll
          ret = false;
        } else if (scrollAxis === 'XY') {

          // this element should always scroll
          ret = true;
        } else {
          var t = inEvent.changedTouches[0];

          // check the intended scroll axis, and other axis
          var a = scrollAxis;
          var oa = scrollAxis === 'Y' ? 'X' : 'Y';
          var da = Math.abs(t['client' + a] - this.firstXY[a]);
          var doa = Math.abs(t['client' + oa] - this.firstXY[oa]);

          // if delta in the scroll axis > delta other axis, scroll instead of
          // making events
          ret = da >= doa;
        }
        this.firstXY = null;
        return ret;
      }
    },
    findTouch: function(inTL, inId) {
      for (var i = 0, l = inTL.length, t; i < l && (t = inTL[i]); i++) {
        if (t.identifier === inId) {
          return true;
        }
      }
    },

    // In some instances, a touchstart can happen without a touchend. This
    // leaves the pointermap in a broken state.
    // Therefore, on every touchstart, we remove the touches that did not fire a
    // touchend event.
    // To keep state globally consistent, we fire a
    // pointercancel for this "abandoned" touch
    vacuumTouches: function(inEvent) {
      var tl = inEvent.touches;

      // pointermap.size should be < tl.length here, as the touchstart has not
      // been processed yet.
      if (touch__pointermap.size >= tl.length) {
        var d = [];
        touch__pointermap.forEach(function(value, key) {

          // Never remove pointerId == 1, which is mouse.
          // Touch identifiers are 2 smaller than their pointerId, which is the
          // index in pointermap.
          if (key !== 1 && !this.findTouch(tl, key - 2)) {
            var p = value.out;
            d.push(p);
          }
        }, this);
        d.forEach(this.cancelOut, this);
      }
    },
    touchstart: function(inEvent) {
      this.vacuumTouches(inEvent);
      this.setPrimaryTouch(inEvent.changedTouches[0]);
      this.dedupSynthMouse(inEvent);
      if (!this.scrolling) {
        this.clickCount++;
        this.processTouches(inEvent, this.overDown);
      }
    },
    overDown: function(inPointer) {
      touch__pointermap.set(inPointer.pointerId, {
        target: inPointer.target,
        out: inPointer,
        outTarget: inPointer.target
      });
      _dispatcher.over(inPointer);
      _dispatcher.enter(inPointer);
      _dispatcher.down(inPointer);
    },
    touchmove: function(inEvent) {
      if (!this.scrolling) {
        if (this.shouldScroll(inEvent)) {
          this.scrolling = true;
          this.touchcancel(inEvent);
        } else {
          inEvent.preventDefault();
          this.processTouches(inEvent, this.moveOverOut);
        }
      }
    },
    moveOverOut: function(inPointer) {
      var event = inPointer;
      var pointer = touch__pointermap.get(event.pointerId);

      // a finger drifted off the screen, ignore it
      if (!pointer) {
        return;
      }
      var outEvent = pointer.out;
      var outTarget = pointer.outTarget;
      _dispatcher.move(event);
      if (outEvent && outTarget !== event.target) {
        outEvent.relatedTarget = event.target;
        event.relatedTarget = outTarget;

        // recover from retargeting by shadow
        outEvent.target = outTarget;
        if (event.target) {
          _dispatcher.leaveOut(outEvent);
          _dispatcher.enterOver(event);
        } else {

          // clean up case when finger leaves the screen
          event.target = outTarget;
          event.relatedTarget = null;
          this.cancelOut(event);
        }
      }
      pointer.out = event;
      pointer.outTarget = event.target;
    },
    touchend: function(inEvent) {
      this.dedupSynthMouse(inEvent);
      this.processTouches(inEvent, this.upOut);
    },
    upOut: function(inPointer) {
      if (!this.scrolling) {
        _dispatcher.up(inPointer);
        _dispatcher.out(inPointer);
        _dispatcher.leave(inPointer);
      }
      this.cleanUpPointer(inPointer);
    },
    touchcancel: function(inEvent) {
      this.processTouches(inEvent, this.cancelOut);
    },
    cancelOut: function(inPointer) {
      _dispatcher.cancel(inPointer);
      _dispatcher.out(inPointer);
      _dispatcher.leave(inPointer);
      this.cleanUpPointer(inPointer);
    },
    cleanUpPointer: function(inPointer) {
      touch__pointermap.delete(inPointer.pointerId);
      this.removePrimaryPointer(inPointer);
    },

    // prevent synth mouse events from creating pointer events
    dedupSynthMouse: function(inEvent) {
      var lts = mouse.lastTouches;
      var t = inEvent.changedTouches[0];

      // only the primary finger will synth mouse events
      if (this.isPrimaryTouch(t)) {

        // remember x/y of last touch
        var lt = { x: t.clientX, y: t.clientY };
        lts.push(lt);
        var fn = (function(lts, lt) {
          var i = lts.indexOf(lt);
          if (i > -1) {
            lts.splice(i, 1);
          }
        }).bind(null, lts, lt);
        setTimeout(fn, DEDUP_TIMEOUT);
      }
    }
  };

  if (!HAS_TOUCH_ACTION_DELAY) {
    INSTALLER = new installer(touchEvents.elementAdded, touchEvents.elementRemoved,
      touchEvents.elementChanged, touchEvents);
  }

  var touch = touchEvents;

  var ms__pointermap = _dispatcher.pointermap;
  var HAS_BITMAP_TYPE = window.MSPointerEvent &&
    typeof window.MSPointerEvent.MSPOINTER_TYPE_MOUSE === 'number';
  var msEvents = {
    events: [
      'MSPointerDown',
      'MSPointerMove',
      'MSPointerUp',
      'MSPointerOut',
      'MSPointerOver',
      'MSPointerCancel',
      'MSGotPointerCapture',
      'MSLostPointerCapture'
    ],
    register: function(target) {
      _dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      _dispatcher.unlisten(target, this.events);
    },
    POINTER_TYPES: [
      '',
      'unavailable',
      'touch',
      'pen',
      'mouse'
    ],
    prepareEvent: function(inEvent) {
      var e = inEvent;
      if (HAS_BITMAP_TYPE) {
        e = _dispatcher.cloneEvent(inEvent);
        e.pointerType = this.POINTER_TYPES[inEvent.pointerType];
      }
      return e;
    },
    cleanup: function(id) {
      ms__pointermap.delete(id);
    },
    MSPointerDown: function(inEvent) {
      ms__pointermap.set(inEvent.pointerId, inEvent);
      var e = this.prepareEvent(inEvent);
      _dispatcher.down(e);
    },
    MSPointerMove: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.move(e);
    },
    MSPointerUp: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.up(e);
      this.cleanup(inEvent.pointerId);
    },
    MSPointerOut: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.leaveOut(e);
    },
    MSPointerOver: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.enterOver(e);
    },
    MSPointerCancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.cancel(e);
      this.cleanup(inEvent.pointerId);
    },
    MSLostPointerCapture: function(inEvent) {
      var e = _dispatcher.makeEvent('lostpointercapture', inEvent);
      _dispatcher.dispatchEvent(e);
    },
    MSGotPointerCapture: function(inEvent) {
      var e = _dispatcher.makeEvent('gotpointercapture', inEvent);
      _dispatcher.dispatchEvent(e);
    }
  };

  var ms = msEvents;

  function platform_events__applyPolyfill() {

    // only activate if this platform does not have pointer events
    if (!window.PointerEvent) {
      window.PointerEvent = _PointerEvent;

      if (window.navigator.msPointerEnabled) {
        var tp = window.navigator.msMaxTouchPoints;
        Object.defineProperty(window.navigator, 'maxTouchPoints', {
          value: tp,
          enumerable: true
        });
        _dispatcher.registerSource('ms', ms);
      } else {
        _dispatcher.registerSource('mouse', mouse);
        if (window.ontouchstart !== undefined) {
          _dispatcher.registerSource('touch', touch);
        }
      }

      _dispatcher.register(document);
    }
  }

  var n = window.navigator;
  var s, r;
  function assertDown(id) {
    if (!_dispatcher.pointermap.has(id)) {
      throw new Error('InvalidPointerId');
    }
  }
  if (n.msPointerEnabled) {
    s = function(pointerId) {
      assertDown(pointerId);
      this.msSetPointerCapture(pointerId);
    };
    r = function(pointerId) {
      assertDown(pointerId);
      this.msReleasePointerCapture(pointerId);
    };
  } else {
    s = function setPointerCapture(pointerId) {
      assertDown(pointerId);
      _dispatcher.setCapture(pointerId, this);
    };
    r = function releasePointerCapture(pointerId) {
      assertDown(pointerId);
      _dispatcher.releaseCapture(pointerId, this);
    };
  }

  function _capture__applyPolyfill() {
    if (window.Element && !Element.prototype.setPointerCapture) {
      Object.defineProperties(Element.prototype, {
        'setPointerCapture': {
          value: s
        },
        'releasePointerCapture': {
          value: r
        }
      });
    }
  }

  applyAttributeStyles();
  platform_events__applyPolyfill();
  _capture__applyPolyfill();

  var pointerevents = {
    dispatcher: _dispatcher,
    Installer: installer,
    PointerEvent: _PointerEvent,
    PointerMap: _pointermap,
    targetFinding: targeting
  };

  return pointerevents;

}));
},{}]},{},[6])(6)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idXR0b24uanMiLCJqcy9jYW52YXNXaWRnZXQuanMiLCJqcy9jb21tdW5pY2F0aW9uLmpzIiwianMvZG9tV2lkZ2V0LmpzIiwianMvZmlsdGVycy5qcyIsImpzL2luZGV4LmpzIiwianMvam95c3RpY2suanMiLCJqcy9rbm9iLmpzIiwianMvbWVudS5qcyIsImpzL211bHRpQnV0dG9uLmpzIiwianMvbXVsdGlzbGlkZXIuanMiLCJqcy9wYW5lbC5qcyIsImpzL3NsaWRlci5qcyIsImpzL3V0aWxpdGllcy5qcyIsImpzL3dpZGdldC5qcyIsImpzL3dpZGdldExhYmVsLmpzIiwibm9kZV9tb2R1bGVzL3BlcGpzL2Rpc3QvcGVwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7Ozs7OztBQVdBLElBQUksU0FBUyxPQUFPLE1BQVAsd0JBQWI7O0FBRUEsT0FBTyxNQUFQLENBQWUsTUFBZixFQUF1Qjs7Ozs7Ozs7Ozs7QUFXckIsWUFBVTtBQUNSLGFBQVEsQ0FEQTtBQUVSLFdBQU0sQ0FGRTtBQUdSLFlBQVEsS0FIQTs7Ozs7Ozs7O0FBWVIsV0FBUTtBQVpBLEdBWFc7Ozs7Ozs7OztBQWlDckIsUUFqQ3FCLGtCQWlDYixLQWpDYSxFQWlDTDtBQUNkLFFBQUksU0FBUyxPQUFPLE1BQVAsQ0FBZSxJQUFmLENBQWI7O0FBRUEsMkJBQWEsTUFBYixDQUFvQixJQUFwQixDQUEwQixNQUExQjs7QUFFQSxXQUFPLE1BQVAsQ0FBZSxNQUFmLEVBQXVCLE9BQU8sUUFBOUIsRUFBd0MsS0FBeEM7O0FBRUEsUUFBSSxNQUFNLEtBQVYsRUFBa0IsT0FBTyxPQUFQLEdBQWlCLE1BQU0sS0FBdkI7O0FBRWxCLFdBQU8sSUFBUDs7QUFFQSxXQUFPLE1BQVA7QUFDRCxHQTdDb0I7Ozs7Ozs7O0FBb0RyQixNQXBEcUIsa0JBb0RkO0FBQ0wsU0FBSyxHQUFMLENB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IENhbnZhc1dpZGdldCBmcm9tICcuL2NhbnZhc1dpZGdldCdcblxuLyoqXG4gKiBBIEJ1dHRvbiB3aXRoIHRocmVlIGRpZmZlcmVudCBzdHlsZXM6ICdtb21lbnRhcnknIHRyaWdnZXJzIGEgZmxhc2ggYW5kIGluc3RhbmVvdXMgb3V0cHV0LCBcbiAqICdob2xkJyBvdXRwdXRzIHRoZSBidXR0b25zIG1heGltdW0gdmFsdWUgdW50aWwgaXQgaXMgcmVsZWFzZWQsIGFuZCAndG9nZ2xlJyBhbHRlcm5hdGVzIFxuICogYmV0d2VlbiBvdXRwdXR0aW5nIG1heGltdW0gYW5kIG1pbmltdW0gdmFsdWVzIG9uIHByZXNzLiBcbiAqIFxuICogQG1vZHVsZSBCdXR0b25cbiAqIEBhdWdtZW50cyBDYW52YXNXaWRnZXRcbiAqLyBcblxubGV0IEJ1dHRvbiA9IE9iamVjdC5jcmVhdGUoIENhbnZhc1dpZGdldCApXG5cbk9iamVjdC5hc3NpZ24oIEJ1dHRvbiwge1xuXG4gIC8qKiBAbGVuZHMgQnV0dG9uLnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgQnV0dG9uIGluc3RhbmNlcy5cbiAgICogRGVmYXVsdHMgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdXNlci1kZWZpbmVkIHByb3BlcnRpZXMgcGFzc2VkIHRvXG4gICAqIGNvbnN0cnV0b3IuXG4gICAqIEBtZW1iZXJvZiBCdXR0b25cbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIF9fdmFsdWU6MCxcbiAgICB2YWx1ZTowLFxuICAgIGFjdGl2ZTogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgc3R5bGUgcHJvcGVydHkgY2FuIGJlICdtb21lbnRhcnknLCAnaG9sZCcsIG9yICd0b2dnbGUnLiBUaGlzXG4gICAgICogZGV0ZXJtaW5lcyB0aGUgaW50ZXJhY3Rpb24gb2YgdGhlIEJ1dHRvbiBpbnN0YW5jZS5cbiAgICAgKiBAbWVtYmVyb2YgQnV0dG9uXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBzdHlsZTogICd0b2dnbGUnXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBCdXR0b24gaW5zdGFuY2UuXG4gICAqIEBtZW1iZXJvZiBCdXR0b25cbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wc10gLSBBIGRpY3Rpb25hcnkgb2YgcHJvcGVydGllcyB0byBpbml0aWFsaXplIGEgQnV0dG9uIGluc3RhbmNlIHdpdGguXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSggcHJvcHMgKSB7XG4gICAgbGV0IGJ1dHRvbiA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIENhbnZhc1dpZGdldC5jcmVhdGUuY2FsbCggYnV0dG9uIClcblxuICAgIE9iamVjdC5hc3NpZ24oIGJ1dHRvbiwgQnV0dG9uLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBpZiggcHJvcHMudmFsdWUgKSBidXR0b24uX192YWx1ZSA9IHByb3BzLnZhbHVlXG5cbiAgICBidXR0b24uaW5pdCgpXG5cbiAgICByZXR1cm4gYnV0dG9uXG4gIH0sXG5cbiAgLyoqXG4gICAqIERyYXcgdGhlIEJ1dHRvbiBpbnRvIGl0cyBjYW52YXMgY29udGV4dCB1c2luZyB0aGUgY3VycmVudCAuX192YWx1ZSBwcm9wZXJ0eSBhbmQgYnV0dG9uIHN0eWxlLlxuICAgKiBAbWVtYmVyb2YgQnV0dG9uXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZHJhdygpIHtcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgICA9IHRoaXMuX192YWx1ZSA9PT0gMSA/IHRoaXMuZmlsbCA6IHRoaXMuYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VcbiAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aFxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLDAsIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCApXG5cbiAgICB0aGlzLmN0eC5zdHJva2VSZWN0KCAwLDAsIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCApXG4gIH0sXG5cbiAgYWRkRXZlbnRzKCkge1xuICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmV2ZW50cyApIHtcbiAgICAgIHRoaXNbIGtleSBdID0gdGhpcy5ldmVudHNbIGtleSBdLmJpbmQoIHRoaXMgKSBcbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgIHRoaXMucG9pbnRlcmRvd24gKVxuICB9LFxuXG4gIGV2ZW50czoge1xuICAgIHBvaW50ZXJkb3duKCBlICkge1xuICAgICAgLy8gb25seSBob2xkIG5lZWRzIHRvIGxpc3RlbiBmb3IgcG9pbnRlcnVwIGV2ZW50czsgdG9nZ2xlIGFuZCBtb21lbnRhcnkgb25seSBjYXJlIGFib3V0IHBvaW50ZXJkb3duXG4gICAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvbGQnICkge1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgdGhpcy5wb2ludGVySWQgPSBlLnBvaW50ZXJJZFxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsIHRoaXMucG9pbnRlcnVwICkgXG4gICAgICB9XG5cbiAgICAgIGlmKCB0aGlzLnN0eWxlID09PSAndG9nZ2xlJyApIHtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gdGhpcy5fX3ZhbHVlID09PSAxID8gMCA6IDFcbiAgICAgIH1lbHNlIGlmKCB0aGlzLnN0eWxlID09PSAnbW9tZW50YXJ5JyApIHtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gMVxuICAgICAgICBzZXRUaW1lb3V0KCAoKT0+IHsgdGhpcy5fX3ZhbHVlID0gMDsgdGhpcy5kcmF3KCkgfSwgNTAgKVxuICAgICAgfWVsc2UgaWYoIHRoaXMuc3R5bGUgPT09ICdob2xkJyApIHtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gMVxuICAgICAgfVxuICAgICAgXG4gICAgICB0aGlzLm91dHB1dCgpXG5cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIHBvaW50ZXJ1cCggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgJiYgdGhpcy5zdHlsZSA9PT0gJ2hvbGQnICkge1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIFxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKVxuXG4gICAgICAgIHRoaXMuX192YWx1ZSA9IDBcbiAgICAgICAgdGhpcy5vdXRwdXQoKVxuXG4gICAgICAgIHRoaXMuZHJhdygpXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCBCdXR0b25cbiIsImltcG9ydCBET01XaWRnZXQgZnJvbSAnLi9kb21XaWRnZXQnXG5pbXBvcnQgVXRpbGl0aWVzIGZyb20gJy4vdXRpbGl0aWVzJ1xuaW1wb3J0IFdpZGdldExhYmVsIGZyb20gJy4vd2lkZ2V0TGFiZWwnXG5cbi8qKlxuICogQ2FudmFzV2lkZ2V0IGlzIHRoZSBiYXNlIGNsYXNzIGZvciB3aWRnZXRzIHRoYXQgdXNlIEhUTUwgY2FudmFzIGVsZW1lbnRzLlxuICogQG1vZHVsZSBDYW52YXNXaWRnZXRcbiAqIEBhdWdtZW50cyBET01XaWRnZXRcbiAqLyBcblxubGV0IENhbnZhc1dpZGdldCA9IE9iamVjdC5jcmVhdGUoIERPTVdpZGdldCApXG5cbk9iamVjdC5hc3NpZ24oIENhbnZhc1dpZGdldCwge1xuICAvKiogQGxlbmRzIENhbnZhc1dpZGdldC5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBjb2xvcnMgYW5kIGNhbnZhcyBjb250ZXh0IHByb3BlcnRpZXMgZm9yIHVzZSBpbiBDYW52YXNXaWRnZXRzXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBiYWNrZ3JvdW5kOicjODg4JyxcbiAgICBmaWxsOicjYWFhJyxcbiAgICBzdHJva2U6J3JnYmEoMjU1LDI1NSwyNTUsLjMpJyxcbiAgICBsaW5lV2lkdGg6NCxcbiAgICBkZWZhdWx0TGFiZWw6IHtcbiAgICAgIHg6LjUsIHk6LjUsIGFsaWduOidjZW50ZXInLCB3aWR0aDoxLCB0ZXh0OidkZW1vJ1xuICAgIH0sXG4gICAgc2hvdWxkRGlzcGxheVZhbHVlOmZhbHNlXG4gIH0sXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgQ2FudmFzV2lkZ2V0IGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBDYW52YXNXaWRnZXRcbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgc2hvdWxkVXNlVG91Y2ggPSBVdGlsaXRpZXMuZ2V0TW9kZSgpID09PSAndG91Y2gnXG4gICAgXG4gICAgRE9NV2lkZ2V0LmNyZWF0ZS5jYWxsKCB0aGlzIClcblxuICAgIE9iamVjdC5hc3NpZ24oIHRoaXMsIENhbnZhc1dpZGdldC5kZWZhdWx0cylcblxuICAgIC8qKlxuICAgICAqIFN0b3JlIGEgcmVmZXJlbmNlIHRvIHRoZSBjYW52YXMgMkQgY29udGV4dC5cbiAgICAgKiBAbWVtYmVyb2YgQ2FudmFzV2lkZ2V0XG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH1cbiAgICAgKi9cbiAgICB0aGlzLmN0eCA9IHRoaXMuZWxlbWVudC5nZXRDb250ZXh0KCAnMmQnIClcblxuICAgIHRoaXMuYXBwbHlIYW5kbGVycyggc2hvdWxkVXNlVG91Y2ggKVxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSB0aGUgY2FudmFzIGVsZW1lbnQgdXNlZCBieSB0aGUgd2lkZ2V0IGFuZCBzZXRcbiAgICogc29tZSBkZWZhdWx0IENTUyB2YWx1ZXMuXG4gICAqIEBtZW1iZXJvZiBDYW52YXNXaWRnZXRcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlRWxlbWVudCgpIHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnIClcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSggJ3RvdWNoLWFjdGlvbicsICdub25lJyApXG4gICAgZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbiAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgID0gJ2Jsb2NrJ1xuICAgIFxuICAgIHJldHVybiBlbGVtZW50XG4gIH0sXG5cbiAgYXBwbHlIYW5kbGVycyggc2hvdWxkVXNlVG91Y2g9ZmFsc2UgKSB7XG4gICAgbGV0IGhhbmRsZXJzID0gc2hvdWxkVXNlVG91Y2ggPyBDYW52YXNXaWRnZXQuaGFuZGxlcnMudG91Y2ggOiBDYW52YXNXaWRnZXQuaGFuZGxlcnMubW91c2VcbiAgICBcbiAgICAvLyB3aWRnZXRzIGhhdmUgaWpzIGRlZmluZWQgaGFuZGxlcnMgc3RvcmVkIGluIHRoZSBfZXZlbnRzIGFycmF5LFxuICAgIC8vIGFuZCB1c2VyLWRlZmluZWQgZXZlbnRzIHN0b3JlZCB3aXRoICdvbicgcHJlZml4ZXMgKGUuZy4gb25jbGljaywgb25tb3VzZWRvd24pXG4gICAgZm9yKCBsZXQgaGFuZGxlck5hbWUgb2YgaGFuZGxlcnMgKSB7XG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggaGFuZGxlck5hbWUsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYoIHR5cGVvZiB0aGlzWyAnb24nICsgaGFuZGxlck5hbWUgXSAgPT09ICdmdW5jdGlvbicgICkgdGhpc1sgJ29uJyArIGhhbmRsZXJOYW1lIF0oIGV2ZW50IClcbiAgICAgIH0pXG4gICAgfVxuXG4gIH0sXG5cbiAgaGFuZGxlcnM6IHtcbiAgICBtb3VzZTogW1xuICAgICAgJ21vdXNldXAnLFxuICAgICAgJ21vdXNlbW92ZScsXG4gICAgICAnbW91c2Vkb3duJyxcbiAgICBdLFxuICAgIHRvdWNoOiBbXVxuICB9LFxuXG4gIGFkZExhYmVsKCkge1xuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHsgY3R4OiB0aGlzLmN0eCB9LCB0aGlzLmxhYmVsIHx8IHRoaXMuZGVmYXVsdExhYmVsICksXG4gICAgICAgIGxhYmVsID0gV2lkZ2V0TGFiZWwuY3JlYXRlKCBwcm9wcyApXG5cbiAgICB0aGlzLmxhYmVsID0gbGFiZWxcbiAgICB0aGlzLl9kcmF3ID0gdGhpcy5kcmF3XG4gICAgdGhpcy5kcmF3ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9kcmF3KClcbiAgICAgIHRoaXMubGFiZWwuZHJhdygpXG4gICAgfVxuICB9LFxuXG4gIF9fYWRkVG9QYW5lbCggcGFuZWwgKSB7XG4gICAgdGhpcy5jb250YWluZXIgPSBwYW5lbFxuXG4gICAgaWYoIHR5cGVvZiB0aGlzLmFkZEV2ZW50cyA9PT0gJ2Z1bmN0aW9uJyApIHRoaXMuYWRkRXZlbnRzKClcblxuICAgIC8vIGNhbGxlZCBpZiB3aWRnZXQgdXNlcyBET01XaWRnZXQgYXMgcHJvdG90eXBlOyAucGxhY2UgaW5oZXJpdGVkIGZyb20gRE9NV2lkZ2V0XG4gICAgdGhpcy5wbGFjZSgpIFxuXG4gICAgaWYoIHRoaXMubGFiZWwgfHwgdGhpcy5zaG91bGREaXNwbGF5VmFsdWUgKSB0aGlzLmFkZExhYmVsKClcbiAgICBpZiggdGhpcy5zaG91bGREaXNwbGF5VmFsdWUgKSB7XG4gICAgICB0aGlzLl9fcG9zdGZpbHRlcnMucHVzaCggKCB2YWx1ZSApID0+IHsgXG4gICAgICAgIHRoaXMubGFiZWwudGV4dCA9IHZhbHVlLnRvRml4ZWQoIDUgKVxuICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgIH0pXG4gICAgfVxuICAgIHRoaXMuZHJhdygpICAgICBcblxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCBDYW52YXNXaWRnZXRcbiIsImltcG9ydCBXaWRnZXQgZnJvbSAnLi93aWRnZXQnXG5cbmxldCBDb21tdW5pY2F0aW9uID0ge1xuICBTb2NrZXQgOiBudWxsLFxuICBpbml0aWFsaXplZDogZmFsc2UsXG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLlNvY2tldCA9IG5ldyBXZWJTb2NrZXQoIHRoaXMuZ2V0U2VydmVyQWRkcmVzcygpIClcbiAgICB0aGlzLlNvY2tldC5vbm1lc3NhZ2UgPSB0aGlzLm9ubWVzc2FnZVxuXG4gICAgbGV0IGZ1bGxMb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbi50b1N0cmluZygpLFxuICAgICAgICBsb2NhdGlvblNwbGl0ID0gZnVsbExvY2F0aW9uLnNwbGl0KCAnLycgKSxcbiAgICAgICAgaW50ZXJmYWNlTmFtZSA9IGxvY2F0aW9uU3BsaXRbIGxvY2F0aW9uU3BsaXQubGVuZ3RoIC0gMSBdXG4gICAgXG4gICAgdGhpcy5Tb2NrZXQub25vcGVuID0gKCk9PiB7XG4gICAgICB0aGlzLlNvY2tldC5zZW5kKCBKU09OLnN0cmluZ2lmeSh7IHR5cGU6J21ldGEnLCBpbnRlcmZhY2VOYW1lLCBrZXk6J3JlZ2lzdGVyJyB9KSApXG4gICAgfVxuXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWVcbiAgfSxcblxuICBnZXRTZXJ2ZXJBZGRyZXNzKCkge1xuICAgIGxldCBleHByLCBzb2NrZXRJUEFuZFBvcnQsIHNvY2tldFN0cmluZywgaXAsIHBvcnRcblxuICAgIGV4cHIgPSAvWy1hLXpBLVowLTkuXSsoOig2NTUzWzAtNV18NjU1WzAtMl1cXGR8NjVbMC00XVxcZHsyfXw2WzAtNF1cXGR7M318WzEtNV1cXGR7NH18WzEtOV1cXGR7MCwzfSkpL1xuXG4gICAgc29ja2V0SVBBbmRQb3J0ID0gZXhwci5leGVjKCB3aW5kb3cubG9jYXRpb24udG9TdHJpbmcoKSApWyAwIF0uc3BsaXQoICc6JyApXG4gICAgaXAgPSBzb2NrZXRJUEFuZFBvcnRbIDAgXVxuICAgIHBvcnQgPSBwYXJzZUludCggc29ja2V0SVBBbmRQb3J0WyAxIF0gKVxuXG4gICAgc29ja2V0U3RyaW5nID0gYHdzOi8vJHtpcH06JHtwb3J0fWBcblxuICAgIHJldHVybiBzb2NrZXRTdHJpbmdcbiAgfSxcblxuICBvbm1lc3NhZ2UoIGUgKSB7XG4gICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKCBlLmRhdGEgKVxuICAgIGlmKCBkYXRhLnR5cGUgPT09ICdvc2MnICkge1xuICAgICAgQ29tbXVuaWNhdGlvbi5PU0MuX3JlY2VpdmUoIGUuZGF0YSApO1xuICAgIH1lbHNlIHtcbiAgICAgIGlmKCBDb21tdW5pY2F0aW9uLlNvY2tldC5yZWNlaXZlICkge1xuICAgICAgICBDb21tdW5pY2F0aW9uLlNvY2tldC5yZWNlaXZlKCBkYXRhLmFkZHJlc3MsIGRhdGEucGFyYW1ldGVycyAgKVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBPU0MgOiB7XG4gICAgY2FsbGJhY2tzOiB7fSxcbiAgICBvbm1lc3NhZ2U6IG51bGwsXG5cbiAgICBzZW5kKCBhZGRyZXNzLCBwYXJhbWV0ZXJzICkge1xuICAgICAgaWYoIENvbW11bmljYXRpb24uU29ja2V0LnJlYWR5U3RhdGUgPT09IDEgKSB7XG4gICAgICAgIGlmKCB0eXBlb2YgYWRkcmVzcyA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgbGV0IG1zZyA9IHtcbiAgICAgICAgICAgIHR5cGUgOiBcIm9zY1wiLFxuICAgICAgICAgICAgYWRkcmVzcyxcbiAgICAgICAgICAgICdwYXJhbWV0ZXJzJzogQXJyYXkuaXNBcnJheSggcGFyYW1ldGVycyApID8gcGFyYW1ldGVycyA6IFsgcGFyYW1ldGVycyBdLFxuICAgICAgICAgIH1cblxuICAgICAgICAgIENvbW11bmljYXRpb24uU29ja2V0LnNlbmQoIEpTT04uc3RyaW5naWZ5KCBtc2cgKSApXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRocm93IEVycm9yKCAnSW52YWxpZCBvc2MgbWVzc2FnZTonLCBhcmd1bWVudHMgKSAgIFxuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhyb3cgRXJyb3IoICdTb2NrZXQgaXMgbm90IHlldCBjb25uZWN0ZWQ7IGNhbm5vdCBzZW5kIE9TQyBtZXNzc2FnZXMuJyApXG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgcmVjZWl2ZSggZGF0YSApIHtcbiAgICAgIGxldCBtc2cgPSBKU09OLnBhcnNlKCBkYXRhIClcblxuICAgICAgaWYoIG1zZy5hZGRyZXNzIGluIHRoaXMuY2FsbGJhY2tzICkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrc1sgbXNnLmFkZHJlc3MgXSggbXNnLnBhcmFtZXRlcnMgKVxuICAgICAgfWVsc2V7XG4gICAgICAgIGZvciggbGV0IHdpZGdldCBvZiBXaWRnZXQud2lkZ2V0cyApIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCBcIkNIRUNLXCIsIGNoaWxkLmtleSwgbXNnLmFkZHJlc3MgKVxuICAgICAgICAgIGlmKCB3aWRnZXQua2V5ID09PSBtc2cuYWRkcmVzcyApIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGNoaWxkLmtleSwgbXNnLnBhcmFtZXRlcnMgKVxuICAgICAgICAgICAgd2lkZ2V0LnNldFZhbHVlLmFwcGx5KCB3aWRnZXQsIG1zZy5wYXJhbWV0ZXJzIClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgfSAgICBcblxuICAgICAgICBpZiggdGhpcy5vbm1lc3NhZ2UgIT09IG51bGwgKSB7IFxuICAgICAgICAgIHRoaXMucmVjZWl2ZSggbXNnLmFkZHJlc3MsIG1zZy50eXBldGFncywgbXNnLnBhcmFtZXRlcnMgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29tbXVuaWNhdGlvblxuIiwiaW1wb3J0IFdpZGdldCBmcm9tICcuL3dpZGdldCdcbmltcG9ydCBVdGlsaXRpZXMgZnJvbSAnLi91dGlsaXRpZXMnXG5cbi8qKlxuICogRE9NV2lkZ2V0IGlzIHRoZSBiYXNlIGNsYXNzIGZvciB3aWRnZXRzIHRoYXQgdXNlIEhUTUwgY2FudmFzIGVsZW1lbnRzLlxuICogQGF1Z21lbnRzIFdpZGdldFxuICovXG5cbmxldCBET01XaWRnZXQgPSBPYmplY3QuY3JlYXRlKCBXaWRnZXQgKVxuXG5PYmplY3QuYXNzaWduKCBET01XaWRnZXQsIHtcbiAgLyoqIEBsZW5kcyBET01XaWRnZXQucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBET01XaWRnZXRzXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICB4OjAseTowLHdpZHRoOi4yNSxoZWlnaHQ6LjI1LFxuICAgIGF0dGFjaGVkOmZhbHNlLFxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgRE9NV2lkZ2V0IGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBET01XaWRnZXRcbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCkge1xuICAgIGxldCBzaG91bGRVc2VUb3VjaCA9IFV0aWxpdGllcy5nZXRNb2RlKCkgPT09ICd0b3VjaCdcbiAgICBcbiAgICBXaWRnZXQuY3JlYXRlLmNhbGwoIHRoaXMgKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggdGhpcywgRE9NV2lkZ2V0LmRlZmF1bHRzIClcblxuICAgIC8vIEFMTCBJTlNUQU5DRVMgT0YgRE9NV0lER0VUIE1VU1QgSU1QTEVNRU5UIENSRUFURSBFTEVNRU5UXG4gICAgaWYoIHR5cGVvZiB0aGlzLmNyZWF0ZUVsZW1lbnQgPT09ICdmdW5jdGlvbicgKSB7XG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIERPTSBlbGVtZW50IHVzZWQgYnkgdGhlIERPTVdpZGdldFxuICAgICAgICogQG1lbWJlcm9mIERPTVdpZGdldFxuICAgICAgICogQGluc3RhbmNlXG4gICAgICAgKi9cbiAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuY3JlYXRlRWxlbWVudCgpXG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICd3aWRnZXQgaW5oZXJpdGluZyBmcm9tIERPTVdpZGdldCBkb2VzIG5vdCBpbXBsZW1lbnQgY3JlYXRlRWxlbWVudCBtZXRob2Q7IHRoaXMgaXMgcmVxdWlyZWQuJyApXG4gICAgfVxuICB9LFxuICBcbiAgLyoqXG4gICAqIENyZWF0ZSBhIERPTSBlbGVtZW50IHRvIGJlIHBsYWNlZCBpbiBhIFBhbmVsLlxuICAgKiBAdmlydHVhbFxuICAgKiBAbWVtYmVyb2YgRE9NV2lkZ2V0XG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZUVsZW1lbnQoKSB7XG4gICAgdGhyb3cgRXJyb3IoICdhbGwgc3ViY2xhc3NlcyBvZiBET01XaWRnZXQgbXVzdCBpbXBsZW1lbnQgY3JlYXRlRWxlbWVudCgpJyApXG4gIH0sXG5cbiAgLyoqXG4gICAqIHVzZSBDU1MgdG8gcG9zaXRpb24gZWxlbWVudCBlbGVtZW50IG9mIHdpZGdldFxuICAgKiBAbWVtYmVyb2YgRE9NV2lkZ2V0XG4gICAqL1xuICBwbGFjZSgpIHtcbiAgICBsZXQgY29udGFpbmVyV2lkdGggPSB0aGlzLmNvbnRhaW5lci5nZXRXaWR0aCgpLFxuICAgICAgICBjb250YWluZXJIZWlnaHQ9IHRoaXMuY29udGFpbmVyLmdldEhlaWdodCgpLFxuICAgICAgICB3aWR0aCAgPSB0aGlzLndpZHRoICA8PSAxID8gY29udGFpbmVyV2lkdGggICogdGhpcy53aWR0aCA6IHRoaXMud2lkdGgsXG4gICAgICAgIGhlaWdodCA9IHRoaXMuaGVpZ2h0IDw9IDEgPyBjb250YWluZXJIZWlnaHQgKiB0aGlzLmhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICAgIHggICAgICA9IHRoaXMueCA8IDEgPyBjb250YWluZXJXaWR0aCAgKiB0aGlzLnggOiB0aGlzLngsXG4gICAgICAgIHkgICAgICA9IHRoaXMueSA8IDEgPyBjb250YWluZXJIZWlnaHQgKiB0aGlzLnkgOiB0aGlzLnlcblxuICAgIGlmKCAhdGhpcy5hdHRhY2hlZCApIHtcbiAgICAgIHRoaXMuYXR0YWNoZWQgPSB0cnVlXG4gICAgfVxuICBcbiAgICBpZiggdGhpcy5pc1NxdWFyZSApIHtcbiAgICAgIGlmKCBoZWlnaHQgPiB3aWR0aCApIHtcbiAgICAgICAgaGVpZ2h0ID0gd2lkdGhcbiAgICAgIH1lbHNle1xuICAgICAgICB3aWR0aCA9IGhlaWdodFxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudC53aWR0aCAgPSB3aWR0aFxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4J1xuICAgIHRoaXMuZWxlbWVudC5oZWlnaHQgPSBoZWlnaHRcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4J1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0geFxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgID0geVxuXG4gICAgLyoqXG4gICAgICogQm91bmRpbmcgYm94LCBpbiBhYnNvbHV0ZSBjb29yZGluYXRlcywgb2YgdGhlIERPTVdpZGdldFxuICAgICAqIEBtZW1iZXJvZiBET01XaWRnZXRcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMucmVjdCA9IHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSBcbiAgfSxcbiAgXG59KVxuXG5leHBvcnQgZGVmYXVsdCBET01XaWRnZXRcbiIsImxldCBGaWx0ZXJzID0ge1xuICBTY2FsZSggaW5taW49MCwgaW5tYXg9MSwgb3V0bWluPS0xLCBvdXRtYXg9MSApIHtcbiAgICBsZXQgaW5yYW5nZSAgPSBpbm1heCAtIGlubWluLFxuICAgICAgICBvdXRyYW5nZSA9IG91dG1heCAtIG91dG1pbixcbiAgICAgICAgcmFuZ2VSYXRpbyA9IG91dHJhbmdlIC8gaW5yYW5nZVxuXG4gICAgcmV0dXJuIGlucHV0ID0+IG91dG1pbiArIGlucHV0ICogcmFuZ2VSYXRpb1xuICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBGaWx0ZXJzXG4iLCIvLyBFdmVyeXRoaW5nIHdlIG5lZWQgdG8gaW5jbHVkZSBnb2VzIGhlcmUgYW5kIGlzIGZlZCB0byBicm93c2VyaWZ5IGluIHRoZSBndWxwZmlsZS5qc1xuXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi9wYW5lbCdcbmltcG9ydCBTbGlkZXIgZnJvbSAnLi9zbGlkZXInXG5pbXBvcnQgSm95c3RpY2sgZnJvbSAnLi9qb3lzdGljaydcbmltcG9ydCBCdXR0b24gZnJvbSAnLi9idXR0b24nXG5pbXBvcnQgTWVudSBmcm9tICcuL21lbnUnXG5pbXBvcnQgQ29tbXVuaWNhdGlvbiBmcm9tICcuL2NvbW11bmljYXRpb24nXG5pbXBvcnQgUEVQIGZyb20gJ3BlcGpzJ1xuaW1wb3J0IEtub2IgZnJvbSAnLi9rbm9iJ1xuaW1wb3J0IE11bHRpU2xpZGVyIGZyb20gJy4vbXVsdGlzbGlkZXInXG5pbXBvcnQgTXVsdGlCdXR0b24gZnJvbSAnLi9tdWx0aUJ1dHRvbidcblxuZXhwb3J0IHtcbiAgUGFuZWwsIFNsaWRlciwgSm95c3RpY2ssIEJ1dHRvbiwgTWVudSwgQ29tbXVuaWNhdGlvbiwgS25vYiwgTXVsdGlTbGlkZXIsIE11bHRpQnV0dG9uXG59XG4iLCJpbXBvcnQgQ2FudmFzV2lkZ2V0IGZyb20gJy4vY2FudmFzV2lkZ2V0LmpzJ1xuXG4vKipcbiAqIEEgam95c3RpY2sgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWxlY3QgYW4gWFkgcG9zaXRpb24gYW5kIHRoZW4gc25hcHMgYmFjay4gXG4gKiBAbW9kdWxlIEpveXN0aWNrXG4gKiBAYXVnbWVudHMgQ2FudmFzV2lkZ2V0XG4gKi8gXG5cbmxldCBKb3lzdGljayA9IE9iamVjdC5jcmVhdGUoIENhbnZhc1dpZGdldCApIFxuXG5PYmplY3QuYXNzaWduKCBKb3lzdGljaywge1xuICAvKiogQGxlbmRzIEpveXN0aWNrLnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgSm95c3RpY2sgaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIEpveXN0aWNrXG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBfX3ZhbHVlOlsuNSwuNV0sIC8vIGFsd2F5cyAwLTEsIG5vdCBmb3IgZW5kLXVzZXJzXG4gICAgdmFsdWU6Wy41LC41XSwgICAvLyBlbmQtdXNlciB2YWx1ZSB0aGF0IG1heSBiZSBmaWx0ZXJlZFxuICAgIGFjdGl2ZTogZmFsc2UsXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBKb3lzdGljayBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIEpveXN0aWNrXG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBTbGlkZXIgd2l0aC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgam95c3RpY2sgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICAvLyBhcHBseSBXaWRnZXQgZGVmYXVsdHMsIHRoZW4gb3ZlcndyaXRlIChpZiBhcHBsaWNhYmxlKSB3aXRoIFNsaWRlciBkZWZhdWx0c1xuICAgIENhbnZhc1dpZGdldC5jcmVhdGUuY2FsbCggam95c3RpY2sgKVxuXG4gICAgLy8gLi4uYW5kIHRoZW4gZmluYWxseSBvdmVycmlkZSB3aXRoIHVzZXIgZGVmYXVsdHNcbiAgICBPYmplY3QuYXNzaWduKCBqb3lzdGljaywgSm95c3RpY2suZGVmYXVsdHMsIHByb3BzIClcblxuICAgIC8vIHNldCB1bmRlcmx5aW5nIHZhbHVlIGlmIG5lY2Vzc2FyeS4uLiBUT0RPOiBob3cgc2hvdWxkIHRoaXMgYmUgc2V0IGdpdmVuIG1pbi9tYXg/XG4gICAgaWYoIHByb3BzLnZhbHVlICkgam95c3RpY2suX192YWx1ZSA9IHByb3BzLnZhbHVlXG4gICAgXG4gICAgLy8gaW5oZXJpdHMgZnJvbSBXaWRnZXRcbiAgICBqb3lzdGljay5pbml0KClcblxuICAgIHJldHVybiBqb3lzdGlja1xuICB9LFxuXG4gIC8qKlxuICAgKiBEcmF3IHRoZSBKb3lzdGljayBvbnRvIGl0cyBjYW52YXMgY29udGV4dCB1c2luZyB0aGUgY3VycmVudCAuX192YWx1ZSBwcm9wZXJ0eS5cbiAgICogQG1lbWJlcm9mIEpveXN0aWNrXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZHJhdygpIHtcbiAgICAvLyBkcmF3IGJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgICA9IHRoaXMuYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VcbiAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aFxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLDAsIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCApXG5cbiAgICAvLyBkcmF3IGZpbGwgKHNsaWRlciB2YWx1ZSByZXByZXNlbnRhdGlvbilcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxcblxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLnJlY3Qud2lkdGgqMC41LHRoaXMucmVjdC5oZWlnaHQqLjUpO1xuICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLnJlY3Qud2lkdGggKnRoaXMuX192YWx1ZVswXSwgdGhpcy5yZWN0LmhlaWdodCAqIHRoaXMuX192YWx1ZVsxXSk7XG4gICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgdGhpcy5jdHguZmlsbFJlY3QoIHRoaXMucmVjdC53aWR0aCAqIHRoaXMuX192YWx1ZVswXSAtMTIsIHRoaXMucmVjdC5oZWlnaHQgKiB0aGlzLl9fdmFsdWVbMV0gLTEyLCAyNCwgMjQgKVxuXG4gICAgdGhpcy5jdHguc3Ryb2tlUmVjdCggMCwwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuICB9LFxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICAvLyBjcmVhdGUgZXZlbnQgaGFuZGxlcnMgYm91bmQgdG8gdGhlIGN1cnJlbnQgb2JqZWN0LCBvdGhlcndpc2UgXG4gICAgLy8gdGhlICd0aGlzJyBrZXl3b3JkIHdpbGwgcmVmZXIgdG8gdGhlIHdpbmRvdyBvYmplY3QgaW4gdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZXZlbnRzICkge1xuICAgICAgdGhpc1sga2V5IF0gPSB0aGlzLmV2ZW50c1sga2V5IF0uYmluZCggdGhpcyApIFxuICAgIH1cblxuICAgIC8vIG9ubHkgbGlzdGVuIGZvciBtb3VzZWRvd24gaW50aWFsbHk7IG1vdXNlbW92ZSBhbmQgbW91c2V1cCBhcmUgcmVnaXN0ZXJlZCBvbiBtb3VzZWRvd25cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgIHRoaXMucG9pbnRlcmRvd24gKVxuICB9LFxuXG4gIGV2ZW50czoge1xuICAgIHBvaW50ZXJkb3duKCBlICkge1xuICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlXG4gICAgICB0aGlzLnBvaW50ZXJJZCA9IGUucG9pbnRlcklkXG5cbiAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIC8vIGNoYW5nZSBzbGlkZXIgdmFsdWUgb24gY2xpY2sgLyB0b3VjaGRvd25cblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSAvLyBvbmx5IGxpc3RlbiBmb3IgdXAgYW5kIG1vdmUgZXZlbnRzIGFmdGVyIHBvaW50ZXJkb3duIFxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgfSxcblxuICAgIHBvaW50ZXJ1cCggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSBcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgICAgIHRoaXMuX192YWx1ZSA9IFsuNSwuNV1cbiAgICAgICAgdGhpcy5vdXRwdXQoKVxuICAgICAgICB0aGlzLmRyYXcoKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBwb2ludGVybW92ZSggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApXG4gICAgICB9XG4gICAgfSxcbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSB2YWx1ZSBiZXR3ZWVuIDAtMSBnaXZlbiB0aGUgY3VycmVudCBwb2ludGVyIHBvc2l0aW9uIGluIHJlbGF0aW9uXG4gICAqIHRvIHRoZSBKb3lzdGljaydzIHBvc2l0aW9uLCBhbmQgdHJpZ2dlcnMgb3V0cHV0LlxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIEpveXN0aWNrXG4gICAqIEBwYXJhbSB7UG9pbnRlckV2ZW50fSBlIC0gVGhlIHBvaW50ZXIgZXZlbnQgdG8gYmUgcHJvY2Vzc2VkLlxuICAgKi9cbiAgcHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIHtcblxuICAgIHRoaXMuX192YWx1ZVswXSA9ICggZS5jbGllbnRYIC0gdGhpcy5yZWN0LmxlZnQgKSAvIHRoaXMucmVjdC53aWR0aFxuICAgIHRoaXMuX192YWx1ZVsxXSA9ICggZS5jbGllbnRZIC0gdGhpcy5yZWN0LnRvcCAgKSAvIHRoaXMucmVjdC5oZWlnaHQgXG4gICAgXG5cbiAgICAvLyBjbGFtcCBfX3ZhbHVlLCB3aGljaCBpcyBvbmx5IHVzZWQgaW50ZXJuYWxseVxuICAgIGlmKCB0aGlzLl9fdmFsdWVbMF0gPiAxICkgdGhpcy5fX3ZhbHVlWzBdID0gMVxuICAgIGlmKCB0aGlzLl9fdmFsdWVbMV0gPiAxICkgdGhpcy5fX3ZhbHVlWzFdID0gMVxuICAgIGlmKCB0aGlzLl9fdmFsdWVbMF0gPCAwICkgdGhpcy5fX3ZhbHVlWzBdID0gMFxuICAgIGlmKCB0aGlzLl9fdmFsdWVbMV0gPCAwICkgdGhpcy5fX3ZhbHVlWzFdID0gMFxuXG4gICAgbGV0IHNob3VsZERyYXcgPSB0aGlzLm91dHB1dCgpXG4gICAgXG4gICAgaWYoIHNob3VsZERyYXcgKSB0aGlzLmRyYXcoKVxuICB9LFxuXG59KVxuXG5leHBvcnQgZGVmYXVsdCBKb3lzdGlja1xuIiwiaW1wb3J0IENhbnZhc1dpZGdldCBmcm9tICcuL2NhbnZhc1dpZGdldC5qcydcblxuLyoqXG4gKiBBIGhvcml6b250YWwgb3IgdmVydGljYWwgZmFkZXIuIFxuICogQG1vZHVsZSBLbm9iXG4gKiBAYXVnbWVudHMgQ2FudmFzV2lkZ2V0XG4gKi8gXG5cbmxldCBLbm9iID0gT2JqZWN0LmNyZWF0ZSggQ2FudmFzV2lkZ2V0ICkgXG5cbk9iamVjdC5hc3NpZ24oIEtub2IsIHtcbiAgLyoqIEBsZW5kcyBLbm9iLnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgS25vYiBpbnN0YW5jZXMuXG4gICAqIERlZmF1bHRzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHVzZXItZGVmaW5lZCBwcm9wZXJ0aWVzIHBhc3NlZCB0b1xuICAgKiBjb25zdHJ1dG9yLlxuICAgKiBAbWVtYmVyb2YgS25vYlxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgX192YWx1ZTouNSwgLy8gYWx3YXlzIDAtMSwgbm90IGZvciBlbmQtdXNlcnNcbiAgICB2YWx1ZTouNSwgICAvLyBlbmQtdXNlciB2YWx1ZSB0aGF0IG1heSBiZSBmaWx0ZXJlZFxuICAgIGFjdGl2ZTogZmFsc2UsXG4gICAga25vYkJ1ZmZlcjoyMCxcbiAgICB1c2VzUm90YXRpb246ZmFsc2UsXG4gICAgbGFzdFBvc2l0aW9uOjAsXG4gICAgaXNTcXVhcmU6dHJ1ZSxcbiAgICAvKipcbiAgICAgKiBUaGUgc3R5bGUgcHJvcGVydHkgY2FuIGJlIGVpdGhlciAnaG9yaXpvbnRhbCcgKHRoZSBkZWZhdWx0KSBvciAndmVydGljYWwnLiBUaGlzXG4gICAgICogZGV0ZXJtaW5lcyB0aGUgb3JpZW50YXRpb24gb2YgdGhlIEtub2IgaW5zdGFuY2UuXG4gICAgICogQG1lbWJlcm9mIEtub2JcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqL1xuICAgIHN0eWxlOiAgJ2hvcml6b250YWwnXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBLbm9iIGluc3RhbmNlLlxuICAgKiBAbWVtYmVyb2YgS25vYlxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXSAtIEEgZGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGluaXRpYWxpemUgS25vYiB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBrbm9iID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgLy8gYXBwbHkgV2lkZ2V0IGRlZmF1bHRzLCB0aGVuIG92ZXJ3cml0ZSAoaWYgYXBwbGljYWJsZSkgd2l0aCBLbm9iIGRlZmF1bHRzXG4gICAgQ2FudmFzV2lkZ2V0LmNyZWF0ZS5jYWxsKCBrbm9iIClcblxuICAgIC8vIC4uLmFuZCB0aGVuIGZpbmFsbHkgb3ZlcnJpZGUgd2l0aCB1c2VyIGRlZmF1bHRzXG4gICAgT2JqZWN0LmFzc2lnbigga25vYiwgS25vYi5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgLy8gc2V0IHVuZGVybHlpbmcgdmFsdWUgaWYgbmVjZXNzYXJ5Li4uIFRPRE86IGhvdyBzaG91bGQgdGhpcyBiZSBzZXQgZ2l2ZW4gbWluL21heD9cbiAgICBpZiggcHJvcHMudmFsdWUgKSBrbm9iLl9fdmFsdWUgPSBwcm9wcy52YWx1ZVxuICAgIFxuICAgIC8vIGluaGVyaXRzIGZyb20gV2lkZ2V0XG4gICAga25vYi5pbml0KClcblxuICAgIHJldHVybiBrbm9iXG4gIH0sXG5cbiAgLyoqXG4gICAqIERyYXcgdGhlIEtub2Igb250byBpdHMgY2FudmFzIGNvbnRleHQgdXNpbmcgdGhlIGN1cnJlbnQgLl9fdmFsdWUgcHJvcGVydHkuXG4gICAqIEBtZW1iZXJvZiBLbm9iXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZHJhdygpIHtcbiAgICAvLyBkcmF3IGJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgICA9IHRoaXMuY29udGFpbmVyLmJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlXG4gICAgdGhpcy5jdHgubGluZVdpZHRoICAgPSB0aGlzLmxpbmVXaWR0aFxuXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsMCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcblxuICAgIGxldCB4ID0gMCxcbiAgICAgICAgeSA9IDAsXG4gICAgICAgIHdpZHRoID0gdGhpcy5yZWN0LndpZHRoLFxuICAgICAgICBoZWlnaHQ9IHRoaXMucmVjdC5oZWlnaHQsXG4gICAgICAgIHJhZGl1cyA9IHdpZHRoIC8gMlxuICAgIFxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KCB4LCB5LCB3aWR0aCwgaGVpZ2h0IClcbiAgICAvL3RoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VcblxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuYmFja2dyb3VuZCAvLyBkcmF3IGJhY2tncm91bmQgb2Ygd2lkZ2V0IGZpcnN0XG5cbiAgICBsZXQgYW5nbGUwID0gTWF0aC5QSSAqIC42LFxuICAgICAgICBhbmdsZTEgPSBNYXRoLlBJICogLjRcblxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpXG4gICAgdGhpcy5jdHguYXJjKCB4ICsgcmFkaXVzLCB5ICsgcmFkaXVzLCByYWRpdXMgLSB0aGlzLmtub2JCdWZmZXIsICAgICAgICAgYW5nbGUwLCBhbmdsZTEsIGZhbHNlIClcbiAgICB0aGlzLmN0eC5hcmMoIHggKyByYWRpdXMsIHkgKyByYWRpdXMsIChyYWRpdXMgLSB0aGlzLmtub2JCdWZmZXIpICogLjUgLCBhbmdsZTEsIGFuZ2xlMCwgdHJ1ZSAgKVx0XHRcbiAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKVxuICAgIFxuICAgIHRoaXMuY3R4LmZpbGwoKVxuXG4gICAgbGV0IGFuZ2xlMlxuICAgIGlmKCF0aGlzLmlzSW52ZXJ0ZWQpICB7IFxuICAgICAgYW5nbGUyID0gTWF0aC5QSSAqIC42ICsgdGhpcy5fX3ZhbHVlICogMS44ICAqIE1hdGguUElcbiAgICAgIGlmKCBhbmdsZTIgPiAyICogTWF0aC5QSSkgYW5nbGUyIC09IDIgKiBNYXRoLlBJXG4gICAgfWVsc2V7XG4gICAgICBhbmdsZTIgPSBNYXRoLlBJICogKDAuNCAtICgxLjggKiB0aGlzLl9fdmFsdWUpKVxuICAgIH1cblxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpXG5cbiAgICBpZighdGhpcy5pc0ludmVydGVkKSB7XG4gICAgICB0aGlzLmN0eC5hcmMoIHggKyByYWRpdXMsIHkgKyByYWRpdXMsIHJhZGl1cyAtIHRoaXMua25vYkJ1ZmZlciwgYW5nbGUwLCBhbmdsZTIsIGZhbHNlIClcbiAgICAgIHRoaXMuY3R4LmFyYyggeCArIHJhZGl1cywgeSArIHJhZGl1cywgKHJhZGl1cyAtIHRoaXMua25vYkJ1ZmZlcikgKiAuNSwgYW5nbGUyLCBhbmdsZTAsIHRydWUgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmN0eC5hcmMoIHggKyByYWRpdXMsIHkgKyByYWRpdXMsIHJhZGl1cyAtIHRoaXMua25vYkJ1ZmZlciwgYW5nbGUxLCBhbmdsZTIgLHRydWUgKVxuICAgICAgdGhpcy5jdHguYXJjKCB4ICsgcmFkaXVzLCB5ICsgcmFkaXVzLCAocmFkaXVzIC0gdGhpcy5rbm9iQnVmZmVyKSAqIC41LCBhbmdsZTIsIGFuZ2xlMSwgZmFsc2UgKVxuICAgIH1cblxuICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpXG5cbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxcbiAgICB0aGlzLmN0eC5maWxsKClcbiAgXG4gIH0sXG5cbiAgYWRkRXZlbnRzKCkge1xuICAgIC8vIGNyZWF0ZSBldmVudCBoYW5kbGVycyBib3VuZCB0byB0aGUgY3VycmVudCBvYmplY3QsIG90aGVyd2lzZSBcbiAgICAvLyB0aGUgJ3RoaXMnIGtleXdvcmQgd2lsbCByZWZlciB0byB0aGUgd2luZG93IG9iamVjdCBpbiB0aGUgZXZlbnQgaGFuZGxlcnNcbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5ldmVudHMgKSB7XG4gICAgICB0aGlzWyBrZXkgXSA9IHRoaXMuZXZlbnRzWyBrZXkgXS5iaW5kKCB0aGlzICkgXG4gICAgfVxuXG4gICAgLy8gb25seSBsaXN0ZW4gZm9yIG1vdXNlZG93biBpbnRpYWxseTsgbW91c2Vtb3ZlIGFuZCBtb3VzZXVwIGFyZSByZWdpc3RlcmVkIG9uIG1vdXNlZG93blxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcmRvd24nLCAgdGhpcy5wb2ludGVyZG93biApXG4gIH0sXG5cbiAgZXZlbnRzOiB7XG4gICAgcG9pbnRlcmRvd24oIGUgKSB7XG4gICAgICB0aGlzLmFjdGl2ZSA9IHRydWVcbiAgICAgIHRoaXMucG9pbnRlcklkID0gZS5wb2ludGVySWRcblxuICAgICAgdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlICkgLy8gY2hhbmdlIGtub2IgdmFsdWUgb24gY2xpY2sgLyB0b3VjaGRvd25cblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSAvLyBvbmx5IGxpc3RlbiBmb3IgdXAgYW5kIG1vdmUgZXZlbnRzIGFmdGVyIHBvaW50ZXJkb3duIFxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgfSxcblxuICAgIHBvaW50ZXJ1cCggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSBcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgICB9XG4gICAgfSxcblxuICAgIHBvaW50ZXJtb3ZlKCBlICkge1xuICAgICAgaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCApIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlIClcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuICBcbiAgLyoqXG4gICAqIEdlbmVyYXRlcyBhIHZhbHVlIGJldHdlZW4gMC0xIGdpdmVuIHRoZSBjdXJyZW50IHBvaW50ZXIgcG9zaXRpb24gaW4gcmVsYXRpb25cbiAgICogdG8gdGhlIEtub2IncyBwb3NpdGlvbiwgYW5kIHRyaWdnZXJzIG91dHB1dC5cbiAgICogQGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBLbm9iXG4gICAqIEBwYXJhbSB7UG9pbnRlckV2ZW50fSBlIC0gVGhlIHBvaW50ZXIgZXZlbnQgdG8gYmUgcHJvY2Vzc2VkLlxuICAgKi9cblxuICBwcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlICkge1xuICAgIGxldCB4T2Zmc2V0ID0gZS5jbGllbnRYLCB5T2Zmc2V0ID0gZS5jbGllbnRZXG5cbiAgICBsZXQgcmFkaXVzID0gdGhpcy5yZWN0LndpZHRoIC8gMjtcbiAgICB0aGlzLmxhc3RWYWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICBpZiggIXRoaXMudXNlc1JvdGF0aW9uICkge1xuICAgICAgaWYoIHRoaXMubGFzdFBvc2l0aW9uICE9PSAtMSApIHsgXG4gICAgICAgIC8vdGhpcy5fX3ZhbHVlIC09ICggeU9mZnNldCAtIHRoaXMubGFzdFBvc2l0aW9uICkgLyAocmFkaXVzICogMik7XG4gICAgICAgIHRoaXMuX192YWx1ZSA9IDEgLSB5T2Zmc2V0IC8gdGhpcy5yZWN0LmhlaWdodFxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgdmFyIHhkaWZmID0gcmFkaXVzIC0geE9mZnNldDtcbiAgICAgIHZhciB5ZGlmZiA9IHJhZGl1cyAtIHlPZmZzZXQ7XG4gICAgICB2YXIgYW5nbGUgPSBNYXRoLlBJICsgTWF0aC5hdGFuMih5ZGlmZiwgeGRpZmYpO1xuICAgICAgdGhpcy5fX3ZhbHVlID0gICgoYW5nbGUgKyAoTWF0aC5QSSAqIDEuNSkpICUgKE1hdGguUEkgKiAyKSkgLyAoTWF0aC5QSSAqIDIpO1xuXG4gICAgICBpZih0aGlzLmxhc3RSb3RhdGlvblZhbHVlID4gLjggJiYgdGhpcy5fX3ZhbHVlIDwgLjIpIHtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gMTtcbiAgICAgIH1lbHNlIGlmKHRoaXMubGFzdFJvdGF0aW9uVmFsdWUgPCAuMiAmJiB0aGlzLl9fdmFsdWUgPiAuOCkge1xuICAgICAgICB0aGlzLl9fdmFsdWUgPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9fdmFsdWUgPiAxKSB0aGlzLl9fdmFsdWUgPSAxO1xuICAgIGlmICh0aGlzLl9fdmFsdWUgPCAwKSB0aGlzLl9fdmFsdWUgPSAwO1xuXG4gICAgdGhpcy5sYXN0Um90YXRpb25WYWx1ZSA9IHRoaXMuX192YWx1ZTtcbiAgICB0aGlzLmxhc3RQb3NpdGlvbiA9IHlPZmZzZXQ7XG5cbiAgICBsZXQgc2hvdWxkRHJhdyA9IHRoaXMub3V0cHV0KClcbiAgICBcbiAgICBpZiggc2hvdWxkRHJhdyApIHRoaXMuZHJhdygpXG4gIH0sXG5cbiAgLy9fX2FkZFRvUGFuZWwoIHBhbmVsICkge1xuICAvLyAgdGhpcy5jb250YWluZXIgPSBwYW5lbFxuXG4gIC8vICBpZiggdHlwZW9mIHRoaXMuYWRkRXZlbnRzID09PSAnZnVuY3Rpb24nICkgdGhpcy5hZGRFdmVudHMoKVxuXG4gIC8vICAvLyBjYWxsZWQgaWYgd2lkZ2V0IHVzZXMgRE9NV2lkZ2V0IGFzIHByb3RvdHlwZTsgLnBsYWNlIGluaGVyaXRlZCBmcm9tIERPTVdpZGdldFxuICAgIFxuICAvLyAgdGhpcy5wbGFjZSggdHJ1ZSApIFxuXG4gIC8vICBpZiggdGhpcy5sYWJlbCApIHRoaXMuYWRkTGFiZWwoKVxuXG4gIC8vICB0aGlzLmRyYXcoKSAgICAgXG5cbiAgLy99XG5cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gS25vYlxuIiwiaW1wb3J0IERPTVdpZGdldCBmcm9tICcuL2RvbVdpZGdldC5qcydcblxuLyoqXG4gKiBBIEhUTUwgc2VsZWN0IGVsZW1lbnQsIGZvciBwaWNraW5nIGl0ZW1zIGZyb20gYSBkcm9wLWRvd24gbWVudS4gXG4gKiBcbiAqIEBtb2R1bGUgTWVudVxuICogQGF1Z21lbnRzIERPTVdpZGdldFxuICovIFxubGV0IE1lbnUgPSBPYmplY3QuY3JlYXRlKCBET01XaWRnZXQgKSBcblxuT2JqZWN0LmFzc2lnbiggTWVudSwge1xuICAvKiogQGxlbmRzIE1lbnUucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBNZW51IGluc3RhbmNlcy5cbiAgICogRGVmYXVsdHMgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdXNlci1kZWZpbmVkIHByb3BlcnRpZXMgcGFzc2VkIHRvXG4gICAqIGNvbnN0cnV0b3IuXG4gICAqIEBtZW1iZXJvZiBNZW51XG4gICAqIEBzdGF0aWNcbiAgICovIFxuICBkZWZhdWx0czoge1xuICAgIF9fdmFsdWU6MCxcbiAgICB2YWx1ZTowLFxuICAgIGJhY2tncm91bmQ6JyMzMzMnLFxuICAgIGZpbGw6JyM3NzcnLFxuICAgIHN0cm9rZTonI2FhYScsXG4gICAgYm9yZGVyV2lkdGg6NCxcblxuICAvKipcbiAgICogVGhlIG9wdGlvbnMgYXJyYXkgc3RvcmVzIHRoZSBkaWZmZXJlbnQgcG9zc2libGUgdmFsdWVzIGZvciB0aGUgTWVudVxuICAgKiB3aWRnZXQuIFRoZXJlIGFyZSB1c2VkIHRvIGNyZWF0ZSBIVE1MIG9wdGlvbiBlbGVtZW50cyB3aGljaCBhcmUgdGhlblxuICAgKiBhdHRhY2hlZCB0byB0aGUgcHJpbWFyeSBzZWxlY3QgZWxlbWVudCB1c2VkIGJ5IHRoZSBNZW51LlxuICAgKiBAbWVtYmVyb2YgTWVudVxuICAgKiBAaW5zdGFuY2VcbiAgICogQHR5cGUge0FycmF5fVxuICAgKi8gXG4gICAgb3B0aW9uczpbXSxcbiAgICBvbnZhbHVlY2hhbmdlOm51bGxcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IE1lbnUgaW5zdGFuY2UuXG4gICAqIEBtZW1iZXJvZiBNZW51XG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBhIE1lbnUgd2l0aC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgbWVudSA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIERPTVdpZGdldC5jcmVhdGUuY2FsbCggbWVudSApXG5cbiAgICBPYmplY3QuYXNzaWduKCBtZW51LCBNZW51LmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBtZW51LmNyZWF0ZU9wdGlvbnMoKVxuXG4gICAgbWVudS5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCAoIGUgKT0+IHtcbiAgICAgIG1lbnUuX192YWx1ZSA9IGUudGFyZ2V0LnZhbHVlXG4gICAgICBtZW51Lm91dHB1dCgpXG5cbiAgICAgIGlmKCBtZW51Lm9udmFsdWVjaGFuZ2UgIT09IG51bGwgKSB7XG4gICAgICAgIG1lbnUub252YWx1ZWNoYW5nZSggbWVudS52YWx1ZSAgKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gbWVudVxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgcHJpbWFyeSBET00gZWxlbWVudCAoc2VsZWN0KSB0byBiZSBwbGFjZWQgaW4gYSBQYW5lbC5cbiAgICogQG1lbWJlcm9mIE1lbnUgXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgY3JlYXRlRWxlbWVudCgpIHtcbiAgICBsZXQgc2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3NlbGVjdCcgKVxuXG4gICAgcmV0dXJuIHNlbGVjdFxuICB9LFxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBvcHRpb24gZWxlbWVudHMgZm9yIG1lbnUuIFJlbW92ZXMgcHJldmlvdXNseSBhcHBlbmRlZCBlbGVtZW50cy5cbiAgICogQG1lbWJlcm9mIE1lbnUgXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgY3JlYXRlT3B0aW9ucygpIHtcbiAgICB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID0gJydcblxuICAgIGZvciggbGV0IG9wdGlvbiBvZiB0aGlzLm9wdGlvbnMgKSB7XG4gICAgICBsZXQgb3B0aW9uRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnb3B0aW9uJyApXG4gICAgICBvcHRpb25FbC5zZXRBdHRyaWJ1dGUoICd2YWx1ZScsIG9wdGlvbiApXG4gICAgICBvcHRpb25FbC5pbm5lclRleHQgPSBvcHRpb25cbiAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCggb3B0aW9uRWwgKVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogT3ZlcnJpZGRlbiB2aXJ0dWFsIG1ldGhvZCB0byBhZGQgZWxlbWVudCB0byBwYW5lbC5cbiAgICogQHByaXZhdGVcbiAgICogQG1lbWJlcm9mIE1lbnUgXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgX19hZGRUb1BhbmVsKCBwYW5lbCApIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IHBhbmVsXG5cbiAgICBpZiggdHlwZW9mIHRoaXMuYWRkRXZlbnRzID09PSAnZnVuY3Rpb24nICkgdGhpcy5hZGRFdmVudHMoKVxuXG4gICAgLy8gY2FsbGVkIGlmIHdpZGdldCB1c2VzIERPTVdpZGdldCBhcyBwcm90b3R5cGU7IC5wbGFjZSBpbmhlcml0ZWQgZnJvbSBET01XaWRnZXRcbiAgICB0aGlzLnBsYWNlKCkgXG4gIH1cblxufSlcblxuZXhwb3J0IGRlZmF1bHQgTWVudVxuIiwiaW1wb3J0IENhbnZhc1dpZGdldCBmcm9tICcuL2NhbnZhc1dpZGdldCdcblxuLyoqXG4gKiBBIE11bHRpQnV0dG9uIHdpdGggdGhyZWUgZGlmZmVyZW50IHN0eWxlczogJ21vbWVudGFyeScgdHJpZ2dlcnMgYSBmbGFzaCBhbmQgaW5zdGFuZW91cyBvdXRwdXQsIFxuICogJ2hvbGQnIG91dHB1dHMgdGhlIG11bHRpQnV0dG9ucyBtYXhpbXVtIHZhbHVlIHVudGlsIGl0IGlzIHJlbGVhc2VkLCBhbmQgJ3RvZ2dsZScgYWx0ZXJuYXRlcyBcbiAqIGJldHdlZW4gb3V0cHV0dGluZyBtYXhpbXVtIGFuZCBtaW5pbXVtIHZhbHVlcyBvbiBwcmVzcy4gXG4gKiBcbiAqIEBtb2R1bGUgTXVsdGlCdXR0b25cbiAqIEBhdWdtZW50cyBDYW52YXNXaWRnZXRcbiAqLyBcblxubGV0IE11bHRpQnV0dG9uID0gT2JqZWN0LmNyZWF0ZSggQ2FudmFzV2lkZ2V0IClcblxuT2JqZWN0LmFzc2lnbiggTXVsdGlCdXR0b24sIHtcblxuICAvKiogQGxlbmRzIE11bHRpQnV0dG9uLnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgTXVsdGlCdXR0b24gaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIE11bHRpQnV0dG9uXG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBfX3ZhbHVlOlswLDAsMCwwLF0sXG4gICAgdmFsdWU6WzAsMCwwLDBdLFxuICAgIGFjdGl2ZTogW10sXG4gICAgcm93czoyLFxuICAgIGNvbHVtbnM6MixcblxuICAgIC8qKlxuICAgICAqIFRoZSBzdHlsZSBwcm9wZXJ0eSBjYW4gYmUgJ21vbWVudGFyeScsICdob2xkJywgb3IgJ3RvZ2dsZScuIFRoaXNcbiAgICAgKiBkZXRlcm1pbmVzIHRoZSBpbnRlcmFjdGlvbiBvZiB0aGUgTXVsdGlCdXR0b24gaW5zdGFuY2UuXG4gICAgICogQG1lbWJlcm9mIE11bHRpQnV0dG9uXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBzdHlsZTogICd0b2dnbGUnXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBNdWx0aUJ1dHRvbiBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIE11bHRpQnV0dG9uXG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBhIE11bHRpQnV0dG9uIGluc3RhbmNlIHdpdGguXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSggcHJvcHMgKSB7XG4gICAgbGV0IG11bHRpQnV0dG9uID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgQ2FudmFzV2lkZ2V0LmNyZWF0ZS5jYWxsKCBtdWx0aUJ1dHRvbiApXG5cbiAgICBPYmplY3QuYXNzaWduKCBtdWx0aUJ1dHRvbiwgTXVsdGlCdXR0b24uZGVmYXVsdHMsIHByb3BzIClcblxuICAgIGlmKCBwcm9wcy52YWx1ZSApIG11bHRpQnV0dG9uLl9fdmFsdWUgPSBwcm9wcy52YWx1ZVxuXG4gICAgbXVsdGlCdXR0b24uaW5pdCgpXG5cbiAgICByZXR1cm4gbXVsdGlCdXR0b25cbiAgfSxcblxuICAvKipcbiAgICogRHJhdyB0aGUgTXVsdGlCdXR0b24gaW50byBpdHMgY2FudmFzIGNvbnRleHQgdXNpbmcgdGhlIGN1cnJlbnQgLl9fdmFsdWUgcHJvcGVydHkgYW5kIG11bHRpQnV0dG9uIHN0eWxlLlxuICAgKiBAbWVtYmVyb2YgTXVsdGlCdXR0b25cbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBkcmF3KCkge1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSAgID0gdGhpcy5fX3ZhbHVlID09PSAxID8gdGhpcy5maWxsIDogdGhpcy5iYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVxuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoXG5cbiAgICBsZXQgYnV0dG9uV2lkdGggID0gdGhpcy5yZWN0LndpZHRoICAvIHRoaXMuY29sdW1ucywgIFxuICAgICAgICBidXR0b25IZWlnaHQgPSB0aGlzLnJlY3QuaGVpZ2h0IC8gdGhpcy5yb3dzXG5cbiAgICBmb3IoIGxldCByb3cgPSAwOyByb3cgPCB0aGlzLnJvd3M7IHJvdysrICkge1xuICAgICAgbGV0IHkgPSByb3cgKiBidXR0b25IZWlnaHRcbiAgICAgIGZvciggbGV0IGNvbHVtbiA9IDA7IGNvbHVtbiA8IHRoaXMuY29sdW1uczsgY29sdW1uKysgKSB7XG4gICAgICAgIGxldCB4ID0gY29sdW1uICogYnV0dG9uV2lkdGgsXG4gICAgICAgICAgICBidXR0b25OdW0gPSByb3cgKiB0aGlzLmNvbHVtbnMgKyBjb2x1bW5cblxuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLl9fdmFsdWVbIGJ1dHRvbk51bSBdID09PSAxID8gdGhpcy5maWxsIDogdGhpcy5iYWNrZ3JvdW5kXG4gICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KCB4LHksIGJ1dHRvbldpZHRoLCBidXR0b25IZWlnaHQgKVxuICAgICAgICB0aGlzLmN0eC5zdHJva2VSZWN0KCB4LHksIGJ1dHRvbldpZHRoLCBidXR0b25IZWlnaHQgKVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBhZGRFdmVudHMoKSB7XG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZXZlbnRzICkge1xuICAgICAgdGhpc1sga2V5IF0gPSB0aGlzLmV2ZW50c1sga2V5IF0uYmluZCggdGhpcyApIFxuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcmRvd24nLCAgdGhpcy5wb2ludGVyZG93biApXG4gIH0sXG5cbiAgZ2V0QnV0dG9uTnVtRnJvbUV2ZW50KCBlICkge1xuICAgIGxldCByb3dTaXplID0gMS90aGlzLnJvd3MsXG4gICAgICAgIHJvdyA9ICBNYXRoLmZsb29yKCAoIGUuY2xpZW50WSAvIHRoaXMucmVjdC5oZWlnaHQgKSAvIHJvd1NpemUgKSxcbiAgICAgICAgY29sdW1uU2l6ZSA9IDEvdGhpcy5jb2x1bW5zLFxuICAgICAgICBjb2x1bW4gPSAgTWF0aC5mbG9vciggKCBlLmNsaWVudFggLyB0aGlzLnJlY3Qud2lkdGggKSAvIGNvbHVtblNpemUgKSxcbiAgICAgICAgYnV0dG9uTnVtID0gcm93ICogdGhpcy5jb2x1bW5zICsgY29sdW1uXG5cbiAgICAgcmV0dXJuIGJ1dHRvbk51bVxuICB9LFxuXG4gIGV2ZW50czoge1xuICAgIHBvaW50ZXJkb3duKCBlICkge1xuICAgICAgLy8gb25seSBob2xkIG5lZWRzIHRvIGxpc3RlbiBmb3IgcG9pbnRlcnVwIGV2ZW50czsgdG9nZ2xlIGFuZCBtb21lbnRhcnkgb25seSBjYXJlIGFib3V0IHBvaW50ZXJkb3duXG4gICAgICBsZXQgYnV0dG9uTnVtID0gdGhpcy5nZXRCdXR0b25OdW1Gcm9tRXZlbnQoIGUgKVxuXG4gICAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvbGQnICkge1xuICAgICAgICB0aGlzLmFjdGl2ZS5wdXNoKHsgaWQ6ZS5wb2ludGVySWQsIGJ1dHRvbk51bSB9KVxuICAgICAgICB0aGlzLnBvaW50ZXJJZCA9IGUucG9pbnRlcklkXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgdGhpcy5wb2ludGVydXAgKSBcbiAgICAgIH1cblxuICAgICAgaWYoIHRoaXMuc3R5bGUgPT09ICd0b2dnbGUnICkge1xuICAgICAgICB0aGlzLl9fdmFsdWVbIGJ1dHRvbk51bSBdID0gdGhpcy5fX3ZhbHVlWyBidXR0b25OdW0gXSA9PT0gMSA/IDAgOiAxXG4gICAgICB9ZWxzZSBpZiggdGhpcy5zdHlsZSA9PT0gJ21vbWVudGFyeScgKSB7XG4gICAgICAgIHRoaXMuX192YWx1ZVsgYnV0dG9uTnVtIF0gPSAxXG4gICAgICAgIHNldFRpbWVvdXQoICgpPT4geyB0aGlzLl9fdmFsdWVbIGJ1dHRvbk51bSBdID0gMDsgdGhpcy5kcmF3KCkgfSwgNTAgKVxuICAgICAgfWVsc2UgaWYoIHRoaXMuc3R5bGUgPT09ICdob2xkJyApIHtcbiAgICAgICAgdGhpcy5fX3ZhbHVlWyBidXR0b25OdW0gXSA9IDFcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdGhpcy5vdXRwdXQoKVxuXG4gICAgICB0aGlzLmRyYXcoKVxuICAgIH0sXG5cbiAgICBwb2ludGVybW92ZSggZSApIHtcbiAgICAgIGxldCBidXR0b25OdW0gPSB0aGlzLmdldEJ1dHRvbk51bUZyb21FdmVudCggZSApXG5cbiAgICB9LFxuXG4gICAgcG9pbnRlcnVwKCBlICkge1xuICAgICAgaWYoIHRoaXMuYWN0aXZlLmxlbmd0aCAmJiB0aGlzLnN0eWxlID09PSAnaG9sZCcgKSB7XG4gICAgICAgIGxldCBpZHggPSB0aGlzLmFjdGl2ZS5maW5kSW5kZXgoIHYgPT4gdi5pZCA9PT0gZS5wb2ludGVySWQgKVxuXG4gICAgICAgIHRoaXMuX192YWx1ZVsgdGhpcy5hY3RpdmVbIGlkeCBdLmJ1dHRvbk51bSBdID0gMFxuICAgICAgICB0aGlzLmFjdGl2ZS5zcGxpY2UoIGlkeCwgMSApXG4gICAgICAgIFxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKVxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgdGhpcy5wb2ludGVybW92ZSApXG5cbiAgICAgICAgdGhpcy5vdXRwdXQoKVxuXG4gICAgICAgIHRoaXMuZHJhdygpXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCBNdWx0aUJ1dHRvblxuIiwiaW1wb3J0IENhbnZhc1dpZGdldCBmcm9tICcuL2NhbnZhc1dpZGdldC5qcydcblxuLyoqXG4gKiBBIGhvcml6b250YWwgb3IgdmVydGljYWwgZmFkZXIuIFxuICogQG1vZHVsZSBNdWx0aVNsaWRlclxuICogQGF1Z21lbnRzIENhbnZhc1dpZGdldFxuICovIFxuXG5sZXQgTXVsdGlTbGlkZXIgPSBPYmplY3QuY3JlYXRlKCBDYW52YXNXaWRnZXQgKSBcblxuT2JqZWN0LmFzc2lnbiggTXVsdGlTbGlkZXIsIHtcbiAgLyoqIEBsZW5kcyBNdWx0aVNsaWRlci5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIE11bHRpU2xpZGVyIGluc3RhbmNlcy5cbiAgICogRGVmYXVsdHMgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdXNlci1kZWZpbmVkIHByb3BlcnRpZXMgcGFzc2VkIHRvXG4gICAqIGNvbnN0cnV0b3IuXG4gICAqIEBtZW1iZXJvZiBNdWx0aVNsaWRlclxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgX192YWx1ZTpbLjE1LC4zNSwuNSwuNzVdLCAvLyBhbHdheXMgMC0xLCBub3QgZm9yIGVuZC11c2Vyc1xuICAgIHZhbHVlOlsuNSwuNSwuNSwuNV0sICAgLy8gZW5kLXVzZXIgdmFsdWUgdGhhdCBtYXkgYmUgZmlsdGVyZWRcbiAgICBhY3RpdmU6IGZhbHNlLFxuICAgIC8qKlxuICAgICAqIFRoZSBjb3VudCBwcm9wZXJ0eSBkZXRlcm1pbmVzIHRoZSBudW1iZXIgb2Ygc2xpZGVycyBpbiB0aGUgbXVsdGlzbGlkZXIsIGRlZmF1bHQgNC5cbiAgICAgKiBAbWVtYmVyb2YgTXVsdGlTbGlkZXJcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7SW50ZWdlcn1cbiAgICAgKi9cbiAgICBjb3VudDo0LFxuICAgIGxpbmVXaWR0aDoxLFxuICAgIC8qKlxuICAgICAqIFRoZSBzdHlsZSBwcm9wZXJ0eSBjYW4gYmUgZWl0aGVyICdob3Jpem9udGFsJyAodGhlIGRlZmF1bHQpIG9yICd2ZXJ0aWNhbCcuIFRoaXNcbiAgICAgKiBkZXRlcm1pbmVzIHRoZSBvcmllbnRhdGlvbiBvZiB0aGUgTXVsdGlTbGlkZXIgaW5zdGFuY2UuXG4gICAgICogQG1lbWJlcm9mIE11bHRpU2xpZGVyXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBzdHlsZTondmVydGljYWwnXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBNdWx0aVNsaWRlciBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIE11bHRpU2xpZGVyXG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBNdWx0aVNsaWRlciB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBtdWx0aVNsaWRlciA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIC8vIGFwcGx5IFdpZGdldCBkZWZhdWx0cywgdGhlbiBvdmVyd3JpdGUgKGlmIGFwcGxpY2FibGUpIHdpdGggTXVsdGlTbGlkZXIgZGVmYXVsdHNcbiAgICBDYW52YXNXaWRnZXQuY3JlYXRlLmNhbGwoIG11bHRpU2xpZGVyIClcblxuICAgIC8vIC4uLmFuZCB0aGVuIGZpbmFsbHkgb3ZlcnJpZGUgd2l0aCB1c2VyIGRlZmF1bHRzXG4gICAgT2JqZWN0LmFzc2lnbiggbXVsdGlTbGlkZXIsIE11bHRpU2xpZGVyLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICAvLyBzZXQgdW5kZXJseWluZyB2YWx1ZSBpZiBuZWNlc3NhcnkuLi4gVE9ETzogaG93IHNob3VsZCB0aGlzIGJlIHNldCBnaXZlbiBtaW4vbWF4P1xuICAgIGlmKCBwcm9wcy52YWx1ZSApIG11bHRpU2xpZGVyLl9fdmFsdWUgPSBwcm9wcy52YWx1ZVxuICAgIFxuICAgIC8vIGluaGVyaXRzIGZyb20gV2lkZ2V0XG4gICAgbXVsdGlTbGlkZXIuaW5pdCgpXG4gICAgXG4gICAgaWYoIHByb3BzLnZhbHVlID09PSB1bmRlZmluZWQgJiYgbXVsdGlTbGlkZXIuY291bnQgIT09IDQgKSB7XG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IG11bHRpU2xpZGVyLmNvdW50OyBpKysgKSB7XG4gICAgICAgIG11bHRpU2xpZGVyLl9fdmFsdWVbIGkgXSA9IGkgLyBtdWx0aVNsaWRlci5jb3VudFxuICAgICAgfVxuICAgIH1lbHNlIGlmKCB0eXBlb2YgcHJvcHMudmFsdWUgPT09ICdudW1iZXInICkge1xuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBtdWx0aVNsaWRlci5jb3VudDsgaSsrICkgbXVsdGlTbGlkZXIuX192YWx1ZVsgaSBdID0gcHJvcHMudmFsdWVcbiAgICB9XG5cbiAgICByZXR1cm4gbXVsdGlTbGlkZXJcbiAgfSxcbiAgXG5cbiAgLyoqXG4gICAqIERyYXcgdGhlIE11bHRpU2xpZGVyIG9udG8gaXRzIGNhbnZhcyBjb250ZXh0IHVzaW5nIHRoZSBjdXJyZW50IC5fX3ZhbHVlIHByb3BlcnR5LlxuICAgKiBAbWVtYmVyb2YgTXVsdGlTbGlkZXJcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBkcmF3KCkge1xuICAgIC8vIGRyYXcgYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSAgID0gdGhpcy5iYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVxuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsMCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcblxuICAgIC8vIGRyYXcgZmlsbCAobXVsdGlTbGlkZXIgdmFsdWUgcmVwcmVzZW50YXRpb24pXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5maWxsXG5cbiAgICBsZXQgc2xpZGVyV2lkdGggPSB0aGlzLnN0eWxlID09PSAndmVydGljYWwnID8gdGhpcy5yZWN0LndpZHRoIC8gdGhpcy5jb3VudCA6IHRoaXMucmVjdC5oZWlnaHQgLyB0aGlzLmNvdW50XG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMuY291bnQ7IGkrKyApIHtcbiAgICAgIFxuICAgICAgaWYoIHRoaXMuc3R5bGUgPT09ICdob3Jpem9udGFsJyApIHtcbiAgICAgICAgbGV0IHlwb3MgPSBNYXRoLmZsb29yKCBpICogc2xpZGVyV2lkdGggKVxuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwgeXBvcywgdGhpcy5yZWN0LndpZHRoICogdGhpcy5fX3ZhbHVlWyBpIF0sIE1hdGguY2VpbCggc2xpZGVyV2lkdGggKSApXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QoIDAseXBvcywgdGhpcy5yZWN0LndpZHRoLCBzbGlkZXJXaWR0aCApXG4gICAgICB9ZWxzZXtcbiAgICAgICAgbGV0IHhwb3MgPSBNYXRoLmZsb29yKCBpICogc2xpZGVyV2lkdGggKVxuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCggeHBvcywgdGhpcy5yZWN0LmhlaWdodCAtIHRoaXMuX192YWx1ZVsgaSBdICogdGhpcy5yZWN0LmhlaWdodCwgTWF0aC5jZWlsKHNsaWRlcldpZHRoKSwgdGhpcy5yZWN0LmhlaWdodCAqIHRoaXMuX192YWx1ZVsgaSBdIClcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlUmVjdCggeHBvcywgMCwgc2xpZGVyV2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuICAgICAgfVxuICAgIH1cblxuICAgXG4gIH0sXG5cbiAgYWRkRXZlbnRzKCkge1xuICAgIC8vIGNyZWF0ZSBldmVudCBoYW5kbGVycyBib3VuZCB0byB0aGUgY3VycmVudCBvYmplY3QsIG90aGVyd2lzZSBcbiAgICAvLyB0aGUgJ3RoaXMnIGtleXdvcmQgd2lsbCByZWZlciB0byB0aGUgd2luZG93IG9iamVjdCBpbiB0aGUgZXZlbnQgaGFuZGxlcnNcbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5ldmVudHMgKSB7XG4gICAgICB0aGlzWyBrZXkgXSA9IHRoaXMuZXZlbnRzWyBrZXkgXS5iaW5kKCB0aGlzICkgXG4gICAgfVxuXG4gICAgLy8gb25seSBsaXN0ZW4gZm9yIG1vdXNlZG93biBpbnRpYWxseTsgbW91c2Vtb3ZlIGFuZCBtb3VzZXVwIGFyZSByZWdpc3RlcmVkIG9uIG1vdXNlZG93blxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcmRvd24nLCAgdGhpcy5wb2ludGVyZG93biApXG4gIH0sXG5cbiAgZXZlbnRzOiB7XG4gICAgcG9pbnRlcmRvd24oIGUgKSB7XG4gICAgICB0aGlzLmFjdGl2ZSA9IHRydWVcbiAgICAgIHRoaXMucG9pbnRlcklkID0gZS5wb2ludGVySWRcblxuICAgICAgdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlICkgLy8gY2hhbmdlIG11bHRpU2xpZGVyIHZhbHVlIG9uIGNsaWNrIC8gdG91Y2hkb3duXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgLy8gb25seSBsaXN0ZW4gZm9yIHVwIGFuZCBtb3ZlIGV2ZW50cyBhZnRlciBwb2ludGVyZG93biBcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgIH0sXG5cbiAgICBwb2ludGVydXAoIGUgKSB7XG4gICAgICBpZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICkge1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBwb2ludGVybW92ZSggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApXG4gICAgICB9XG4gICAgfSxcbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSB2YWx1ZSBiZXR3ZWVuIDAtMSBnaXZlbiB0aGUgY3VycmVudCBwb2ludGVyIHBvc2l0aW9uIGluIHJlbGF0aW9uXG4gICAqIHRvIHRoZSBNdWx0aVNsaWRlcidzIHBvc2l0aW9uLCBhbmQgdHJpZ2dlcnMgb3V0cHV0LlxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIE11bHRpU2xpZGVyXG4gICAqIEBwYXJhbSB7UG9pbnRlckV2ZW50fSBlIC0gVGhlIHBvaW50ZXIgZXZlbnQgdG8gYmUgcHJvY2Vzc2VkLlxuICAgKi9cbiAgcHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIHtcbiAgICBsZXQgcHJldlZhbHVlID0gdGhpcy52YWx1ZSxcbiAgICAgICAgc2xpZGVyTnVtXG5cbiAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvcml6b250YWwnICkge1xuICAgICAgc2xpZGVyTnVtID0gTWF0aC5mbG9vciggKCBlLmNsaWVudFkgLyB0aGlzLnJlY3QuaGVpZ2h0ICkgLyAoIDEvdGhpcy5jb3VudCApIClcbiAgICAgIHRoaXMuX192YWx1ZVsgc2xpZGVyTnVtIF0gPSAoIGUuY2xpZW50WCAtIHRoaXMucmVjdC5sZWZ0ICkgLyB0aGlzLnJlY3Qud2lkdGhcbiAgICB9ZWxzZXtcbiAgICAgIHNsaWRlck51bSA9IE1hdGguZmxvb3IoICggZS5jbGllbnRYIC8gdGhpcy5yZWN0LndpZHRoICkgLyAoIDEvdGhpcy5jb3VudCApIClcbiAgICAgIHRoaXMuX192YWx1ZVsgc2xpZGVyTnVtIF0gPSAxIC0gKCBlLmNsaWVudFkgLSB0aGlzLnJlY3QudG9wICApIC8gdGhpcy5yZWN0LmhlaWdodCBcbiAgICB9XG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMuY291bnQ7IGkrKyAgKSB7XG4gICAgICBpZiggdGhpcy5fX3ZhbHVlWyBpIF0gPiAxICkgdGhpcy5fX3ZhbHVlWyBpIF0gPSAxXG4gICAgICBpZiggdGhpcy5fX3ZhbHVlWyBpIF0gPCAwICkgdGhpcy5fX3ZhbHVlWyBpIF0gPSAwXG4gICAgfVxuXG4gICAgbGV0IHNob3VsZERyYXcgPSB0aGlzLm91dHB1dCgpXG4gICAgXG4gICAgaWYoIHNob3VsZERyYXcgKSB0aGlzLmRyYXcoKVxuICB9LFxuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IE11bHRpU2xpZGVyXG4iLCJsZXQgUGFuZWwgPSB7XG4gIGRlZmF1bHRzOiB7XG4gICAgZnVsbHNjcmVlbjpmYWxzZSxcbiAgICBiYWNrZ3JvdW5kOicjMzMzJ1xuICB9LFxuICBcbiAgLy8gY2xhc3MgdmFyaWFibGUgZm9yIHJlZmVyZW5jZSB0byBhbGwgcGFuZWxzXG4gIHBhbmVsczpbXSxcblxuICBjcmVhdGUoIHByb3BzID0gbnVsbCApIHtcbiAgICBsZXQgcGFuZWwgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICAvLyBkZWZhdWx0OiBmdWxsIHdpbmRvdyBpbnRlcmZhY2VcbiAgICBpZiggcHJvcHMgPT09IG51bGwgKSB7XG4gICAgICAgIFxuICAgICAgT2JqZWN0LmFzc2lnbiggcGFuZWwsIFBhbmVsLmRlZmF1bHRzLCB7XG4gICAgICAgIHg6MCxcbiAgICAgICAgeTowLFxuICAgICAgICB3aWR0aDoxLFxuICAgICAgICBoZWlnaHQ6MSxcbiAgICAgICAgX194OiAwLFxuICAgICAgICBfX3k6IDAsXG4gICAgICAgIF9fd2lkdGg6IG51bGwsXG4gICAgICAgIF9faGVpZ2h0Om51bGwsXG4gICAgICAgIGZ1bGxzY3JlZW46IHRydWUsXG4gICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgfSlcbiAgICAgIFxuICAgICAgcGFuZWwuZGl2ID0gcGFuZWwuX19jcmVhdGVIVE1MRWxlbWVudCgpXG4gICAgICBwYW5lbC5sYXlvdXQoKVxuXG4gICAgICBsZXQgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICdib2R5JyApXG4gICAgICBib2R5LmFwcGVuZENoaWxkKCBwYW5lbC5kaXYgKVxuICAgIH1cbiAgICBcbiAgICBQYW5lbC5wYW5lbHMucHVzaCggcGFuZWwgKVxuXG4gICAgcmV0dXJuIHBhbmVsXG4gIH0sXG4gIFxuICBfX2NyZWF0ZUhUTUxFbGVtZW50KCkge1xuICAgIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApXG4gICAgZGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICAgIGRpdi5zdHlsZS5kaXNwbGF5ICA9ICdibG9jaydcbiAgICBkaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gdGhpcy5iYWNrZ3JvdW5kXG4gICAgXG4gICAgcmV0dXJuIGRpdlxuICB9LFxuXG4gIGxheW91dCgpIHtcbiAgICBpZiggdGhpcy5mdWxsc2NyZWVuICkge1xuICAgICAgdGhpcy5fX3dpZHRoICA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgICB0aGlzLl9faGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICB0aGlzLl9feCAgICAgID0gdGhpcy54ICogdGhpcy5fX3dpZHRoXG4gICAgICB0aGlzLl9feSAgICAgID0gdGhpcy55ICogdGhpcy5fX2hlaWdodFxuXG4gICAgICB0aGlzLmRpdi5zdHlsZS53aWR0aCAgPSB0aGlzLl9fd2lkdGggKyAncHgnXG4gICAgICB0aGlzLmRpdi5zdHlsZS5oZWlnaHQgPSB0aGlzLl9faGVpZ2h0ICsgJ3B4J1xuICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCAgID0gdGhpcy5fX3ggKyAncHgnXG4gICAgICB0aGlzLmRpdi5zdHlsZS50b3AgICAgPSB0aGlzLl9feSArICdweCdcbiAgICB9XG4gIH0sXG5cbiAgZ2V0V2lkdGgoKSAgeyByZXR1cm4gdGhpcy5fX3dpZHRoICB9LFxuICBnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLl9faGVpZ2h0IH0sXG5cbiAgYWRkKCAuLi53aWRnZXRzICkge1xuICAgIGZvciggbGV0IHdpZGdldCBvZiB3aWRnZXRzICkge1xuXG4gICAgICAvLyBjaGVjayB0byBtYWtlIHN1cmUgd2lkZ2V0IGhhcyBub3QgYmVlbiBhbHJlYWR5IGFkZGVkXG4gICAgICBpZiggdGhpcy5jaGlsZHJlbi5pbmRleE9mKCB3aWRnZXQgKSA9PT0gLTEgKSB7XG4gICAgICAgIGlmKCB0eXBlb2Ygd2lkZ2V0Ll9fYWRkVG9QYW5lbCA9PT0gJ2Z1bmN0aW9uJyApIHtcbiAgICAgICAgICB0aGlzLmRpdi5hcHBlbmRDaGlsZCggd2lkZ2V0LmVsZW1lbnQgKVxuICAgICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaCggd2lkZ2V0IClcblxuICAgICAgICAgIHdpZGdldC5fX2FkZFRvUGFuZWwoIHRoaXMgKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0aHJvdyBFcnJvciggJ1dpZGdldCBjYW5ub3QgYmUgYWRkZWQgdG8gcGFuZWw7IGl0IGRvZXMgbm90IGNvbnRhaW4gdGhlIG1ldGhvZCAuX19hZGRUb1BhbmVsJyApXG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICB0aHJvdyBFcnJvciggJ1dpZGdldCBpcyBhbHJlYWR5IGFkZGVkIHRvIHBhbmVsLicgKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBQYW5lbCBcbiIsImltcG9ydCBDYW52YXNXaWRnZXQgZnJvbSAnLi9jYW52YXNXaWRnZXQuanMnXG5cbi8qKlxuICogQSBob3Jpem9udGFsIG9yIHZlcnRpY2FsIGZhZGVyLiBcbiAqIEBtb2R1bGUgU2xpZGVyXG4gKiBAYXVnbWVudHMgQ2FudmFzV2lkZ2V0XG4gKi8gXG5cbmxldCBTbGlkZXIgPSBPYmplY3QuY3JlYXRlKCBDYW52YXNXaWRnZXQgKSBcblxuT2JqZWN0LmFzc2lnbiggU2xpZGVyLCB7XG4gIC8qKiBAbGVuZHMgU2xpZGVyLnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgU2xpZGVyIGluc3RhbmNlcy5cbiAgICogRGVmYXVsdHMgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdXNlci1kZWZpbmVkIHByb3BlcnRpZXMgcGFzc2VkIHRvXG4gICAqIGNvbnN0cnV0b3IuXG4gICAqIEBtZW1iZXJvZiBTbGlkZXJcbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIF9fdmFsdWU6LjUsIC8vIGFsd2F5cyAwLTEsIG5vdCBmb3IgZW5kLXVzZXJzXG4gICAgdmFsdWU6LjUsICAgLy8gZW5kLXVzZXIgdmFsdWUgdGhhdCBtYXkgYmUgZmlsdGVyZWRcbiAgICBhY3RpdmU6IGZhbHNlLFxuICAgIC8qKlxuICAgICAqIFRoZSBzdHlsZSBwcm9wZXJ0eSBjYW4gYmUgZWl0aGVyICdob3Jpem9udGFsJyAodGhlIGRlZmF1bHQpIG9yICd2ZXJ0aWNhbCcuIFRoaXNcbiAgICAgKiBkZXRlcm1pbmVzIHRoZSBvcmllbnRhdGlvbiBvZiB0aGUgU2xpZGVyIGluc3RhbmNlLlxuICAgICAqIEBtZW1iZXJvZiBTbGlkZXJcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqL1xuICAgIHN0eWxlOiAgJ2hvcml6b250YWwnXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBTbGlkZXIgaW5zdGFuY2UuXG4gICAqIEBtZW1iZXJvZiBTbGlkZXJcbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wc10gLSBBIGRpY3Rpb25hcnkgb2YgcHJvcGVydGllcyB0byBpbml0aWFsaXplIFNsaWRlciB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBzbGlkZXIgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICAvLyBhcHBseSBXaWRnZXQgZGVmYXVsdHMsIHRoZW4gb3ZlcndyaXRlIChpZiBhcHBsaWNhYmxlKSB3aXRoIFNsaWRlciBkZWZhdWx0c1xuICAgIENhbnZhc1dpZGdldC5jcmVhdGUuY2FsbCggc2xpZGVyIClcblxuICAgIC8vIC4uLmFuZCB0aGVuIGZpbmFsbHkgb3ZlcnJpZGUgd2l0aCB1c2VyIGRlZmF1bHRzXG4gICAgT2JqZWN0LmFzc2lnbiggc2xpZGVyLCBTbGlkZXIuZGVmYXVsdHMsIHByb3BzIClcblxuICAgIC8vIHNldCB1bmRlcmx5aW5nIHZhbHVlIGlmIG5lY2Vzc2FyeS4uLiBUT0RPOiBob3cgc2hvdWxkIHRoaXMgYmUgc2V0IGdpdmVuIG1pbi9tYXg/XG4gICAgaWYoIHByb3BzLnZhbHVlICkgc2xpZGVyLl9fdmFsdWUgPSBwcm9wcy52YWx1ZVxuICAgIFxuICAgIC8vIGluaGVyaXRzIGZyb20gV2lkZ2V0XG4gICAgc2xpZGVyLmluaXQoKVxuXG4gICAgcmV0dXJuIHNsaWRlclxuICB9LFxuXG4gIC8qKlxuICAgKiBEcmF3IHRoZSBTbGlkZXIgb250byBpdHMgY2FudmFzIGNvbnRleHQgdXNpbmcgdGhlIGN1cnJlbnQgLl9fdmFsdWUgcHJvcGVydHkuXG4gICAqIEBtZW1iZXJvZiBTbGlkZXJcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBkcmF3KCkge1xuICAgIC8vIGRyYXcgYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSAgID0gdGhpcy5iYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVxuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsMCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcblxuICAgIC8vIGRyYXcgZmlsbCAoc2xpZGVyIHZhbHVlIHJlcHJlc2VudGF0aW9uKVxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuZmlsbFxuXG4gICAgaWYoIHRoaXMuc3R5bGUgPT09ICdob3Jpem9udGFsJyApXG4gICAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwgMCwgdGhpcy5yZWN0LndpZHRoICogdGhpcy5fX3ZhbHVlLCB0aGlzLnJlY3QuaGVpZ2h0IClcbiAgICBlbHNlXG4gICAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwgdGhpcy5yZWN0LmhlaWdodCAtIHRoaXMuX192YWx1ZSAqIHRoaXMucmVjdC5oZWlnaHQsIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCAqIHRoaXMuX192YWx1ZSApXG5cbiAgICB0aGlzLmN0eC5zdHJva2VSZWN0KCAwLDAsIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCApXG4gIH0sXG5cbiAgYWRkRXZlbnRzKCkge1xuICAgIC8vIGNyZWF0ZSBldmVudCBoYW5kbGVycyBib3VuZCB0byB0aGUgY3VycmVudCBvYmplY3QsIG90aGVyd2lzZSBcbiAgICAvLyB0aGUgJ3RoaXMnIGtleXdvcmQgd2lsbCByZWZlciB0byB0aGUgd2luZG93IG9iamVjdCBpbiB0aGUgZXZlbnQgaGFuZGxlcnNcbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5ldmVudHMgKSB7XG4gICAgICB0aGlzWyBrZXkgXSA9IHRoaXMuZXZlbnRzWyBrZXkgXS5iaW5kKCB0aGlzICkgXG4gICAgfVxuXG4gICAgLy8gb25seSBsaXN0ZW4gZm9yIG1vdXNlZG93biBpbnRpYWxseTsgbW91c2Vtb3ZlIGFuZCBtb3VzZXVwIGFyZSByZWdpc3RlcmVkIG9uIG1vdXNlZG93blxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcmRvd24nLCAgdGhpcy5wb2ludGVyZG93biApXG4gIH0sXG5cbiAgZXZlbnRzOiB7XG4gICAgcG9pbnRlcmRvd24oIGUgKSB7XG4gICAgICB0aGlzLmFjdGl2ZSA9IHRydWVcbiAgICAgIHRoaXMucG9pbnRlcklkID0gZS5wb2ludGVySWRcblxuICAgICAgdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlICkgLy8gY2hhbmdlIHNsaWRlciB2YWx1ZSBvbiBjbGljayAvIHRvdWNoZG93blxuXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgdGhpcy5wb2ludGVybW92ZSApIC8vIG9ubHkgbGlzdGVuIGZvciB1cCBhbmQgbW92ZSBldmVudHMgYWZ0ZXIgcG9pbnRlcmRvd24gXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKSBcbiAgICB9LFxuXG4gICAgcG9pbnRlcnVwKCBlICkge1xuICAgICAgaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCApIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgdGhpcy5wb2ludGVybW92ZSApIFxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKSBcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcG9pbnRlcm1vdmUoIGUgKSB7XG4gICAgICBpZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICkge1xuICAgICAgICB0aGlzLnByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKVxuICAgICAgfVxuICAgIH0sXG4gIH0sXG4gIFxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgdmFsdWUgYmV0d2VlbiAwLTEgZ2l2ZW4gdGhlIGN1cnJlbnQgcG9pbnRlciBwb3NpdGlvbiBpbiByZWxhdGlvblxuICAgKiB0byB0aGUgU2xpZGVyJ3MgcG9zaXRpb24sIGFuZCB0cmlnZ2VycyBvdXRwdXQuXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAbWVtYmVyb2YgU2xpZGVyXG4gICAqIEBwYXJhbSB7UG9pbnRlckV2ZW50fSBlIC0gVGhlIHBvaW50ZXIgZXZlbnQgdG8gYmUgcHJvY2Vzc2VkLlxuICAgKi9cbiAgcHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIHtcbiAgICBsZXQgcHJldlZhbHVlID0gdGhpcy52YWx1ZVxuXG4gICAgaWYoIHRoaXMuc3R5bGUgPT09ICdob3Jpem9udGFsJyApIHtcbiAgICAgIHRoaXMuX192YWx1ZSA9ICggZS5jbGllbnRYIC0gdGhpcy5yZWN0LmxlZnQgKSAvIHRoaXMucmVjdC53aWR0aFxuICAgIH1lbHNle1xuICAgICAgdGhpcy5fX3ZhbHVlID0gMSAtICggZS5jbGllbnRZIC0gdGhpcy5yZWN0LnRvcCAgKSAvIHRoaXMucmVjdC5oZWlnaHQgXG4gICAgfVxuXG4gICAgLy8gY2xhbXAgX192YWx1ZSwgd2hpY2ggaXMgb25seSB1c2VkIGludGVybmFsbHlcbiAgICBpZiggdGhpcy5fX3ZhbHVlID4gMSApIHRoaXMuX192YWx1ZSA9IDFcbiAgICBpZiggdGhpcy5fX3ZhbHVlIDwgMCApIHRoaXMuX192YWx1ZSA9IDBcblxuICAgIGxldCBzaG91bGREcmF3ID0gdGhpcy5vdXRwdXQoKVxuICAgIFxuICAgIGlmKCBzaG91bGREcmF3ICkgdGhpcy5kcmF3KClcbiAgfSxcblxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBTbGlkZXJcbiIsImxldCBVdGlsaXRpZXMgPSB7XG5cbiAgZ2V0TW9kZSgpIHtcbiAgICByZXR1cm4gJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ID8gJ3RvdWNoJyA6ICdtb3VzZSdcbiAgfSxcbiAgXG4gIGNvbXBhcmVBcnJheXMoIGExLCBhMiApIHtcbiAgICByZXR1cm4gYTEubGVuZ3RoID09PSBhMi5sZW5ndGggJiYgYTEuZXZlcnkoKHYsaSk9PiB2ID09PSBhMltpXSlcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxpdGllc1xuIiwiaW1wb3J0IEZpbHRlcnMgZnJvbSAnLi9maWx0ZXJzJ1xuaW1wb3J0IENvbW11bmljYXRpb24gZnJvbSAnLi9jb21tdW5pY2F0aW9uLmpzJ1xuaW1wb3J0IFV0aWxpdGllcyBmcm9tICcuL3V0aWxpdGllcydcblxuLyoqXG4gKiBXaWRnZXQgaXMgdGhlIGJhc2UgY2xhc3MgdGhhdCBhbGwgb3RoZXIgVUkgZWxlbWVudHMgaW5oZXJpdHMgZnJvbS4gSXQgcHJpbWFyaWx5XG4gKiBpbmNsdWRlcyBtZXRob2RzIGZvciBmaWx0ZXJpbmcgLyBzY2FsaW5nIG91dHB1dC5cbiAqIEBtb2R1bGUgV2lkZ2V0XG4gKi9cblxuXG5sZXQgV2lkZ2V0ID0ge1xuICAvKiogQGxlbmRzIFdpZGdldC5wcm90b3R5cGUgKi9cbiAgXG4gIC8qKlxuICAgKiBzdG9yZSBhbGwgaW5zdGFudGlhdGVkIHdpZGdldHMuXG4gICAqIEB0eXBlIHtBcnJheS48V2lkZ2V0Pn1cbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICB3aWRnZXRzOiBbXSxcbiAgbGFzdFZhbHVlOiBudWxsLFxuICBvbnZhbHVlY2hhbmdlOiBudWxsLFxuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgd2lkZ2V0c1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgbWluOjAsIG1heDoxLFxuICAgIHNjYWxlT3V0cHV0OnRydWUsIC8vIGFwcGx5IHNjYWxlIGZpbHRlciBieSBkZWZhdWx0IGZvciBtaW4gLyBtYXggcmFuZ2VzXG4gICAgdGFyZ2V0Om51bGwsXG4gICAgX19wcmV2VmFsdWU6bnVsbFxuICB9LFxuICBcbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBXaWRnZXQgaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIFdpZGdldFxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoKSB7XG4gICAgT2JqZWN0LmFzc2lnbiggdGhpcywgV2lkZ2V0LmRlZmF1bHRzIClcbiAgICBcbiAgICAvKiogXG4gICAgICogU3RvcmVzIGZpbHRlcnMgZm9yIHRyYW5zZm9ybWluZyB3aWRnZXQgb3V0cHV0LlxuICAgICAqIEBtZW1iZXJvZiBXaWRnZXRcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmZpbHRlcnMgPSBbXVxuXG4gICAgdGhpcy5fX3ByZWZpbHRlcnMgPSBbXVxuICAgIHRoaXMuX19wb3N0ZmlsdGVycyA9IFtdXG5cbiAgICBXaWRnZXQud2lkZ2V0cy5wdXNoKCB0aGlzIClcblxuICAgIHJldHVybiB0aGlzXG4gIH0sXG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemF0aW9uIG1ldGhvZCBmb3Igd2lkZ2V0cy4gQ2hlY2tzIHRvIHNlZSBpZiB3aWRnZXQgY29udGFpbnNcbiAgICogYSAndGFyZ2V0JyBwcm9wZXJ0eTsgaWYgc28sIG1ha2VzIHN1cmUgdGhhdCBjb21tdW5pY2F0aW9uIHdpdGggdGhhdFxuICAgKiB0YXJnZXQgaXMgaW5pdGlhbGl6ZWQuXG4gICAqIEBtZW1iZXJvZiBXaWRnZXRcbiAgICogQGluc3RhbmNlXG4gICAqL1xuXG4gIGluaXQoKSB7XG4gICAgaWYoIHRoaXMudGFyZ2V0ICYmIHRoaXMudGFyZ2V0ID09PSAnb3NjJyB8fCB0aGlzLnRhcmdldCA9PT0gJ21pZGknICkge1xuICAgICAgaWYoICFDb21tdW5pY2F0aW9uLmluaXRpYWxpemVkICkgQ29tbXVuaWNhdGlvbi5pbml0KClcbiAgICB9XG5cbiAgICAvLyBpZiBtaW4vbWF4IGFyZSBub3QgMC0xIGFuZCBzY2FsaW5nIGlzIG5vdCBkaXNhYmxlZFxuICAgIGlmKCB0aGlzLnNjYWxlT3V0cHV0ICYmICh0aGlzLm1pbiAhPT0gMCB8fCB0aGlzLm1heCAhPT0gMSApKSB7ICAgICAgXG4gICAgICB0aGlzLl9fcHJlZmlsdGVycy5wdXNoKCBcbiAgICAgICAgRmlsdGVycy5TY2FsZSggMCwxLHRoaXMubWluLHRoaXMubWF4ICkgXG4gICAgICApXG4gICAgfVxuICB9LFxuXG4gIHJ1bkZpbHRlcnMoIHZhbHVlLCB3aWRnZXQgKSB7XG4gICAgZm9yKCBsZXQgZmlsdGVyIG9mIHdpZGdldC5fX3ByZWZpbHRlcnMgKSAgdmFsdWUgPSBmaWx0ZXIoIHZhbHVlIClcbiAgICBmb3IoIGxldCBmaWx0ZXIgb2Ygd2lkZ2V0LmZpbHRlcnMgKSAgICAgICB2YWx1ZSA9IGZpbHRlciggdmFsdWUgKVxuICAgIGZvciggbGV0IGZpbHRlciBvZiB3aWRnZXQuX19wb3N0ZmlsdGVycyApIHZhbHVlID0gZmlsdGVyKCB2YWx1ZSApXG4gICBcbiAgICByZXR1cm4gdmFsdWVcbiAgfSxcblxuICAvKipcbiAgICogQ2FsY3VsYXRlcyBvdXRwdXQgb2Ygd2lkZ2V0IGJ5IHJ1bm5pbmcgLl9fdmFsdWUgcHJvcGVydHkgdGhyb3VnaCBmaWx0ZXIgY2hhaW4uXG4gICAqIFRoZSByZXN1bHQgaXMgc3RvcmVkIGluIHRoZSAudmFsdWUgcHJvcGVydHkgb2YgdGhlIHdpZGdldCwgd2hpY2ggaXMgdGhlblxuICAgKiByZXR1cm5lZC5cbiAgICogQG1lbWJlcm9mIFdpZGdldFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIG91dHB1dCgpIHtcbiAgICBsZXQgdmFsdWUgPSB0aGlzLl9fdmFsdWUsIG5ld1ZhbHVlR2VuZXJhdGVkID0gZmFsc2UsIGxhc3RWYWx1ZSA9IHRoaXMudmFsdWVpLCBpc0FycmF5XG5cbiAgICBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSggdmFsdWUgKVxuXG4gICAgaWYoIGlzQXJyYXkgKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLm1hcCggdiA9PiBXaWRnZXQucnVuRmlsdGVycyggdiwgdGhpcyApIClcbiAgICB9ZWxzZXtcbiAgICAgIHZhbHVlID0gdGhpcy5ydW5GaWx0ZXJzKCB2YWx1ZSwgdGhpcyApXG4gICAgfVxuICAgIFxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICAgIFxuICAgIGlmKCB0aGlzLnRhcmdldCAhPT0gbnVsbCApIHRoaXMudHJhbnNtaXQoIHRoaXMudmFsdWUgKVxuXG4gICAgaWYoIHRoaXMuX19wcmV2VmFsdWUgIT09IG51bGwgKSB7XG4gICAgICBpZiggaXNBcnJheSApIHtcbiAgICAgICAgaWYoICFVdGlsaXRpZXMuY29tcGFyZUFycmF5cyggdGhpcy5fX3ZhbHVlLCB0aGlzLl9fcHJldlZhbHVlICkgKSB7XG4gICAgICAgICAgbmV3VmFsdWVHZW5lcmF0ZWQgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiggdGhpcy5fX3ZhbHVlICE9PSB0aGlzLl9fcHJldlZhbHVlICkge1xuICAgICAgICBuZXdWYWx1ZUdlbmVyYXRlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIG5ld1ZhbHVlR2VuZXJhdGVkID0gdHJ1ZVxuICAgIH1cblxuICAgIGlmKCBuZXdWYWx1ZUdlbmVyYXRlZCApIHsgXG4gICAgICBpZiggdGhpcy5vbnZhbHVlY2hhbmdlICE9PSBudWxsICkgdGhpcy5vbnZhbHVlY2hhbmdlKCB0aGlzLnZhbHVlLCBsYXN0VmFsdWUgKVxuXG4gICAgICBpZiggQXJyYXkuaXNBcnJheSggdGhpcy5fX3ZhbHVlICkgKSB7XG4gICAgICAgIHRoaXMuX19wcmV2VmFsdWUgPSB0aGlzLl9fdmFsdWUuc2xpY2UoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fX3ByZXZWYWx1ZSA9IHRoaXMuX192YWx1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIG5ld1ZhbHVlR2VuZXJhdGVkIGNhbiBiZSB1c2UgdG8gZGV0ZXJtaW5lIGlmIHdpZGdldCBzaG91bGQgZHJhd1xuICAgIHJldHVybiBuZXdWYWx1ZUdlbmVyYXRlZFxuICB9LFxuXG4gIC8qKlxuICAgKiBJZiB0aGUgd2lkZ2V0IGhhcyBhIHJlbW90ZSB0YXJnZXQgKG5vdCBhIHRhcmdldCBpbnNpZGUgdGhlIGludGVyZmFjZSB3ZWIgcGFnZSlcbiAgICogdGhpcyB3aWxsIHRyYW5zbWl0IHRoZSB3aWRnZXRzIHZhbHVlIHRvIHRoZSByZW1vdGUgZGVzdGluYXRpb24uXG4gICAqIEBtZW1iZXJvZiBXaWRnZXRcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICB0cmFuc21pdCgpIHtcbiAgIC8vbG9va3MgbGlrZSB0aGlzIHNob3VsZCBoYW5kbGUgYXJyYXlzLCBub3QgdGVzdGVkXG4gICAgaWYoIHRoaXMudGFyZ2V0ID09PSAnb3NjJyApIHtcbiAgICAgIENvbW11bmljYXRpb24uT1NDLnNlbmQoIHRoaXMuYWRkcmVzcywgdGhpcy52YWx1ZSApXG4gICAgfVxuICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBXaWRnZXRcbiIsImxldCBXaWRnZXRMYWJlbCA9IHtcblxuICBkZWZhdWx0czoge1xuICAgIHNpemU6MjQsXG4gICAgZmFjZTonc2Fucy1zZXJpZicsXG4gICAgZmlsbDond2hpdGUnLFxuICAgIGFsaWduOidjZW50ZXInLFxuICAgIGJhY2tncm91bmQ6bnVsbCxcbiAgICB3aWR0aDoxXG4gIH0sXG5cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgbGFiZWwgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcblxuICAgIE9iamVjdC5hc3NpZ24oIGxhYmVsLCB0aGlzLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBpZiggdHlwZW9mIGxhYmVsLmN0eCA9PT0gdW5kZWZpbmVkICkgdGhyb3cgRXJyb3IoICdXaWRnZXRMYWJlbHMgbXVzdCBiZSBjb25zdHJ1Y3RlZCB3aXRoIGEgY2FudmFzIGNvbnRleHQgKGN0eCkgYXJndW1lbnQnIClcbiAgICBcbiAgICBsYWJlbC5mb250ID0gYCR7bGFiZWwuc2l6ZX1weCAke2xhYmVsLmZhY2V9YFxuXG4gICAgcmV0dXJuIGxhYmVsXG4gIH0sXG5cbiAgZHJhdygpIHtcbiAgICBsZXQgY252cyA9IHRoaXMuY3R4LmNhbnZhcyxcbiAgICAgICAgY3dpZHRoID0gY252cy53aWR0aCxcbiAgICAgICAgY2hlaWdodD0gY252cy5oZWlnaHQsXG4gICAgICAgIHggICAgICA9IHRoaXMueCAqIGN3aWR0aCxcbiAgICAgICAgeSAgICAgID0gdGhpcy55ICogY2hlaWdodCxcbiAgICAgICAgd2lkdGggID0gdGhpcy53aWR0aCAqIGN3aWR0aFxuXG4gICAgaWYoIHRoaXMuYmFja2dyb3VuZCAhPT0gbnVsbCApIHtcbiAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuYmFja2dyb3VuZFxuICAgICAgdGhpcy5jdHguZmlsbFJlY3QoIHgseSx3aWR0aCx0aGlzLnNpemUgKyAxMCApXG4gICAgfVxuICAgIFxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuZmlsbFxuICAgIHRoaXMuY3R4LnRleHRBbGlnbiA9IHRoaXMuYWxpZ25cbiAgICB0aGlzLmN0eC5mb250ID0gdGhpcy5mb250XG4gICAgdGhpcy5jdHguZmlsbFRleHQoIHRoaXMudGV4dCwgeCx5LHdpZHRoICkgICAgXG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBXaWRnZXRMYWJlbFxuIiwiLyohXG4gKiBQRVAgdjAuNC4xIHwgaHR0cHM6Ly9naXRodWIuY29tL2pxdWVyeS9QRVBcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIHwgaHR0cDovL2pxdWVyeS5vcmcvbGljZW5zZVxuICovXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gIGdsb2JhbC5Qb2ludGVyRXZlbnRzUG9seWZpbGwgPSBmYWN0b3J5KClcbn0odGhpcywgZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgdGhlIGNvbnN0cnVjdG9yIGZvciBuZXcgUG9pbnRlckV2ZW50cy5cbiAgICpcbiAgICogTmV3IFBvaW50ZXIgRXZlbnRzIG11c3QgYmUgZ2l2ZW4gYSB0eXBlLCBhbmQgYW4gb3B0aW9uYWwgZGljdGlvbmFyeSBvZlxuICAgKiBpbml0aWFsaXphdGlvbiBwcm9wZXJ0aWVzLlxuICAgKlxuICAgKiBEdWUgdG8gY2VydGFpbiBwbGF0Zm9ybSByZXF1aXJlbWVudHMsIGV2ZW50cyByZXR1cm5lZCBmcm9tIHRoZSBjb25zdHJ1Y3RvclxuICAgKiBpZGVudGlmeSBhcyBNb3VzZUV2ZW50cy5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBpblR5cGUgVGhlIHR5cGUgb2YgdGhlIGV2ZW50IHRvIGNyZWF0ZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtpbkRpY3RdIEFuIG9wdGlvbmFsIGRpY3Rpb25hcnkgb2YgaW5pdGlhbCBldmVudCBwcm9wZXJ0aWVzLlxuICAgKiBAcmV0dXJuIHtFdmVudH0gQSBuZXcgUG9pbnRlckV2ZW50IG9mIHR5cGUgYGluVHlwZWAsIGluaXRpYWxpemVkIHdpdGggcHJvcGVydGllcyBmcm9tIGBpbkRpY3RgLlxuICAgKi9cbiAgdmFyIE1PVVNFX1BST1BTID0gW1xuICAgICdidWJibGVzJyxcbiAgICAnY2FuY2VsYWJsZScsXG4gICAgJ3ZpZXcnLFxuICAgICdkZXRhaWwnLFxuICAgICdzY3JlZW5YJyxcbiAgICAnc2NyZWVuWScsXG4gICAgJ2NsaWVudFgnLFxuICAgICdjbGllbnRZJyxcbiAgICAnY3RybEtleScsXG4gICAgJ2FsdEtleScsXG4gICAgJ3NoaWZ0S2V5JyxcbiAgICAnbWV0YUtleScsXG4gICAgJ2J1dHRvbicsXG4gICAgJ3JlbGF0ZWRUYXJnZXQnLFxuICAgICdwYWdlWCcsXG4gICAgJ3BhZ2VZJ1xuICBdO1xuXG4gIHZhciBNT1VTRV9ERUZBVUxUUyA9IFtcbiAgICBmYWxzZSxcbiAgICBmYWxzZSxcbiAgICBudWxsLFxuICAgIG51bGwsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICBmYWxzZSxcbiAgICBmYWxzZSxcbiAgICBmYWxzZSxcbiAgICBmYWxzZSxcbiAgICAwLFxuICAgIG51bGwsXG4gICAgMCxcbiAgICAwXG4gIF07XG5cbiAgZnVuY3Rpb24gUG9pbnRlckV2ZW50KGluVHlwZSwgaW5EaWN0KSB7XG4gICAgaW5EaWN0ID0gaW5EaWN0IHx8IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgIGUuaW5pdEV2ZW50KGluVHlwZSwgaW5EaWN0LmJ1YmJsZXMgfHwgZmFsc2UsIGluRGljdC5jYW5jZWxhYmxlIHx8IGZhbHNlKTtcblxuICAgIC8vIGRlZmluZSBpbmhlcml0ZWQgTW91c2VFdmVudCBwcm9wZXJ0aWVzXG4gICAgLy8gc2tpcCBidWJibGVzIGFuZCBjYW5jZWxhYmxlIHNpbmNlIHRoZXkncmUgc2V0IGFib3ZlIGluIGluaXRFdmVudCgpXG4gICAgZm9yICh2YXIgaSA9IDIsIHA7IGkgPCBNT1VTRV9QUk9QUy5sZW5ndGg7IGkrKykge1xuICAgICAgcCA9IE1PVVNFX1BST1BTW2ldO1xuICAgICAgZVtwXSA9IGluRGljdFtwXSB8fCBNT1VTRV9ERUZBVUxUU1tpXTtcbiAgICB9XG4gICAgZS5idXR0b25zID0gaW5EaWN0LmJ1dHRvbnMgfHwgMDtcblxuICAgIC8vIFNwZWMgcmVxdWlyZXMgdGhhdCBwb2ludGVycyB3aXRob3V0IHByZXNzdXJlIHNwZWNpZmllZCB1c2UgMC41IGZvciBkb3duXG4gICAgLy8gc3RhdGUgYW5kIDAgZm9yIHVwIHN0YXRlLlxuICAgIHZhciBwcmVzc3VyZSA9IDA7XG4gICAgaWYgKGluRGljdC5wcmVzc3VyZSkge1xuICAgICAgcHJlc3N1cmUgPSBpbkRpY3QucHJlc3N1cmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXNzdXJlID0gZS5idXR0b25zID8gMC41IDogMDtcbiAgICB9XG5cbiAgICAvLyBhZGQgeC95IHByb3BlcnRpZXMgYWxpYXNlZCB0byBjbGllbnRYL1lcbiAgICBlLnggPSBlLmNsaWVudFg7XG4gICAgZS55ID0gZS5jbGllbnRZO1xuXG4gICAgLy8gZGVmaW5lIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBQb2ludGVyRXZlbnQgaW50ZXJmYWNlXG4gICAgZS5wb2ludGVySWQgPSBpbkRpY3QucG9pbnRlcklkIHx8IDA7XG4gICAgZS53aWR0aCA9IGluRGljdC53aWR0aCB8fCAwO1xuICAgIGUuaGVpZ2h0ID0gaW5EaWN0LmhlaWdodCB8fCAwO1xuICAgIGUucHJlc3N1cmUgPSBwcmVzc3VyZTtcbiAgICBlLnRpbHRYID0gaW5EaWN0LnRpbHRYIHx8IDA7XG4gICAgZS50aWx0WSA9IGluRGljdC50aWx0WSB8fCAwO1xuICAgIGUucG9pbnRlclR5cGUgPSBpbkRpY3QucG9pbnRlclR5cGUgfHwgJyc7XG4gICAgZS5od1RpbWVzdGFtcCA9IGluRGljdC5od1RpbWVzdGFtcCB8fCAwO1xuICAgIGUuaXNQcmltYXJ5ID0gaW5EaWN0LmlzUHJpbWFyeSB8fCBmYWxzZTtcbiAgICByZXR1cm4gZTtcbiAgfVxuXG4gIHZhciBfUG9pbnRlckV2ZW50ID0gUG9pbnRlckV2ZW50O1xuXG4gIC8qKlxuICAgKiBUaGlzIG1vZHVsZSBpbXBsZW1lbnRzIGEgbWFwIG9mIHBvaW50ZXIgc3RhdGVzXG4gICAqL1xuICB2YXIgVVNFX01BUCA9IHdpbmRvdy5NYXAgJiYgd2luZG93Lk1hcC5wcm90b3R5cGUuZm9yRWFjaDtcbiAgdmFyIFBvaW50ZXJNYXAgPSBVU0VfTUFQID8gTWFwIDogU3BhcnNlQXJyYXlNYXA7XG5cbiAgZnVuY3Rpb24gU3BhcnNlQXJyYXlNYXAoKSB7XG4gICAgdGhpcy5hcnJheSA9IFtdO1xuICAgIHRoaXMuc2l6ZSA9IDA7XG4gIH1cblxuICBTcGFyc2VBcnJheU1hcC5wcm90b3R5cGUgPSB7XG4gICAgc2V0OiBmdW5jdGlvbihrLCB2KSB7XG4gICAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbGV0ZShrKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5oYXMoaykpIHtcbiAgICAgICAgdGhpcy5zaXplKys7XG4gICAgICB9XG4gICAgICB0aGlzLmFycmF5W2tdID0gdjtcbiAgICB9LFxuICAgIGhhczogZnVuY3Rpb24oaykge1xuICAgICAgcmV0dXJuIHRoaXMuYXJyYXlba10gIT09IHVuZGVmaW5lZDtcbiAgICB9LFxuICAgIGRlbGV0ZTogZnVuY3Rpb24oaykge1xuICAgICAgaWYgKHRoaXMuaGFzKGspKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmFycmF5W2tdO1xuICAgICAgICB0aGlzLnNpemUtLTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24oaykge1xuICAgICAgcmV0dXJuIHRoaXMuYXJyYXlba107XG4gICAgfSxcbiAgICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFycmF5Lmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLnNpemUgPSAwO1xuICAgIH0sXG5cbiAgICAvLyByZXR1cm4gdmFsdWUsIGtleSwgbWFwXG4gICAgZm9yRWFjaDogZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHJldHVybiB0aGlzLmFycmF5LmZvckVhY2goZnVuY3Rpb24odiwgaykge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHYsIGssIHRoaXMpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfcG9pbnRlcm1hcCA9IFBvaW50ZXJNYXA7XG5cbiAgdmFyIENMT05FX1BST1BTID0gW1xuXG4gICAgLy8gTW91c2VFdmVudFxuICAgICdidWJibGVzJyxcbiAgICAnY2FuY2VsYWJsZScsXG4gICAgJ3ZpZXcnLFxuICAgICdkZXRhaWwnLFxuICAgICdzY3JlZW5YJyxcbiAgICAnc2NyZWVuWScsXG4gICAgJ2NsaWVudFgnLFxuICAgICdjbGllbnRZJyxcbiAgICAnY3RybEtleScsXG4gICAgJ2FsdEtleScsXG4gICAgJ3NoaWZ0S2V5JyxcbiAgICAnbWV0YUtleScsXG4gICAgJ2J1dHRvbicsXG4gICAgJ3JlbGF0ZWRUYXJnZXQnLFxuXG4gICAgLy8gRE9NIExldmVsIDNcbiAgICAnYnV0dG9ucycsXG5cbiAgICAvLyBQb2ludGVyRXZlbnRcbiAgICAncG9pbnRlcklkJyxcbiAgICAnd2lkdGgnLFxuICAgICdoZWlnaHQnLFxuICAgICdwcmVzc3VyZScsXG4gICAgJ3RpbHRYJyxcbiAgICAndGlsdFknLFxuICAgICdwb2ludGVyVHlwZScsXG4gICAgJ2h3VGltZXN0YW1wJyxcbiAgICAnaXNQcmltYXJ5JyxcblxuICAgIC8vIGV2ZW50IGluc3RhbmNlXG4gICAgJ3R5cGUnLFxuICAgICd0YXJnZXQnLFxuICAgICdjdXJyZW50VGFyZ2V0JyxcbiAgICAnd2hpY2gnLFxuICAgICdwYWdlWCcsXG4gICAgJ3BhZ2VZJyxcbiAgICAndGltZVN0YW1wJ1xuICBdO1xuXG4gIHZhciBDTE9ORV9ERUZBVUxUUyA9IFtcblxuICAgIC8vIE1vdXNlRXZlbnRcbiAgICBmYWxzZSxcbiAgICBmYWxzZSxcbiAgICBudWxsLFxuICAgIG51bGwsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICBmYWxzZSxcbiAgICBmYWxzZSxcbiAgICBmYWxzZSxcbiAgICBmYWxzZSxcbiAgICAwLFxuICAgIG51bGwsXG5cbiAgICAvLyBET00gTGV2ZWwgM1xuICAgIDAsXG5cbiAgICAvLyBQb2ludGVyRXZlbnRcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAnJyxcbiAgICAwLFxuICAgIGZhbHNlLFxuXG4gICAgLy8gZXZlbnQgaW5zdGFuY2VcbiAgICAnJyxcbiAgICBudWxsLFxuICAgIG51bGwsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMFxuICBdO1xuXG4gIHZhciBCT1VOREFSWV9FVkVOVFMgPSB7XG4gICAgJ3BvaW50ZXJvdmVyJzogMSxcbiAgICAncG9pbnRlcm91dCc6IDEsXG4gICAgJ3BvaW50ZXJlbnRlcic6IDEsXG4gICAgJ3BvaW50ZXJsZWF2ZSc6IDFcbiAgfTtcblxuICB2YXIgSEFTX1NWR19JTlNUQU5DRSA9ICh0eXBlb2YgU1ZHRWxlbWVudEluc3RhbmNlICE9PSAndW5kZWZpbmVkJyk7XG5cbiAgLyoqXG4gICAqIFRoaXMgbW9kdWxlIGlzIGZvciBub3JtYWxpemluZyBldmVudHMuIE1vdXNlIGFuZCBUb3VjaCBldmVudHMgd2lsbCBiZVxuICAgKiBjb2xsZWN0ZWQgaGVyZSwgYW5kIGZpcmUgUG9pbnRlckV2ZW50cyB0aGF0IGhhdmUgdGhlIHNhbWUgc2VtYW50aWNzLCBub1xuICAgKiBtYXR0ZXIgdGhlIHNvdXJjZS5cbiAgICogRXZlbnRzIGZpcmVkOlxuICAgKiAgIC0gcG9pbnRlcmRvd246IGEgcG9pbnRpbmcgaXMgYWRkZWRcbiAgICogICAtIHBvaW50ZXJ1cDogYSBwb2ludGVyIGlzIHJlbW92ZWRcbiAgICogICAtIHBvaW50ZXJtb3ZlOiBhIHBvaW50ZXIgaXMgbW92ZWRcbiAgICogICAtIHBvaW50ZXJvdmVyOiBhIHBvaW50ZXIgY3Jvc3NlcyBpbnRvIGFuIGVsZW1lbnRcbiAgICogICAtIHBvaW50ZXJvdXQ6IGEgcG9pbnRlciBsZWF2ZXMgYW4gZWxlbWVudFxuICAgKiAgIC0gcG9pbnRlcmNhbmNlbDogYSBwb2ludGVyIHdpbGwgbm8gbG9uZ2VyIGdlbmVyYXRlIGV2ZW50c1xuICAgKi9cbiAgdmFyIGRpc3BhdGNoZXIgPSB7XG4gICAgcG9pbnRlcm1hcDogbmV3IF9wb2ludGVybWFwKCksXG4gICAgZXZlbnRNYXA6IE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgY2FwdHVyZUluZm86IE9iamVjdC5jcmVhdGUobnVsbCksXG5cbiAgICAvLyBTY29wZSBvYmplY3RzIGZvciBuYXRpdmUgZXZlbnRzLlxuICAgIC8vIFRoaXMgZXhpc3RzIGZvciBlYXNlIG9mIHRlc3RpbmcuXG4gICAgZXZlbnRTb3VyY2VzOiBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgIGV2ZW50U291cmNlTGlzdDogW10sXG4gICAgLyoqXG4gICAgICogQWRkIGEgbmV3IGV2ZW50IHNvdXJjZSB0aGF0IHdpbGwgZ2VuZXJhdGUgcG9pbnRlciBldmVudHMuXG4gICAgICpcbiAgICAgKiBgaW5Tb3VyY2VgIG11c3QgY29udGFpbiBhbiBhcnJheSBvZiBldmVudCBuYW1lcyBuYW1lZCBgZXZlbnRzYCwgYW5kXG4gICAgICogZnVuY3Rpb25zIHdpdGggdGhlIG5hbWVzIHNwZWNpZmllZCBpbiB0aGUgYGV2ZW50c2AgYXJyYXkuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgQSBuYW1lIGZvciB0aGUgZXZlbnQgc291cmNlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBBIG5ldyBzb3VyY2Ugb2YgcGxhdGZvcm0gZXZlbnRzLlxuICAgICAqL1xuICAgIHJlZ2lzdGVyU291cmNlOiBmdW5jdGlvbihuYW1lLCBzb3VyY2UpIHtcbiAgICAgIHZhciBzID0gc291cmNlO1xuICAgICAgdmFyIG5ld0V2ZW50cyA9IHMuZXZlbnRzO1xuICAgICAgaWYgKG5ld0V2ZW50cykge1xuICAgICAgICBuZXdFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICAgICAgaWYgKHNbZV0pIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRNYXBbZV0gPSBzW2VdLmJpbmQocyk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgdGhpcy5ldmVudFNvdXJjZXNbbmFtZV0gPSBzO1xuICAgICAgICB0aGlzLmV2ZW50U291cmNlTGlzdC5wdXNoKHMpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHZhciBsID0gdGhpcy5ldmVudFNvdXJjZUxpc3QubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGVzOyAoaSA8IGwpICYmIChlcyA9IHRoaXMuZXZlbnRTb3VyY2VMaXN0W2ldKTsgaSsrKSB7XG5cbiAgICAgICAgLy8gY2FsbCBldmVudHNvdXJjZSByZWdpc3RlclxuICAgICAgICBlcy5yZWdpc3Rlci5jYWxsKGVzLCBlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHVucmVnaXN0ZXI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHZhciBsID0gdGhpcy5ldmVudFNvdXJjZUxpc3QubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGVzOyAoaSA8IGwpICYmIChlcyA9IHRoaXMuZXZlbnRTb3VyY2VMaXN0W2ldKTsgaSsrKSB7XG5cbiAgICAgICAgLy8gY2FsbCBldmVudHNvdXJjZSByZWdpc3RlclxuICAgICAgICBlcy51bnJlZ2lzdGVyLmNhbGwoZXMsIGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgY29udGFpbnM6IC8qc2NvcGUuZXh0ZXJuYWwuY29udGFpbnMgfHwgKi9mdW5jdGlvbihjb250YWluZXIsIGNvbnRhaW5lZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lci5jb250YWlucyhjb250YWluZWQpO1xuICAgICAgfSBjYXRjaCAoZXgpIHtcblxuICAgICAgICAvLyBtb3N0IGxpa2VseTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjA4NDI3XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gRVZFTlRTXG4gICAgZG93bjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVyZG93bicsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgbW92ZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVybW92ZScsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgdXA6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IHRydWU7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcnVwJywgaW5FdmVudCk7XG4gICAgfSxcbiAgICBlbnRlcjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gZmFsc2U7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcmVudGVyJywgaW5FdmVudCk7XG4gICAgfSxcbiAgICBsZWF2ZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gZmFsc2U7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcmxlYXZlJywgaW5FdmVudCk7XG4gICAgfSxcbiAgICBvdmVyOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSB0cnVlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJvdmVyJywgaW5FdmVudCk7XG4gICAgfSxcbiAgICBvdXQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IHRydWU7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcm91dCcsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgY2FuY2VsOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSB0cnVlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJjYW5jZWwnLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIGxlYXZlT3V0OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgdGhpcy5vdXQoZXZlbnQpO1xuICAgICAgaWYgKCF0aGlzLmNvbnRhaW5zKGV2ZW50LnRhcmdldCwgZXZlbnQucmVsYXRlZFRhcmdldCkpIHtcbiAgICAgICAgdGhpcy5sZWF2ZShldmVudCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlbnRlck92ZXI6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB0aGlzLm92ZXIoZXZlbnQpO1xuICAgICAgaWYgKCF0aGlzLmNvbnRhaW5zKGV2ZW50LnRhcmdldCwgZXZlbnQucmVsYXRlZFRhcmdldCkpIHtcbiAgICAgICAgdGhpcy5lbnRlcihldmVudCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIExJU1RFTkVSIExPR0lDXG4gICAgZXZlbnRIYW5kbGVyOiBmdW5jdGlvbihpbkV2ZW50KSB7XG5cbiAgICAgIC8vIFRoaXMgaXMgdXNlZCB0byBwcmV2ZW50IG11bHRpcGxlIGRpc3BhdGNoIG9mIHBvaW50ZXJldmVudHMgZnJvbVxuICAgICAgLy8gcGxhdGZvcm0gZXZlbnRzLiBUaGlzIGNhbiBoYXBwZW4gd2hlbiB0d28gZWxlbWVudHMgaW4gZGlmZmVyZW50IHNjb3Blc1xuICAgICAgLy8gYXJlIHNldCB1cCB0byBjcmVhdGUgcG9pbnRlciBldmVudHMsIHdoaWNoIGlzIHJlbGV2YW50IHRvIFNoYWRvdyBET00uXG4gICAgICBpZiAoaW5FdmVudC5faGFuZGxlZEJ5UEUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIHR5cGUgPSBpbkV2ZW50LnR5cGU7XG4gICAgICB2YXIgZm4gPSB0aGlzLmV2ZW50TWFwICYmIHRoaXMuZXZlbnRNYXBbdHlwZV07XG4gICAgICBpZiAoZm4pIHtcbiAgICAgICAgZm4oaW5FdmVudCk7XG4gICAgICB9XG4gICAgICBpbkV2ZW50Ll9oYW5kbGVkQnlQRSA9IHRydWU7XG4gICAgfSxcblxuICAgIC8vIHNldCB1cCBldmVudCBsaXN0ZW5lcnNcbiAgICBsaXN0ZW46IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnRzKSB7XG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMuYWRkRXZlbnQodGFyZ2V0LCBlKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvLyByZW1vdmUgZXZlbnQgbGlzdGVuZXJzXG4gICAgdW5saXN0ZW46IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnRzKSB7XG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnQodGFyZ2V0LCBlKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG4gICAgYWRkRXZlbnQ6IC8qc2NvcGUuZXh0ZXJuYWwuYWRkRXZlbnQgfHwgKi9mdW5jdGlvbih0YXJnZXQsIGV2ZW50TmFtZSkge1xuICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB0aGlzLmJvdW5kSGFuZGxlcik7XG4gICAgfSxcbiAgICByZW1vdmVFdmVudDogLypzY29wZS5leHRlcm5hbC5yZW1vdmVFdmVudCB8fCAqL2Z1bmN0aW9uKHRhcmdldCwgZXZlbnROYW1lKSB7XG4gICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuYm91bmRIYW5kbGVyKTtcbiAgICB9LFxuXG4gICAgLy8gRVZFTlQgQ1JFQVRJT04gQU5EIFRSQUNLSU5HXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBFdmVudCBvZiB0eXBlIGBpblR5cGVgLCBiYXNlZCBvbiB0aGUgaW5mb3JtYXRpb24gaW5cbiAgICAgKiBgaW5FdmVudGAuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaW5UeXBlIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdHlwZSBvZiBldmVudCB0byBjcmVhdGVcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBpbkV2ZW50IEEgcGxhdGZvcm0gZXZlbnQgd2l0aCBhIHRhcmdldFxuICAgICAqIEByZXR1cm4ge0V2ZW50fSBBIFBvaW50ZXJFdmVudCBvZiB0eXBlIGBpblR5cGVgXG4gICAgICovXG4gICAgbWFrZUV2ZW50OiBmdW5jdGlvbihpblR5cGUsIGluRXZlbnQpIHtcblxuICAgICAgLy8gcmVsYXRlZFRhcmdldCBtdXN0IGJlIG51bGwgaWYgcG9pbnRlciBpcyBjYXB0dXJlZFxuICAgICAgaWYgKHRoaXMuY2FwdHVyZUluZm9baW5FdmVudC5wb2ludGVySWRdKSB7XG4gICAgICAgIGluRXZlbnQucmVsYXRlZFRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgICB2YXIgZSA9IG5ldyBfUG9pbnRlckV2ZW50KGluVHlwZSwgaW5FdmVudCk7XG4gICAgICBpZiAoaW5FdmVudC5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0ID0gaW5FdmVudC5wcmV2ZW50RGVmYXVsdDtcbiAgICAgIH1cbiAgICAgIGUuX3RhcmdldCA9IGUuX3RhcmdldCB8fCBpbkV2ZW50LnRhcmdldDtcbiAgICAgIHJldHVybiBlO1xuICAgIH0sXG5cbiAgICAvLyBtYWtlIGFuZCBkaXNwYXRjaCBhbiBldmVudCBpbiBvbmUgY2FsbFxuICAgIGZpcmVFdmVudDogZnVuY3Rpb24oaW5UeXBlLCBpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHRoaXMubWFrZUV2ZW50KGluVHlwZSwgaW5FdmVudCk7XG4gICAgICByZXR1cm4gdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHNuYXBzaG90IG9mIGluRXZlbnQsIHdpdGggd3JpdGFibGUgcHJvcGVydGllcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGluRXZlbnQgQW4gZXZlbnQgdGhhdCBjb250YWlucyBwcm9wZXJ0aWVzIHRvIGNvcHkuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBBbiBvYmplY3QgY29udGFpbmluZyBzaGFsbG93IGNvcGllcyBvZiBgaW5FdmVudGAnc1xuICAgICAqICAgIHByb3BlcnRpZXMuXG4gICAgICovXG4gICAgY2xvbmVFdmVudDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGV2ZW50Q29weSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICB2YXIgcDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgQ0xPTkVfUFJPUFMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcCA9IENMT05FX1BST1BTW2ldO1xuICAgICAgICBldmVudENvcHlbcF0gPSBpbkV2ZW50W3BdIHx8IENMT05FX0RFRkFVTFRTW2ldO1xuXG4gICAgICAgIC8vIFdvcmsgYXJvdW5kIFNWR0luc3RhbmNlRWxlbWVudCBzaGFkb3cgdHJlZVxuICAgICAgICAvLyBSZXR1cm4gdGhlIDx1c2U+IGVsZW1lbnQgdGhhdCBpcyByZXByZXNlbnRlZCBieSB0aGUgaW5zdGFuY2UgZm9yIFNhZmFyaSwgQ2hyb21lLCBJRS5cbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgYmVoYXZpb3IgaW1wbGVtZW50ZWQgYnkgRmlyZWZveC5cbiAgICAgICAgaWYgKEhBU19TVkdfSU5TVEFOQ0UgJiYgKHAgPT09ICd0YXJnZXQnIHx8IHAgPT09ICdyZWxhdGVkVGFyZ2V0JykpIHtcbiAgICAgICAgICBpZiAoZXZlbnRDb3B5W3BdIGluc3RhbmNlb2YgU1ZHRWxlbWVudEluc3RhbmNlKSB7XG4gICAgICAgICAgICBldmVudENvcHlbcF0gPSBldmVudENvcHlbcF0uY29ycmVzcG9uZGluZ1VzZUVsZW1lbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGtlZXAgdGhlIHNlbWFudGljcyBvZiBwcmV2ZW50RGVmYXVsdFxuICAgICAgaWYgKGluRXZlbnQucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgZXZlbnRDb3B5LnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaW5FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGV2ZW50Q29weTtcbiAgICB9LFxuICAgIGdldFRhcmdldDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGNhcHR1cmUgPSB0aGlzLmNhcHR1cmVJbmZvW2luRXZlbnQucG9pbnRlcklkXTtcbiAgICAgIGlmICghY2FwdHVyZSkge1xuICAgICAgICByZXR1cm4gaW5FdmVudC5fdGFyZ2V0O1xuICAgICAgfVxuICAgICAgaWYgKGluRXZlbnQuX3RhcmdldCA9PT0gY2FwdHVyZSB8fCAhKGluRXZlbnQudHlwZSBpbiBCT1VOREFSWV9FVkVOVFMpKSB7XG4gICAgICAgIHJldHVybiBjYXB0dXJlO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2V0Q2FwdHVyZTogZnVuY3Rpb24oaW5Qb2ludGVySWQsIGluVGFyZ2V0KSB7XG4gICAgICBpZiAodGhpcy5jYXB0dXJlSW5mb1tpblBvaW50ZXJJZF0pIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlQ2FwdHVyZShpblBvaW50ZXJJZCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNhcHR1cmVJbmZvW2luUG9pbnRlcklkXSA9IGluVGFyZ2V0O1xuICAgICAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgIGUuaW5pdEV2ZW50KCdnb3Rwb2ludGVyY2FwdHVyZScsIHRydWUsIGZhbHNlKTtcbiAgICAgIGUucG9pbnRlcklkID0gaW5Qb2ludGVySWQ7XG4gICAgICB0aGlzLmltcGxpY2l0UmVsZWFzZSA9IHRoaXMucmVsZWFzZUNhcHR1cmUuYmluZCh0aGlzLCBpblBvaW50ZXJJZCk7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVydXAnLCB0aGlzLmltcGxpY2l0UmVsZWFzZSk7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyY2FuY2VsJywgdGhpcy5pbXBsaWNpdFJlbGVhc2UpO1xuICAgICAgZS5fdGFyZ2V0ID0gaW5UYXJnZXQ7XG4gICAgICB0aGlzLmFzeW5jRGlzcGF0Y2hFdmVudChlKTtcbiAgICB9LFxuICAgIHJlbGVhc2VDYXB0dXJlOiBmdW5jdGlvbihpblBvaW50ZXJJZCkge1xuICAgICAgdmFyIHQgPSB0aGlzLmNhcHR1cmVJbmZvW2luUG9pbnRlcklkXTtcbiAgICAgIGlmICh0KSB7XG4gICAgICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICAgIGUuaW5pdEV2ZW50KCdsb3N0cG9pbnRlcmNhcHR1cmUnLCB0cnVlLCBmYWxzZSk7XG4gICAgICAgIGUucG9pbnRlcklkID0gaW5Qb2ludGVySWQ7XG4gICAgICAgIHRoaXMuY2FwdHVyZUluZm9baW5Qb2ludGVySWRdID0gdW5kZWZpbmVkO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVydXAnLCB0aGlzLmltcGxpY2l0UmVsZWFzZSk7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJjYW5jZWwnLCB0aGlzLmltcGxpY2l0UmVsZWFzZSk7XG4gICAgICAgIGUuX3RhcmdldCA9IHQ7XG4gICAgICAgIHRoaXMuYXN5bmNEaXNwYXRjaEV2ZW50KGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2hlcyB0aGUgZXZlbnQgdG8gaXRzIHRhcmdldC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGluRXZlbnQgVGhlIGV2ZW50IHRvIGJlIGRpc3BhdGNoZWQuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gVHJ1ZSBpZiBhbiBldmVudCBoYW5kbGVyIHJldHVybnMgdHJ1ZSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGRpc3BhdGNoRXZlbnQ6IC8qc2NvcGUuZXh0ZXJuYWwuZGlzcGF0Y2hFdmVudCB8fCAqL2Z1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciB0ID0gdGhpcy5nZXRUYXJnZXQoaW5FdmVudCk7XG4gICAgICBpZiAodCkge1xuICAgICAgICByZXR1cm4gdC5kaXNwYXRjaEV2ZW50KGluRXZlbnQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYXN5bmNEaXNwYXRjaEV2ZW50OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5kaXNwYXRjaEV2ZW50LmJpbmQodGhpcywgaW5FdmVudCkpO1xuICAgIH1cbiAgfTtcbiAgZGlzcGF0Y2hlci5ib3VuZEhhbmRsZXIgPSBkaXNwYXRjaGVyLmV2ZW50SGFuZGxlci5iaW5kKGRpc3BhdGNoZXIpO1xuXG4gIHZhciBfZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG5cbiAgdmFyIHRhcmdldGluZyA9IHtcbiAgICBzaGFkb3c6IGZ1bmN0aW9uKGluRWwpIHtcbiAgICAgIGlmIChpbkVsKSB7XG4gICAgICAgIHJldHVybiBpbkVsLnNoYWRvd1Jvb3QgfHwgaW5FbC53ZWJraXRTaGFkb3dSb290O1xuICAgICAgfVxuICAgIH0sXG4gICAgY2FuVGFyZ2V0OiBmdW5jdGlvbihzaGFkb3cpIHtcbiAgICAgIHJldHVybiBzaGFkb3cgJiYgQm9vbGVhbihzaGFkb3cuZWxlbWVudEZyb21Qb2ludCk7XG4gICAgfSxcbiAgICB0YXJnZXRpbmdTaGFkb3c6IGZ1bmN0aW9uKGluRWwpIHtcbiAgICAgIHZhciBzID0gdGhpcy5zaGFkb3coaW5FbCk7XG4gICAgICBpZiAodGhpcy5jYW5UYXJnZXQocykpIHtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgICB9XG4gICAgfSxcbiAgICBvbGRlclNoYWRvdzogZnVuY3Rpb24oc2hhZG93KSB7XG4gICAgICB2YXIgb3MgPSBzaGFkb3cub2xkZXJTaGFkb3dSb290O1xuICAgICAgaWYgKCFvcykge1xuICAgICAgICB2YXIgc2UgPSBzaGFkb3cucXVlcnlTZWxlY3Rvcignc2hhZG93Jyk7XG4gICAgICAgIGlmIChzZSkge1xuICAgICAgICAgIG9zID0gc2Uub2xkZXJTaGFkb3dSb290O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb3M7XG4gICAgfSxcbiAgICBhbGxTaGFkb3dzOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgc2hhZG93cyA9IFtdO1xuICAgICAgdmFyIHMgPSB0aGlzLnNoYWRvdyhlbGVtZW50KTtcbiAgICAgIHdoaWxlIChzKSB7XG4gICAgICAgIHNoYWRvd3MucHVzaChzKTtcbiAgICAgICAgcyA9IHRoaXMub2xkZXJTaGFkb3cocyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2hhZG93cztcbiAgICB9LFxuICAgIHNlYXJjaFJvb3Q6IGZ1bmN0aW9uKGluUm9vdCwgeCwgeSkge1xuICAgICAgaWYgKGluUm9vdCkge1xuICAgICAgICB2YXIgdCA9IGluUm9vdC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuICAgICAgICB2YXIgc3QsIHNyO1xuXG4gICAgICAgIC8vIGlzIGVsZW1lbnQgYSBzaGFkb3cgaG9zdD9cbiAgICAgICAgc3IgPSB0aGlzLnRhcmdldGluZ1NoYWRvdyh0KTtcbiAgICAgICAgd2hpbGUgKHNyKSB7XG5cbiAgICAgICAgICAvLyBmaW5kIHRoZSB0aGUgZWxlbWVudCBpbnNpZGUgdGhlIHNoYWRvdyByb290XG4gICAgICAgICAgc3QgPSBzci5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuICAgICAgICAgIGlmICghc3QpIHtcblxuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIG9sZGVyIHNoYWRvd3NcbiAgICAgICAgICAgIHNyID0gdGhpcy5vbGRlclNoYWRvdyhzcik7XG4gICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gc2hhZG93ZWQgZWxlbWVudCBtYXkgY29udGFpbiBhIHNoYWRvdyByb290XG4gICAgICAgICAgICB2YXIgc3NyID0gdGhpcy50YXJnZXRpbmdTaGFkb3coc3QpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoUm9vdChzc3IsIHgsIHkpIHx8IHN0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGxpZ2h0IGRvbSBlbGVtZW50IGlzIHRoZSB0YXJnZXRcbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgICB9XG4gICAgfSxcbiAgICBvd25lcjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdmFyIHMgPSBlbGVtZW50O1xuXG4gICAgICAvLyB3YWxrIHVwIHVudGlsIHlvdSBoaXQgdGhlIHNoYWRvdyByb290IG9yIGRvY3VtZW50XG4gICAgICB3aGlsZSAocy5wYXJlbnROb2RlKSB7XG4gICAgICAgIHMgPSBzLnBhcmVudE5vZGU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRoZSBvd25lciBlbGVtZW50IGlzIGV4cGVjdGVkIHRvIGJlIGEgRG9jdW1lbnQgb3IgU2hhZG93Um9vdFxuICAgICAgaWYgKHMubm9kZVR5cGUgIT09IE5vZGUuRE9DVU1FTlRfTk9ERSAmJiBzLm5vZGVUeXBlICE9PSBOb2RlLkRPQ1VNRU5UX0ZSQUdNRU5UX05PREUpIHtcbiAgICAgICAgcyA9IGRvY3VtZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHM7XG4gICAgfSxcbiAgICBmaW5kVGFyZ2V0OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgeCA9IGluRXZlbnQuY2xpZW50WDtcbiAgICAgIHZhciB5ID0gaW5FdmVudC5jbGllbnRZO1xuXG4gICAgICAvLyBpZiB0aGUgbGlzdGVuZXIgaXMgaW4gdGhlIHNoYWRvdyByb290LCBpdCBpcyBtdWNoIGZhc3RlciB0byBzdGFydCB0aGVyZVxuICAgICAgdmFyIHMgPSB0aGlzLm93bmVyKGluRXZlbnQudGFyZ2V0KTtcblxuICAgICAgLy8gaWYgeCwgeSBpcyBub3QgaW4gdGhpcyByb290LCBmYWxsIGJhY2sgdG8gZG9jdW1lbnQgc2VhcmNoXG4gICAgICBpZiAoIXMuZWxlbWVudEZyb21Qb2ludCh4LCB5KSkge1xuICAgICAgICBzID0gZG9jdW1lbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zZWFyY2hSb290KHMsIHgsIHkpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogVGhpcyBtb2R1bGUgdXNlcyBNdXRhdGlvbiBPYnNlcnZlcnMgdG8gZHluYW1pY2FsbHkgYWRqdXN0IHdoaWNoIG5vZGVzIHdpbGxcbiAgICogZ2VuZXJhdGUgUG9pbnRlciBFdmVudHMuXG4gICAqXG4gICAqIEFsbCBub2RlcyB0aGF0IHdpc2ggdG8gZ2VuZXJhdGUgUG9pbnRlciBFdmVudHMgbXVzdCBoYXZlIHRoZSBhdHRyaWJ1dGVcbiAgICogYHRvdWNoLWFjdGlvbmAgc2V0IHRvIGBub25lYC5cbiAgICovXG4gIHZhciBmb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbC5iaW5kKEFycmF5LnByb3RvdHlwZS5mb3JFYWNoKTtcbiAgdmFyIG1hcCA9IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbC5iaW5kKEFycmF5LnByb3RvdHlwZS5tYXApO1xuICB2YXIgdG9BcnJheSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsLmJpbmQoQXJyYXkucHJvdG90eXBlLnNsaWNlKTtcbiAgdmFyIGZpbHRlciA9IEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbC5iaW5kKEFycmF5LnByb3RvdHlwZS5maWx0ZXIpO1xuICB2YXIgTU8gPSB3aW5kb3cuTXV0YXRpb25PYnNlcnZlciB8fCB3aW5kb3cuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcbiAgdmFyIFNFTEVDVE9SID0gJ1t0b3VjaC1hY3Rpb25dJztcbiAgdmFyIE9CU0VSVkVSX0lOSVQgPSB7XG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICBhdHRyaWJ1dGVPbGRWYWx1ZTogdHJ1ZSxcbiAgICBhdHRyaWJ1dGVGaWx0ZXI6IFsndG91Y2gtYWN0aW9uJ11cbiAgfTtcblxuICBmdW5jdGlvbiBJbnN0YWxsZXIoYWRkLCByZW1vdmUsIGNoYW5nZWQsIGJpbmRlcikge1xuICAgIHRoaXMuYWRkQ2FsbGJhY2sgPSBhZGQuYmluZChiaW5kZXIpO1xuICAgIHRoaXMucmVtb3ZlQ2FsbGJhY2sgPSByZW1vdmUuYmluZChiaW5kZXIpO1xuICAgIHRoaXMuY2hhbmdlZENhbGxiYWNrID0gY2hhbmdlZC5iaW5kKGJpbmRlcik7XG4gICAgaWYgKE1PKSB7XG4gICAgICB0aGlzLm9ic2VydmVyID0gbmV3IE1PKHRoaXMubXV0YXRpb25XYXRjaGVyLmJpbmQodGhpcykpO1xuICAgIH1cbiAgfVxuXG4gIEluc3RhbGxlci5wcm90b3R5cGUgPSB7XG4gICAgd2F0Y2hTdWJ0cmVlOiBmdW5jdGlvbih0YXJnZXQpIHtcblxuICAgICAgLy8gT25seSB3YXRjaCBzY29wZXMgdGhhdCBjYW4gdGFyZ2V0IGZpbmQsIGFzIHRoZXNlIGFyZSB0b3AtbGV2ZWwuXG4gICAgICAvLyBPdGhlcndpc2Ugd2UgY2FuIHNlZSBkdXBsaWNhdGUgYWRkaXRpb25zIGFuZCByZW1vdmFscyB0aGF0IGFkZCBub2lzZS5cbiAgICAgIC8vXG4gICAgICAvLyBUT0RPKGRmcmVlZG1hbik6IEZvciBzb21lIGluc3RhbmNlcyB3aXRoIFNoYWRvd0RPTVBvbHlmaWxsLCB3ZSBjYW4gc2VlXG4gICAgICAvLyBhIHJlbW92YWwgd2l0aG91dCBhbiBpbnNlcnRpb24gd2hlbiBhIG5vZGUgaXMgcmVkaXN0cmlidXRlZCBhbW9uZ1xuICAgICAgLy8gc2hhZG93cy4gU2luY2UgaXQgYWxsIGVuZHMgdXAgY29ycmVjdCBpbiB0aGUgZG9jdW1lbnQsIHdhdGNoaW5nIG9ubHlcbiAgICAgIC8vIHRoZSBkb2N1bWVudCB3aWxsIHlpZWxkIHRoZSBjb3JyZWN0IG11dGF0aW9ucyB0byB3YXRjaC5cbiAgICAgIGlmICh0aGlzLm9ic2VydmVyICYmIHRhcmdldGluZy5jYW5UYXJnZXQodGFyZ2V0KSkge1xuICAgICAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUodGFyZ2V0LCBPQlNFUlZFUl9JTklUKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVuYWJsZU9uU3VidHJlZTogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICB0aGlzLndhdGNoU3VidHJlZSh0YXJnZXQpO1xuICAgICAgaWYgKHRhcmdldCA9PT0gZG9jdW1lbnQgJiYgZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykge1xuICAgICAgICB0aGlzLmluc3RhbGxPbkxvYWQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaW5zdGFsbE5ld1N1YnRyZWUodGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGluc3RhbGxOZXdTdWJ0cmVlOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIGZvckVhY2godGhpcy5maW5kRWxlbWVudHModGFyZ2V0KSwgdGhpcy5hZGRFbGVtZW50LCB0aGlzKTtcbiAgICB9LFxuICAgIGZpbmRFbGVtZW50czogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBpZiAodGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKFNFTEVDVE9SKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXTtcbiAgICB9LFxuICAgIHJlbW92ZUVsZW1lbnQ6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICB0aGlzLnJlbW92ZUNhbGxiYWNrKGVsKTtcbiAgICB9LFxuICAgIGFkZEVsZW1lbnQ6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICB0aGlzLmFkZENhbGxiYWNrKGVsKTtcbiAgICB9LFxuICAgIGVsZW1lbnRDaGFuZ2VkOiBmdW5jdGlvbihlbCwgb2xkVmFsdWUpIHtcbiAgICAgIHRoaXMuY2hhbmdlZENhbGxiYWNrKGVsLCBvbGRWYWx1ZSk7XG4gICAgfSxcbiAgICBjb25jYXRMaXN0czogZnVuY3Rpb24oYWNjdW0sIGxpc3QpIHtcbiAgICAgIHJldHVybiBhY2N1bS5jb25jYXQodG9BcnJheShsaXN0KSk7XG4gICAgfSxcblxuICAgIC8vIHJlZ2lzdGVyIGFsbCB0b3VjaC1hY3Rpb24gPSBub25lIG5vZGVzIG9uIGRvY3VtZW50IGxvYWRcbiAgICBpbnN0YWxsT25Mb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3JlYWR5c3RhdGVjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICB0aGlzLmluc3RhbGxOZXdTdWJ0cmVlKGRvY3VtZW50KTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuICAgIGlzRWxlbWVudDogZnVuY3Rpb24obikge1xuICAgICAgcmV0dXJuIG4ubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFO1xuICAgIH0sXG4gICAgZmxhdHRlbk11dGF0aW9uVHJlZTogZnVuY3Rpb24oaW5Ob2Rlcykge1xuXG4gICAgICAvLyBmaW5kIGNoaWxkcmVuIHdpdGggdG91Y2gtYWN0aW9uXG4gICAgICB2YXIgdHJlZSA9IG1hcChpbk5vZGVzLCB0aGlzLmZpbmRFbGVtZW50cywgdGhpcyk7XG5cbiAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgYWRkZWQgbm9kZXMgYXJlIGFjY291bnRlZCBmb3JcbiAgICAgIHRyZWUucHVzaChmaWx0ZXIoaW5Ob2RlcywgdGhpcy5pc0VsZW1lbnQpKTtcblxuICAgICAgLy8gZmxhdHRlbiB0aGUgbGlzdFxuICAgICAgcmV0dXJuIHRyZWUucmVkdWNlKHRoaXMuY29uY2F0TGlzdHMsIFtdKTtcbiAgICB9LFxuICAgIG11dGF0aW9uV2F0Y2hlcjogZnVuY3Rpb24obXV0YXRpb25zKSB7XG4gICAgICBtdXRhdGlvbnMuZm9yRWFjaCh0aGlzLm11dGF0aW9uSGFuZGxlciwgdGhpcyk7XG4gICAgfSxcbiAgICBtdXRhdGlvbkhhbmRsZXI6IGZ1bmN0aW9uKG0pIHtcbiAgICAgIGlmIChtLnR5cGUgPT09ICdjaGlsZExpc3QnKSB7XG4gICAgICAgIHZhciBhZGRlZCA9IHRoaXMuZmxhdHRlbk11dGF0aW9uVHJlZShtLmFkZGVkTm9kZXMpO1xuICAgICAgICBhZGRlZC5mb3JFYWNoKHRoaXMuYWRkRWxlbWVudCwgdGhpcyk7XG4gICAgICAgIHZhciByZW1vdmVkID0gdGhpcy5mbGF0dGVuTXV0YXRpb25UcmVlKG0ucmVtb3ZlZE5vZGVzKTtcbiAgICAgICAgcmVtb3ZlZC5mb3JFYWNoKHRoaXMucmVtb3ZlRWxlbWVudCwgdGhpcyk7XG4gICAgICB9IGVsc2UgaWYgKG0udHlwZSA9PT0gJ2F0dHJpYnV0ZXMnKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudENoYW5nZWQobS50YXJnZXQsIG0ub2xkVmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB2YXIgaW5zdGFsbGVyID0gSW5zdGFsbGVyO1xuXG4gIGZ1bmN0aW9uIHNoYWRvd1NlbGVjdG9yKHYpIHtcbiAgICByZXR1cm4gJ2JvZHkgL3NoYWRvdy1kZWVwLyAnICsgc2VsZWN0b3Iodik7XG4gIH1cbiAgZnVuY3Rpb24gc2VsZWN0b3Iodikge1xuICAgIHJldHVybiAnW3RvdWNoLWFjdGlvbj1cIicgKyB2ICsgJ1wiXSc7XG4gIH1cbiAgZnVuY3Rpb24gcnVsZSh2KSB7XG4gICAgcmV0dXJuICd7IC1tcy10b3VjaC1hY3Rpb246ICcgKyB2ICsgJzsgdG91Y2gtYWN0aW9uOiAnICsgdiArICc7IHRvdWNoLWFjdGlvbi1kZWxheTogbm9uZTsgfSc7XG4gIH1cbiAgdmFyIGF0dHJpYjJjc3MgPSBbXG4gICAgJ25vbmUnLFxuICAgICdhdXRvJyxcbiAgICAncGFuLXgnLFxuICAgICdwYW4teScsXG4gICAge1xuICAgICAgcnVsZTogJ3Bhbi14IHBhbi15JyxcbiAgICAgIHNlbGVjdG9yczogW1xuICAgICAgICAncGFuLXggcGFuLXknLFxuICAgICAgICAncGFuLXkgcGFuLXgnXG4gICAgICBdXG4gICAgfVxuICBdO1xuICB2YXIgc3R5bGVzID0gJyc7XG5cbiAgLy8gb25seSBpbnN0YWxsIHN0eWxlc2hlZXQgaWYgdGhlIGJyb3dzZXIgaGFzIHRvdWNoIGFjdGlvbiBzdXBwb3J0XG4gIHZhciBoYXNOYXRpdmVQRSA9IHdpbmRvdy5Qb2ludGVyRXZlbnQgfHwgd2luZG93Lk1TUG9pbnRlckV2ZW50O1xuXG4gIC8vIG9ubHkgYWRkIHNoYWRvdyBzZWxlY3RvcnMgaWYgc2hhZG93ZG9tIGlzIHN1cHBvcnRlZFxuICB2YXIgaGFzU2hhZG93Um9vdCA9ICF3aW5kb3cuU2hhZG93RE9NUG9seWZpbGwgJiYgZG9jdW1lbnQuaGVhZC5jcmVhdGVTaGFkb3dSb290O1xuXG4gIGZ1bmN0aW9uIGFwcGx5QXR0cmlidXRlU3R5bGVzKCkge1xuICAgIGlmIChoYXNOYXRpdmVQRSkge1xuICAgICAgYXR0cmliMmNzcy5mb3JFYWNoKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgaWYgKFN0cmluZyhyKSA9PT0gcikge1xuICAgICAgICAgIHN0eWxlcyArPSBzZWxlY3RvcihyKSArIHJ1bGUocikgKyAnXFxuJztcbiAgICAgICAgICBpZiAoaGFzU2hhZG93Um9vdCkge1xuICAgICAgICAgICAgc3R5bGVzICs9IHNoYWRvd1NlbGVjdG9yKHIpICsgcnVsZShyKSArICdcXG4nO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHlsZXMgKz0gci5zZWxlY3RvcnMubWFwKHNlbGVjdG9yKSArIHJ1bGUoci5ydWxlKSArICdcXG4nO1xuICAgICAgICAgIGlmIChoYXNTaGFkb3dSb290KSB7XG4gICAgICAgICAgICBzdHlsZXMgKz0gci5zZWxlY3RvcnMubWFwKHNoYWRvd1NlbGVjdG9yKSArIHJ1bGUoci5ydWxlKSArICdcXG4nO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICBlbC50ZXh0Q29udGVudCA9IHN0eWxlcztcbiAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoZWwpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBtb3VzZV9fcG9pbnRlcm1hcCA9IF9kaXNwYXRjaGVyLnBvaW50ZXJtYXA7XG5cbiAgLy8gcmFkaXVzIGFyb3VuZCB0b3VjaGVuZCB0aGF0IHN3YWxsb3dzIG1vdXNlIGV2ZW50c1xuICB2YXIgREVEVVBfRElTVCA9IDI1O1xuXG4gIC8vIGxlZnQsIG1pZGRsZSwgcmlnaHQsIGJhY2ssIGZvcndhcmRcbiAgdmFyIEJVVFRPTl9UT19CVVRUT05TID0gWzEsIDQsIDIsIDgsIDE2XTtcblxuICB2YXIgSEFTX0JVVFRPTlMgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICBIQVNfQlVUVE9OUyA9IG5ldyBNb3VzZUV2ZW50KCd0ZXN0JywgeyBidXR0b25zOiAxIH0pLmJ1dHRvbnMgPT09IDE7XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgLy8gaGFuZGxlciBibG9jayBmb3IgbmF0aXZlIG1vdXNlIGV2ZW50c1xuICB2YXIgbW91c2VFdmVudHMgPSB7XG4gICAgUE9JTlRFUl9JRDogMSxcbiAgICBQT0lOVEVSX1RZUEU6ICdtb3VzZScsXG4gICAgZXZlbnRzOiBbXG4gICAgICAnbW91c2Vkb3duJyxcbiAgICAgICdtb3VzZW1vdmUnLFxuICAgICAgJ21vdXNldXAnLFxuICAgICAgJ21vdXNlb3ZlcicsXG4gICAgICAnbW91c2VvdXQnXG4gICAgXSxcbiAgICByZWdpc3RlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBfZGlzcGF0Y2hlci5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgfSxcbiAgICB1bnJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIF9kaXNwYXRjaGVyLnVubGlzdGVuKHRhcmdldCwgdGhpcy5ldmVudHMpO1xuICAgIH0sXG4gICAgbGFzdFRvdWNoZXM6IFtdLFxuXG4gICAgLy8gY29sbGlkZSB3aXRoIHRoZSBnbG9iYWwgbW91c2UgbGlzdGVuZXJcbiAgICBpc0V2ZW50U2ltdWxhdGVkRnJvbVRvdWNoOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgbHRzID0gdGhpcy5sYXN0VG91Y2hlcztcbiAgICAgIHZhciB4ID0gaW5FdmVudC5jbGllbnRYO1xuICAgICAgdmFyIHkgPSBpbkV2ZW50LmNsaWVudFk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGx0cy5sZW5ndGgsIHQ7IGkgPCBsICYmICh0ID0gbHRzW2ldKTsgaSsrKSB7XG5cbiAgICAgICAgLy8gc2ltdWxhdGVkIG1vdXNlIGV2ZW50cyB3aWxsIGJlIHN3YWxsb3dlZCBuZWFyIGEgcHJpbWFyeSB0b3VjaGVuZFxuICAgICAgICB2YXIgZHggPSBNYXRoLmFicyh4IC0gdC54KTtcbiAgICAgICAgdmFyIGR5ID0gTWF0aC5hYnMoeSAtIHQueSk7XG4gICAgICAgIGlmIChkeCA8PSBERURVUF9ESVNUICYmIGR5IDw9IERFRFVQX0RJU1QpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcHJlcGFyZUV2ZW50OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IF9kaXNwYXRjaGVyLmNsb25lRXZlbnQoaW5FdmVudCk7XG5cbiAgICAgIC8vIGZvcndhcmQgbW91c2UgcHJldmVudERlZmF1bHRcbiAgICAgIHZhciBwZCA9IGUucHJldmVudERlZmF1bHQ7XG4gICAgICBlLnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGluRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcGQoKTtcbiAgICAgIH07XG4gICAgICBlLnBvaW50ZXJJZCA9IHRoaXMuUE9JTlRFUl9JRDtcbiAgICAgIGUuaXNQcmltYXJ5ID0gdHJ1ZTtcbiAgICAgIGUucG9pbnRlclR5cGUgPSB0aGlzLlBPSU5URVJfVFlQRTtcbiAgICAgIHJldHVybiBlO1xuICAgIH0sXG4gICAgcHJlcGFyZUJ1dHRvbnNGb3JNb3ZlOiBmdW5jdGlvbihlLCBpbkV2ZW50KSB7XG4gICAgICB2YXIgcCA9IG1vdXNlX19wb2ludGVybWFwLmdldCh0aGlzLlBPSU5URVJfSUQpO1xuICAgICAgZS5idXR0b25zID0gcCA/IHAuYnV0dG9ucyA6IDA7XG4gICAgICBpbkV2ZW50LmJ1dHRvbnMgPSBlLmJ1dHRvbnM7XG4gICAgfSxcbiAgICBtb3VzZWRvd246IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5pc0V2ZW50U2ltdWxhdGVkRnJvbVRvdWNoKGluRXZlbnQpKSB7XG4gICAgICAgIHZhciBwID0gbW91c2VfX3BvaW50ZXJtYXAuZ2V0KHRoaXMuUE9JTlRFUl9JRCk7XG4gICAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICAgIGlmICghSEFTX0JVVFRPTlMpIHtcbiAgICAgICAgICBlLmJ1dHRvbnMgPSBCVVRUT05fVE9fQlVUVE9OU1tlLmJ1dHRvbl07XG4gICAgICAgICAgaWYgKHApIHsgZS5idXR0b25zIHw9IHAuYnV0dG9uczsgfVxuICAgICAgICAgIGluRXZlbnQuYnV0dG9ucyA9IGUuYnV0dG9ucztcbiAgICAgICAgfVxuICAgICAgICBtb3VzZV9fcG9pbnRlcm1hcC5zZXQodGhpcy5QT0lOVEVSX0lELCBpbkV2ZW50KTtcbiAgICAgICAgaWYgKCFwKSB7XG4gICAgICAgICAgX2Rpc3BhdGNoZXIuZG93bihlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfZGlzcGF0Y2hlci5tb3ZlKGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBtb3VzZW1vdmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5pc0V2ZW50U2ltdWxhdGVkRnJvbVRvdWNoKGluRXZlbnQpKSB7XG4gICAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICAgIGlmICghSEFTX0JVVFRPTlMpIHsgdGhpcy5wcmVwYXJlQnV0dG9uc0Zvck1vdmUoZSwgaW5FdmVudCk7IH1cbiAgICAgICAgX2Rpc3BhdGNoZXIubW92ZShlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdXNldXA6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5pc0V2ZW50U2ltdWxhdGVkRnJvbVRvdWNoKGluRXZlbnQpKSB7XG4gICAgICAgIHZhciBwID0gbW91c2VfX3BvaW50ZXJtYXAuZ2V0KHRoaXMuUE9JTlRFUl9JRCk7XG4gICAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICAgIGlmICghSEFTX0JVVFRPTlMpIHtcbiAgICAgICAgICB2YXIgdXAgPSBCVVRUT05fVE9fQlVUVE9OU1tlLmJ1dHRvbl07XG5cbiAgICAgICAgICAvLyBQcm9kdWNlcyB3cm9uZyBzdGF0ZSBvZiBidXR0b25zIGluIEJyb3dzZXJzIHdpdGhvdXQgYGJ1dHRvbnNgIHN1cHBvcnRcbiAgICAgICAgICAvLyB3aGVuIGEgbW91c2UgYnV0dG9uIHRoYXQgd2FzIHByZXNzZWQgb3V0c2lkZSB0aGUgZG9jdW1lbnQgaXMgcmVsZWFzZWRcbiAgICAgICAgICAvLyBpbnNpZGUgYW5kIG90aGVyIGJ1dHRvbnMgYXJlIHN0aWxsIHByZXNzZWQgZG93bi5cbiAgICAgICAgICBlLmJ1dHRvbnMgPSBwID8gcC5idXR0b25zICYgfnVwIDogMDtcbiAgICAgICAgICBpbkV2ZW50LmJ1dHRvbnMgPSBlLmJ1dHRvbnM7XG4gICAgICAgIH1cbiAgICAgICAgbW91c2VfX3BvaW50ZXJtYXAuc2V0KHRoaXMuUE9JTlRFUl9JRCwgaW5FdmVudCk7XG5cbiAgICAgICAgLy8gU3VwcG9ydDogRmlyZWZveCA8PTQ0IG9ubHlcbiAgICAgICAgLy8gRkYgVWJ1bnR1IGluY2x1ZGVzIHRoZSBsaWZ0ZWQgYnV0dG9uIGluIHRoZSBgYnV0dG9uc2AgcHJvcGVydHkgb25cbiAgICAgICAgLy8gbW91c2V1cC5cbiAgICAgICAgLy8gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTIyMzM2NlxuICAgICAgICBpZiAoZS5idXR0b25zID09PSAwIHx8IGUuYnV0dG9ucyA9PT0gQlVUVE9OX1RPX0JVVFRPTlNbZS5idXR0b25dKSB7XG4gICAgICAgICAgdGhpcy5jbGVhbnVwTW91c2UoKTtcbiAgICAgICAgICBfZGlzcGF0Y2hlci51cChlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfZGlzcGF0Y2hlci5tb3ZlKGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBtb3VzZW92ZXI6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5pc0V2ZW50U2ltdWxhdGVkRnJvbVRvdWNoKGluRXZlbnQpKSB7XG4gICAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICAgIGlmICghSEFTX0JVVFRPTlMpIHsgdGhpcy5wcmVwYXJlQnV0dG9uc0Zvck1vdmUoZSwgaW5FdmVudCk7IH1cbiAgICAgICAgX2Rpc3BhdGNoZXIuZW50ZXJPdmVyKGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbW91c2VvdXQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5pc0V2ZW50U2ltdWxhdGVkRnJvbVRvdWNoKGluRXZlbnQpKSB7XG4gICAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICAgIGlmICghSEFTX0JVVFRPTlMpIHsgdGhpcy5wcmVwYXJlQnV0dG9uc0Zvck1vdmUoZSwgaW5FdmVudCk7IH1cbiAgICAgICAgX2Rpc3BhdGNoZXIubGVhdmVPdXQoZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBjYW5jZWw6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBfZGlzcGF0Y2hlci5jYW5jZWwoZSk7XG4gICAgICB0aGlzLmNsZWFudXBNb3VzZSgpO1xuICAgIH0sXG4gICAgY2xlYW51cE1vdXNlOiBmdW5jdGlvbigpIHtcbiAgICAgIG1vdXNlX19wb2ludGVybWFwLmRlbGV0ZSh0aGlzLlBPSU5URVJfSUQpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgbW91c2UgPSBtb3VzZUV2ZW50cztcblxuICB2YXIgY2FwdHVyZUluZm8gPSBfZGlzcGF0Y2hlci5jYXB0dXJlSW5mbztcbiAgdmFyIGZpbmRUYXJnZXQgPSB0YXJnZXRpbmcuZmluZFRhcmdldC5iaW5kKHRhcmdldGluZyk7XG4gIHZhciBhbGxTaGFkb3dzID0gdGFyZ2V0aW5nLmFsbFNoYWRvd3MuYmluZCh0YXJnZXRpbmcpO1xuICB2YXIgdG91Y2hfX3BvaW50ZXJtYXAgPSBfZGlzcGF0Y2hlci5wb2ludGVybWFwO1xuXG4gIC8vIFRoaXMgc2hvdWxkIGJlIGxvbmcgZW5vdWdoIHRvIGlnbm9yZSBjb21wYXQgbW91c2UgZXZlbnRzIG1hZGUgYnkgdG91Y2hcbiAgdmFyIERFRFVQX1RJTUVPVVQgPSAyNTAwO1xuICB2YXIgQ0xJQ0tfQ09VTlRfVElNRU9VVCA9IDIwMDtcbiAgdmFyIEFUVFJJQiA9ICd0b3VjaC1hY3Rpb24nO1xuICB2YXIgSU5TVEFMTEVSO1xuXG4gIC8vIFRoZSBwcmVzZW5jZSBvZiB0b3VjaCBldmVudCBoYW5kbGVycyBibG9ja3Mgc2Nyb2xsaW5nLCBhbmQgc28gd2UgbXVzdCBiZSBjYXJlZnVsIHRvXG4gIC8vIGF2b2lkIGFkZGluZyBoYW5kbGVycyB1bm5lY2Vzc2FyaWx5LiAgQ2hyb21lIHBsYW5zIHRvIGFkZCBhIHRvdWNoLWFjdGlvbi1kZWxheSBwcm9wZXJ0eVxuICAvLyAoY3JidWcuY29tLzMyOTU1OSkgdG8gYWRkcmVzcyB0aGlzLCBhbmQgb25jZSB3ZSBoYXZlIHRoYXQgd2UgY2FuIG9wdC1pbiB0byBhIHNpbXBsZXJcbiAgLy8gaGFuZGxlciByZWdpc3RyYXRpb24gbWVjaGFuaXNtLiAgUmF0aGVyIHRoYW4gdHJ5IHRvIHByZWRpY3QgaG93IGV4YWN0bHkgdG8gb3B0LWluIHRvXG4gIC8vIHRoYXQgd2UnbGwganVzdCBsZWF2ZSB0aGlzIGRpc2FibGVkIHVudGlsIHRoZXJlIGlzIGEgYnVpbGQgb2YgQ2hyb21lIHRvIHRlc3QuXG4gIHZhciBIQVNfVE9VQ0hfQUNUSU9OX0RFTEFZID0gZmFsc2U7XG5cbiAgLy8gaGFuZGxlciBibG9jayBmb3IgbmF0aXZlIHRvdWNoIGV2ZW50c1xuICB2YXIgdG91Y2hFdmVudHMgPSB7XG4gICAgZXZlbnRzOiBbXG4gICAgICAndG91Y2hzdGFydCcsXG4gICAgICAndG91Y2htb3ZlJyxcbiAgICAgICd0b3VjaGVuZCcsXG4gICAgICAndG91Y2hjYW5jZWwnXG4gICAgXSxcbiAgICByZWdpc3RlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBpZiAoSEFTX1RPVUNIX0FDVElPTl9ERUxBWSkge1xuICAgICAgICBfZGlzcGF0Y2hlci5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBJTlNUQUxMRVIuZW5hYmxlT25TdWJ0cmVlKHRhcmdldCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB1bnJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIGlmIChIQVNfVE9VQ0hfQUNUSU9OX0RFTEFZKSB7XG4gICAgICAgIF9kaXNwYXRjaGVyLnVubGlzdGVuKHRhcmdldCwgdGhpcy5ldmVudHMpO1xuICAgICAgfSBlbHNlIHtcblxuICAgICAgICAvLyBUT0RPKGRmcmVlZG1hbik6IGlzIGl0IHdvcnRoIGl0IHRvIGRpc2Nvbm5lY3QgdGhlIE1PP1xuICAgICAgfVxuICAgIH0sXG4gICAgZWxlbWVudEFkZGVkOiBmdW5jdGlvbihlbCkge1xuICAgICAgdmFyIGEgPSBlbC5nZXRBdHRyaWJ1dGUoQVRUUklCKTtcbiAgICAgIHZhciBzdCA9IHRoaXMudG91Y2hBY3Rpb25Ub1Njcm9sbFR5cGUoYSk7XG4gICAgICBpZiAoc3QpIHtcbiAgICAgICAgZWwuX3Njcm9sbFR5cGUgPSBzdDtcbiAgICAgICAgX2Rpc3BhdGNoZXIubGlzdGVuKGVsLCB0aGlzLmV2ZW50cyk7XG5cbiAgICAgICAgLy8gc2V0IHRvdWNoLWFjdGlvbiBvbiBzaGFkb3dzIGFzIHdlbGxcbiAgICAgICAgYWxsU2hhZG93cyhlbCkuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgICAgICAgcy5fc2Nyb2xsVHlwZSA9IHN0O1xuICAgICAgICAgIF9kaXNwYXRjaGVyLmxpc3RlbihzLCB0aGlzLmV2ZW50cyk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZWxlbWVudFJlbW92ZWQ6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICBlbC5fc2Nyb2xsVHlwZSA9IHVuZGVmaW5lZDtcbiAgICAgIF9kaXNwYXRjaGVyLnVubGlzdGVuKGVsLCB0aGlzLmV2ZW50cyk7XG5cbiAgICAgIC8vIHJlbW92ZSB0b3VjaC1hY3Rpb24gZnJvbSBzaGFkb3dcbiAgICAgIGFsbFNoYWRvd3MoZWwpLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgICBzLl9zY3JvbGxUeXBlID0gdW5kZWZpbmVkO1xuICAgICAgICBfZGlzcGF0Y2hlci51bmxpc3RlbihzLCB0aGlzLmV2ZW50cyk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9LFxuICAgIGVsZW1lbnRDaGFuZ2VkOiBmdW5jdGlvbihlbCwgb2xkVmFsdWUpIHtcbiAgICAgIHZhciBhID0gZWwuZ2V0QXR0cmlidXRlKEFUVFJJQik7XG4gICAgICB2YXIgc3QgPSB0aGlzLnRvdWNoQWN0aW9uVG9TY3JvbGxUeXBlKGEpO1xuICAgICAgdmFyIG9sZFN0ID0gdGhpcy50b3VjaEFjdGlvblRvU2Nyb2xsVHlwZShvbGRWYWx1ZSk7XG5cbiAgICAgIC8vIHNpbXBseSB1cGRhdGUgc2Nyb2xsVHlwZSBpZiBsaXN0ZW5lcnMgYXJlIGFscmVhZHkgZXN0YWJsaXNoZWRcbiAgICAgIGlmIChzdCAmJiBvbGRTdCkge1xuICAgICAgICBlbC5fc2Nyb2xsVHlwZSA9IHN0O1xuICAgICAgICBhbGxTaGFkb3dzKGVsKS5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgICBzLl9zY3JvbGxUeXBlID0gc3Q7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfSBlbHNlIGlmIChvbGRTdCkge1xuICAgICAgICB0aGlzLmVsZW1lbnRSZW1vdmVkKGVsKTtcbiAgICAgIH0gZWxzZSBpZiAoc3QpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50QWRkZWQoZWwpO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2Nyb2xsVHlwZXM6IHtcbiAgICAgIEVNSVRURVI6ICdub25lJyxcbiAgICAgIFhTQ1JPTExFUjogJ3Bhbi14JyxcbiAgICAgIFlTQ1JPTExFUjogJ3Bhbi15JyxcbiAgICAgIFNDUk9MTEVSOiAvXig/OnBhbi14IHBhbi15KXwoPzpwYW4teSBwYW4teCl8YXV0byQvXG4gICAgfSxcbiAgICB0b3VjaEFjdGlvblRvU2Nyb2xsVHlwZTogZnVuY3Rpb24odG91Y2hBY3Rpb24pIHtcbiAgICAgIHZhciB0ID0gdG91Y2hBY3Rpb247XG4gICAgICB2YXIgc3QgPSB0aGlzLnNjcm9sbFR5cGVzO1xuICAgICAgaWYgKHQgPT09ICdub25lJykge1xuICAgICAgICByZXR1cm4gJ25vbmUnO1xuICAgICAgfSBlbHNlIGlmICh0ID09PSBzdC5YU0NST0xMRVIpIHtcbiAgICAgICAgcmV0dXJuICdYJztcbiAgICAgIH0gZWxzZSBpZiAodCA9PT0gc3QuWVNDUk9MTEVSKSB7XG4gICAgICAgIHJldHVybiAnWSc7XG4gICAgICB9IGVsc2UgaWYgKHN0LlNDUk9MTEVSLmV4ZWModCkpIHtcbiAgICAgICAgcmV0dXJuICdYWSc7XG4gICAgICB9XG4gICAgfSxcbiAgICBQT0lOVEVSX1RZUEU6ICd0b3VjaCcsXG4gICAgZmlyc3RUb3VjaDogbnVsbCxcbiAgICBpc1ByaW1hcnlUb3VjaDogZnVuY3Rpb24oaW5Ub3VjaCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlyc3RUb3VjaCA9PT0gaW5Ub3VjaC5pZGVudGlmaWVyO1xuICAgIH0sXG4gICAgc2V0UHJpbWFyeVRvdWNoOiBmdW5jdGlvbihpblRvdWNoKSB7XG5cbiAgICAgIC8vIHNldCBwcmltYXJ5IHRvdWNoIGlmIHRoZXJlIG5vIHBvaW50ZXJzLCBvciB0aGUgb25seSBwb2ludGVyIGlzIHRoZSBtb3VzZVxuICAgICAgaWYgKHRvdWNoX19wb2ludGVybWFwLnNpemUgPT09IDAgfHwgKHRvdWNoX19wb2ludGVybWFwLnNpemUgPT09IDEgJiYgdG91Y2hfX3BvaW50ZXJtYXAuaGFzKDEpKSkge1xuICAgICAgICB0aGlzLmZpcnN0VG91Y2ggPSBpblRvdWNoLmlkZW50aWZpZXI7XG4gICAgICAgIHRoaXMuZmlyc3RYWSA9IHsgWDogaW5Ub3VjaC5jbGllbnRYLCBZOiBpblRvdWNoLmNsaWVudFkgfTtcbiAgICAgICAgdGhpcy5zY3JvbGxpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jYW5jZWxSZXNldENsaWNrQ291bnQoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlbW92ZVByaW1hcnlQb2ludGVyOiBmdW5jdGlvbihpblBvaW50ZXIpIHtcbiAgICAgIGlmIChpblBvaW50ZXIuaXNQcmltYXJ5KSB7XG4gICAgICAgIHRoaXMuZmlyc3RUb3VjaCA9IG51bGw7XG4gICAgICAgIHRoaXMuZmlyc3RYWSA9IG51bGw7XG4gICAgICAgIHRoaXMucmVzZXRDbGlja0NvdW50KCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBjbGlja0NvdW50OiAwLFxuICAgIHJlc2V0SWQ6IG51bGwsXG4gICAgcmVzZXRDbGlja0NvdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmNsaWNrQ291bnQgPSAwO1xuICAgICAgICB0aGlzLnJlc2V0SWQgPSBudWxsO1xuICAgICAgfS5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5yZXNldElkID0gc2V0VGltZW91dChmbiwgQ0xJQ0tfQ09VTlRfVElNRU9VVCk7XG4gICAgfSxcbiAgICBjYW5jZWxSZXNldENsaWNrQ291bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMucmVzZXRJZCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5yZXNldElkKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHR5cGVUb0J1dHRvbnM6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIHZhciByZXQgPSAwO1xuICAgICAgaWYgKHR5cGUgPT09ICd0b3VjaHN0YXJ0JyB8fCB0eXBlID09PSAndG91Y2htb3ZlJykge1xuICAgICAgICByZXQgPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJldDtcbiAgICB9LFxuICAgIHRvdWNoVG9Qb2ludGVyOiBmdW5jdGlvbihpblRvdWNoKSB7XG4gICAgICB2YXIgY3RlID0gdGhpcy5jdXJyZW50VG91Y2hFdmVudDtcbiAgICAgIHZhciBlID0gX2Rpc3BhdGNoZXIuY2xvbmVFdmVudChpblRvdWNoKTtcblxuICAgICAgLy8gV2UgcmVzZXJ2ZSBwb2ludGVySWQgMSBmb3IgTW91c2UuXG4gICAgICAvLyBUb3VjaCBpZGVudGlmaWVycyBjYW4gc3RhcnQgYXQgMC5cbiAgICAgIC8vIEFkZCAyIHRvIHRoZSB0b3VjaCBpZGVudGlmaWVyIGZvciBjb21wYXRpYmlsaXR5LlxuICAgICAgdmFyIGlkID0gZS5wb2ludGVySWQgPSBpblRvdWNoLmlkZW50aWZpZXIgKyAyO1xuICAgICAgZS50YXJnZXQgPSBjYXB0dXJlSW5mb1tpZF0gfHwgZmluZFRhcmdldChlKTtcbiAgICAgIGUuYnViYmxlcyA9IHRydWU7XG4gICAgICBlLmNhbmNlbGFibGUgPSB0cnVlO1xuICAgICAgZS5kZXRhaWwgPSB0aGlzLmNsaWNrQ291bnQ7XG4gICAgICBlLmJ1dHRvbiA9IDA7XG4gICAgICBlLmJ1dHRvbnMgPSB0aGlzLnR5cGVUb0J1dHRvbnMoY3RlLnR5cGUpO1xuICAgICAgZS53aWR0aCA9IGluVG91Y2gucmFkaXVzWCB8fCBpblRvdWNoLndlYmtpdFJhZGl1c1ggfHwgMDtcbiAgICAgIGUuaGVpZ2h0ID0gaW5Ub3VjaC5yYWRpdXNZIHx8IGluVG91Y2gud2Via2l0UmFkaXVzWSB8fCAwO1xuICAgICAgZS5wcmVzc3VyZSA9IGluVG91Y2guZm9yY2UgfHwgaW5Ub3VjaC53ZWJraXRGb3JjZSB8fCAwLjU7XG4gICAgICBlLmlzUHJpbWFyeSA9IHRoaXMuaXNQcmltYXJ5VG91Y2goaW5Ub3VjaCk7XG4gICAgICBlLnBvaW50ZXJUeXBlID0gdGhpcy5QT0lOVEVSX1RZUEU7XG5cbiAgICAgIC8vIGZvcndhcmQgdG91Y2ggcHJldmVudERlZmF1bHRzXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBlLnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuc2Nyb2xsaW5nID0gZmFsc2U7XG4gICAgICAgIHNlbGYuZmlyc3RYWSA9IG51bGw7XG4gICAgICAgIGN0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfTtcbiAgICAgIHJldHVybiBlO1xuICAgIH0sXG4gICAgcHJvY2Vzc1RvdWNoZXM6IGZ1bmN0aW9uKGluRXZlbnQsIGluRnVuY3Rpb24pIHtcbiAgICAgIHZhciB0bCA9IGluRXZlbnQuY2hhbmdlZFRvdWNoZXM7XG4gICAgICB0aGlzLmN1cnJlbnRUb3VjaEV2ZW50ID0gaW5FdmVudDtcbiAgICAgIGZvciAodmFyIGkgPSAwLCB0OyBpIDwgdGwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdCA9IHRsW2ldO1xuICAgICAgICBpbkZ1bmN0aW9uLmNhbGwodGhpcywgdGhpcy50b3VjaFRvUG9pbnRlcih0KSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEZvciBzaW5nbGUgYXhpcyBzY3JvbGxlcnMsIGRldGVybWluZXMgd2hldGhlciB0aGUgZWxlbWVudCBzaG91bGQgZW1pdFxuICAgIC8vIHBvaW50ZXIgZXZlbnRzIG9yIGJlaGF2ZSBhcyBhIHNjcm9sbGVyXG4gICAgc2hvdWxkU2Nyb2xsOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAodGhpcy5maXJzdFhZKSB7XG4gICAgICAgIHZhciByZXQ7XG4gICAgICAgIHZhciBzY3JvbGxBeGlzID0gaW5FdmVudC5jdXJyZW50VGFyZ2V0Ll9zY3JvbGxUeXBlO1xuICAgICAgICBpZiAoc2Nyb2xsQXhpcyA9PT0gJ25vbmUnKSB7XG5cbiAgICAgICAgICAvLyB0aGlzIGVsZW1lbnQgaXMgYSB0b3VjaC1hY3Rpb246IG5vbmUsIHNob3VsZCBuZXZlciBzY3JvbGxcbiAgICAgICAgICByZXQgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChzY3JvbGxBeGlzID09PSAnWFknKSB7XG5cbiAgICAgICAgICAvLyB0aGlzIGVsZW1lbnQgc2hvdWxkIGFsd2F5cyBzY3JvbGxcbiAgICAgICAgICByZXQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciB0ID0gaW5FdmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcblxuICAgICAgICAgIC8vIGNoZWNrIHRoZSBpbnRlbmRlZCBzY3JvbGwgYXhpcywgYW5kIG90aGVyIGF4aXNcbiAgICAgICAgICB2YXIgYSA9IHNjcm9sbEF4aXM7XG4gICAgICAgICAgdmFyIG9hID0gc2Nyb2xsQXhpcyA9PT0gJ1knID8gJ1gnIDogJ1knO1xuICAgICAgICAgIHZhciBkYSA9IE1hdGguYWJzKHRbJ2NsaWVudCcgKyBhXSAtIHRoaXMuZmlyc3RYWVthXSk7XG4gICAgICAgICAgdmFyIGRvYSA9IE1hdGguYWJzKHRbJ2NsaWVudCcgKyBvYV0gLSB0aGlzLmZpcnN0WFlbb2FdKTtcblxuICAgICAgICAgIC8vIGlmIGRlbHRhIGluIHRoZSBzY3JvbGwgYXhpcyA+IGRlbHRhIG90aGVyIGF4aXMsIHNjcm9sbCBpbnN0ZWFkIG9mXG4gICAgICAgICAgLy8gbWFraW5nIGV2ZW50c1xuICAgICAgICAgIHJldCA9IGRhID49IGRvYTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpcnN0WFkgPSBudWxsO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfVxuICAgIH0sXG4gICAgZmluZFRvdWNoOiBmdW5jdGlvbihpblRMLCBpbklkKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGluVEwubGVuZ3RoLCB0OyBpIDwgbCAmJiAodCA9IGluVExbaV0pOyBpKyspIHtcbiAgICAgICAgaWYgKHQuaWRlbnRpZmllciA9PT0gaW5JZCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEluIHNvbWUgaW5zdGFuY2VzLCBhIHRvdWNoc3RhcnQgY2FuIGhhcHBlbiB3aXRob3V0IGEgdG91Y2hlbmQuIFRoaXNcbiAgICAvLyBsZWF2ZXMgdGhlIHBvaW50ZXJtYXAgaW4gYSBicm9rZW4gc3RhdGUuXG4gICAgLy8gVGhlcmVmb3JlLCBvbiBldmVyeSB0b3VjaHN0YXJ0LCB3ZSByZW1vdmUgdGhlIHRvdWNoZXMgdGhhdCBkaWQgbm90IGZpcmUgYVxuICAgIC8vIHRvdWNoZW5kIGV2ZW50LlxuICAgIC8vIFRvIGtlZXAgc3RhdGUgZ2xvYmFsbHkgY29uc2lzdGVudCwgd2UgZmlyZSBhXG4gICAgLy8gcG9pbnRlcmNhbmNlbCBmb3IgdGhpcyBcImFiYW5kb25lZFwiIHRvdWNoXG4gICAgdmFjdXVtVG91Y2hlczogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIHRsID0gaW5FdmVudC50b3VjaGVzO1xuXG4gICAgICAvLyBwb2ludGVybWFwLnNpemUgc2hvdWxkIGJlIDwgdGwubGVuZ3RoIGhlcmUsIGFzIHRoZSB0b3VjaHN0YXJ0IGhhcyBub3RcbiAgICAgIC8vIGJlZW4gcHJvY2Vzc2VkIHlldC5cbiAgICAgIGlmICh0b3VjaF9fcG9pbnRlcm1hcC5zaXplID49IHRsLmxlbmd0aCkge1xuICAgICAgICB2YXIgZCA9IFtdO1xuICAgICAgICB0b3VjaF9fcG9pbnRlcm1hcC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcblxuICAgICAgICAgIC8vIE5ldmVyIHJlbW92ZSBwb2ludGVySWQgPT0gMSwgd2hpY2ggaXMgbW91c2UuXG4gICAgICAgICAgLy8gVG91Y2ggaWRlbnRpZmllcnMgYXJlIDIgc21hbGxlciB0aGFuIHRoZWlyIHBvaW50ZXJJZCwgd2hpY2ggaXMgdGhlXG4gICAgICAgICAgLy8gaW5kZXggaW4gcG9pbnRlcm1hcC5cbiAgICAgICAgICBpZiAoa2V5ICE9PSAxICYmICF0aGlzLmZpbmRUb3VjaCh0bCwga2V5IC0gMikpIHtcbiAgICAgICAgICAgIHZhciBwID0gdmFsdWUub3V0O1xuICAgICAgICAgICAgZC5wdXNoKHApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIGQuZm9yRWFjaCh0aGlzLmNhbmNlbE91dCwgdGhpcyk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0b3VjaHN0YXJ0OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB0aGlzLnZhY3V1bVRvdWNoZXMoaW5FdmVudCk7XG4gICAgICB0aGlzLnNldFByaW1hcnlUb3VjaChpbkV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdKTtcbiAgICAgIHRoaXMuZGVkdXBTeW50aE1vdXNlKGluRXZlbnQpO1xuICAgICAgaWYgKCF0aGlzLnNjcm9sbGluZykge1xuICAgICAgICB0aGlzLmNsaWNrQ291bnQrKztcbiAgICAgICAgdGhpcy5wcm9jZXNzVG91Y2hlcyhpbkV2ZW50LCB0aGlzLm92ZXJEb3duKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG92ZXJEb3duOiBmdW5jdGlvbihpblBvaW50ZXIpIHtcbiAgICAgIHRvdWNoX19wb2ludGVybWFwLnNldChpblBvaW50ZXIucG9pbnRlcklkLCB7XG4gICAgICAgIHRhcmdldDogaW5Qb2ludGVyLnRhcmdldCxcbiAgICAgICAgb3V0OiBpblBvaW50ZXIsXG4gICAgICAgIG91dFRhcmdldDogaW5Qb2ludGVyLnRhcmdldFxuICAgICAgfSk7XG4gICAgICBfZGlzcGF0Y2hlci5vdmVyKGluUG9pbnRlcik7XG4gICAgICBfZGlzcGF0Y2hlci5lbnRlcihpblBvaW50ZXIpO1xuICAgICAgX2Rpc3BhdGNoZXIuZG93bihpblBvaW50ZXIpO1xuICAgIH0sXG4gICAgdG91Y2htb3ZlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuc2Nyb2xsaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLnNob3VsZFNjcm9sbChpbkV2ZW50KSkge1xuICAgICAgICAgIHRoaXMuc2Nyb2xsaW5nID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLnRvdWNoY2FuY2VsKGluRXZlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB0aGlzLnByb2Nlc3NUb3VjaGVzKGluRXZlbnQsIHRoaXMubW92ZU92ZXJPdXQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBtb3ZlT3Zlck91dDogZnVuY3Rpb24oaW5Qb2ludGVyKSB7XG4gICAgICB2YXIgZXZlbnQgPSBpblBvaW50ZXI7XG4gICAgICB2YXIgcG9pbnRlciA9IHRvdWNoX19wb2ludGVybWFwLmdldChldmVudC5wb2ludGVySWQpO1xuXG4gICAgICAvLyBhIGZpbmdlciBkcmlmdGVkIG9mZiB0aGUgc2NyZWVuLCBpZ25vcmUgaXRcbiAgICAgIGlmICghcG9pbnRlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgb3V0RXZlbnQgPSBwb2ludGVyLm91dDtcbiAgICAgIHZhciBvdXRUYXJnZXQgPSBwb2ludGVyLm91dFRhcmdldDtcbiAgICAgIF9kaXNwYXRjaGVyLm1vdmUoZXZlbnQpO1xuICAgICAgaWYgKG91dEV2ZW50ICYmIG91dFRhcmdldCAhPT0gZXZlbnQudGFyZ2V0KSB7XG4gICAgICAgIG91dEV2ZW50LnJlbGF0ZWRUYXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGV2ZW50LnJlbGF0ZWRUYXJnZXQgPSBvdXRUYXJnZXQ7XG5cbiAgICAgICAgLy8gcmVjb3ZlciBmcm9tIHJldGFyZ2V0aW5nIGJ5IHNoYWRvd1xuICAgICAgICBvdXRFdmVudC50YXJnZXQgPSBvdXRUYXJnZXQ7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQpIHtcbiAgICAgICAgICBfZGlzcGF0Y2hlci5sZWF2ZU91dChvdXRFdmVudCk7XG4gICAgICAgICAgX2Rpc3BhdGNoZXIuZW50ZXJPdmVyKGV2ZW50KTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgIC8vIGNsZWFuIHVwIGNhc2Ugd2hlbiBmaW5nZXIgbGVhdmVzIHRoZSBzY3JlZW5cbiAgICAgICAgICBldmVudC50YXJnZXQgPSBvdXRUYXJnZXQ7XG4gICAgICAgICAgZXZlbnQucmVsYXRlZFRhcmdldCA9IG51bGw7XG4gICAgICAgICAgdGhpcy5jYW5jZWxPdXQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwb2ludGVyLm91dCA9IGV2ZW50O1xuICAgICAgcG9pbnRlci5vdXRUYXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgfSxcbiAgICB0b3VjaGVuZDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdGhpcy5kZWR1cFN5bnRoTW91c2UoaW5FdmVudCk7XG4gICAgICB0aGlzLnByb2Nlc3NUb3VjaGVzKGluRXZlbnQsIHRoaXMudXBPdXQpO1xuICAgIH0sXG4gICAgdXBPdXQ6IGZ1bmN0aW9uKGluUG9pbnRlcikge1xuICAgICAgaWYgKCF0aGlzLnNjcm9sbGluZykge1xuICAgICAgICBfZGlzcGF0Y2hlci51cChpblBvaW50ZXIpO1xuICAgICAgICBfZGlzcGF0Y2hlci5vdXQoaW5Qb2ludGVyKTtcbiAgICAgICAgX2Rpc3BhdGNoZXIubGVhdmUoaW5Qb2ludGVyKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2xlYW5VcFBvaW50ZXIoaW5Qb2ludGVyKTtcbiAgICB9LFxuICAgIHRvdWNoY2FuY2VsOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB0aGlzLnByb2Nlc3NUb3VjaGVzKGluRXZlbnQsIHRoaXMuY2FuY2VsT3V0KTtcbiAgICB9LFxuICAgIGNhbmNlbE91dDogZnVuY3Rpb24oaW5Qb2ludGVyKSB7XG4gICAgICBfZGlzcGF0Y2hlci5jYW5jZWwoaW5Qb2ludGVyKTtcbiAgICAgIF9kaXNwYXRjaGVyLm91dChpblBvaW50ZXIpO1xuICAgICAgX2Rpc3BhdGNoZXIubGVhdmUoaW5Qb2ludGVyKTtcbiAgICAgIHRoaXMuY2xlYW5VcFBvaW50ZXIoaW5Qb2ludGVyKTtcbiAgICB9LFxuICAgIGNsZWFuVXBQb2ludGVyOiBmdW5jdGlvbihpblBvaW50ZXIpIHtcbiAgICAgIHRvdWNoX19wb2ludGVybWFwLmRlbGV0ZShpblBvaW50ZXIucG9pbnRlcklkKTtcbiAgICAgIHRoaXMucmVtb3ZlUHJpbWFyeVBvaW50ZXIoaW5Qb2ludGVyKTtcbiAgICB9LFxuXG4gICAgLy8gcHJldmVudCBzeW50aCBtb3VzZSBldmVudHMgZnJvbSBjcmVhdGluZyBwb2ludGVyIGV2ZW50c1xuICAgIGRlZHVwU3ludGhNb3VzZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGx0cyA9IG1vdXNlLmxhc3RUb3VjaGVzO1xuICAgICAgdmFyIHQgPSBpbkV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuXG4gICAgICAvLyBvbmx5IHRoZSBwcmltYXJ5IGZpbmdlciB3aWxsIHN5bnRoIG1vdXNlIGV2ZW50c1xuICAgICAgaWYgKHRoaXMuaXNQcmltYXJ5VG91Y2godCkpIHtcblxuICAgICAgICAvLyByZW1lbWJlciB4L3kgb2YgbGFzdCB0b3VjaFxuICAgICAgICB2YXIgbHQgPSB7IHg6IHQuY2xpZW50WCwgeTogdC5jbGllbnRZIH07XG4gICAgICAgIGx0cy5wdXNoKGx0KTtcbiAgICAgICAgdmFyIGZuID0gKGZ1bmN0aW9uKGx0cywgbHQpIHtcbiAgICAgICAgICB2YXIgaSA9IGx0cy5pbmRleE9mKGx0KTtcbiAgICAgICAgICBpZiAoaSA+IC0xKSB7XG4gICAgICAgICAgICBsdHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZChudWxsLCBsdHMsIGx0KTtcbiAgICAgICAgc2V0VGltZW91dChmbiwgREVEVVBfVElNRU9VVCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGlmICghSEFTX1RPVUNIX0FDVElPTl9ERUxBWSkge1xuICAgIElOU1RBTExFUiA9IG5ldyBpbnN0YWxsZXIodG91Y2hFdmVudHMuZWxlbWVudEFkZGVkLCB0b3VjaEV2ZW50cy5lbGVtZW50UmVtb3ZlZCxcbiAgICAgIHRvdWNoRXZlbnRzLmVsZW1lbnRDaGFuZ2VkLCB0b3VjaEV2ZW50cyk7XG4gIH1cblxuICB2YXIgdG91Y2ggPSB0b3VjaEV2ZW50cztcblxuICB2YXIgbXNfX3BvaW50ZXJtYXAgPSBfZGlzcGF0Y2hlci5wb2ludGVybWFwO1xuICB2YXIgSEFTX0JJVE1BUF9UWVBFID0gd2luZG93Lk1TUG9pbnRlckV2ZW50ICYmXG4gICAgdHlwZW9mIHdpbmRvdy5NU1BvaW50ZXJFdmVudC5NU1BPSU5URVJfVFlQRV9NT1VTRSA9PT0gJ251bWJlcic7XG4gIHZhciBtc0V2ZW50cyA9IHtcbiAgICBldmVudHM6IFtcbiAgICAgICdNU1BvaW50ZXJEb3duJyxcbiAgICAgICdNU1BvaW50ZXJNb3ZlJyxcbiAgICAgICdNU1BvaW50ZXJVcCcsXG4gICAgICAnTVNQb2ludGVyT3V0JyxcbiAgICAgICdNU1BvaW50ZXJPdmVyJyxcbiAgICAgICdNU1BvaW50ZXJDYW5jZWwnLFxuICAgICAgJ01TR290UG9pbnRlckNhcHR1cmUnLFxuICAgICAgJ01TTG9zdFBvaW50ZXJDYXB0dXJlJ1xuICAgIF0sXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgX2Rpc3BhdGNoZXIubGlzdGVuKHRhcmdldCwgdGhpcy5ldmVudHMpO1xuICAgIH0sXG4gICAgdW5yZWdpc3RlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBfZGlzcGF0Y2hlci51bmxpc3Rlbih0YXJnZXQsIHRoaXMuZXZlbnRzKTtcbiAgICB9LFxuICAgIFBPSU5URVJfVFlQRVM6IFtcbiAgICAgICcnLFxuICAgICAgJ3VuYXZhaWxhYmxlJyxcbiAgICAgICd0b3VjaCcsXG4gICAgICAncGVuJyxcbiAgICAgICdtb3VzZSdcbiAgICBdLFxuICAgIHByZXBhcmVFdmVudDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSBpbkV2ZW50O1xuICAgICAgaWYgKEhBU19CSVRNQVBfVFlQRSkge1xuICAgICAgICBlID0gX2Rpc3BhdGNoZXIuY2xvbmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgZS5wb2ludGVyVHlwZSA9IHRoaXMuUE9JTlRFUl9UWVBFU1tpbkV2ZW50LnBvaW50ZXJUeXBlXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlO1xuICAgIH0sXG4gICAgY2xlYW51cDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIG1zX19wb2ludGVybWFwLmRlbGV0ZShpZCk7XG4gICAgfSxcbiAgICBNU1BvaW50ZXJEb3duOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBtc19fcG9pbnRlcm1hcC5zZXQoaW5FdmVudC5wb2ludGVySWQsIGluRXZlbnQpO1xuICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLmRvd24oZSk7XG4gICAgfSxcbiAgICBNU1BvaW50ZXJNb3ZlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgX2Rpc3BhdGNoZXIubW92ZShlKTtcbiAgICB9LFxuICAgIE1TUG9pbnRlclVwOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgX2Rpc3BhdGNoZXIudXAoZSk7XG4gICAgICB0aGlzLmNsZWFudXAoaW5FdmVudC5wb2ludGVySWQpO1xuICAgIH0sXG4gICAgTVNQb2ludGVyT3V0OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgX2Rpc3BhdGNoZXIubGVhdmVPdXQoZSk7XG4gICAgfSxcbiAgICBNU1BvaW50ZXJPdmVyOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgX2Rpc3BhdGNoZXIuZW50ZXJPdmVyKGUpO1xuICAgIH0sXG4gICAgTVNQb2ludGVyQ2FuY2VsOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgX2Rpc3BhdGNoZXIuY2FuY2VsKGUpO1xuICAgICAgdGhpcy5jbGVhbnVwKGluRXZlbnQucG9pbnRlcklkKTtcbiAgICB9LFxuICAgIE1TTG9zdFBvaW50ZXJDYXB0dXJlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IF9kaXNwYXRjaGVyLm1ha2VFdmVudCgnbG9zdHBvaW50ZXJjYXB0dXJlJywgaW5FdmVudCk7XG4gICAgICBfZGlzcGF0Y2hlci5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH0sXG4gICAgTVNHb3RQb2ludGVyQ2FwdHVyZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSBfZGlzcGF0Y2hlci5tYWtlRXZlbnQoJ2dvdHBvaW50ZXJjYXB0dXJlJywgaW5FdmVudCk7XG4gICAgICBfZGlzcGF0Y2hlci5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgbXMgPSBtc0V2ZW50cztcblxuICBmdW5jdGlvbiBwbGF0Zm9ybV9ldmVudHNfX2FwcGx5UG9seWZpbGwoKSB7XG5cbiAgICAvLyBvbmx5IGFjdGl2YXRlIGlmIHRoaXMgcGxhdGZvcm0gZG9lcyBub3QgaGF2ZSBwb2ludGVyIGV2ZW50c1xuICAgIGlmICghd2luZG93LlBvaW50ZXJFdmVudCkge1xuICAgICAgd2luZG93LlBvaW50ZXJFdmVudCA9IF9Qb2ludGVyRXZlbnQ7XG5cbiAgICAgIGlmICh3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQpIHtcbiAgICAgICAgdmFyIHRwID0gd2luZG93Lm5hdmlnYXRvci5tc01heFRvdWNoUG9pbnRzO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93Lm5hdmlnYXRvciwgJ21heFRvdWNoUG9pbnRzJywge1xuICAgICAgICAgIHZhbHVlOiB0cCxcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBfZGlzcGF0Y2hlci5yZWdpc3RlclNvdXJjZSgnbXMnLCBtcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfZGlzcGF0Y2hlci5yZWdpc3RlclNvdXJjZSgnbW91c2UnLCBtb3VzZSk7XG4gICAgICAgIGlmICh3aW5kb3cub250b3VjaHN0YXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBfZGlzcGF0Y2hlci5yZWdpc3RlclNvdXJjZSgndG91Y2gnLCB0b3VjaCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgX2Rpc3BhdGNoZXIucmVnaXN0ZXIoZG9jdW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBuID0gd2luZG93Lm5hdmlnYXRvcjtcbiAgdmFyIHMsIHI7XG4gIGZ1bmN0aW9uIGFzc2VydERvd24oaWQpIHtcbiAgICBpZiAoIV9kaXNwYXRjaGVyLnBvaW50ZXJtYXAuaGFzKGlkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkUG9pbnRlcklkJyk7XG4gICAgfVxuICB9XG4gIGlmIChuLm1zUG9pbnRlckVuYWJsZWQpIHtcbiAgICBzID0gZnVuY3Rpb24ocG9pbnRlcklkKSB7XG4gICAgICBhc3NlcnREb3duKHBvaW50ZXJJZCk7XG4gICAgICB0aGlzLm1zU2V0UG9pbnRlckNhcHR1cmUocG9pbnRlcklkKTtcbiAgICB9O1xuICAgIHIgPSBmdW5jdGlvbihwb2ludGVySWQpIHtcbiAgICAgIGFzc2VydERvd24ocG9pbnRlcklkKTtcbiAgICAgIHRoaXMubXNSZWxlYXNlUG9pbnRlckNhcHR1cmUocG9pbnRlcklkKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHMgPSBmdW5jdGlvbiBzZXRQb2ludGVyQ2FwdHVyZShwb2ludGVySWQpIHtcbiAgICAgIGFzc2VydERvd24ocG9pbnRlcklkKTtcbiAgICAgIF9kaXNwYXRjaGVyLnNldENhcHR1cmUocG9pbnRlcklkLCB0aGlzKTtcbiAgICB9O1xuICAgIHIgPSBmdW5jdGlvbiByZWxlYXNlUG9pbnRlckNhcHR1cmUocG9pbnRlcklkKSB7XG4gICAgICBhc3NlcnREb3duKHBvaW50ZXJJZCk7XG4gICAgICBfZGlzcGF0Y2hlci5yZWxlYXNlQ2FwdHVyZShwb2ludGVySWQsIHRoaXMpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBfY2FwdHVyZV9fYXBwbHlQb2x5ZmlsbCgpIHtcbiAgICBpZiAod2luZG93LkVsZW1lbnQgJiYgIUVsZW1lbnQucHJvdG90eXBlLnNldFBvaW50ZXJDYXB0dXJlKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhFbGVtZW50LnByb3RvdHlwZSwge1xuICAgICAgICAnc2V0UG9pbnRlckNhcHR1cmUnOiB7XG4gICAgICAgICAgdmFsdWU6IHNcbiAgICAgICAgfSxcbiAgICAgICAgJ3JlbGVhc2VQb2ludGVyQ2FwdHVyZSc6IHtcbiAgICAgICAgICB2YWx1ZTogclxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBhcHBseUF0dHJpYnV0ZVN0eWxlcygpO1xuICBwbGF0Zm9ybV9ldmVudHNfX2FwcGx5UG9seWZpbGwoKTtcbiAgX2NhcHR1cmVfX2FwcGx5UG9seWZpbGwoKTtcblxuICB2YXIgcG9pbnRlcmV2ZW50cyA9IHtcbiAgICBkaXNwYXRjaGVyOiBfZGlzcGF0Y2hlcixcbiAgICBJbnN0YWxsZXI6IGluc3RhbGxlcixcbiAgICBQb2ludGVyRXZlbnQ6IF9Qb2ludGVyRXZlbnQsXG4gICAgUG9pbnRlck1hcDogX3BvaW50ZXJtYXAsXG4gICAgdGFyZ2V0RmluZGluZzogdGFyZ2V0aW5nXG4gIH07XG5cbiAgcmV0dXJuIHBvaW50ZXJldmVudHM7XG5cbn0pKTsiXX0=
