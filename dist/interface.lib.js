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

},{"./domWidget":4,"./utilities":11,"./widgetLabel":13}],3:[function(require,module,exports){
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

},{"./widget":12}],4:[function(require,module,exports){
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

},{"./utilities":11,"./widget":12}],5:[function(require,module,exports){
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
exports.Knob = exports.Communication = exports.Menu = exports.Button = exports.Slider = exports.Panel = undefined;

var _panel = require('./panel');

var _panel2 = _interopRequireDefault(_panel);

var _slider = require('./slider');

var _slider2 = _interopRequireDefault(_slider);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Panel = _panel2.default;
exports.Slider = _slider2.default;
exports.Button = _button2.default;
exports.Menu = _menu2.default;
exports.Communication = _communication2.default;
exports.Knob = _knob2.default; // Everything we need to include goes here and is fed to browserify in the gulpfile.js

},{"./button":1,"./communication":3,"./knob":7,"./menu":8,"./panel":9,"./slider":10,"pepjs":14}],7:[function(require,module,exports){
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

},{"./canvasWidget.js":2}],8:[function(require,module,exports){
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

},{"./domWidget.js":4}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{"./canvasWidget.js":2}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Utilities = {
  getMode: function getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse';
  }
};

exports.default = Utilities;

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _filters = require('./filters');

var _filters2 = _interopRequireDefault(_filters);

var _communication = require('./communication.js');

var _communication2 = _interopRequireDefault(_communication);

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


  /**
   * Calculates output of widget by running .__value property through filter chain.
   * The result is stored in the .value property of the widget, which is then
   * returned.
   * @memberof Widget
   * @instance
   */
  output: function output() {
    var value = this.__value,
        newValueGenerated = false,
        lastValue = this.value;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.__prefilters[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
      for (var _iterator2 = this.filters[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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
      for (var _iterator3 = this.__postfilters[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
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

    this.value = value;

    if (this.target !== null) this.transmit(this.value);

    if (this.__value !== this.__prevValue) {
      newValueGenerated = true;

      if (this.onvaluechange !== null) this.onvaluechange(this.value, lastValue);
    }

    this.__prevValue = this.__value;
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
    if (this.target === 'osc') {
      _communication2.default.OSC.send(this.address, this.value);
    }
  }
};

exports.default = Widget;

},{"./communication.js":3,"./filters":5}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idXR0b24uanMiLCJqcy9jYW52YXNXaWRnZXQuanMiLCJqcy9jb21tdW5pY2F0aW9uLmpzIiwianMvZG9tV2lkZ2V0LmpzIiwianMvZmlsdGVycy5qcyIsImpzL2luZGV4LmpzIiwianMva25vYi5qcyIsImpzL21lbnUuanMiLCJqcy9wYW5lbC5qcyIsImpzL3NsaWRlci5qcyIsImpzL3V0aWxpdGllcy5qcyIsImpzL3dpZGdldC5qcyIsImpzL3dpZGdldExhYmVsLmpzIiwibm9kZV9tb2R1bGVzL3BlcGpzL2Rpc3QvcGVwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7Ozs7OztBQVdBLElBQUksU0FBUyxPQUFPLE1BQVAsd0JBQWI7O0FBRUEsT0FBTyxNQUFQLENBQWUsTUFBZixFQUF1Qjs7Ozs7Ozs7Ozs7QUFXckIsWUFBVTtBQUNSLGFBQVEsQ0FEQTtBQUVSLFdBQU0sQ0FGRTtBQUdSLFlBQVEsS0FIQTs7Ozs7Ozs7O0FBWVIsV0FBUTtBQVpBLEdBWFc7Ozs7Ozs7OztBQWlDckIsUUFqQ3FCLGtCQWlDYixLQWpDYSxFQWlDTDtBQUNkLFFBQUksU0FBUyxPQUFPLE1BQVAsQ0FBZSxJQUFmLENBQWI7O0FBRUEsMkJBQWEsTUFBYixDQUFvQixJQUFwQixDQUEwQixNQUExQjs7QUFFQSxXQUFPLE1BQVAsQ0FBZSxNQUFmLEVBQXVCLE9BQU8sUUFBOUIsRUFBd0MsS0FBeEM7O0FBRUEsUUFBSSxNQUFNLEtBQVYsRUFBa0IsT0FBTyxPQUFQLEdBQWlCLE1BQU0sS0FBdkI7O0FBRWxCLFdBQU8sTUFBUDtBQUNELEdBM0NvQjs7Ozs7Ozs7QUFrRHJCLE1BbERxQixrQkFrRGQ7QUFDTCxTQUFLLEdBQUwsQ0FBUyxTQUFULEdBQXVCLEtBQUssT0FBTCxLQUFpQixDQUFqQixHQUFxQixLQUFLLElBQTFCLEdBQWlDLEtBQUssVUFBN0Q7QUFD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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBDYW52YXNXaWRnZXQgZnJvbSAnLi9jYW52YXNXaWRnZXQnXG5cbi8qKlxuICogQSBCdXR0b24gd2l0aCB0aHJlZSBkaWZmZXJlbnQgc3R5bGVzOiAnbW9tZW50YXJ5JyB0cmlnZ2VycyBhIGZsYXNoIGFuZCBpbnN0YW5lb3VzIG91dHB1dCwgXG4gKiAnaG9sZCcgb3V0cHV0cyB0aGUgYnV0dG9ucyBtYXhpbXVtIHZhbHVlIHVudGlsIGl0IGlzIHJlbGVhc2VkLCBhbmQgJ3RvZ2dsZScgYWx0ZXJuYXRlcyBcbiAqIGJldHdlZW4gb3V0cHV0dGluZyBtYXhpbXVtIGFuZCBtaW5pbXVtIHZhbHVlcyBvbiBwcmVzcy4gXG4gKiBcbiAqIEBtb2R1bGUgQnV0dG9uXG4gKiBAYXVnbWVudHMgQ2FudmFzV2lkZ2V0XG4gKi8gXG5cbmxldCBCdXR0b24gPSBPYmplY3QuY3JlYXRlKCBDYW52YXNXaWRnZXQgKVxuXG5PYmplY3QuYXNzaWduKCBCdXR0b24sIHtcblxuICAvKiogQGxlbmRzIEJ1dHRvbi5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIEJ1dHRvbiBpbnN0YW5jZXMuXG4gICAqIERlZmF1bHRzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHVzZXItZGVmaW5lZCBwcm9wZXJ0aWVzIHBhc3NlZCB0b1xuICAgKiBjb25zdHJ1dG9yLlxuICAgKiBAbWVtYmVyb2YgQnV0dG9uXG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBfX3ZhbHVlOjAsXG4gICAgdmFsdWU6MCxcbiAgICBhY3RpdmU6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogVGhlIHN0eWxlIHByb3BlcnR5IGNhbiBiZSAnbW9tZW50YXJ5JywgJ2hvbGQnLCBvciAndG9nZ2xlJy4gVGhpc1xuICAgICAqIGRldGVybWluZXMgdGhlIGludGVyYWN0aW9uIG9mIHRoZSBCdXR0b24gaW5zdGFuY2UuXG4gICAgICogQG1lbWJlcm9mIEJ1dHRvblxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgc3R5bGU6ICAndG9nZ2xlJ1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgQnV0dG9uIGluc3RhbmNlLlxuICAgKiBAbWVtYmVyb2YgQnV0dG9uXG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBhIEJ1dHRvbiBpbnN0YW5jZSB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBidXR0b24gPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICBDYW52YXNXaWRnZXQuY3JlYXRlLmNhbGwoIGJ1dHRvbiApXG5cbiAgICBPYmplY3QuYXNzaWduKCBidXR0b24sIEJ1dHRvbi5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgaWYoIHByb3BzLnZhbHVlICkgYnV0dG9uLl9fdmFsdWUgPSBwcm9wcy52YWx1ZVxuXG4gICAgcmV0dXJuIGJ1dHRvblxuICB9LFxuXG4gIC8qKlxuICAgKiBEcmF3IHRoZSBCdXR0b24gaW50byBpdHMgY2FudmFzIGNvbnRleHQgdXNpbmcgdGhlIGN1cnJlbnQgLl9fdmFsdWUgcHJvcGVydHkgYW5kIGJ1dHRvbiBzdHlsZS5cbiAgICogQG1lbWJlcm9mIEJ1dHRvblxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGRyYXcoKSB7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlICAgPSB0aGlzLl9fdmFsdWUgPT09IDEgPyB0aGlzLmZpbGwgOiB0aGlzLmJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlXG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGhcbiAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuXG4gICAgdGhpcy5jdHguc3Ryb2tlUmVjdCggMCwwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuICB9LFxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5ldmVudHMgKSB7XG4gICAgICB0aGlzWyBrZXkgXSA9IHRoaXMuZXZlbnRzWyBrZXkgXS5iaW5kKCB0aGlzICkgXG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVyZG93bicsICB0aGlzLnBvaW50ZXJkb3duIClcbiAgfSxcblxuICBldmVudHM6IHtcbiAgICBwb2ludGVyZG93biggZSApIHtcbiAgICAgIC8vIG9ubHkgaG9sZCBuZWVkcyB0byBsaXN0ZW4gZm9yIHBvaW50ZXJ1cCBldmVudHM7IHRvZ2dsZSBhbmQgbW9tZW50YXJ5IG9ubHkgY2FyZSBhYm91dCBwb2ludGVyZG93blxuICAgICAgaWYoIHRoaXMuc3R5bGUgPT09ICdob2xkJyApIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlXG4gICAgICAgIHRoaXMucG9pbnRlcklkID0gZS5wb2ludGVySWRcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCB0aGlzLnBvaW50ZXJ1cCApIFxuICAgICAgfVxuXG4gICAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ3RvZ2dsZScgKSB7XG4gICAgICAgIHRoaXMuX192YWx1ZSA9IHRoaXMuX192YWx1ZSA9PT0gMSA/IDAgOiAxXG4gICAgICB9ZWxzZSBpZiggdGhpcy5zdHlsZSA9PT0gJ21vbWVudGFyeScgKSB7XG4gICAgICAgIHRoaXMuX192YWx1ZSA9IDFcbiAgICAgICAgc2V0VGltZW91dCggKCk9PiB7IHRoaXMuX192YWx1ZSA9IDA7IHRoaXMuZHJhdygpIH0sIDUwIClcbiAgICAgIH1lbHNlIGlmKCB0aGlzLnN0eWxlID09PSAnaG9sZCcgKSB7XG4gICAgICAgIHRoaXMuX192YWx1ZSA9IDFcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdGhpcy5vdXRwdXQoKVxuXG4gICAgICB0aGlzLmRyYXcoKVxuICAgIH0sXG5cbiAgICBwb2ludGVydXAoIGUgKSB7XG4gICAgICBpZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICYmIHRoaXMuc3R5bGUgPT09ICdob2xkJyApIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxuICAgICAgICBcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwIClcblxuICAgICAgICB0aGlzLl9fdmFsdWUgPSAwXG4gICAgICAgIHRoaXMub3V0cHV0KClcblxuICAgICAgICB0aGlzLmRyYXcoKVxuICAgICAgfVxuICAgIH1cbiAgfVxufSlcblxuZXhwb3J0IGRlZmF1bHQgQnV0dG9uXG4iLCJpbXBvcnQgRE9NV2lkZ2V0IGZyb20gJy4vZG9tV2lkZ2V0J1xuaW1wb3J0IFV0aWxpdGllcyBmcm9tICcuL3V0aWxpdGllcydcbmltcG9ydCBXaWRnZXRMYWJlbCBmcm9tICcuL3dpZGdldExhYmVsJ1xuXG4vKipcbiAqIENhbnZhc1dpZGdldCBpcyB0aGUgYmFzZSBjbGFzcyBmb3Igd2lkZ2V0cyB0aGF0IHVzZSBIVE1MIGNhbnZhcyBlbGVtZW50cy5cbiAqIEBtb2R1bGUgQ2FudmFzV2lkZ2V0XG4gKiBAYXVnbWVudHMgRE9NV2lkZ2V0XG4gKi8gXG5cbmxldCBDYW52YXNXaWRnZXQgPSBPYmplY3QuY3JlYXRlKCBET01XaWRnZXQgKVxuXG5PYmplY3QuYXNzaWduKCBDYW52YXNXaWRnZXQsIHtcbiAgLyoqIEBsZW5kcyBDYW52YXNXaWRnZXQucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgY29sb3JzIGFuZCBjYW52YXMgY29udGV4dCBwcm9wZXJ0aWVzIGZvciB1c2UgaW4gQ2FudmFzV2lkZ2V0c1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgYmFja2dyb3VuZDonIzg4OCcsXG4gICAgZmlsbDonI2FhYScsXG4gICAgc3Ryb2tlOidyZ2JhKDI1NSwyNTUsMjU1LC4zKScsXG4gICAgbGluZVdpZHRoOjQsXG4gICAgZGVmYXVsdExhYmVsOiB7XG4gICAgICB4Oi41LCB5Oi41LCBhbGlnbjonY2VudGVyJywgd2lkdGg6MSwgdGV4dDonZGVtbydcbiAgICB9LFxuICAgIHNob3VsZERpc3BsYXlWYWx1ZTpmYWxzZVxuICB9LFxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IENhbnZhc1dpZGdldCBpbnN0YW5jZVxuICAgKiBAbWVtYmVyb2YgQ2FudmFzV2lkZ2V0XG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSggcHJvcHMgKSB7XG4gICAgbGV0IHNob3VsZFVzZVRvdWNoID0gVXRpbGl0aWVzLmdldE1vZGUoKSA9PT0gJ3RvdWNoJ1xuICAgIFxuICAgIERPTVdpZGdldC5jcmVhdGUuY2FsbCggdGhpcyApXG5cbiAgICBPYmplY3QuYXNzaWduKCB0aGlzLCBDYW52YXNXaWRnZXQuZGVmYXVsdHMpXG5cbiAgICAvKipcbiAgICAgKiBTdG9yZSBhIHJlZmVyZW5jZSB0byB0aGUgY2FudmFzIDJEIGNvbnRleHQuXG4gICAgICogQG1lbWJlcm9mIENhbnZhc1dpZGdldFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEB0eXBlIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9XG4gICAgICovXG4gICAgdGhpcy5jdHggPSB0aGlzLmVsZW1lbnQuZ2V0Q29udGV4dCggJzJkJyApXG5cbiAgICB0aGlzLmFwcGx5SGFuZGxlcnMoIHNob3VsZFVzZVRvdWNoIClcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgdGhlIGNhbnZhcyBlbGVtZW50IHVzZWQgYnkgdGhlIHdpZGdldCBhbmQgc2V0XG4gICAqIHNvbWUgZGVmYXVsdCBDU1MgdmFsdWVzLlxuICAgKiBAbWVtYmVyb2YgQ2FudmFzV2lkZ2V0XG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZUVsZW1lbnQoKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApXG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoICd0b3VjaC1hY3Rpb24nLCAnbm9uZScgKVxuICAgIGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG4gICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ICA9ICdibG9jaydcbiAgICBcbiAgICByZXR1cm4gZWxlbWVudFxuICB9LFxuXG4gIGFwcGx5SGFuZGxlcnMoIHNob3VsZFVzZVRvdWNoPWZhbHNlICkge1xuICAgIGxldCBoYW5kbGVycyA9IHNob3VsZFVzZVRvdWNoID8gQ2FudmFzV2lkZ2V0LmhhbmRsZXJzLnRvdWNoIDogQ2FudmFzV2lkZ2V0LmhhbmRsZXJzLm1vdXNlXG4gICAgXG4gICAgLy8gd2lkZ2V0cyBoYXZlIGlqcyBkZWZpbmVkIGhhbmRsZXJzIHN0b3JlZCBpbiB0aGUgX2V2ZW50cyBhcnJheSxcbiAgICAvLyBhbmQgdXNlci1kZWZpbmVkIGV2ZW50cyBzdG9yZWQgd2l0aCAnb24nIHByZWZpeGVzIChlLmcuIG9uY2xpY2ssIG9ubW91c2Vkb3duKVxuICAgIGZvciggbGV0IGhhbmRsZXJOYW1lIG9mIGhhbmRsZXJzICkge1xuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoIGhhbmRsZXJOYW1lLCBldmVudCA9PiB7XG4gICAgICAgIGlmKCB0eXBlb2YgdGhpc1sgJ29uJyArIGhhbmRsZXJOYW1lIF0gID09PSAnZnVuY3Rpb24nICApIHRoaXNbICdvbicgKyBoYW5kbGVyTmFtZSBdKCBldmVudCApXG4gICAgICB9KVxuICAgIH1cblxuICB9LFxuXG4gIGhhbmRsZXJzOiB7XG4gICAgbW91c2U6IFtcbiAgICAgICdtb3VzZXVwJyxcbiAgICAgICdtb3VzZW1vdmUnLFxuICAgICAgJ21vdXNlZG93bicsXG4gICAgXSxcbiAgICB0b3VjaDogW11cbiAgfSxcblxuICBhZGRMYWJlbCgpIHtcbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7IGN0eDogdGhpcy5jdHggfSwgdGhpcy5sYWJlbCB8fCB0aGlzLmRlZmF1bHRMYWJlbCApLFxuICAgICAgICBsYWJlbCA9IFdpZGdldExhYmVsLmNyZWF0ZSggcHJvcHMgKVxuXG4gICAgdGhpcy5sYWJlbCA9IGxhYmVsXG4gICAgdGhpcy5fZHJhdyA9IHRoaXMuZHJhd1xuICAgIHRoaXMuZHJhdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fZHJhdygpXG4gICAgICB0aGlzLmxhYmVsLmRyYXcoKVxuICAgIH1cbiAgfSxcblxuICBfX2FkZFRvUGFuZWwoIHBhbmVsICkge1xuICAgIHRoaXMuY29udGFpbmVyID0gcGFuZWxcblxuICAgIGlmKCB0eXBlb2YgdGhpcy5hZGRFdmVudHMgPT09ICdmdW5jdGlvbicgKSB0aGlzLmFkZEV2ZW50cygpXG5cbiAgICAvLyBjYWxsZWQgaWYgd2lkZ2V0IHVzZXMgRE9NV2lkZ2V0IGFzIHByb3RvdHlwZTsgLnBsYWNlIGluaGVyaXRlZCBmcm9tIERPTVdpZGdldFxuICAgIHRoaXMucGxhY2UoKSBcblxuICAgIGlmKCB0aGlzLmxhYmVsIHx8IHRoaXMuc2hvdWxkRGlzcGxheVZhbHVlICkgdGhpcy5hZGRMYWJlbCgpXG4gICAgaWYoIHRoaXMuc2hvdWxkRGlzcGxheVZhbHVlICkge1xuICAgICAgdGhpcy5fX3Bvc3RmaWx0ZXJzLnB1c2goICggdmFsdWUgKSA9PiB7IFxuICAgICAgICB0aGlzLmxhYmVsLnRleHQgPSB2YWx1ZS50b0ZpeGVkKCA1IClcbiAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLmRyYXcoKSAgICAgXG5cbiAgfVxufSlcblxuZXhwb3J0IGRlZmF1bHQgQ2FudmFzV2lkZ2V0XG4iLCJpbXBvcnQgV2lkZ2V0IGZyb20gJy4vd2lkZ2V0J1xuXG5sZXQgQ29tbXVuaWNhdGlvbiA9IHtcbiAgU29ja2V0IDogbnVsbCxcbiAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy5Tb2NrZXQgPSBuZXcgV2ViU29ja2V0KCB0aGlzLmdldFNlcnZlckFkZHJlc3MoKSApXG4gICAgdGhpcy5Tb2NrZXQub25tZXNzYWdlID0gdGhpcy5vbm1lc3NhZ2VcblxuICAgIGxldCBmdWxsTG9jYXRpb24gPSB3aW5kb3cubG9jYXRpb24udG9TdHJpbmcoKSxcbiAgICAgICAgbG9jYXRpb25TcGxpdCA9IGZ1bGxMb2NhdGlvbi5zcGxpdCggJy8nICksXG4gICAgICAgIGludGVyZmFjZU5hbWUgPSBsb2NhdGlvblNwbGl0WyBsb2NhdGlvblNwbGl0Lmxlbmd0aCAtIDEgXVxuICAgIFxuICAgIHRoaXMuU29ja2V0Lm9ub3BlbiA9ICgpPT4ge1xuICAgICAgdGhpcy5Tb2NrZXQuc2VuZCggSlNPTi5zdHJpbmdpZnkoeyB0eXBlOidtZXRhJywgaW50ZXJmYWNlTmFtZSwga2V5OidyZWdpc3RlcicgfSkgKVxuICAgIH1cblxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG4gIH0sXG5cbiAgZ2V0U2VydmVyQWRkcmVzcygpIHtcbiAgICBsZXQgZXhwciwgc29ja2V0SVBBbmRQb3J0LCBzb2NrZXRTdHJpbmcsIGlwLCBwb3J0XG5cbiAgICBleHByID0gL1stYS16QS1aMC05Ll0rKDooNjU1M1swLTVdfDY1NVswLTJdXFxkfDY1WzAtNF1cXGR7Mn18NlswLTRdXFxkezN9fFsxLTVdXFxkezR9fFsxLTldXFxkezAsM30pKS9cblxuICAgIHNvY2tldElQQW5kUG9ydCA9IGV4cHIuZXhlYyggd2luZG93LmxvY2F0aW9uLnRvU3RyaW5nKCkgKVsgMCBdLnNwbGl0KCAnOicgKVxuICAgIGlwID0gc29ja2V0SVBBbmRQb3J0WyAwIF1cbiAgICBwb3J0ID0gcGFyc2VJbnQoIHNvY2tldElQQW5kUG9ydFsgMSBdIClcblxuICAgIHNvY2tldFN0cmluZyA9IGB3czovLyR7aXB9OiR7cG9ydH1gXG5cbiAgICByZXR1cm4gc29ja2V0U3RyaW5nXG4gIH0sXG5cbiAgb25tZXNzYWdlKCBlICkge1xuICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZSggZS5kYXRhIClcbiAgICBpZiggZGF0YS50eXBlID09PSAnb3NjJyApIHtcbiAgICAgIENvbW11bmljYXRpb24uT1NDLl9yZWNlaXZlKCBlLmRhdGEgKTtcbiAgICB9ZWxzZSB7XG4gICAgICBpZiggQ29tbXVuaWNhdGlvbi5Tb2NrZXQucmVjZWl2ZSApIHtcbiAgICAgICAgQ29tbXVuaWNhdGlvbi5Tb2NrZXQucmVjZWl2ZSggZGF0YS5hZGRyZXNzLCBkYXRhLnBhcmFtZXRlcnMgIClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgT1NDIDoge1xuICAgIGNhbGxiYWNrczoge30sXG4gICAgb25tZXNzYWdlOiBudWxsLFxuXG4gICAgc2VuZCggYWRkcmVzcywgcGFyYW1ldGVycyApIHtcbiAgICAgIGlmKCBDb21tdW5pY2F0aW9uLlNvY2tldC5yZWFkeVN0YXRlID09PSAxICkge1xuICAgICAgICBpZiggdHlwZW9mIGFkZHJlc3MgPT09ICdzdHJpbmcnICkge1xuICAgICAgICAgIGxldCBtc2cgPSB7XG4gICAgICAgICAgICB0eXBlIDogXCJvc2NcIixcbiAgICAgICAgICAgIGFkZHJlc3MsXG4gICAgICAgICAgICAncGFyYW1ldGVycyc6IEFycmF5LmlzQXJyYXkoIHBhcmFtZXRlcnMgKSA/IHBhcmFtZXRlcnMgOiBbIHBhcmFtZXRlcnMgXSxcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBDb21tdW5pY2F0aW9uLlNvY2tldC5zZW5kKCBKU09OLnN0cmluZ2lmeSggbXNnICkgKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0aHJvdyBFcnJvciggJ0ludmFsaWQgb3NjIG1lc3NhZ2U6JywgYXJndW1lbnRzICkgICBcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIHRocm93IEVycm9yKCAnU29ja2V0IGlzIG5vdCB5ZXQgY29ubmVjdGVkOyBjYW5ub3Qgc2VuZCBPU0MgbWVzc3NhZ2VzLicgKVxuICAgICAgfVxuXG4gICAgfSxcblxuICAgIHJlY2VpdmUoIGRhdGEgKSB7XG4gICAgICBsZXQgbXNnID0gSlNPTi5wYXJzZSggZGF0YSApXG5cbiAgICAgIGlmKCBtc2cuYWRkcmVzcyBpbiB0aGlzLmNhbGxiYWNrcyApIHtcbiAgICAgICAgdGhpcy5jYWxsYmFja3NbIG1zZy5hZGRyZXNzIF0oIG1zZy5wYXJhbWV0ZXJzIClcbiAgICAgIH1lbHNle1xuICAgICAgICBmb3IoIGxldCB3aWRnZXQgb2YgV2lkZ2V0LndpZGdldHMgKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyggXCJDSEVDS1wiLCBjaGlsZC5rZXksIG1zZy5hZGRyZXNzIClcbiAgICAgICAgICBpZiggd2lkZ2V0LmtleSA9PT0gbXNnLmFkZHJlc3MgKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCBjaGlsZC5rZXksIG1zZy5wYXJhbWV0ZXJzIClcbiAgICAgICAgICAgIHdpZGdldC5zZXRWYWx1ZS5hcHBseSggd2lkZ2V0LCBtc2cucGFyYW1ldGVycyApXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgIH0gICAgXG5cbiAgICAgICAgaWYoIHRoaXMub25tZXNzYWdlICE9PSBudWxsICkgeyBcbiAgICAgICAgICB0aGlzLnJlY2VpdmUoIG1zZy5hZGRyZXNzLCBtc2cudHlwZXRhZ3MsIG1zZy5wYXJhbWV0ZXJzIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbW11bmljYXRpb25cbiIsImltcG9ydCBXaWRnZXQgZnJvbSAnLi93aWRnZXQnXG5pbXBvcnQgVXRpbGl0aWVzIGZyb20gJy4vdXRpbGl0aWVzJ1xuXG4vKipcbiAqIERPTVdpZGdldCBpcyB0aGUgYmFzZSBjbGFzcyBmb3Igd2lkZ2V0cyB0aGF0IHVzZSBIVE1MIGNhbnZhcyBlbGVtZW50cy5cbiAqIEBhdWdtZW50cyBXaWRnZXRcbiAqL1xuXG5sZXQgRE9NV2lkZ2V0ID0gT2JqZWN0LmNyZWF0ZSggV2lkZ2V0IClcblxuT2JqZWN0LmFzc2lnbiggRE9NV2lkZ2V0LCB7XG4gIC8qKiBAbGVuZHMgRE9NV2lkZ2V0LnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgRE9NV2lkZ2V0c1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgeDowLHk6MCx3aWR0aDouMjUsaGVpZ2h0Oi4yNSxcbiAgICBhdHRhY2hlZDpmYWxzZSxcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IERPTVdpZGdldCBpbnN0YW5jZVxuICAgKiBAbWVtYmVyb2YgRE9NV2lkZ2V0XG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSgpIHtcbiAgICBsZXQgc2hvdWxkVXNlVG91Y2ggPSBVdGlsaXRpZXMuZ2V0TW9kZSgpID09PSAndG91Y2gnXG4gICAgXG4gICAgV2lkZ2V0LmNyZWF0ZS5jYWxsKCB0aGlzIClcblxuICAgIE9iamVjdC5hc3NpZ24oIHRoaXMsIERPTVdpZGdldC5kZWZhdWx0cyApXG5cbiAgICAvLyBBTEwgSU5TVEFOQ0VTIE9GIERPTVdJREdFVCBNVVNUIElNUExFTUVOVCBDUkVBVEUgRUxFTUVOVFxuICAgIGlmKCB0eXBlb2YgdGhpcy5jcmVhdGVFbGVtZW50ID09PSAnZnVuY3Rpb24nICkge1xuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBET00gZWxlbWVudCB1c2VkIGJ5IHRoZSBET01XaWRnZXRcbiAgICAgICAqIEBtZW1iZXJvZiBET01XaWRnZXRcbiAgICAgICAqIEBpbnN0YW5jZVxuICAgICAgICovXG4gICAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLmNyZWF0ZUVsZW1lbnQoKVxuICAgIH1lbHNle1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnd2lkZ2V0IGluaGVyaXRpbmcgZnJvbSBET01XaWRnZXQgZG9lcyBub3QgaW1wbGVtZW50IGNyZWF0ZUVsZW1lbnQgbWV0aG9kOyB0aGlzIGlzIHJlcXVpcmVkLicgKVxuICAgIH1cbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBET00gZWxlbWVudCB0byBiZSBwbGFjZWQgaW4gYSBQYW5lbC5cbiAgICogQHZpcnR1YWxcbiAgICogQG1lbWJlcm9mIERPTVdpZGdldFxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGVFbGVtZW50KCkge1xuICAgIHRocm93IEVycm9yKCAnYWxsIHN1YmNsYXNzZXMgb2YgRE9NV2lkZ2V0IG11c3QgaW1wbGVtZW50IGNyZWF0ZUVsZW1lbnQoKScgKVxuICB9LFxuXG4gIC8qKlxuICAgKiB1c2UgQ1NTIHRvIHBvc2l0aW9uIGVsZW1lbnQgZWxlbWVudCBvZiB3aWRnZXRcbiAgICogQG1lbWJlcm9mIERPTVdpZGdldFxuICAgKi9cbiAgcGxhY2UoKSB7XG4gICAgbGV0IGNvbnRhaW5lcldpZHRoID0gdGhpcy5jb250YWluZXIuZ2V0V2lkdGgoKSxcbiAgICAgICAgY29udGFpbmVySGVpZ2h0PSB0aGlzLmNvbnRhaW5lci5nZXRIZWlnaHQoKSxcbiAgICAgICAgd2lkdGggID0gdGhpcy53aWR0aCAgPD0gMSA/IGNvbnRhaW5lcldpZHRoICAqIHRoaXMud2lkdGggOiB0aGlzLndpZHRoLFxuICAgICAgICBoZWlnaHQgPSB0aGlzLmhlaWdodCA8PSAxID8gY29udGFpbmVySGVpZ2h0ICogdGhpcy5oZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgICB4ICAgICAgPSB0aGlzLnggPCAxID8gY29udGFpbmVyV2lkdGggICogdGhpcy54IDogdGhpcy54LFxuICAgICAgICB5ICAgICAgPSB0aGlzLnkgPCAxID8gY29udGFpbmVySGVpZ2h0ICogdGhpcy55IDogdGhpcy55XG5cbiAgICBpZiggIXRoaXMuYXR0YWNoZWQgKSB7XG4gICAgICB0aGlzLmF0dGFjaGVkID0gdHJ1ZVxuICAgIH1cbiAgXG4gICAgaWYoIHRoaXMuaXNTcXVhcmUgKSB7XG4gICAgICBpZiggaGVpZ2h0ID4gd2lkdGggKSB7XG4gICAgICAgIGhlaWdodCA9IHdpZHRoXG4gICAgICB9ZWxzZXtcbiAgICAgICAgd2lkdGggPSBoZWlnaHRcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnQud2lkdGggID0gd2lkdGhcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSB3aWR0aCArICdweCdcbiAgICB0aGlzLmVsZW1lbnQuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCdcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHhcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wICA9IHlcblxuICAgIC8qKlxuICAgICAqIEJvdW5kaW5nIGJveCwgaW4gYWJzb2x1dGUgY29vcmRpbmF0ZXMsIG9mIHRoZSBET01XaWRnZXRcbiAgICAgKiBAbWVtYmVyb2YgRE9NV2lkZ2V0XG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICB0aGlzLnJlY3QgPSB0aGlzLmVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkgXG4gIH0sXG4gIFxufSlcblxuZXhwb3J0IGRlZmF1bHQgRE9NV2lkZ2V0XG4iLCJsZXQgRmlsdGVycyA9IHtcbiAgU2NhbGUoIGlubWluPTAsIGlubWF4PTEsIG91dG1pbj0tMSwgb3V0bWF4PTEgKSB7XG4gICAgbGV0IGlucmFuZ2UgID0gaW5tYXggLSBpbm1pbixcbiAgICAgICAgb3V0cmFuZ2UgPSBvdXRtYXggLSBvdXRtaW4sXG4gICAgICAgIHJhbmdlUmF0aW8gPSBvdXRyYW5nZSAvIGlucmFuZ2VcblxuICAgIHJldHVybiBpbnB1dCA9PiBvdXRtaW4gKyBpbnB1dCAqIHJhbmdlUmF0aW9cbiAgfSxcbn1cblxuZXhwb3J0IGRlZmF1bHQgRmlsdGVyc1xuIiwiLy8gRXZlcnl0aGluZyB3ZSBuZWVkIHRvIGluY2x1ZGUgZ29lcyBoZXJlIGFuZCBpcyBmZWQgdG8gYnJvd3NlcmlmeSBpbiB0aGUgZ3VscGZpbGUuanNcblxuaW1wb3J0IFBhbmVsIGZyb20gJy4vcGFuZWwnXG5pbXBvcnQgU2xpZGVyIGZyb20gJy4vc2xpZGVyJ1xuaW1wb3J0IEJ1dHRvbiBmcm9tICcuL2J1dHRvbidcbmltcG9ydCBNZW51IGZyb20gJy4vbWVudSdcbmltcG9ydCBDb21tdW5pY2F0aW9uIGZyb20gJy4vY29tbXVuaWNhdGlvbidcbmltcG9ydCBQRVAgZnJvbSAncGVwanMnXG5pbXBvcnQgS25vYiBmcm9tICcuL2tub2InXG5cbmV4cG9ydCB7XG4gIFBhbmVsLCBTbGlkZXIsIEJ1dHRvbiwgTWVudSwgQ29tbXVuaWNhdGlvbiwgS25vYlxufVxuIiwiaW1wb3J0IENhbnZhc1dpZGdldCBmcm9tICcuL2NhbnZhc1dpZGdldC5qcydcblxuLyoqXG4gKiBBIGhvcml6b250YWwgb3IgdmVydGljYWwgZmFkZXIuIFxuICogQG1vZHVsZSBLbm9iXG4gKiBAYXVnbWVudHMgQ2FudmFzV2lkZ2V0XG4gKi8gXG5cbmxldCBLbm9iID0gT2JqZWN0LmNyZWF0ZSggQ2FudmFzV2lkZ2V0ICkgXG5cbk9iamVjdC5hc3NpZ24oIEtub2IsIHtcbiAgLyoqIEBsZW5kcyBLbm9iLnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgS25vYiBpbnN0YW5jZXMuXG4gICAqIERlZmF1bHRzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHVzZXItZGVmaW5lZCBwcm9wZXJ0aWVzIHBhc3NlZCB0b1xuICAgKiBjb25zdHJ1dG9yLlxuICAgKiBAbWVtYmVyb2YgS25vYlxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgX192YWx1ZTouNSwgLy8gYWx3YXlzIDAtMSwgbm90IGZvciBlbmQtdXNlcnNcbiAgICB2YWx1ZTouNSwgICAvLyBlbmQtdXNlciB2YWx1ZSB0aGF0IG1heSBiZSBmaWx0ZXJlZFxuICAgIGFjdGl2ZTogZmFsc2UsXG4gICAga25vYkJ1ZmZlcjoyMCxcbiAgICB1c2VzUm90YXRpb246ZmFsc2UsXG4gICAgbGFzdFBvc2l0aW9uOjAsXG4gICAgaXNTcXVhcmU6dHJ1ZSxcbiAgICAvKipcbiAgICAgKiBUaGUgc3R5bGUgcHJvcGVydHkgY2FuIGJlIGVpdGhlciAnaG9yaXpvbnRhbCcgKHRoZSBkZWZhdWx0KSBvciAndmVydGljYWwnLiBUaGlzXG4gICAgICogZGV0ZXJtaW5lcyB0aGUgb3JpZW50YXRpb24gb2YgdGhlIEtub2IgaW5zdGFuY2UuXG4gICAgICogQG1lbWJlcm9mIEtub2JcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqL1xuICAgIHN0eWxlOiAgJ2hvcml6b250YWwnXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBLbm9iIGluc3RhbmNlLlxuICAgKiBAbWVtYmVyb2YgS25vYlxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXSAtIEEgZGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGluaXRpYWxpemUgS25vYiB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBrbm9iID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgLy8gYXBwbHkgV2lkZ2V0IGRlZmF1bHRzLCB0aGVuIG92ZXJ3cml0ZSAoaWYgYXBwbGljYWJsZSkgd2l0aCBLbm9iIGRlZmF1bHRzXG4gICAgQ2FudmFzV2lkZ2V0LmNyZWF0ZS5jYWxsKCBrbm9iIClcblxuICAgIC8vIC4uLmFuZCB0aGVuIGZpbmFsbHkgb3ZlcnJpZGUgd2l0aCB1c2VyIGRlZmF1bHRzXG4gICAgT2JqZWN0LmFzc2lnbigga25vYiwgS25vYi5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgLy8gc2V0IHVuZGVybHlpbmcgdmFsdWUgaWYgbmVjZXNzYXJ5Li4uIFRPRE86IGhvdyBzaG91bGQgdGhpcyBiZSBzZXQgZ2l2ZW4gbWluL21heD9cbiAgICBpZiggcHJvcHMudmFsdWUgKSBrbm9iLl9fdmFsdWUgPSBwcm9wcy52YWx1ZVxuICAgIFxuICAgIC8vIGluaGVyaXRzIGZyb20gV2lkZ2V0XG4gICAga25vYi5pbml0KClcblxuICAgIHJldHVybiBrbm9iXG4gIH0sXG5cbiAgLyoqXG4gICAqIERyYXcgdGhlIEtub2Igb250byBpdHMgY2FudmFzIGNvbnRleHQgdXNpbmcgdGhlIGN1cnJlbnQgLl9fdmFsdWUgcHJvcGVydHkuXG4gICAqIEBtZW1iZXJvZiBLbm9iXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZHJhdygpIHtcbiAgICAvLyBkcmF3IGJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgICA9IHRoaXMuY29udGFpbmVyLmJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlXG4gICAgdGhpcy5jdHgubGluZVdpZHRoICAgPSB0aGlzLmxpbmVXaWR0aFxuXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsMCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcblxuICAgIGxldCB4ID0gMCxcbiAgICAgICAgeSA9IDAsXG4gICAgICAgIHdpZHRoID0gdGhpcy5yZWN0LndpZHRoLFxuICAgICAgICBoZWlnaHQ9IHRoaXMucmVjdC5oZWlnaHQsXG4gICAgICAgIHJhZGl1cyA9IHdpZHRoIC8gMlxuICAgIFxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KCB4LCB5LCB3aWR0aCwgaGVpZ2h0IClcbiAgICAvL3RoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VcblxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuYmFja2dyb3VuZCAvLyBkcmF3IGJhY2tncm91bmQgb2Ygd2lkZ2V0IGZpcnN0XG5cbiAgICBsZXQgYW5nbGUwID0gTWF0aC5QSSAqIC42LFxuICAgICAgICBhbmdsZTEgPSBNYXRoLlBJICogLjRcblxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpXG4gICAgdGhpcy5jdHguYXJjKCB4ICsgcmFkaXVzLCB5ICsgcmFkaXVzLCByYWRpdXMgLSB0aGlzLmtub2JCdWZmZXIsICAgICAgICAgYW5nbGUwLCBhbmdsZTEsIGZhbHNlIClcbiAgICB0aGlzLmN0eC5hcmMoIHggKyByYWRpdXMsIHkgKyByYWRpdXMsIChyYWRpdXMgLSB0aGlzLmtub2JCdWZmZXIpICogLjUgLCBhbmdsZTEsIGFuZ2xlMCwgdHJ1ZSAgKVx0XHRcbiAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKVxuICAgIFxuICAgIHRoaXMuY3R4LmZpbGwoKVxuXG4gICAgbGV0IGFuZ2xlMlxuICAgIGlmKCF0aGlzLmlzSW52ZXJ0ZWQpICB7IFxuICAgICAgYW5nbGUyID0gTWF0aC5QSSAqIC42ICsgdGhpcy5fX3ZhbHVlICogMS44ICAqIE1hdGguUElcbiAgICAgIGlmKCBhbmdsZTIgPiAyICogTWF0aC5QSSkgYW5nbGUyIC09IDIgKiBNYXRoLlBJXG4gICAgfWVsc2V7XG4gICAgICBhbmdsZTIgPSBNYXRoLlBJICogKDAuNCAtICgxLjggKiB0aGlzLl9fdmFsdWUpKVxuICAgIH1cblxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpXG5cbiAgICBpZighdGhpcy5pc0ludmVydGVkKSB7XG4gICAgICB0aGlzLmN0eC5hcmMoIHggKyByYWRpdXMsIHkgKyByYWRpdXMsIHJhZGl1cyAtIHRoaXMua25vYkJ1ZmZlciwgYW5nbGUwLCBhbmdsZTIsIGZhbHNlIClcbiAgICAgIHRoaXMuY3R4LmFyYyggeCArIHJhZGl1cywgeSArIHJhZGl1cywgKHJhZGl1cyAtIHRoaXMua25vYkJ1ZmZlcikgKiAuNSwgYW5nbGUyLCBhbmdsZTAsIHRydWUgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmN0eC5hcmMoIHggKyByYWRpdXMsIHkgKyByYWRpdXMsIHJhZGl1cyAtIHRoaXMua25vYkJ1ZmZlciwgYW5nbGUxLCBhbmdsZTIgLHRydWUgKVxuICAgICAgdGhpcy5jdHguYXJjKCB4ICsgcmFkaXVzLCB5ICsgcmFkaXVzLCAocmFkaXVzIC0gdGhpcy5rbm9iQnVmZmVyKSAqIC41LCBhbmdsZTIsIGFuZ2xlMSwgZmFsc2UgKVxuICAgIH1cblxuICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpXG5cbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxcbiAgICB0aGlzLmN0eC5maWxsKClcbiAgXG4gIH0sXG5cbiAgYWRkRXZlbnRzKCkge1xuICAgIC8vIGNyZWF0ZSBldmVudCBoYW5kbGVycyBib3VuZCB0byB0aGUgY3VycmVudCBvYmplY3QsIG90aGVyd2lzZSBcbiAgICAvLyB0aGUgJ3RoaXMnIGtleXdvcmQgd2lsbCByZWZlciB0byB0aGUgd2luZG93IG9iamVjdCBpbiB0aGUgZXZlbnQgaGFuZGxlcnNcbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5ldmVudHMgKSB7XG4gICAgICB0aGlzWyBrZXkgXSA9IHRoaXMuZXZlbnRzWyBrZXkgXS5iaW5kKCB0aGlzICkgXG4gICAgfVxuXG4gICAgLy8gb25seSBsaXN0ZW4gZm9yIG1vdXNlZG93biBpbnRpYWxseTsgbW91c2Vtb3ZlIGFuZCBtb3VzZXVwIGFyZSByZWdpc3RlcmVkIG9uIG1vdXNlZG93blxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcmRvd24nLCAgdGhpcy5wb2ludGVyZG93biApXG4gIH0sXG5cbiAgZXZlbnRzOiB7XG4gICAgcG9pbnRlcmRvd24oIGUgKSB7XG4gICAgICB0aGlzLmFjdGl2ZSA9IHRydWVcbiAgICAgIHRoaXMucG9pbnRlcklkID0gZS5wb2ludGVySWRcblxuICAgICAgdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlICkgLy8gY2hhbmdlIGtub2IgdmFsdWUgb24gY2xpY2sgLyB0b3VjaGRvd25cblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSAvLyBvbmx5IGxpc3RlbiBmb3IgdXAgYW5kIG1vdmUgZXZlbnRzIGFmdGVyIHBvaW50ZXJkb3duIFxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgfSxcblxuICAgIHBvaW50ZXJ1cCggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSBcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgICB9XG4gICAgfSxcblxuICAgIHBvaW50ZXJtb3ZlKCBlICkge1xuICAgICAgaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCApIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlIClcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuICBcbiAgLyoqXG4gICAqIEdlbmVyYXRlcyBhIHZhbHVlIGJldHdlZW4gMC0xIGdpdmVuIHRoZSBjdXJyZW50IHBvaW50ZXIgcG9zaXRpb24gaW4gcmVsYXRpb25cbiAgICogdG8gdGhlIEtub2IncyBwb3NpdGlvbiwgYW5kIHRyaWdnZXJzIG91dHB1dC5cbiAgICogQGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBLbm9iXG4gICAqIEBwYXJhbSB7UG9pbnRlckV2ZW50fSBlIC0gVGhlIHBvaW50ZXIgZXZlbnQgdG8gYmUgcHJvY2Vzc2VkLlxuICAgKi9cblxuICBwcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlICkge1xuICAgIGxldCB4T2Zmc2V0ID0gZS5jbGllbnRYLCB5T2Zmc2V0ID0gZS5jbGllbnRZXG5cbiAgICBsZXQgcmFkaXVzID0gdGhpcy5yZWN0LndpZHRoIC8gMjtcbiAgICB0aGlzLmxhc3RWYWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICBpZiggIXRoaXMudXNlc1JvdGF0aW9uICkge1xuICAgICAgaWYoIHRoaXMubGFzdFBvc2l0aW9uICE9PSAtMSApIHsgXG4gICAgICAgIC8vdGhpcy5fX3ZhbHVlIC09ICggeU9mZnNldCAtIHRoaXMubGFzdFBvc2l0aW9uICkgLyAocmFkaXVzICogMik7XG4gICAgICAgIHRoaXMuX192YWx1ZSA9IDEgLSB5T2Zmc2V0IC8gdGhpcy5yZWN0LmhlaWdodFxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgdmFyIHhkaWZmID0gcmFkaXVzIC0geE9mZnNldDtcbiAgICAgIHZhciB5ZGlmZiA9IHJhZGl1cyAtIHlPZmZzZXQ7XG4gICAgICB2YXIgYW5nbGUgPSBNYXRoLlBJICsgTWF0aC5hdGFuMih5ZGlmZiwgeGRpZmYpO1xuICAgICAgdGhpcy5fX3ZhbHVlID0gICgoYW5nbGUgKyAoTWF0aC5QSSAqIDEuNSkpICUgKE1hdGguUEkgKiAyKSkgLyAoTWF0aC5QSSAqIDIpO1xuXG4gICAgICBpZih0aGlzLmxhc3RSb3RhdGlvblZhbHVlID4gLjggJiYgdGhpcy5fX3ZhbHVlIDwgLjIpIHtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gMTtcbiAgICAgIH1lbHNlIGlmKHRoaXMubGFzdFJvdGF0aW9uVmFsdWUgPCAuMiAmJiB0aGlzLl9fdmFsdWUgPiAuOCkge1xuICAgICAgICB0aGlzLl9fdmFsdWUgPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9fdmFsdWUgPiAxKSB0aGlzLl9fdmFsdWUgPSAxO1xuICAgIGlmICh0aGlzLl9fdmFsdWUgPCAwKSB0aGlzLl9fdmFsdWUgPSAwO1xuXG4gICAgdGhpcy5sYXN0Um90YXRpb25WYWx1ZSA9IHRoaXMuX192YWx1ZTtcbiAgICB0aGlzLmxhc3RQb3NpdGlvbiA9IHlPZmZzZXQ7XG5cbiAgICBsZXQgc2hvdWxkRHJhdyA9IHRoaXMub3V0cHV0KClcbiAgICBcbiAgICBpZiggc2hvdWxkRHJhdyApIHRoaXMuZHJhdygpXG4gIH0sXG5cbiAgLy9fX2FkZFRvUGFuZWwoIHBhbmVsICkge1xuICAvLyAgdGhpcy5jb250YWluZXIgPSBwYW5lbFxuXG4gIC8vICBpZiggdHlwZW9mIHRoaXMuYWRkRXZlbnRzID09PSAnZnVuY3Rpb24nICkgdGhpcy5hZGRFdmVudHMoKVxuXG4gIC8vICAvLyBjYWxsZWQgaWYgd2lkZ2V0IHVzZXMgRE9NV2lkZ2V0IGFzIHByb3RvdHlwZTsgLnBsYWNlIGluaGVyaXRlZCBmcm9tIERPTVdpZGdldFxuICAgIFxuICAvLyAgdGhpcy5wbGFjZSggdHJ1ZSApIFxuXG4gIC8vICBpZiggdGhpcy5sYWJlbCApIHRoaXMuYWRkTGFiZWwoKVxuXG4gIC8vICB0aGlzLmRyYXcoKSAgICAgXG5cbiAgLy99XG5cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gS25vYlxuIiwiaW1wb3J0IERPTVdpZGdldCBmcm9tICcuL2RvbVdpZGdldC5qcydcblxuLyoqXG4gKiBBIEhUTUwgc2VsZWN0IGVsZW1lbnQsIGZvciBwaWNraW5nIGl0ZW1zIGZyb20gYSBkcm9wLWRvd24gbWVudS4gXG4gKiBcbiAqIEBtb2R1bGUgTWVudVxuICogQGF1Z21lbnRzIERPTVdpZGdldFxuICovIFxubGV0IE1lbnUgPSBPYmplY3QuY3JlYXRlKCBET01XaWRnZXQgKSBcblxuT2JqZWN0LmFzc2lnbiggTWVudSwge1xuICAvKiogQGxlbmRzIE1lbnUucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBNZW51IGluc3RhbmNlcy5cbiAgICogRGVmYXVsdHMgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdXNlci1kZWZpbmVkIHByb3BlcnRpZXMgcGFzc2VkIHRvXG4gICAqIGNvbnN0cnV0b3IuXG4gICAqIEBtZW1iZXJvZiBNZW51XG4gICAqIEBzdGF0aWNcbiAgICovIFxuICBkZWZhdWx0czoge1xuICAgIF9fdmFsdWU6MCxcbiAgICB2YWx1ZTowLFxuICAgIGJhY2tncm91bmQ6JyMzMzMnLFxuICAgIGZpbGw6JyM3NzcnLFxuICAgIHN0cm9rZTonI2FhYScsXG4gICAgYm9yZGVyV2lkdGg6NCxcblxuICAvKipcbiAgICogVGhlIG9wdGlvbnMgYXJyYXkgc3RvcmVzIHRoZSBkaWZmZXJlbnQgcG9zc2libGUgdmFsdWVzIGZvciB0aGUgTWVudVxuICAgKiB3aWRnZXQuIFRoZXJlIGFyZSB1c2VkIHRvIGNyZWF0ZSBIVE1MIG9wdGlvbiBlbGVtZW50cyB3aGljaCBhcmUgdGhlblxuICAgKiBhdHRhY2hlZCB0byB0aGUgcHJpbWFyeSBzZWxlY3QgZWxlbWVudCB1c2VkIGJ5IHRoZSBNZW51LlxuICAgKiBAbWVtYmVyb2YgTWVudVxuICAgKiBAaW5zdGFuY2VcbiAgICogQHR5cGUge0FycmF5fVxuICAgKi8gXG4gICAgb3B0aW9uczpbXSxcbiAgICBvbnZhbHVlY2hhbmdlOm51bGxcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IE1lbnUgaW5zdGFuY2UuXG4gICAqIEBtZW1iZXJvZiBNZW51XG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBhIE1lbnUgd2l0aC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgbWVudSA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIERPTVdpZGdldC5jcmVhdGUuY2FsbCggbWVudSApXG5cbiAgICBPYmplY3QuYXNzaWduKCBtZW51LCBNZW51LmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBtZW51LmNyZWF0ZU9wdGlvbnMoKVxuXG4gICAgbWVudS5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCAoIGUgKT0+IHtcbiAgICAgIG1lbnUuX192YWx1ZSA9IGUudGFyZ2V0LnZhbHVlXG4gICAgICBtZW51Lm91dHB1dCgpXG5cbiAgICAgIGlmKCBtZW51Lm9udmFsdWVjaGFuZ2UgIT09IG51bGwgKSB7XG4gICAgICAgIG1lbnUub252YWx1ZWNoYW5nZSggbWVudS52YWx1ZSAgKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gbWVudVxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgcHJpbWFyeSBET00gZWxlbWVudCAoc2VsZWN0KSB0byBiZSBwbGFjZWQgaW4gYSBQYW5lbC5cbiAgICogQG1lbWJlcm9mIE1lbnUgXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgY3JlYXRlRWxlbWVudCgpIHtcbiAgICBsZXQgc2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3NlbGVjdCcgKVxuXG4gICAgcmV0dXJuIHNlbGVjdFxuICB9LFxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBvcHRpb24gZWxlbWVudHMgZm9yIG1lbnUuIFJlbW92ZXMgcHJldmlvdXNseSBhcHBlbmRlZCBlbGVtZW50cy5cbiAgICogQG1lbWJlcm9mIE1lbnUgXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgY3JlYXRlT3B0aW9ucygpIHtcbiAgICB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID0gJydcblxuICAgIGZvciggbGV0IG9wdGlvbiBvZiB0aGlzLm9wdGlvbnMgKSB7XG4gICAgICBsZXQgb3B0aW9uRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnb3B0aW9uJyApXG4gICAgICBvcHRpb25FbC5zZXRBdHRyaWJ1dGUoICd2YWx1ZScsIG9wdGlvbiApXG4gICAgICBvcHRpb25FbC5pbm5lclRleHQgPSBvcHRpb25cbiAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCggb3B0aW9uRWwgKVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogT3ZlcnJpZGRlbiB2aXJ0dWFsIG1ldGhvZCB0byBhZGQgZWxlbWVudCB0byBwYW5lbC5cbiAgICogQHByaXZhdGVcbiAgICogQG1lbWJlcm9mIE1lbnUgXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgX19hZGRUb1BhbmVsKCBwYW5lbCApIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IHBhbmVsXG5cbiAgICBpZiggdHlwZW9mIHRoaXMuYWRkRXZlbnRzID09PSAnZnVuY3Rpb24nICkgdGhpcy5hZGRFdmVudHMoKVxuXG4gICAgLy8gY2FsbGVkIGlmIHdpZGdldCB1c2VzIERPTVdpZGdldCBhcyBwcm90b3R5cGU7IC5wbGFjZSBpbmhlcml0ZWQgZnJvbSBET01XaWRnZXRcbiAgICB0aGlzLnBsYWNlKCkgXG4gIH1cblxufSlcblxuZXhwb3J0IGRlZmF1bHQgTWVudVxuIiwibGV0IFBhbmVsID0ge1xuICBkZWZhdWx0czoge1xuICAgIGZ1bGxzY3JlZW46ZmFsc2UsXG4gICAgYmFja2dyb3VuZDonIzMzMydcbiAgfSxcbiAgXG4gIC8vIGNsYXNzIHZhcmlhYmxlIGZvciByZWZlcmVuY2UgdG8gYWxsIHBhbmVsc1xuICBwYW5lbHM6W10sXG5cbiAgY3JlYXRlKCBwcm9wcyA9IG51bGwgKSB7XG4gICAgbGV0IHBhbmVsID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgLy8gZGVmYXVsdDogZnVsbCB3aW5kb3cgaW50ZXJmYWNlXG4gICAgaWYoIHByb3BzID09PSBudWxsICkge1xuICAgICAgICBcbiAgICAgIE9iamVjdC5hc3NpZ24oIHBhbmVsLCBQYW5lbC5kZWZhdWx0cywge1xuICAgICAgICB4OjAsXG4gICAgICAgIHk6MCxcbiAgICAgICAgd2lkdGg6MSxcbiAgICAgICAgaGVpZ2h0OjEsXG4gICAgICAgIF9feDogMCxcbiAgICAgICAgX195OiAwLFxuICAgICAgICBfX3dpZHRoOiBudWxsLFxuICAgICAgICBfX2hlaWdodDpudWxsLFxuICAgICAgICBmdWxsc2NyZWVuOiB0cnVlLFxuICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgIH0pXG4gICAgICBcbiAgICAgIHBhbmVsLmRpdiA9IHBhbmVsLl9fY3JlYXRlSFRNTEVsZW1lbnQoKVxuICAgICAgcGFuZWwubGF5b3V0KClcblxuICAgICAgbGV0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnYm9keScgKVxuICAgICAgYm9keS5hcHBlbmRDaGlsZCggcGFuZWwuZGl2IClcbiAgICB9XG4gICAgXG4gICAgUGFuZWwucGFuZWxzLnB1c2goIHBhbmVsIClcblxuICAgIHJldHVybiBwYW5lbFxuICB9LFxuICBcbiAgX19jcmVhdGVIVE1MRWxlbWVudCgpIHtcbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKVxuICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbiAgICBkaXYuc3R5bGUuZGlzcGxheSAgPSAnYmxvY2snXG4gICAgZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IHRoaXMuYmFja2dyb3VuZFxuICAgIFxuICAgIHJldHVybiBkaXZcbiAgfSxcblxuICBsYXlvdXQoKSB7XG4gICAgaWYoIHRoaXMuZnVsbHNjcmVlbiApIHtcbiAgICAgIHRoaXMuX193aWR0aCAgPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgICAgdGhpcy5fX2hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgdGhpcy5fX3ggICAgICA9IHRoaXMueCAqIHRoaXMuX193aWR0aFxuICAgICAgdGhpcy5fX3kgICAgICA9IHRoaXMueSAqIHRoaXMuX19oZWlnaHRcblxuICAgICAgdGhpcy5kaXYuc3R5bGUud2lkdGggID0gdGhpcy5fX3dpZHRoICsgJ3B4J1xuICAgICAgdGhpcy5kaXYuc3R5bGUuaGVpZ2h0ID0gdGhpcy5fX2hlaWdodCArICdweCdcbiAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgICA9IHRoaXMuX194ICsgJ3B4J1xuICAgICAgdGhpcy5kaXYuc3R5bGUudG9wICAgID0gdGhpcy5fX3kgKyAncHgnXG4gICAgfVxuICB9LFxuXG4gIGdldFdpZHRoKCkgIHsgcmV0dXJuIHRoaXMuX193aWR0aCAgfSxcbiAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5fX2hlaWdodCB9LFxuXG4gIGFkZCggLi4ud2lkZ2V0cyApIHtcbiAgICBmb3IoIGxldCB3aWRnZXQgb2Ygd2lkZ2V0cyApIHtcblxuICAgICAgLy8gY2hlY2sgdG8gbWFrZSBzdXJlIHdpZGdldCBoYXMgbm90IGJlZW4gYWxyZWFkeSBhZGRlZFxuICAgICAgaWYoIHRoaXMuY2hpbGRyZW4uaW5kZXhPZiggd2lkZ2V0ICkgPT09IC0xICkge1xuICAgICAgICBpZiggdHlwZW9mIHdpZGdldC5fX2FkZFRvUGFuZWwgPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgdGhpcy5kaXYuYXBwZW5kQ2hpbGQoIHdpZGdldC5lbGVtZW50IClcbiAgICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2goIHdpZGdldCApXG5cbiAgICAgICAgICB3aWRnZXQuX19hZGRUb1BhbmVsKCB0aGlzIClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoICdXaWRnZXQgY2Fubm90IGJlIGFkZGVkIHRvIHBhbmVsOyBpdCBkb2VzIG5vdCBjb250YWluIHRoZSBtZXRob2QgLl9fYWRkVG9QYW5lbCcgKVxuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhyb3cgRXJyb3IoICdXaWRnZXQgaXMgYWxyZWFkeSBhZGRlZCB0byBwYW5lbC4nIClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG59XG5cblxuZXhwb3J0IGRlZmF1bHQgUGFuZWwgXG4iLCJpbXBvcnQgQ2FudmFzV2lkZ2V0IGZyb20gJy4vY2FudmFzV2lkZ2V0LmpzJ1xuXG4vKipcbiAqIEEgaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbCBmYWRlci4gXG4gKiBAbW9kdWxlIFNsaWRlclxuICogQGF1Z21lbnRzIENhbnZhc1dpZGdldFxuICovIFxuXG5sZXQgU2xpZGVyID0gT2JqZWN0LmNyZWF0ZSggQ2FudmFzV2lkZ2V0ICkgXG5cbk9iamVjdC5hc3NpZ24oIFNsaWRlciwge1xuICAvKiogQGxlbmRzIFNsaWRlci5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIFNsaWRlciBpbnN0YW5jZXMuXG4gICAqIERlZmF1bHRzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHVzZXItZGVmaW5lZCBwcm9wZXJ0aWVzIHBhc3NlZCB0b1xuICAgKiBjb25zdHJ1dG9yLlxuICAgKiBAbWVtYmVyb2YgU2xpZGVyXG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBfX3ZhbHVlOi41LCAvLyBhbHdheXMgMC0xLCBub3QgZm9yIGVuZC11c2Vyc1xuICAgIHZhbHVlOi41LCAgIC8vIGVuZC11c2VyIHZhbHVlIHRoYXQgbWF5IGJlIGZpbHRlcmVkXG4gICAgYWN0aXZlOiBmYWxzZSxcbiAgICAvKipcbiAgICAgKiBUaGUgc3R5bGUgcHJvcGVydHkgY2FuIGJlIGVpdGhlciAnaG9yaXpvbnRhbCcgKHRoZSBkZWZhdWx0KSBvciAndmVydGljYWwnLiBUaGlzXG4gICAgICogZGV0ZXJtaW5lcyB0aGUgb3JpZW50YXRpb24gb2YgdGhlIFNsaWRlciBpbnN0YW5jZS5cbiAgICAgKiBAbWVtYmVyb2YgU2xpZGVyXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBzdHlsZTogICdob3Jpem9udGFsJ1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgU2xpZGVyIGluc3RhbmNlLlxuICAgKiBAbWVtYmVyb2YgU2xpZGVyXG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBTbGlkZXIgd2l0aC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgc2xpZGVyID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgLy8gYXBwbHkgV2lkZ2V0IGRlZmF1bHRzLCB0aGVuIG92ZXJ3cml0ZSAoaWYgYXBwbGljYWJsZSkgd2l0aCBTbGlkZXIgZGVmYXVsdHNcbiAgICBDYW52YXNXaWRnZXQuY3JlYXRlLmNhbGwoIHNsaWRlciApXG5cbiAgICAvLyAuLi5hbmQgdGhlbiBmaW5hbGx5IG92ZXJyaWRlIHdpdGggdXNlciBkZWZhdWx0c1xuICAgIE9iamVjdC5hc3NpZ24oIHNsaWRlciwgU2xpZGVyLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICAvLyBzZXQgdW5kZXJseWluZyB2YWx1ZSBpZiBuZWNlc3NhcnkuLi4gVE9ETzogaG93IHNob3VsZCB0aGlzIGJlIHNldCBnaXZlbiBtaW4vbWF4P1xuICAgIGlmKCBwcm9wcy52YWx1ZSApIHNsaWRlci5fX3ZhbHVlID0gcHJvcHMudmFsdWVcbiAgICBcbiAgICAvLyBpbmhlcml0cyBmcm9tIFdpZGdldFxuICAgIHNsaWRlci5pbml0KClcblxuICAgIHJldHVybiBzbGlkZXJcbiAgfSxcblxuICAvKipcbiAgICogRHJhdyB0aGUgU2xpZGVyIG9udG8gaXRzIGNhbnZhcyBjb250ZXh0IHVzaW5nIHRoZSBjdXJyZW50IC5fX3ZhbHVlIHByb3BlcnR5LlxuICAgKiBAbWVtYmVyb2YgU2xpZGVyXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZHJhdygpIHtcbiAgICAvLyBkcmF3IGJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgICA9IHRoaXMuYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VcbiAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aFxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLDAsIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCApXG5cbiAgICAvLyBkcmF3IGZpbGwgKHNsaWRlciB2YWx1ZSByZXByZXNlbnRhdGlvbilcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxcblxuICAgIGlmKCB0aGlzLnN0eWxlID09PSAnaG9yaXpvbnRhbCcgKVxuICAgICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsIDAsIHRoaXMucmVjdC53aWR0aCAqIHRoaXMuX192YWx1ZSwgdGhpcy5yZWN0LmhlaWdodCApXG4gICAgZWxzZVxuICAgICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsIHRoaXMucmVjdC5oZWlnaHQgLSB0aGlzLl9fdmFsdWUgKiB0aGlzLnJlY3QuaGVpZ2h0LCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKiB0aGlzLl9fdmFsdWUgKVxuXG4gICAgdGhpcy5jdHguc3Ryb2tlUmVjdCggMCwwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuICB9LFxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICAvLyBjcmVhdGUgZXZlbnQgaGFuZGxlcnMgYm91bmQgdG8gdGhlIGN1cnJlbnQgb2JqZWN0LCBvdGhlcndpc2UgXG4gICAgLy8gdGhlICd0aGlzJyBrZXl3b3JkIHdpbGwgcmVmZXIgdG8gdGhlIHdpbmRvdyBvYmplY3QgaW4gdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZXZlbnRzICkge1xuICAgICAgdGhpc1sga2V5IF0gPSB0aGlzLmV2ZW50c1sga2V5IF0uYmluZCggdGhpcyApIFxuICAgIH1cblxuICAgIC8vIG9ubHkgbGlzdGVuIGZvciBtb3VzZWRvd24gaW50aWFsbHk7IG1vdXNlbW92ZSBhbmQgbW91c2V1cCBhcmUgcmVnaXN0ZXJlZCBvbiBtb3VzZWRvd25cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgIHRoaXMucG9pbnRlcmRvd24gKVxuICB9LFxuXG4gIGV2ZW50czoge1xuICAgIHBvaW50ZXJkb3duKCBlICkge1xuICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlXG4gICAgICB0aGlzLnBvaW50ZXJJZCA9IGUucG9pbnRlcklkXG5cbiAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIC8vIGNoYW5nZSBzbGlkZXIgdmFsdWUgb24gY2xpY2sgLyB0b3VjaGRvd25cblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSAvLyBvbmx5IGxpc3RlbiBmb3IgdXAgYW5kIG1vdmUgZXZlbnRzIGFmdGVyIHBvaW50ZXJkb3duIFxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgfSxcblxuICAgIHBvaW50ZXJ1cCggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSBcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgICB9XG4gICAgfSxcblxuICAgIHBvaW50ZXJtb3ZlKCBlICkge1xuICAgICAgaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCApIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlIClcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuICBcbiAgLyoqXG4gICAqIEdlbmVyYXRlcyBhIHZhbHVlIGJldHdlZW4gMC0xIGdpdmVuIHRoZSBjdXJyZW50IHBvaW50ZXIgcG9zaXRpb24gaW4gcmVsYXRpb25cbiAgICogdG8gdGhlIFNsaWRlcidzIHBvc2l0aW9uLCBhbmQgdHJpZ2dlcnMgb3V0cHV0LlxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIFNsaWRlclxuICAgKiBAcGFyYW0ge1BvaW50ZXJFdmVudH0gZSAtIFRoZSBwb2ludGVyIGV2ZW50IHRvIGJlIHByb2Nlc3NlZC5cbiAgICovXG4gIHByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKSB7XG4gICAgbGV0IHByZXZWYWx1ZSA9IHRoaXMudmFsdWVcblxuICAgIGlmKCB0aGlzLnN0eWxlID09PSAnaG9yaXpvbnRhbCcgKSB7XG4gICAgICB0aGlzLl9fdmFsdWUgPSAoIGUuY2xpZW50WCAtIHRoaXMucmVjdC5sZWZ0ICkgLyB0aGlzLnJlY3Qud2lkdGhcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuX192YWx1ZSA9IDEgLSAoIGUuY2xpZW50WSAtIHRoaXMucmVjdC50b3AgICkgLyB0aGlzLnJlY3QuaGVpZ2h0IFxuICAgIH1cblxuICAgIC8vIGNsYW1wIF9fdmFsdWUsIHdoaWNoIGlzIG9ubHkgdXNlZCBpbnRlcm5hbGx5XG4gICAgaWYoIHRoaXMuX192YWx1ZSA+IDEgKSB0aGlzLl9fdmFsdWUgPSAxXG4gICAgaWYoIHRoaXMuX192YWx1ZSA8IDAgKSB0aGlzLl9fdmFsdWUgPSAwXG5cbiAgICBsZXQgc2hvdWxkRHJhdyA9IHRoaXMub3V0cHV0KClcbiAgICBcbiAgICBpZiggc2hvdWxkRHJhdyApIHRoaXMuZHJhdygpXG4gIH0sXG5cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2xpZGVyXG4iLCJsZXQgVXRpbGl0aWVzID0ge1xuXG4gIGdldE1vZGUoKSB7XG4gICAgcmV0dXJuICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA/ICd0b3VjaCcgOiAnbW91c2UnXG4gIH0sXG5cblxufVxuXG5leHBvcnQgZGVmYXVsdCBVdGlsaXRpZXNcbiIsImltcG9ydCBGaWx0ZXJzIGZyb20gJy4vZmlsdGVycydcbmltcG9ydCBDb21tdW5pY2F0aW9uIGZyb20gJy4vY29tbXVuaWNhdGlvbi5qcydcblxuLyoqXG4gKiBXaWRnZXQgaXMgdGhlIGJhc2UgY2xhc3MgdGhhdCBhbGwgb3RoZXIgVUkgZWxlbWVudHMgaW5oZXJpdHMgZnJvbS4gSXQgcHJpbWFyaWx5XG4gKiBpbmNsdWRlcyBtZXRob2RzIGZvciBmaWx0ZXJpbmcgLyBzY2FsaW5nIG91dHB1dC5cbiAqIEBtb2R1bGUgV2lkZ2V0XG4gKi9cblxuXG5sZXQgV2lkZ2V0ID0ge1xuICAvKiogQGxlbmRzIFdpZGdldC5wcm90b3R5cGUgKi9cbiAgXG4gIC8qKlxuICAgKiBzdG9yZSBhbGwgaW5zdGFudGlhdGVkIHdpZGdldHMuXG4gICAqIEB0eXBlIHtBcnJheS48V2lkZ2V0Pn1cbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICB3aWRnZXRzOiBbXSxcbiAgbGFzdFZhbHVlOiBudWxsLFxuICBvbnZhbHVlY2hhbmdlOiBudWxsLFxuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgd2lkZ2V0c1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgbWluOjAsIG1heDoxLFxuICAgIHNjYWxlT3V0cHV0OnRydWUsIC8vIGFwcGx5IHNjYWxlIGZpbHRlciBieSBkZWZhdWx0IGZvciBtaW4gLyBtYXggcmFuZ2VzXG4gICAgdGFyZ2V0Om51bGwsXG4gICAgX19wcmV2VmFsdWU6bnVsbFxuICB9LFxuICBcbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBXaWRnZXQgaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIFdpZGdldFxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoKSB7XG4gICAgT2JqZWN0LmFzc2lnbiggdGhpcywgV2lkZ2V0LmRlZmF1bHRzIClcbiAgICBcbiAgICAvKiogXG4gICAgICogU3RvcmVzIGZpbHRlcnMgZm9yIHRyYW5zZm9ybWluZyB3aWRnZXQgb3V0cHV0LlxuICAgICAqIEBtZW1iZXJvZiBXaWRnZXRcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmZpbHRlcnMgPSBbXVxuXG4gICAgdGhpcy5fX3ByZWZpbHRlcnMgPSBbXVxuICAgIHRoaXMuX19wb3N0ZmlsdGVycyA9IFtdXG5cbiAgICBXaWRnZXQud2lkZ2V0cy5wdXNoKCB0aGlzIClcblxuICAgIHJldHVybiB0aGlzXG4gIH0sXG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemF0aW9uIG1ldGhvZCBmb3Igd2lkZ2V0cy4gQ2hlY2tzIHRvIHNlZSBpZiB3aWRnZXQgY29udGFpbnNcbiAgICogYSAndGFyZ2V0JyBwcm9wZXJ0eTsgaWYgc28sIG1ha2VzIHN1cmUgdGhhdCBjb21tdW5pY2F0aW9uIHdpdGggdGhhdFxuICAgKiB0YXJnZXQgaXMgaW5pdGlhbGl6ZWQuXG4gICAqIEBtZW1iZXJvZiBXaWRnZXRcbiAgICogQGluc3RhbmNlXG4gICAqL1xuXG4gIGluaXQoKSB7XG4gICAgaWYoIHRoaXMudGFyZ2V0ICYmIHRoaXMudGFyZ2V0ID09PSAnb3NjJyB8fCB0aGlzLnRhcmdldCA9PT0gJ21pZGknICkge1xuICAgICAgaWYoICFDb21tdW5pY2F0aW9uLmluaXRpYWxpemVkICkgQ29tbXVuaWNhdGlvbi5pbml0KClcbiAgICB9XG5cbiAgICAvLyBpZiBtaW4vbWF4IGFyZSBub3QgMC0xIGFuZCBzY2FsaW5nIGlzIG5vdCBkaXNhYmxlZFxuICAgIGlmKCB0aGlzLnNjYWxlT3V0cHV0ICYmICh0aGlzLm1pbiAhPT0gMCB8fCB0aGlzLm1heCAhPT0gMSApKSB7ICAgICAgXG4gICAgICB0aGlzLl9fcHJlZmlsdGVycy5wdXNoKCBcbiAgICAgICAgRmlsdGVycy5TY2FsZSggMCwxLHRoaXMubWluLHRoaXMubWF4ICkgXG4gICAgICApXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIG91dHB1dCBvZiB3aWRnZXQgYnkgcnVubmluZyAuX192YWx1ZSBwcm9wZXJ0eSB0aHJvdWdoIGZpbHRlciBjaGFpbi5cbiAgICogVGhlIHJlc3VsdCBpcyBzdG9yZWQgaW4gdGhlIC52YWx1ZSBwcm9wZXJ0eSBvZiB0aGUgd2lkZ2V0LCB3aGljaCBpcyB0aGVuXG4gICAqIHJldHVybmVkLlxuICAgKiBAbWVtYmVyb2YgV2lkZ2V0XG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgb3V0cHV0KCkge1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuX192YWx1ZSwgbmV3VmFsdWVHZW5lcmF0ZWQgPSBmYWxzZSwgbGFzdFZhbHVlID0gdGhpcy52YWx1ZVxuICAgIFxuICAgIGZvciggbGV0IGZpbHRlciBvZiB0aGlzLl9fcHJlZmlsdGVycyApICB2YWx1ZSA9IGZpbHRlciggdmFsdWUgKVxuICAgIGZvciggbGV0IGZpbHRlciBvZiB0aGlzLmZpbHRlcnMgKSAgICAgICB2YWx1ZSA9IGZpbHRlciggdmFsdWUgKVxuICAgIGZvciggbGV0IGZpbHRlciBvZiB0aGlzLl9fcG9zdGZpbHRlcnMgKSB2YWx1ZSA9IGZpbHRlciggdmFsdWUgKVxuXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXG4gICAgXG4gICAgaWYoIHRoaXMudGFyZ2V0ICE9PSBudWxsICkgdGhpcy50cmFuc21pdCggdGhpcy52YWx1ZSApXG5cbiAgICBpZiggdGhpcy5fX3ZhbHVlICE9PSB0aGlzLl9fcHJldlZhbHVlICkge1xuICAgICAgbmV3VmFsdWVHZW5lcmF0ZWQgPSB0cnVlXG5cbiAgICAgIGlmKCB0aGlzLm9udmFsdWVjaGFuZ2UgIT09IG51bGwgKSB0aGlzLm9udmFsdWVjaGFuZ2UoIHRoaXMudmFsdWUsIGxhc3RWYWx1ZSApXG4gICAgfVxuXG4gICAgdGhpcy5fX3ByZXZWYWx1ZSA9IHRoaXMuX192YWx1ZVxuICAgIC8vIG5ld1ZhbHVlR2VuZXJhdGVkIGNhbiBiZSB1c2UgdG8gZGV0ZXJtaW5lIGlmIHdpZGdldCBzaG91bGQgZHJhd1xuICAgIHJldHVybiBuZXdWYWx1ZUdlbmVyYXRlZFxuICB9LFxuXG4gIC8qKlxuICAgKiBJZiB0aGUgd2lkZ2V0IGhhcyBhIHJlbW90ZSB0YXJnZXQgKG5vdCBhIHRhcmdldCBpbnNpZGUgdGhlIGludGVyZmFjZSB3ZWIgcGFnZSlcbiAgICogdGhpcyB3aWxsIHRyYW5zbWl0IHRoZSB3aWRnZXRzIHZhbHVlIHRvIHRoZSByZW1vdGUgZGVzdGluYXRpb24uXG4gICAqIEBtZW1iZXJvZiBXaWRnZXRcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICB0cmFuc21pdCgpIHtcbiAgICBpZiggdGhpcy50YXJnZXQgPT09ICdvc2MnICkge1xuICAgICAgQ29tbXVuaWNhdGlvbi5PU0Muc2VuZCggdGhpcy5hZGRyZXNzLCB0aGlzLnZhbHVlIClcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2lkZ2V0XG4iLCJsZXQgV2lkZ2V0TGFiZWwgPSB7XG5cbiAgZGVmYXVsdHM6IHtcbiAgICBzaXplOjI0LFxuICAgIGZhY2U6J3NhbnMtc2VyaWYnLFxuICAgIGZpbGw6J3doaXRlJyxcbiAgICBhbGlnbjonY2VudGVyJyxcbiAgICBiYWNrZ3JvdW5kOm51bGwsXG4gICAgd2lkdGg6MVxuICB9LFxuXG4gIGNyZWF0ZSggcHJvcHMgKSB7XG4gICAgbGV0IGxhYmVsID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG5cbiAgICBPYmplY3QuYXNzaWduKCBsYWJlbCwgdGhpcy5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgaWYoIHR5cGVvZiBsYWJlbC5jdHggPT09IHVuZGVmaW5lZCApIHRocm93IEVycm9yKCAnV2lkZ2V0TGFiZWxzIG11c3QgYmUgY29uc3RydWN0ZWQgd2l0aCBhIGNhbnZhcyBjb250ZXh0IChjdHgpIGFyZ3VtZW50JyApXG4gICAgXG4gICAgbGFiZWwuZm9udCA9IGAke2xhYmVsLnNpemV9cHggJHtsYWJlbC5mYWNlfWBcblxuICAgIHJldHVybiBsYWJlbFxuICB9LFxuXG4gIGRyYXcoKSB7XG4gICAgbGV0IGNudnMgPSB0aGlzLmN0eC5jYW52YXMsXG4gICAgICAgIGN3aWR0aCA9IGNudnMud2lkdGgsXG4gICAgICAgIGNoZWlnaHQ9IGNudnMuaGVpZ2h0LFxuICAgICAgICB4ICAgICAgPSB0aGlzLnggKiBjd2lkdGgsXG4gICAgICAgIHkgICAgICA9IHRoaXMueSAqIGNoZWlnaHQsXG4gICAgICAgIHdpZHRoICA9IHRoaXMud2lkdGggKiBjd2lkdGhcblxuICAgIGlmKCB0aGlzLmJhY2tncm91bmQgIT09IG51bGwgKSB7XG4gICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmJhY2tncm91bmRcbiAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KCB4LHksd2lkdGgsdGhpcy5zaXplICsgMTAgKVxuICAgIH1cbiAgICBcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxcbiAgICB0aGlzLmN0eC50ZXh0QWxpZ24gPSB0aGlzLmFsaWduXG4gICAgdGhpcy5jdHguZm9udCA9IHRoaXMuZm9udFxuICAgIHRoaXMuY3R4LmZpbGxUZXh0KCB0aGlzLnRleHQsIHgseSx3aWR0aCApICAgIFxuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2lkZ2V0TGFiZWxcbiIsIi8qIVxuICogUEVQIHYwLjQuMSB8IGh0dHBzOi8vZ2l0aHViLmNvbS9qcXVlcnkvUEVQXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyB8IGh0dHA6Ly9qcXVlcnkub3JnL2xpY2Vuc2VcbiAqL1xuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuICBnbG9iYWwuUG9pbnRlckV2ZW50c1BvbHlmaWxsID0gZmFjdG9yeSgpXG59KHRoaXMsIGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBUaGlzIGlzIHRoZSBjb25zdHJ1Y3RvciBmb3IgbmV3IFBvaW50ZXJFdmVudHMuXG4gICAqXG4gICAqIE5ldyBQb2ludGVyIEV2ZW50cyBtdXN0IGJlIGdpdmVuIGEgdHlwZSwgYW5kIGFuIG9wdGlvbmFsIGRpY3Rpb25hcnkgb2ZcbiAgICogaW5pdGlhbGl6YXRpb24gcHJvcGVydGllcy5cbiAgICpcbiAgICogRHVlIHRvIGNlcnRhaW4gcGxhdGZvcm0gcmVxdWlyZW1lbnRzLCBldmVudHMgcmV0dXJuZWQgZnJvbSB0aGUgY29uc3RydWN0b3JcbiAgICogaWRlbnRpZnkgYXMgTW91c2VFdmVudHMuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge1N0cmluZ30gaW5UeXBlIFRoZSB0eXBlIG9mIHRoZSBldmVudCB0byBjcmVhdGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbaW5EaWN0XSBBbiBvcHRpb25hbCBkaWN0aW9uYXJ5IG9mIGluaXRpYWwgZXZlbnQgcHJvcGVydGllcy5cbiAgICogQHJldHVybiB7RXZlbnR9IEEgbmV3IFBvaW50ZXJFdmVudCBvZiB0eXBlIGBpblR5cGVgLCBpbml0aWFsaXplZCB3aXRoIHByb3BlcnRpZXMgZnJvbSBgaW5EaWN0YC5cbiAgICovXG4gIHZhciBNT1VTRV9QUk9QUyA9IFtcbiAgICAnYnViYmxlcycsXG4gICAgJ2NhbmNlbGFibGUnLFxuICAgICd2aWV3JyxcbiAgICAnZGV0YWlsJyxcbiAgICAnc2NyZWVuWCcsXG4gICAgJ3NjcmVlblknLFxuICAgICdjbGllbnRYJyxcbiAgICAnY2xpZW50WScsXG4gICAgJ2N0cmxLZXknLFxuICAgICdhbHRLZXknLFxuICAgICdzaGlmdEtleScsXG4gICAgJ21ldGFLZXknLFxuICAgICdidXR0b24nLFxuICAgICdyZWxhdGVkVGFyZ2V0JyxcbiAgICAncGFnZVgnLFxuICAgICdwYWdlWSdcbiAgXTtcblxuICB2YXIgTU9VU0VfREVGQVVMVFMgPSBbXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgbnVsbCxcbiAgICBudWxsLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgMCxcbiAgICBudWxsLFxuICAgIDAsXG4gICAgMFxuICBdO1xuXG4gIGZ1bmN0aW9uIFBvaW50ZXJFdmVudChpblR5cGUsIGluRGljdCkge1xuICAgIGluRGljdCA9IGluRGljdCB8fCBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICBlLmluaXRFdmVudChpblR5cGUsIGluRGljdC5idWJibGVzIHx8IGZhbHNlLCBpbkRpY3QuY2FuY2VsYWJsZSB8fCBmYWxzZSk7XG5cbiAgICAvLyBkZWZpbmUgaW5oZXJpdGVkIE1vdXNlRXZlbnQgcHJvcGVydGllc1xuICAgIC8vIHNraXAgYnViYmxlcyBhbmQgY2FuY2VsYWJsZSBzaW5jZSB0aGV5J3JlIHNldCBhYm92ZSBpbiBpbml0RXZlbnQoKVxuICAgIGZvciAodmFyIGkgPSAyLCBwOyBpIDwgTU9VU0VfUFJPUFMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHAgPSBNT1VTRV9QUk9QU1tpXTtcbiAgICAgIGVbcF0gPSBpbkRpY3RbcF0gfHwgTU9VU0VfREVGQVVMVFNbaV07XG4gICAgfVxuICAgIGUuYnV0dG9ucyA9IGluRGljdC5idXR0b25zIHx8IDA7XG5cbiAgICAvLyBTcGVjIHJlcXVpcmVzIHRoYXQgcG9pbnRlcnMgd2l0aG91dCBwcmVzc3VyZSBzcGVjaWZpZWQgdXNlIDAuNSBmb3IgZG93blxuICAgIC8vIHN0YXRlIGFuZCAwIGZvciB1cCBzdGF0ZS5cbiAgICB2YXIgcHJlc3N1cmUgPSAwO1xuICAgIGlmIChpbkRpY3QucHJlc3N1cmUpIHtcbiAgICAgIHByZXNzdXJlID0gaW5EaWN0LnByZXNzdXJlO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmVzc3VyZSA9IGUuYnV0dG9ucyA/IDAuNSA6IDA7XG4gICAgfVxuXG4gICAgLy8gYWRkIHgveSBwcm9wZXJ0aWVzIGFsaWFzZWQgdG8gY2xpZW50WC9ZXG4gICAgZS54ID0gZS5jbGllbnRYO1xuICAgIGUueSA9IGUuY2xpZW50WTtcblxuICAgIC8vIGRlZmluZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgUG9pbnRlckV2ZW50IGludGVyZmFjZVxuICAgIGUucG9pbnRlcklkID0gaW5EaWN0LnBvaW50ZXJJZCB8fCAwO1xuICAgIGUud2lkdGggPSBpbkRpY3Qud2lkdGggfHwgMDtcbiAgICBlLmhlaWdodCA9IGluRGljdC5oZWlnaHQgfHwgMDtcbiAgICBlLnByZXNzdXJlID0gcHJlc3N1cmU7XG4gICAgZS50aWx0WCA9IGluRGljdC50aWx0WCB8fCAwO1xuICAgIGUudGlsdFkgPSBpbkRpY3QudGlsdFkgfHwgMDtcbiAgICBlLnBvaW50ZXJUeXBlID0gaW5EaWN0LnBvaW50ZXJUeXBlIHx8ICcnO1xuICAgIGUuaHdUaW1lc3RhbXAgPSBpbkRpY3QuaHdUaW1lc3RhbXAgfHwgMDtcbiAgICBlLmlzUHJpbWFyeSA9IGluRGljdC5pc1ByaW1hcnkgfHwgZmFsc2U7XG4gICAgcmV0dXJuIGU7XG4gIH1cblxuICB2YXIgX1BvaW50ZXJFdmVudCA9IFBvaW50ZXJFdmVudDtcblxuICAvKipcbiAgICogVGhpcyBtb2R1bGUgaW1wbGVtZW50cyBhIG1hcCBvZiBwb2ludGVyIHN0YXRlc1xuICAgKi9cbiAgdmFyIFVTRV9NQVAgPSB3aW5kb3cuTWFwICYmIHdpbmRvdy5NYXAucHJvdG90eXBlLmZvckVhY2g7XG4gIHZhciBQb2ludGVyTWFwID0gVVNFX01BUCA/IE1hcCA6IFNwYXJzZUFycmF5TWFwO1xuXG4gIGZ1bmN0aW9uIFNwYXJzZUFycmF5TWFwKCkge1xuICAgIHRoaXMuYXJyYXkgPSBbXTtcbiAgICB0aGlzLnNpemUgPSAwO1xuICB9XG5cbiAgU3BhcnNlQXJyYXlNYXAucHJvdG90eXBlID0ge1xuICAgIHNldDogZnVuY3Rpb24oaywgdikge1xuICAgICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kZWxldGUoayk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaGFzKGspKSB7XG4gICAgICAgIHRoaXMuc2l6ZSsrO1xuICAgICAgfVxuICAgICAgdGhpcy5hcnJheVtrXSA9IHY7XG4gICAgfSxcbiAgICBoYXM6IGZ1bmN0aW9uKGspIHtcbiAgICAgIHJldHVybiB0aGlzLmFycmF5W2tdICE9PSB1bmRlZmluZWQ7XG4gICAgfSxcbiAgICBkZWxldGU6IGZ1bmN0aW9uKGspIHtcbiAgICAgIGlmICh0aGlzLmhhcyhrKSkge1xuICAgICAgICBkZWxldGUgdGhpcy5hcnJheVtrXTtcbiAgICAgICAgdGhpcy5zaXplLS07XG4gICAgICB9XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGspIHtcbiAgICAgIHJldHVybiB0aGlzLmFycmF5W2tdO1xuICAgIH0sXG4gICAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hcnJheS5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5zaXplID0gMDtcbiAgICB9LFxuXG4gICAgLy8gcmV0dXJuIHZhbHVlLCBrZXksIG1hcFxuICAgIGZvckVhY2g6IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5hcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHYsIGspIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2LCBrLCB0aGlzKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3BvaW50ZXJtYXAgPSBQb2ludGVyTWFwO1xuXG4gIHZhciBDTE9ORV9QUk9QUyA9IFtcblxuICAgIC8vIE1vdXNlRXZlbnRcbiAgICAnYnViYmxlcycsXG4gICAgJ2NhbmNlbGFibGUnLFxuICAgICd2aWV3JyxcbiAgICAnZGV0YWlsJyxcbiAgICAnc2NyZWVuWCcsXG4gICAgJ3NjcmVlblknLFxuICAgICdjbGllbnRYJyxcbiAgICAnY2xpZW50WScsXG4gICAgJ2N0cmxLZXknLFxuICAgICdhbHRLZXknLFxuICAgICdzaGlmdEtleScsXG4gICAgJ21ldGFLZXknLFxuICAgICdidXR0b24nLFxuICAgICdyZWxhdGVkVGFyZ2V0JyxcblxuICAgIC8vIERPTSBMZXZlbCAzXG4gICAgJ2J1dHRvbnMnLFxuXG4gICAgLy8gUG9pbnRlckV2ZW50XG4gICAgJ3BvaW50ZXJJZCcsXG4gICAgJ3dpZHRoJyxcbiAgICAnaGVpZ2h0JyxcbiAgICAncHJlc3N1cmUnLFxuICAgICd0aWx0WCcsXG4gICAgJ3RpbHRZJyxcbiAgICAncG9pbnRlclR5cGUnLFxuICAgICdod1RpbWVzdGFtcCcsXG4gICAgJ2lzUHJpbWFyeScsXG5cbiAgICAvLyBldmVudCBpbnN0YW5jZVxuICAgICd0eXBlJyxcbiAgICAndGFyZ2V0JyxcbiAgICAnY3VycmVudFRhcmdldCcsXG4gICAgJ3doaWNoJyxcbiAgICAncGFnZVgnLFxuICAgICdwYWdlWScsXG4gICAgJ3RpbWVTdGFtcCdcbiAgXTtcblxuICB2YXIgQ0xPTkVfREVGQVVMVFMgPSBbXG5cbiAgICAvLyBNb3VzZUV2ZW50XG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgbnVsbCxcbiAgICBudWxsLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgMCxcbiAgICBudWxsLFxuXG4gICAgLy8gRE9NIExldmVsIDNcbiAgICAwLFxuXG4gICAgLy8gUG9pbnRlckV2ZW50XG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgJycsXG4gICAgMCxcbiAgICBmYWxzZSxcblxuICAgIC8vIGV2ZW50IGluc3RhbmNlXG4gICAgJycsXG4gICAgbnVsbCxcbiAgICBudWxsLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDBcbiAgXTtcblxuICB2YXIgQk9VTkRBUllfRVZFTlRTID0ge1xuICAgICdwb2ludGVyb3Zlcic6IDEsXG4gICAgJ3BvaW50ZXJvdXQnOiAxLFxuICAgICdwb2ludGVyZW50ZXInOiAxLFxuICAgICdwb2ludGVybGVhdmUnOiAxXG4gIH07XG5cbiAgdmFyIEhBU19TVkdfSU5TVEFOQ0UgPSAodHlwZW9mIFNWR0VsZW1lbnRJbnN0YW5jZSAhPT0gJ3VuZGVmaW5lZCcpO1xuXG4gIC8qKlxuICAgKiBUaGlzIG1vZHVsZSBpcyBmb3Igbm9ybWFsaXppbmcgZXZlbnRzLiBNb3VzZSBhbmQgVG91Y2ggZXZlbnRzIHdpbGwgYmVcbiAgICogY29sbGVjdGVkIGhlcmUsIGFuZCBmaXJlIFBvaW50ZXJFdmVudHMgdGhhdCBoYXZlIHRoZSBzYW1lIHNlbWFudGljcywgbm9cbiAgICogbWF0dGVyIHRoZSBzb3VyY2UuXG4gICAqIEV2ZW50cyBmaXJlZDpcbiAgICogICAtIHBvaW50ZXJkb3duOiBhIHBvaW50aW5nIGlzIGFkZGVkXG4gICAqICAgLSBwb2ludGVydXA6IGEgcG9pbnRlciBpcyByZW1vdmVkXG4gICAqICAgLSBwb2ludGVybW92ZTogYSBwb2ludGVyIGlzIG1vdmVkXG4gICAqICAgLSBwb2ludGVyb3ZlcjogYSBwb2ludGVyIGNyb3NzZXMgaW50byBhbiBlbGVtZW50XG4gICAqICAgLSBwb2ludGVyb3V0OiBhIHBvaW50ZXIgbGVhdmVzIGFuIGVsZW1lbnRcbiAgICogICAtIHBvaW50ZXJjYW5jZWw6IGEgcG9pbnRlciB3aWxsIG5vIGxvbmdlciBnZW5lcmF0ZSBldmVudHNcbiAgICovXG4gIHZhciBkaXNwYXRjaGVyID0ge1xuICAgIHBvaW50ZXJtYXA6IG5ldyBfcG9pbnRlcm1hcCgpLFxuICAgIGV2ZW50TWFwOiBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgIGNhcHR1cmVJbmZvOiBPYmplY3QuY3JlYXRlKG51bGwpLFxuXG4gICAgLy8gU2NvcGUgb2JqZWN0cyBmb3IgbmF0aXZlIGV2ZW50cy5cbiAgICAvLyBUaGlzIGV4aXN0cyBmb3IgZWFzZSBvZiB0ZXN0aW5nLlxuICAgIGV2ZW50U291cmNlczogT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICBldmVudFNvdXJjZUxpc3Q6IFtdLFxuICAgIC8qKlxuICAgICAqIEFkZCBhIG5ldyBldmVudCBzb3VyY2UgdGhhdCB3aWxsIGdlbmVyYXRlIHBvaW50ZXIgZXZlbnRzLlxuICAgICAqXG4gICAgICogYGluU291cmNlYCBtdXN0IGNvbnRhaW4gYW4gYXJyYXkgb2YgZXZlbnQgbmFtZXMgbmFtZWQgYGV2ZW50c2AsIGFuZFxuICAgICAqIGZ1bmN0aW9ucyB3aXRoIHRoZSBuYW1lcyBzcGVjaWZpZWQgaW4gdGhlIGBldmVudHNgIGFycmF5LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIEEgbmFtZSBmb3IgdGhlIGV2ZW50IHNvdXJjZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgQSBuZXcgc291cmNlIG9mIHBsYXRmb3JtIGV2ZW50cy5cbiAgICAgKi9cbiAgICByZWdpc3RlclNvdXJjZTogZnVuY3Rpb24obmFtZSwgc291cmNlKSB7XG4gICAgICB2YXIgcyA9IHNvdXJjZTtcbiAgICAgIHZhciBuZXdFdmVudHMgPSBzLmV2ZW50cztcbiAgICAgIGlmIChuZXdFdmVudHMpIHtcbiAgICAgICAgbmV3RXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGlmIChzW2VdKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50TWFwW2VdID0gc1tlXS5iaW5kKHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHRoaXMuZXZlbnRTb3VyY2VzW25hbWVdID0gcztcbiAgICAgICAgdGhpcy5ldmVudFNvdXJjZUxpc3QucHVzaChzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgbCA9IHRoaXMuZXZlbnRTb3VyY2VMaXN0Lmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlczsgKGkgPCBsKSAmJiAoZXMgPSB0aGlzLmV2ZW50U291cmNlTGlzdFtpXSk7IGkrKykge1xuXG4gICAgICAgIC8vIGNhbGwgZXZlbnRzb3VyY2UgcmVnaXN0ZXJcbiAgICAgICAgZXMucmVnaXN0ZXIuY2FsbChlcywgZWxlbWVudCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB1bnJlZ2lzdGVyOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgbCA9IHRoaXMuZXZlbnRTb3VyY2VMaXN0Lmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlczsgKGkgPCBsKSAmJiAoZXMgPSB0aGlzLmV2ZW50U291cmNlTGlzdFtpXSk7IGkrKykge1xuXG4gICAgICAgIC8vIGNhbGwgZXZlbnRzb3VyY2UgcmVnaXN0ZXJcbiAgICAgICAgZXMudW5yZWdpc3Rlci5jYWxsKGVzLCBlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbnRhaW5zOiAvKnNjb3BlLmV4dGVybmFsLmNvbnRhaW5zIHx8ICovZnVuY3Rpb24oY29udGFpbmVyLCBjb250YWluZWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBjb250YWluZXIuY29udGFpbnMoY29udGFpbmVkKTtcbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG5cbiAgICAgICAgLy8gbW9zdCBsaWtlbHk6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTIwODQyN1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEVWRU5UU1xuICAgIGRvd246IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IHRydWU7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcmRvd24nLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIG1vdmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IHRydWU7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcm1vdmUnLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIHVwOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSB0cnVlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJ1cCcsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgZW50ZXI6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IGZhbHNlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJlbnRlcicsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgbGVhdmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IGZhbHNlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJsZWF2ZScsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgb3ZlcjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVyb3ZlcicsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgb3V0OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSB0cnVlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJvdXQnLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIGNhbmNlbDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVyY2FuY2VsJywgaW5FdmVudCk7XG4gICAgfSxcbiAgICBsZWF2ZU91dDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHRoaXMub3V0KGV2ZW50KTtcbiAgICAgIGlmICghdGhpcy5jb250YWlucyhldmVudC50YXJnZXQsIGV2ZW50LnJlbGF0ZWRUYXJnZXQpKSB7XG4gICAgICAgIHRoaXMubGVhdmUoZXZlbnQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZW50ZXJPdmVyOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgdGhpcy5vdmVyKGV2ZW50KTtcbiAgICAgIGlmICghdGhpcy5jb250YWlucyhldmVudC50YXJnZXQsIGV2ZW50LnJlbGF0ZWRUYXJnZXQpKSB7XG4gICAgICAgIHRoaXMuZW50ZXIoZXZlbnQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBMSVNURU5FUiBMT0dJQ1xuICAgIGV2ZW50SGFuZGxlcjogZnVuY3Rpb24oaW5FdmVudCkge1xuXG4gICAgICAvLyBUaGlzIGlzIHVzZWQgdG8gcHJldmVudCBtdWx0aXBsZSBkaXNwYXRjaCBvZiBwb2ludGVyZXZlbnRzIGZyb21cbiAgICAgIC8vIHBsYXRmb3JtIGV2ZW50cy4gVGhpcyBjYW4gaGFwcGVuIHdoZW4gdHdvIGVsZW1lbnRzIGluIGRpZmZlcmVudCBzY29wZXNcbiAgICAgIC8vIGFyZSBzZXQgdXAgdG8gY3JlYXRlIHBvaW50ZXIgZXZlbnRzLCB3aGljaCBpcyByZWxldmFudCB0byBTaGFkb3cgRE9NLlxuICAgICAgaWYgKGluRXZlbnQuX2hhbmRsZWRCeVBFKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciB0eXBlID0gaW5FdmVudC50eXBlO1xuICAgICAgdmFyIGZuID0gdGhpcy5ldmVudE1hcCAmJiB0aGlzLmV2ZW50TWFwW3R5cGVdO1xuICAgICAgaWYgKGZuKSB7XG4gICAgICAgIGZuKGluRXZlbnQpO1xuICAgICAgfVxuICAgICAgaW5FdmVudC5faGFuZGxlZEJ5UEUgPSB0cnVlO1xuICAgIH0sXG5cbiAgICAvLyBzZXQgdXAgZXZlbnQgbGlzdGVuZXJzXG4gICAgbGlzdGVuOiBmdW5jdGlvbih0YXJnZXQsIGV2ZW50cykge1xuICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLmFkZEV2ZW50KHRhcmdldCwgZSk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLy8gcmVtb3ZlIGV2ZW50IGxpc3RlbmVyc1xuICAgIHVubGlzdGVuOiBmdW5jdGlvbih0YXJnZXQsIGV2ZW50cykge1xuICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnJlbW92ZUV2ZW50KHRhcmdldCwgZSk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9LFxuICAgIGFkZEV2ZW50OiAvKnNjb3BlLmV4dGVybmFsLmFkZEV2ZW50IHx8ICovZnVuY3Rpb24odGFyZ2V0LCBldmVudE5hbWUpIHtcbiAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdGhpcy5ib3VuZEhhbmRsZXIpO1xuICAgIH0sXG4gICAgcmVtb3ZlRXZlbnQ6IC8qc2NvcGUuZXh0ZXJuYWwucmVtb3ZlRXZlbnQgfHwgKi9mdW5jdGlvbih0YXJnZXQsIGV2ZW50TmFtZSkge1xuICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB0aGlzLmJvdW5kSGFuZGxlcik7XG4gICAgfSxcblxuICAgIC8vIEVWRU5UIENSRUFUSU9OIEFORCBUUkFDS0lOR1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgRXZlbnQgb2YgdHlwZSBgaW5UeXBlYCwgYmFzZWQgb24gdGhlIGluZm9ybWF0aW9uIGluXG4gICAgICogYGluRXZlbnRgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGluVHlwZSBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHR5cGUgb2YgZXZlbnQgdG8gY3JlYXRlXG4gICAgICogQHBhcmFtIHtFdmVudH0gaW5FdmVudCBBIHBsYXRmb3JtIGV2ZW50IHdpdGggYSB0YXJnZXRcbiAgICAgKiBAcmV0dXJuIHtFdmVudH0gQSBQb2ludGVyRXZlbnQgb2YgdHlwZSBgaW5UeXBlYFxuICAgICAqL1xuICAgIG1ha2VFdmVudDogZnVuY3Rpb24oaW5UeXBlLCBpbkV2ZW50KSB7XG5cbiAgICAgIC8vIHJlbGF0ZWRUYXJnZXQgbXVzdCBiZSBudWxsIGlmIHBvaW50ZXIgaXMgY2FwdHVyZWRcbiAgICAgIGlmICh0aGlzLmNhcHR1cmVJbmZvW2luRXZlbnQucG9pbnRlcklkXSkge1xuICAgICAgICBpbkV2ZW50LnJlbGF0ZWRUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgICAgdmFyIGUgPSBuZXcgX1BvaW50ZXJFdmVudChpblR5cGUsIGluRXZlbnQpO1xuICAgICAgaWYgKGluRXZlbnQucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCA9IGluRXZlbnQucHJldmVudERlZmF1bHQ7XG4gICAgICB9XG4gICAgICBlLl90YXJnZXQgPSBlLl90YXJnZXQgfHwgaW5FdmVudC50YXJnZXQ7XG4gICAgICByZXR1cm4gZTtcbiAgICB9LFxuXG4gICAgLy8gbWFrZSBhbmQgZGlzcGF0Y2ggYW4gZXZlbnQgaW4gb25lIGNhbGxcbiAgICBmaXJlRXZlbnQ6IGZ1bmN0aW9uKGluVHlwZSwgaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLm1ha2VFdmVudChpblR5cGUsIGluRXZlbnQpO1xuICAgICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBzbmFwc2hvdCBvZiBpbkV2ZW50LCB3aXRoIHdyaXRhYmxlIHByb3BlcnRpZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBpbkV2ZW50IEFuIGV2ZW50IHRoYXQgY29udGFpbnMgcHJvcGVydGllcyB0byBjb3B5LlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgc2hhbGxvdyBjb3BpZXMgb2YgYGluRXZlbnRgJ3NcbiAgICAgKiAgICBwcm9wZXJ0aWVzLlxuICAgICAqL1xuICAgIGNsb25lRXZlbnQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBldmVudENvcHkgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgdmFyIHA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IENMT05FX1BST1BTLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHAgPSBDTE9ORV9QUk9QU1tpXTtcbiAgICAgICAgZXZlbnRDb3B5W3BdID0gaW5FdmVudFtwXSB8fCBDTE9ORV9ERUZBVUxUU1tpXTtcblxuICAgICAgICAvLyBXb3JrIGFyb3VuZCBTVkdJbnN0YW5jZUVsZW1lbnQgc2hhZG93IHRyZWVcbiAgICAgICAgLy8gUmV0dXJuIHRoZSA8dXNlPiBlbGVtZW50IHRoYXQgaXMgcmVwcmVzZW50ZWQgYnkgdGhlIGluc3RhbmNlIGZvciBTYWZhcmksIENocm9tZSwgSUUuXG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIGJlaGF2aW9yIGltcGxlbWVudGVkIGJ5IEZpcmVmb3guXG4gICAgICAgIGlmIChIQVNfU1ZHX0lOU1RBTkNFICYmIChwID09PSAndGFyZ2V0JyB8fCBwID09PSAncmVsYXRlZFRhcmdldCcpKSB7XG4gICAgICAgICAgaWYgKGV2ZW50Q29weVtwXSBpbnN0YW5jZW9mIFNWR0VsZW1lbnRJbnN0YW5jZSkge1xuICAgICAgICAgICAgZXZlbnRDb3B5W3BdID0gZXZlbnRDb3B5W3BdLmNvcnJlc3BvbmRpbmdVc2VFbGVtZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBrZWVwIHRoZSBzZW1hbnRpY3Mgb2YgcHJldmVudERlZmF1bHRcbiAgICAgIGlmIChpbkV2ZW50LnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgIGV2ZW50Q29weS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGluRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBldmVudENvcHk7XG4gICAgfSxcbiAgICBnZXRUYXJnZXQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBjYXB0dXJlID0gdGhpcy5jYXB0dXJlSW5mb1tpbkV2ZW50LnBvaW50ZXJJZF07XG4gICAgICBpZiAoIWNhcHR1cmUpIHtcbiAgICAgICAgcmV0dXJuIGluRXZlbnQuX3RhcmdldDtcbiAgICAgIH1cbiAgICAgIGlmIChpbkV2ZW50Ll90YXJnZXQgPT09IGNhcHR1cmUgfHwgIShpbkV2ZW50LnR5cGUgaW4gQk9VTkRBUllfRVZFTlRTKSkge1xuICAgICAgICByZXR1cm4gY2FwdHVyZTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNldENhcHR1cmU6IGZ1bmN0aW9uKGluUG9pbnRlcklkLCBpblRhcmdldCkge1xuICAgICAgaWYgKHRoaXMuY2FwdHVyZUluZm9baW5Qb2ludGVySWRdKSB7XG4gICAgICAgIHRoaXMucmVsZWFzZUNhcHR1cmUoaW5Qb2ludGVySWQpO1xuICAgICAgfVxuICAgICAgdGhpcy5jYXB0dXJlSW5mb1tpblBvaW50ZXJJZF0gPSBpblRhcmdldDtcbiAgICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICBlLmluaXRFdmVudCgnZ290cG9pbnRlcmNhcHR1cmUnLCB0cnVlLCBmYWxzZSk7XG4gICAgICBlLnBvaW50ZXJJZCA9IGluUG9pbnRlcklkO1xuICAgICAgdGhpcy5pbXBsaWNpdFJlbGVhc2UgPSB0aGlzLnJlbGVhc2VDYXB0dXJlLmJpbmQodGhpcywgaW5Qb2ludGVySWQpO1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcnVwJywgdGhpcy5pbXBsaWNpdFJlbGVhc2UpO1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmNhbmNlbCcsIHRoaXMuaW1wbGljaXRSZWxlYXNlKTtcbiAgICAgIGUuX3RhcmdldCA9IGluVGFyZ2V0O1xuICAgICAgdGhpcy5hc3luY0Rpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSxcbiAgICByZWxlYXNlQ2FwdHVyZTogZnVuY3Rpb24oaW5Qb2ludGVySWQpIHtcbiAgICAgIHZhciB0ID0gdGhpcy5jYXB0dXJlSW5mb1tpblBvaW50ZXJJZF07XG4gICAgICBpZiAodCkge1xuICAgICAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgICBlLmluaXRFdmVudCgnbG9zdHBvaW50ZXJjYXB0dXJlJywgdHJ1ZSwgZmFsc2UpO1xuICAgICAgICBlLnBvaW50ZXJJZCA9IGluUG9pbnRlcklkO1xuICAgICAgICB0aGlzLmNhcHR1cmVJbmZvW2luUG9pbnRlcklkXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcnVwJywgdGhpcy5pbXBsaWNpdFJlbGVhc2UpO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyY2FuY2VsJywgdGhpcy5pbXBsaWNpdFJlbGVhc2UpO1xuICAgICAgICBlLl90YXJnZXQgPSB0O1xuICAgICAgICB0aGlzLmFzeW5jRGlzcGF0Y2hFdmVudChlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoZXMgdGhlIGV2ZW50IHRvIGl0cyB0YXJnZXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBpbkV2ZW50IFRoZSBldmVudCB0byBiZSBkaXNwYXRjaGVkLlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IFRydWUgaWYgYW4gZXZlbnQgaGFuZGxlciByZXR1cm5zIHRydWUsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBkaXNwYXRjaEV2ZW50OiAvKnNjb3BlLmV4dGVybmFsLmRpc3BhdGNoRXZlbnQgfHwgKi9mdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgdCA9IHRoaXMuZ2V0VGFyZ2V0KGluRXZlbnQpO1xuICAgICAgaWYgKHQpIHtcbiAgICAgICAgcmV0dXJuIHQuZGlzcGF0Y2hFdmVudChpbkV2ZW50KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGFzeW5jRGlzcGF0Y2hFdmVudDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuZGlzcGF0Y2hFdmVudC5iaW5kKHRoaXMsIGluRXZlbnQpKTtcbiAgICB9XG4gIH07XG4gIGRpc3BhdGNoZXIuYm91bmRIYW5kbGVyID0gZGlzcGF0Y2hlci5ldmVudEhhbmRsZXIuYmluZChkaXNwYXRjaGVyKTtcblxuICB2YXIgX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuXG4gIHZhciB0YXJnZXRpbmcgPSB7XG4gICAgc2hhZG93OiBmdW5jdGlvbihpbkVsKSB7XG4gICAgICBpZiAoaW5FbCkge1xuICAgICAgICByZXR1cm4gaW5FbC5zaGFkb3dSb290IHx8IGluRWwud2Via2l0U2hhZG93Um9vdDtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNhblRhcmdldDogZnVuY3Rpb24oc2hhZG93KSB7XG4gICAgICByZXR1cm4gc2hhZG93ICYmIEJvb2xlYW4oc2hhZG93LmVsZW1lbnRGcm9tUG9pbnQpO1xuICAgIH0sXG4gICAgdGFyZ2V0aW5nU2hhZG93OiBmdW5jdGlvbihpbkVsKSB7XG4gICAgICB2YXIgcyA9IHRoaXMuc2hhZG93KGluRWwpO1xuICAgICAgaWYgKHRoaXMuY2FuVGFyZ2V0KHMpKSB7XG4gICAgICAgIHJldHVybiBzO1xuICAgICAgfVxuICAgIH0sXG4gICAgb2xkZXJTaGFkb3c6IGZ1bmN0aW9uKHNoYWRvdykge1xuICAgICAgdmFyIG9zID0gc2hhZG93Lm9sZGVyU2hhZG93Um9vdDtcbiAgICAgIGlmICghb3MpIHtcbiAgICAgICAgdmFyIHNlID0gc2hhZG93LnF1ZXJ5U2VsZWN0b3IoJ3NoYWRvdycpO1xuICAgICAgICBpZiAoc2UpIHtcbiAgICAgICAgICBvcyA9IHNlLm9sZGVyU2hhZG93Um9vdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9zO1xuICAgIH0sXG4gICAgYWxsU2hhZG93czogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdmFyIHNoYWRvd3MgPSBbXTtcbiAgICAgIHZhciBzID0gdGhpcy5zaGFkb3coZWxlbWVudCk7XG4gICAgICB3aGlsZSAocykge1xuICAgICAgICBzaGFkb3dzLnB1c2gocyk7XG4gICAgICAgIHMgPSB0aGlzLm9sZGVyU2hhZG93KHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNoYWRvd3M7XG4gICAgfSxcbiAgICBzZWFyY2hSb290OiBmdW5jdGlvbihpblJvb3QsIHgsIHkpIHtcbiAgICAgIGlmIChpblJvb3QpIHtcbiAgICAgICAgdmFyIHQgPSBpblJvb3QuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgICAgICAgdmFyIHN0LCBzcjtcblxuICAgICAgICAvLyBpcyBlbGVtZW50IGEgc2hhZG93IGhvc3Q/XG4gICAgICAgIHNyID0gdGhpcy50YXJnZXRpbmdTaGFkb3codCk7XG4gICAgICAgIHdoaWxlIChzcikge1xuXG4gICAgICAgICAgLy8gZmluZCB0aGUgdGhlIGVsZW1lbnQgaW5zaWRlIHRoZSBzaGFkb3cgcm9vdFxuICAgICAgICAgIHN0ID0gc3IuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgICAgICAgICBpZiAoIXN0KSB7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIGZvciBvbGRlciBzaGFkb3dzXG4gICAgICAgICAgICBzciA9IHRoaXMub2xkZXJTaGFkb3coc3IpO1xuICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIHNoYWRvd2VkIGVsZW1lbnQgbWF5IGNvbnRhaW4gYSBzaGFkb3cgcm9vdFxuICAgICAgICAgICAgdmFyIHNzciA9IHRoaXMudGFyZ2V0aW5nU2hhZG93KHN0KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlYXJjaFJvb3Qoc3NyLCB4LCB5KSB8fCBzdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBsaWdodCBkb20gZWxlbWVudCBpcyB0aGUgdGFyZ2V0XG4gICAgICAgIHJldHVybiB0O1xuICAgICAgfVxuICAgIH0sXG4gICAgb3duZXI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHZhciBzID0gZWxlbWVudDtcblxuICAgICAgLy8gd2FsayB1cCB1bnRpbCB5b3UgaGl0IHRoZSBzaGFkb3cgcm9vdCBvciBkb2N1bWVudFxuICAgICAgd2hpbGUgKHMucGFyZW50Tm9kZSkge1xuICAgICAgICBzID0gcy5wYXJlbnROb2RlO1xuICAgICAgfVxuXG4gICAgICAvLyB0aGUgb3duZXIgZWxlbWVudCBpcyBleHBlY3RlZCB0byBiZSBhIERvY3VtZW50IG9yIFNoYWRvd1Jvb3RcbiAgICAgIGlmIChzLm5vZGVUeXBlICE9PSBOb2RlLkRPQ1VNRU5UX05PREUgJiYgcy5ub2RlVHlwZSAhPT0gTm9kZS5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFKSB7XG4gICAgICAgIHMgPSBkb2N1bWVudDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzO1xuICAgIH0sXG4gICAgZmluZFRhcmdldDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIHggPSBpbkV2ZW50LmNsaWVudFg7XG4gICAgICB2YXIgeSA9IGluRXZlbnQuY2xpZW50WTtcblxuICAgICAgLy8gaWYgdGhlIGxpc3RlbmVyIGlzIGluIHRoZSBzaGFkb3cgcm9vdCwgaXQgaXMgbXVjaCBmYXN0ZXIgdG8gc3RhcnQgdGhlcmVcbiAgICAgIHZhciBzID0gdGhpcy5vd25lcihpbkV2ZW50LnRhcmdldCk7XG5cbiAgICAgIC8vIGlmIHgsIHkgaXMgbm90IGluIHRoaXMgcm9vdCwgZmFsbCBiYWNrIHRvIGRvY3VtZW50IHNlYXJjaFxuICAgICAgaWYgKCFzLmVsZW1lbnRGcm9tUG9pbnQoeCwgeSkpIHtcbiAgICAgICAgcyA9IGRvY3VtZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoUm9vdChzLCB4LCB5KTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoaXMgbW9kdWxlIHVzZXMgTXV0YXRpb24gT2JzZXJ2ZXJzIHRvIGR5bmFtaWNhbGx5IGFkanVzdCB3aGljaCBub2RlcyB3aWxsXG4gICAqIGdlbmVyYXRlIFBvaW50ZXIgRXZlbnRzLlxuICAgKlxuICAgKiBBbGwgbm9kZXMgdGhhdCB3aXNoIHRvIGdlbmVyYXRlIFBvaW50ZXIgRXZlbnRzIG11c3QgaGF2ZSB0aGUgYXR0cmlidXRlXG4gICAqIGB0b3VjaC1hY3Rpb25gIHNldCB0byBgbm9uZWAuXG4gICAqL1xuICB2YXIgZm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwuYmluZChBcnJheS5wcm90b3R5cGUuZm9yRWFjaCk7XG4gIHZhciBtYXAgPSBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwuYmluZChBcnJheS5wcm90b3R5cGUubWFwKTtcbiAgdmFyIHRvQXJyYXkgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbC5iaW5kKEFycmF5LnByb3RvdHlwZS5zbGljZSk7XG4gIHZhciBmaWx0ZXIgPSBBcnJheS5wcm90b3R5cGUuZmlsdGVyLmNhbGwuYmluZChBcnJheS5wcm90b3R5cGUuZmlsdGVyKTtcbiAgdmFyIE1PID0gd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIgfHwgd2luZG93LldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG4gIHZhciBTRUxFQ1RPUiA9ICdbdG91Y2gtYWN0aW9uXSc7XG4gIHZhciBPQlNFUlZFUl9JTklUID0ge1xuICAgIHN1YnRyZWU6IHRydWUsXG4gICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgYXR0cmlidXRlT2xkVmFsdWU6IHRydWUsXG4gICAgYXR0cmlidXRlRmlsdGVyOiBbJ3RvdWNoLWFjdGlvbiddXG4gIH07XG5cbiAgZnVuY3Rpb24gSW5zdGFsbGVyKGFkZCwgcmVtb3ZlLCBjaGFuZ2VkLCBiaW5kZXIpIHtcbiAgICB0aGlzLmFkZENhbGxiYWNrID0gYWRkLmJpbmQoYmluZGVyKTtcbiAgICB0aGlzLnJlbW92ZUNhbGxiYWNrID0gcmVtb3ZlLmJpbmQoYmluZGVyKTtcbiAgICB0aGlzLmNoYW5nZWRDYWxsYmFjayA9IGNoYW5nZWQuYmluZChiaW5kZXIpO1xuICAgIGlmIChNTykge1xuICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBNTyh0aGlzLm11dGF0aW9uV2F0Y2hlci5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH1cblxuICBJbnN0YWxsZXIucHJvdG90eXBlID0ge1xuICAgIHdhdGNoU3VidHJlZTogZnVuY3Rpb24odGFyZ2V0KSB7XG5cbiAgICAgIC8vIE9ubHkgd2F0Y2ggc2NvcGVzIHRoYXQgY2FuIHRhcmdldCBmaW5kLCBhcyB0aGVzZSBhcmUgdG9wLWxldmVsLlxuICAgICAgLy8gT3RoZXJ3aXNlIHdlIGNhbiBzZWUgZHVwbGljYXRlIGFkZGl0aW9ucyBhbmQgcmVtb3ZhbHMgdGhhdCBhZGQgbm9pc2UuXG4gICAgICAvL1xuICAgICAgLy8gVE9ETyhkZnJlZWRtYW4pOiBGb3Igc29tZSBpbnN0YW5jZXMgd2l0aCBTaGFkb3dET01Qb2x5ZmlsbCwgd2UgY2FuIHNlZVxuICAgICAgLy8gYSByZW1vdmFsIHdpdGhvdXQgYW4gaW5zZXJ0aW9uIHdoZW4gYSBub2RlIGlzIHJlZGlzdHJpYnV0ZWQgYW1vbmdcbiAgICAgIC8vIHNoYWRvd3MuIFNpbmNlIGl0IGFsbCBlbmRzIHVwIGNvcnJlY3QgaW4gdGhlIGRvY3VtZW50LCB3YXRjaGluZyBvbmx5XG4gICAgICAvLyB0aGUgZG9jdW1lbnQgd2lsbCB5aWVsZCB0aGUgY29ycmVjdCBtdXRhdGlvbnMgdG8gd2F0Y2guXG4gICAgICBpZiAodGhpcy5vYnNlcnZlciAmJiB0YXJnZXRpbmcuY2FuVGFyZ2V0KHRhcmdldCkpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKHRhcmdldCwgT0JTRVJWRVJfSU5JVCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlbmFibGVPblN1YnRyZWU6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgdGhpcy53YXRjaFN1YnRyZWUodGFyZ2V0KTtcbiAgICAgIGlmICh0YXJnZXQgPT09IGRvY3VtZW50ICYmIGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgdGhpcy5pbnN0YWxsT25Mb2FkKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmluc3RhbGxOZXdTdWJ0cmVlKHRhcmdldCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBpbnN0YWxsTmV3U3VidHJlZTogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBmb3JFYWNoKHRoaXMuZmluZEVsZW1lbnRzKHRhcmdldCksIHRoaXMuYWRkRWxlbWVudCwgdGhpcyk7XG4gICAgfSxcbiAgICBmaW5kRWxlbWVudHM6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgaWYgKHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQucXVlcnlTZWxlY3RvckFsbChTRUxFQ1RPUik7XG4gICAgICB9XG4gICAgICByZXR1cm4gW107XG4gICAgfSxcbiAgICByZW1vdmVFbGVtZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgdGhpcy5yZW1vdmVDYWxsYmFjayhlbCk7XG4gICAgfSxcbiAgICBhZGRFbGVtZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgdGhpcy5hZGRDYWxsYmFjayhlbCk7XG4gICAgfSxcbiAgICBlbGVtZW50Q2hhbmdlZDogZnVuY3Rpb24oZWwsIG9sZFZhbHVlKSB7XG4gICAgICB0aGlzLmNoYW5nZWRDYWxsYmFjayhlbCwgb2xkVmFsdWUpO1xuICAgIH0sXG4gICAgY29uY2F0TGlzdHM6IGZ1bmN0aW9uKGFjY3VtLCBsaXN0KSB7XG4gICAgICByZXR1cm4gYWNjdW0uY29uY2F0KHRvQXJyYXkobGlzdCkpO1xuICAgIH0sXG5cbiAgICAvLyByZWdpc3RlciBhbGwgdG91Y2gtYWN0aW9uID0gbm9uZSBub2RlcyBvbiBkb2N1bWVudCBsb2FkXG4gICAgaW5zdGFsbE9uTG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdyZWFkeXN0YXRlY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgdGhpcy5pbnN0YWxsTmV3U3VidHJlZShkb2N1bWVudCk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICBpc0VsZW1lbnQ6IGZ1bmN0aW9uKG4pIHtcbiAgICAgIHJldHVybiBuLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERTtcbiAgICB9LFxuICAgIGZsYXR0ZW5NdXRhdGlvblRyZWU6IGZ1bmN0aW9uKGluTm9kZXMpIHtcblxuICAgICAgLy8gZmluZCBjaGlsZHJlbiB3aXRoIHRvdWNoLWFjdGlvblxuICAgICAgdmFyIHRyZWUgPSBtYXAoaW5Ob2RlcywgdGhpcy5maW5kRWxlbWVudHMsIHRoaXMpO1xuXG4gICAgICAvLyBtYWtlIHN1cmUgdGhlIGFkZGVkIG5vZGVzIGFyZSBhY2NvdW50ZWQgZm9yXG4gICAgICB0cmVlLnB1c2goZmlsdGVyKGluTm9kZXMsIHRoaXMuaXNFbGVtZW50KSk7XG5cbiAgICAgIC8vIGZsYXR0ZW4gdGhlIGxpc3RcbiAgICAgIHJldHVybiB0cmVlLnJlZHVjZSh0aGlzLmNvbmNhdExpc3RzLCBbXSk7XG4gICAgfSxcbiAgICBtdXRhdGlvbldhdGNoZXI6IGZ1bmN0aW9uKG11dGF0aW9ucykge1xuICAgICAgbXV0YXRpb25zLmZvckVhY2godGhpcy5tdXRhdGlvbkhhbmRsZXIsIHRoaXMpO1xuICAgIH0sXG4gICAgbXV0YXRpb25IYW5kbGVyOiBmdW5jdGlvbihtKSB7XG4gICAgICBpZiAobS50eXBlID09PSAnY2hpbGRMaXN0Jykge1xuICAgICAgICB2YXIgYWRkZWQgPSB0aGlzLmZsYXR0ZW5NdXRhdGlvblRyZWUobS5hZGRlZE5vZGVzKTtcbiAgICAgICAgYWRkZWQuZm9yRWFjaCh0aGlzLmFkZEVsZW1lbnQsIHRoaXMpO1xuICAgICAgICB2YXIgcmVtb3ZlZCA9IHRoaXMuZmxhdHRlbk11dGF0aW9uVHJlZShtLnJlbW92ZWROb2Rlcyk7XG4gICAgICAgIHJlbW92ZWQuZm9yRWFjaCh0aGlzLnJlbW92ZUVsZW1lbnQsIHRoaXMpO1xuICAgICAgfSBlbHNlIGlmIChtLnR5cGUgPT09ICdhdHRyaWJ1dGVzJykge1xuICAgICAgICB0aGlzLmVsZW1lbnRDaGFuZ2VkKG0udGFyZ2V0LCBtLm9sZFZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdmFyIGluc3RhbGxlciA9IEluc3RhbGxlcjtcblxuICBmdW5jdGlvbiBzaGFkb3dTZWxlY3Rvcih2KSB7XG4gICAgcmV0dXJuICdib2R5IC9zaGFkb3ctZGVlcC8gJyArIHNlbGVjdG9yKHYpO1xuICB9XG4gIGZ1bmN0aW9uIHNlbGVjdG9yKHYpIHtcbiAgICByZXR1cm4gJ1t0b3VjaC1hY3Rpb249XCInICsgdiArICdcIl0nO1xuICB9XG4gIGZ1bmN0aW9uIHJ1bGUodikge1xuICAgIHJldHVybiAneyAtbXMtdG91Y2gtYWN0aW9uOiAnICsgdiArICc7IHRvdWNoLWFjdGlvbjogJyArIHYgKyAnOyB0b3VjaC1hY3Rpb24tZGVsYXk6IG5vbmU7IH0nO1xuICB9XG4gIHZhciBhdHRyaWIyY3NzID0gW1xuICAgICdub25lJyxcbiAgICAnYXV0bycsXG4gICAgJ3Bhbi14JyxcbiAgICAncGFuLXknLFxuICAgIHtcbiAgICAgIHJ1bGU6ICdwYW4teCBwYW4teScsXG4gICAgICBzZWxlY3RvcnM6IFtcbiAgICAgICAgJ3Bhbi14IHBhbi15JyxcbiAgICAgICAgJ3Bhbi15IHBhbi14J1xuICAgICAgXVxuICAgIH1cbiAgXTtcbiAgdmFyIHN0eWxlcyA9ICcnO1xuXG4gIC8vIG9ubHkgaW5zdGFsbCBzdHlsZXNoZWV0IGlmIHRoZSBicm93c2VyIGhhcyB0b3VjaCBhY3Rpb24gc3VwcG9ydFxuICB2YXIgaGFzTmF0aXZlUEUgPSB3aW5kb3cuUG9pbnRlckV2ZW50IHx8IHdpbmRvdy5NU1BvaW50ZXJFdmVudDtcblxuICAvLyBvbmx5IGFkZCBzaGFkb3cgc2VsZWN0b3JzIGlmIHNoYWRvd2RvbSBpcyBzdXBwb3J0ZWRcbiAgdmFyIGhhc1NoYWRvd1Jvb3QgPSAhd2luZG93LlNoYWRvd0RPTVBvbHlmaWxsICYmIGRvY3VtZW50LmhlYWQuY3JlYXRlU2hhZG93Um9vdDtcblxuICBmdW5jdGlvbiBhcHBseUF0dHJpYnV0ZVN0eWxlcygpIHtcbiAgICBpZiAoaGFzTmF0aXZlUEUpIHtcbiAgICAgIGF0dHJpYjJjc3MuZm9yRWFjaChmdW5jdGlvbihyKSB7XG4gICAgICAgIGlmIChTdHJpbmcocikgPT09IHIpIHtcbiAgICAgICAgICBzdHlsZXMgKz0gc2VsZWN0b3IocikgKyBydWxlKHIpICsgJ1xcbic7XG4gICAgICAgICAgaWYgKGhhc1NoYWRvd1Jvb3QpIHtcbiAgICAgICAgICAgIHN0eWxlcyArPSBzaGFkb3dTZWxlY3RvcihyKSArIHJ1bGUocikgKyAnXFxuJztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3R5bGVzICs9IHIuc2VsZWN0b3JzLm1hcChzZWxlY3RvcikgKyBydWxlKHIucnVsZSkgKyAnXFxuJztcbiAgICAgICAgICBpZiAoaGFzU2hhZG93Um9vdCkge1xuICAgICAgICAgICAgc3R5bGVzICs9IHIuc2VsZWN0b3JzLm1hcChzaGFkb3dTZWxlY3RvcikgKyBydWxlKHIucnVsZSkgKyAnXFxuJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgZWwudGV4dENvbnRlbnQgPSBzdHlsZXM7XG4gICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGVsKTtcbiAgICB9XG4gIH1cblxuICB2YXIgbW91c2VfX3BvaW50ZXJtYXAgPSBfZGlzcGF0Y2hlci5wb2ludGVybWFwO1xuXG4gIC8vIHJhZGl1cyBhcm91bmQgdG91Y2hlbmQgdGhhdCBzd2FsbG93cyBtb3VzZSBldmVudHNcbiAgdmFyIERFRFVQX0RJU1QgPSAyNTtcblxuICAvLyBsZWZ0LCBtaWRkbGUsIHJpZ2h0LCBiYWNrLCBmb3J3YXJkXG4gIHZhciBCVVRUT05fVE9fQlVUVE9OUyA9IFsxLCA0LCAyLCA4LCAxNl07XG5cbiAgdmFyIEhBU19CVVRUT05TID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgSEFTX0JVVFRPTlMgPSBuZXcgTW91c2VFdmVudCgndGVzdCcsIHsgYnV0dG9uczogMSB9KS5idXR0b25zID09PSAxO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIC8vIGhhbmRsZXIgYmxvY2sgZm9yIG5hdGl2ZSBtb3VzZSBldmVudHNcbiAgdmFyIG1vdXNlRXZlbnRzID0ge1xuICAgIFBPSU5URVJfSUQ6IDEsXG4gICAgUE9JTlRFUl9UWVBFOiAnbW91c2UnLFxuICAgIGV2ZW50czogW1xuICAgICAgJ21vdXNlZG93bicsXG4gICAgICAnbW91c2Vtb3ZlJyxcbiAgICAgICdtb3VzZXVwJyxcbiAgICAgICdtb3VzZW92ZXInLFxuICAgICAgJ21vdXNlb3V0J1xuICAgIF0sXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgX2Rpc3BhdGNoZXIubGlzdGVuKHRhcmdldCwgdGhpcy5ldmVudHMpO1xuICAgIH0sXG4gICAgdW5yZWdpc3RlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBfZGlzcGF0Y2hlci51bmxpc3Rlbih0YXJnZXQsIHRoaXMuZXZlbnRzKTtcbiAgICB9LFxuICAgIGxhc3RUb3VjaGVzOiBbXSxcblxuICAgIC8vIGNvbGxpZGUgd2l0aCB0aGUgZ2xvYmFsIG1vdXNlIGxpc3RlbmVyXG4gICAgaXNFdmVudFNpbXVsYXRlZEZyb21Ub3VjaDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGx0cyA9IHRoaXMubGFzdFRvdWNoZXM7XG4gICAgICB2YXIgeCA9IGluRXZlbnQuY2xpZW50WDtcbiAgICAgIHZhciB5ID0gaW5FdmVudC5jbGllbnRZO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsdHMubGVuZ3RoLCB0OyBpIDwgbCAmJiAodCA9IGx0c1tpXSk7IGkrKykge1xuXG4gICAgICAgIC8vIHNpbXVsYXRlZCBtb3VzZSBldmVudHMgd2lsbCBiZSBzd2FsbG93ZWQgbmVhciBhIHByaW1hcnkgdG91Y2hlbmRcbiAgICAgICAgdmFyIGR4ID0gTWF0aC5hYnMoeCAtIHQueCk7XG4gICAgICAgIHZhciBkeSA9IE1hdGguYWJzKHkgLSB0LnkpO1xuICAgICAgICBpZiAoZHggPD0gREVEVVBfRElTVCAmJiBkeSA8PSBERURVUF9ESVNUKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHByZXBhcmVFdmVudDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSBfZGlzcGF0Y2hlci5jbG9uZUV2ZW50KGluRXZlbnQpO1xuXG4gICAgICAvLyBmb3J3YXJkIG1vdXNlIHByZXZlbnREZWZhdWx0XG4gICAgICB2YXIgcGQgPSBlLnByZXZlbnREZWZhdWx0O1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpbkV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHBkKCk7XG4gICAgICB9O1xuICAgICAgZS5wb2ludGVySWQgPSB0aGlzLlBPSU5URVJfSUQ7XG4gICAgICBlLmlzUHJpbWFyeSA9IHRydWU7XG4gICAgICBlLnBvaW50ZXJUeXBlID0gdGhpcy5QT0lOVEVSX1RZUEU7XG4gICAgICByZXR1cm4gZTtcbiAgICB9LFxuICAgIHByZXBhcmVCdXR0b25zRm9yTW92ZTogZnVuY3Rpb24oZSwgaW5FdmVudCkge1xuICAgICAgdmFyIHAgPSBtb3VzZV9fcG9pbnRlcm1hcC5nZXQodGhpcy5QT0lOVEVSX0lEKTtcbiAgICAgIGUuYnV0dG9ucyA9IHAgPyBwLmJ1dHRvbnMgOiAwO1xuICAgICAgaW5FdmVudC5idXR0b25zID0gZS5idXR0b25zO1xuICAgIH0sXG4gICAgbW91c2Vkb3duOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuaXNFdmVudFNpbXVsYXRlZEZyb21Ub3VjaChpbkV2ZW50KSkge1xuICAgICAgICB2YXIgcCA9IG1vdXNlX19wb2ludGVybWFwLmdldCh0aGlzLlBPSU5URVJfSUQpO1xuICAgICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgICBpZiAoIUhBU19CVVRUT05TKSB7XG4gICAgICAgICAgZS5idXR0b25zID0gQlVUVE9OX1RPX0JVVFRPTlNbZS5idXR0b25dO1xuICAgICAgICAgIGlmIChwKSB7IGUuYnV0dG9ucyB8PSBwLmJ1dHRvbnM7IH1cbiAgICAgICAgICBpbkV2ZW50LmJ1dHRvbnMgPSBlLmJ1dHRvbnM7XG4gICAgICAgIH1cbiAgICAgICAgbW91c2VfX3BvaW50ZXJtYXAuc2V0KHRoaXMuUE9JTlRFUl9JRCwgaW5FdmVudCk7XG4gICAgICAgIGlmICghcCkge1xuICAgICAgICAgIF9kaXNwYXRjaGVyLmRvd24oZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX2Rpc3BhdGNoZXIubW92ZShlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbW91c2Vtb3ZlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuaXNFdmVudFNpbXVsYXRlZEZyb21Ub3VjaChpbkV2ZW50KSkge1xuICAgICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgICBpZiAoIUhBU19CVVRUT05TKSB7IHRoaXMucHJlcGFyZUJ1dHRvbnNGb3JNb3ZlKGUsIGluRXZlbnQpOyB9XG4gICAgICAgIF9kaXNwYXRjaGVyLm1vdmUoZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBtb3VzZXVwOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuaXNFdmVudFNpbXVsYXRlZEZyb21Ub3VjaChpbkV2ZW50KSkge1xuICAgICAgICB2YXIgcCA9IG1vdXNlX19wb2ludGVybWFwLmdldCh0aGlzLlBPSU5URVJfSUQpO1xuICAgICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgICBpZiAoIUhBU19CVVRUT05TKSB7XG4gICAgICAgICAgdmFyIHVwID0gQlVUVE9OX1RPX0JVVFRPTlNbZS5idXR0b25dO1xuXG4gICAgICAgICAgLy8gUHJvZHVjZXMgd3Jvbmcgc3RhdGUgb2YgYnV0dG9ucyBpbiBCcm93c2VycyB3aXRob3V0IGBidXR0b25zYCBzdXBwb3J0XG4gICAgICAgICAgLy8gd2hlbiBhIG1vdXNlIGJ1dHRvbiB0aGF0IHdhcyBwcmVzc2VkIG91dHNpZGUgdGhlIGRvY3VtZW50IGlzIHJlbGVhc2VkXG4gICAgICAgICAgLy8gaW5zaWRlIGFuZCBvdGhlciBidXR0b25zIGFyZSBzdGlsbCBwcmVzc2VkIGRvd24uXG4gICAgICAgICAgZS5idXR0b25zID0gcCA/IHAuYnV0dG9ucyAmIH51cCA6IDA7XG4gICAgICAgICAgaW5FdmVudC5idXR0b25zID0gZS5idXR0b25zO1xuICAgICAgICB9XG4gICAgICAgIG1vdXNlX19wb2ludGVybWFwLnNldCh0aGlzLlBPSU5URVJfSUQsIGluRXZlbnQpO1xuXG4gICAgICAgIC8vIFN1cHBvcnQ6IEZpcmVmb3ggPD00NCBvbmx5XG4gICAgICAgIC8vIEZGIFVidW50dSBpbmNsdWRlcyB0aGUgbGlmdGVkIGJ1dHRvbiBpbiB0aGUgYGJ1dHRvbnNgIHByb3BlcnR5IG9uXG4gICAgICAgIC8vIG1vdXNldXAuXG4gICAgICAgIC8vIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTEyMjMzNjZcbiAgICAgICAgaWYgKGUuYnV0dG9ucyA9PT0gMCB8fCBlLmJ1dHRvbnMgPT09IEJVVFRPTl9UT19CVVRUT05TW2UuYnV0dG9uXSkge1xuICAgICAgICAgIHRoaXMuY2xlYW51cE1vdXNlKCk7XG4gICAgICAgICAgX2Rpc3BhdGNoZXIudXAoZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX2Rpc3BhdGNoZXIubW92ZShlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbW91c2VvdmVyOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuaXNFdmVudFNpbXVsYXRlZEZyb21Ub3VjaChpbkV2ZW50KSkge1xuICAgICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgICBpZiAoIUhBU19CVVRUT05TKSB7IHRoaXMucHJlcGFyZUJ1dHRvbnNGb3JNb3ZlKGUsIGluRXZlbnQpOyB9XG4gICAgICAgIF9kaXNwYXRjaGVyLmVudGVyT3ZlcihlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdXNlb3V0OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuaXNFdmVudFNpbXVsYXRlZEZyb21Ub3VjaChpbkV2ZW50KSkge1xuICAgICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgICBpZiAoIUhBU19CVVRUT05TKSB7IHRoaXMucHJlcGFyZUJ1dHRvbnNGb3JNb3ZlKGUsIGluRXZlbnQpOyB9XG4gICAgICAgIF9kaXNwYXRjaGVyLmxlYXZlT3V0KGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgY2FuY2VsOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgX2Rpc3BhdGNoZXIuY2FuY2VsKGUpO1xuICAgICAgdGhpcy5jbGVhbnVwTW91c2UoKTtcbiAgICB9LFxuICAgIGNsZWFudXBNb3VzZTogZnVuY3Rpb24oKSB7XG4gICAgICBtb3VzZV9fcG9pbnRlcm1hcC5kZWxldGUodGhpcy5QT0lOVEVSX0lEKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIG1vdXNlID0gbW91c2VFdmVudHM7XG5cbiAgdmFyIGNhcHR1cmVJbmZvID0gX2Rpc3BhdGNoZXIuY2FwdHVyZUluZm87XG4gIHZhciBmaW5kVGFyZ2V0ID0gdGFyZ2V0aW5nLmZpbmRUYXJnZXQuYmluZCh0YXJnZXRpbmcpO1xuICB2YXIgYWxsU2hhZG93cyA9IHRhcmdldGluZy5hbGxTaGFkb3dzLmJpbmQodGFyZ2V0aW5nKTtcbiAgdmFyIHRvdWNoX19wb2ludGVybWFwID0gX2Rpc3BhdGNoZXIucG9pbnRlcm1hcDtcblxuICAvLyBUaGlzIHNob3VsZCBiZSBsb25nIGVub3VnaCB0byBpZ25vcmUgY29tcGF0IG1vdXNlIGV2ZW50cyBtYWRlIGJ5IHRvdWNoXG4gIHZhciBERURVUF9USU1FT1VUID0gMjUwMDtcbiAgdmFyIENMSUNLX0NPVU5UX1RJTUVPVVQgPSAyMDA7XG4gIHZhciBBVFRSSUIgPSAndG91Y2gtYWN0aW9uJztcbiAgdmFyIElOU1RBTExFUjtcblxuICAvLyBUaGUgcHJlc2VuY2Ugb2YgdG91Y2ggZXZlbnQgaGFuZGxlcnMgYmxvY2tzIHNjcm9sbGluZywgYW5kIHNvIHdlIG11c3QgYmUgY2FyZWZ1bCB0b1xuICAvLyBhdm9pZCBhZGRpbmcgaGFuZGxlcnMgdW5uZWNlc3NhcmlseS4gIENocm9tZSBwbGFucyB0byBhZGQgYSB0b3VjaC1hY3Rpb24tZGVsYXkgcHJvcGVydHlcbiAgLy8gKGNyYnVnLmNvbS8zMjk1NTkpIHRvIGFkZHJlc3MgdGhpcywgYW5kIG9uY2Ugd2UgaGF2ZSB0aGF0IHdlIGNhbiBvcHQtaW4gdG8gYSBzaW1wbGVyXG4gIC8vIGhhbmRsZXIgcmVnaXN0cmF0aW9uIG1lY2hhbmlzbS4gIFJhdGhlciB0aGFuIHRyeSB0byBwcmVkaWN0IGhvdyBleGFjdGx5IHRvIG9wdC1pbiB0b1xuICAvLyB0aGF0IHdlJ2xsIGp1c3QgbGVhdmUgdGhpcyBkaXNhYmxlZCB1bnRpbCB0aGVyZSBpcyBhIGJ1aWxkIG9mIENocm9tZSB0byB0ZXN0LlxuICB2YXIgSEFTX1RPVUNIX0FDVElPTl9ERUxBWSA9IGZhbHNlO1xuXG4gIC8vIGhhbmRsZXIgYmxvY2sgZm9yIG5hdGl2ZSB0b3VjaCBldmVudHNcbiAgdmFyIHRvdWNoRXZlbnRzID0ge1xuICAgIGV2ZW50czogW1xuICAgICAgJ3RvdWNoc3RhcnQnLFxuICAgICAgJ3RvdWNobW92ZScsXG4gICAgICAndG91Y2hlbmQnLFxuICAgICAgJ3RvdWNoY2FuY2VsJ1xuICAgIF0sXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgaWYgKEhBU19UT1VDSF9BQ1RJT05fREVMQVkpIHtcbiAgICAgICAgX2Rpc3BhdGNoZXIubGlzdGVuKHRhcmdldCwgdGhpcy5ldmVudHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgSU5TVEFMTEVSLmVuYWJsZU9uU3VidHJlZSh0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdW5yZWdpc3RlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBpZiAoSEFTX1RPVUNIX0FDVElPTl9ERUxBWSkge1xuICAgICAgICBfZGlzcGF0Y2hlci51bmxpc3Rlbih0YXJnZXQsIHRoaXMuZXZlbnRzKTtcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gVE9ETyhkZnJlZWRtYW4pOiBpcyBpdCB3b3J0aCBpdCB0byBkaXNjb25uZWN0IHRoZSBNTz9cbiAgICAgIH1cbiAgICB9LFxuICAgIGVsZW1lbnRBZGRlZDogZnVuY3Rpb24oZWwpIHtcbiAgICAgIHZhciBhID0gZWwuZ2V0QXR0cmlidXRlKEFUVFJJQik7XG4gICAgICB2YXIgc3QgPSB0aGlzLnRvdWNoQWN0aW9uVG9TY3JvbGxUeXBlKGEpO1xuICAgICAgaWYgKHN0KSB7XG4gICAgICAgIGVsLl9zY3JvbGxUeXBlID0gc3Q7XG4gICAgICAgIF9kaXNwYXRjaGVyLmxpc3RlbihlbCwgdGhpcy5ldmVudHMpO1xuXG4gICAgICAgIC8vIHNldCB0b3VjaC1hY3Rpb24gb24gc2hhZG93cyBhcyB3ZWxsXG4gICAgICAgIGFsbFNoYWRvd3MoZWwpLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgICAgIHMuX3Njcm9sbFR5cGUgPSBzdDtcbiAgICAgICAgICBfZGlzcGF0Y2hlci5saXN0ZW4ocywgdGhpcy5ldmVudHMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVsZW1lbnRSZW1vdmVkOiBmdW5jdGlvbihlbCkge1xuICAgICAgZWwuX3Njcm9sbFR5cGUgPSB1bmRlZmluZWQ7XG4gICAgICBfZGlzcGF0Y2hlci51bmxpc3RlbihlbCwgdGhpcy5ldmVudHMpO1xuXG4gICAgICAvLyByZW1vdmUgdG91Y2gtYWN0aW9uIGZyb20gc2hhZG93XG4gICAgICBhbGxTaGFkb3dzKGVsKS5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcy5fc2Nyb2xsVHlwZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgX2Rpc3BhdGNoZXIudW5saXN0ZW4ocywgdGhpcy5ldmVudHMpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSxcbiAgICBlbGVtZW50Q2hhbmdlZDogZnVuY3Rpb24oZWwsIG9sZFZhbHVlKSB7XG4gICAgICB2YXIgYSA9IGVsLmdldEF0dHJpYnV0ZShBVFRSSUIpO1xuICAgICAgdmFyIHN0ID0gdGhpcy50b3VjaEFjdGlvblRvU2Nyb2xsVHlwZShhKTtcbiAgICAgIHZhciBvbGRTdCA9IHRoaXMudG91Y2hBY3Rpb25Ub1Njcm9sbFR5cGUob2xkVmFsdWUpO1xuXG4gICAgICAvLyBzaW1wbHkgdXBkYXRlIHNjcm9sbFR5cGUgaWYgbGlzdGVuZXJzIGFyZSBhbHJlYWR5IGVzdGFibGlzaGVkXG4gICAgICBpZiAoc3QgJiYgb2xkU3QpIHtcbiAgICAgICAgZWwuX3Njcm9sbFR5cGUgPSBzdDtcbiAgICAgICAgYWxsU2hhZG93cyhlbCkuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgICAgICAgcy5fc2Nyb2xsVHlwZSA9IHN0O1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH0gZWxzZSBpZiAob2xkU3QpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50UmVtb3ZlZChlbCk7XG4gICAgICB9IGVsc2UgaWYgKHN0KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudEFkZGVkKGVsKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNjcm9sbFR5cGVzOiB7XG4gICAgICBFTUlUVEVSOiAnbm9uZScsXG4gICAgICBYU0NST0xMRVI6ICdwYW4teCcsXG4gICAgICBZU0NST0xMRVI6ICdwYW4teScsXG4gICAgICBTQ1JPTExFUjogL14oPzpwYW4teCBwYW4teSl8KD86cGFuLXkgcGFuLXgpfGF1dG8kL1xuICAgIH0sXG4gICAgdG91Y2hBY3Rpb25Ub1Njcm9sbFR5cGU6IGZ1bmN0aW9uKHRvdWNoQWN0aW9uKSB7XG4gICAgICB2YXIgdCA9IHRvdWNoQWN0aW9uO1xuICAgICAgdmFyIHN0ID0gdGhpcy5zY3JvbGxUeXBlcztcbiAgICAgIGlmICh0ID09PSAnbm9uZScpIHtcbiAgICAgICAgcmV0dXJuICdub25lJztcbiAgICAgIH0gZWxzZSBpZiAodCA9PT0gc3QuWFNDUk9MTEVSKSB7XG4gICAgICAgIHJldHVybiAnWCc7XG4gICAgICB9IGVsc2UgaWYgKHQgPT09IHN0LllTQ1JPTExFUikge1xuICAgICAgICByZXR1cm4gJ1knO1xuICAgICAgfSBlbHNlIGlmIChzdC5TQ1JPTExFUi5leGVjKHQpKSB7XG4gICAgICAgIHJldHVybiAnWFknO1xuICAgICAgfVxuICAgIH0sXG4gICAgUE9JTlRFUl9UWVBFOiAndG91Y2gnLFxuICAgIGZpcnN0VG91Y2g6IG51bGwsXG4gICAgaXNQcmltYXJ5VG91Y2g6IGZ1bmN0aW9uKGluVG91Y2gpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpcnN0VG91Y2ggPT09IGluVG91Y2guaWRlbnRpZmllcjtcbiAgICB9LFxuICAgIHNldFByaW1hcnlUb3VjaDogZnVuY3Rpb24oaW5Ub3VjaCkge1xuXG4gICAgICAvLyBzZXQgcHJpbWFyeSB0b3VjaCBpZiB0aGVyZSBubyBwb2ludGVycywgb3IgdGhlIG9ubHkgcG9pbnRlciBpcyB0aGUgbW91c2VcbiAgICAgIGlmICh0b3VjaF9fcG9pbnRlcm1hcC5zaXplID09PSAwIHx8ICh0b3VjaF9fcG9pbnRlcm1hcC5zaXplID09PSAxICYmIHRvdWNoX19wb2ludGVybWFwLmhhcygxKSkpIHtcbiAgICAgICAgdGhpcy5maXJzdFRvdWNoID0gaW5Ub3VjaC5pZGVudGlmaWVyO1xuICAgICAgICB0aGlzLmZpcnN0WFkgPSB7IFg6IGluVG91Y2guY2xpZW50WCwgWTogaW5Ub3VjaC5jbGllbnRZIH07XG4gICAgICAgIHRoaXMuc2Nyb2xsaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2FuY2VsUmVzZXRDbGlja0NvdW50KCk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVQcmltYXJ5UG9pbnRlcjogZnVuY3Rpb24oaW5Qb2ludGVyKSB7XG4gICAgICBpZiAoaW5Qb2ludGVyLmlzUHJpbWFyeSkge1xuICAgICAgICB0aGlzLmZpcnN0VG91Y2ggPSBudWxsO1xuICAgICAgICB0aGlzLmZpcnN0WFkgPSBudWxsO1xuICAgICAgICB0aGlzLnJlc2V0Q2xpY2tDb3VudCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgY2xpY2tDb3VudDogMCxcbiAgICByZXNldElkOiBudWxsLFxuICAgIHJlc2V0Q2xpY2tDb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZm4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5jbGlja0NvdW50ID0gMDtcbiAgICAgICAgdGhpcy5yZXNldElkID0gbnVsbDtcbiAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgIHRoaXMucmVzZXRJZCA9IHNldFRpbWVvdXQoZm4sIENMSUNLX0NPVU5UX1RJTUVPVVQpO1xuICAgIH0sXG4gICAgY2FuY2VsUmVzZXRDbGlja0NvdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnJlc2V0SWQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucmVzZXRJZCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0eXBlVG9CdXR0b25zOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICB2YXIgcmV0ID0gMDtcbiAgICAgIGlmICh0eXBlID09PSAndG91Y2hzdGFydCcgfHwgdHlwZSA9PT0gJ3RvdWNobW92ZScpIHtcbiAgICAgICAgcmV0ID0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSxcbiAgICB0b3VjaFRvUG9pbnRlcjogZnVuY3Rpb24oaW5Ub3VjaCkge1xuICAgICAgdmFyIGN0ZSA9IHRoaXMuY3VycmVudFRvdWNoRXZlbnQ7XG4gICAgICB2YXIgZSA9IF9kaXNwYXRjaGVyLmNsb25lRXZlbnQoaW5Ub3VjaCk7XG5cbiAgICAgIC8vIFdlIHJlc2VydmUgcG9pbnRlcklkIDEgZm9yIE1vdXNlLlxuICAgICAgLy8gVG91Y2ggaWRlbnRpZmllcnMgY2FuIHN0YXJ0IGF0IDAuXG4gICAgICAvLyBBZGQgMiB0byB0aGUgdG91Y2ggaWRlbnRpZmllciBmb3IgY29tcGF0aWJpbGl0eS5cbiAgICAgIHZhciBpZCA9IGUucG9pbnRlcklkID0gaW5Ub3VjaC5pZGVudGlmaWVyICsgMjtcbiAgICAgIGUudGFyZ2V0ID0gY2FwdHVyZUluZm9baWRdIHx8IGZpbmRUYXJnZXQoZSk7XG4gICAgICBlLmJ1YmJsZXMgPSB0cnVlO1xuICAgICAgZS5jYW5jZWxhYmxlID0gdHJ1ZTtcbiAgICAgIGUuZGV0YWlsID0gdGhpcy5jbGlja0NvdW50O1xuICAgICAgZS5idXR0b24gPSAwO1xuICAgICAgZS5idXR0b25zID0gdGhpcy50eXBlVG9CdXR0b25zKGN0ZS50eXBlKTtcbiAgICAgIGUud2lkdGggPSBpblRvdWNoLnJhZGl1c1ggfHwgaW5Ub3VjaC53ZWJraXRSYWRpdXNYIHx8IDA7XG4gICAgICBlLmhlaWdodCA9IGluVG91Y2gucmFkaXVzWSB8fCBpblRvdWNoLndlYmtpdFJhZGl1c1kgfHwgMDtcbiAgICAgIGUucHJlc3N1cmUgPSBpblRvdWNoLmZvcmNlIHx8IGluVG91Y2gud2Via2l0Rm9yY2UgfHwgMC41O1xuICAgICAgZS5pc1ByaW1hcnkgPSB0aGlzLmlzUHJpbWFyeVRvdWNoKGluVG91Y2gpO1xuICAgICAgZS5wb2ludGVyVHlwZSA9IHRoaXMuUE9JTlRFUl9UWVBFO1xuXG4gICAgICAvLyBmb3J3YXJkIHRvdWNoIHByZXZlbnREZWZhdWx0c1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNjcm9sbGluZyA9IGZhbHNlO1xuICAgICAgICBzZWxmLmZpcnN0WFkgPSBudWxsO1xuICAgICAgICBjdGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gZTtcbiAgICB9LFxuICAgIHByb2Nlc3NUb3VjaGVzOiBmdW5jdGlvbihpbkV2ZW50LCBpbkZ1bmN0aW9uKSB7XG4gICAgICB2YXIgdGwgPSBpbkV2ZW50LmNoYW5nZWRUb3VjaGVzO1xuICAgICAgdGhpcy5jdXJyZW50VG91Y2hFdmVudCA9IGluRXZlbnQ7XG4gICAgICBmb3IgKHZhciBpID0gMCwgdDsgaSA8IHRsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHQgPSB0bFtpXTtcbiAgICAgICAgaW5GdW5jdGlvbi5jYWxsKHRoaXMsIHRoaXMudG91Y2hUb1BvaW50ZXIodCkpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBGb3Igc2luZ2xlIGF4aXMgc2Nyb2xsZXJzLCBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGVsZW1lbnQgc2hvdWxkIGVtaXRcbiAgICAvLyBwb2ludGVyIGV2ZW50cyBvciBiZWhhdmUgYXMgYSBzY3JvbGxlclxuICAgIHNob3VsZFNjcm9sbDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKHRoaXMuZmlyc3RYWSkge1xuICAgICAgICB2YXIgcmV0O1xuICAgICAgICB2YXIgc2Nyb2xsQXhpcyA9IGluRXZlbnQuY3VycmVudFRhcmdldC5fc2Nyb2xsVHlwZTtcbiAgICAgICAgaWYgKHNjcm9sbEF4aXMgPT09ICdub25lJykge1xuXG4gICAgICAgICAgLy8gdGhpcyBlbGVtZW50IGlzIGEgdG91Y2gtYWN0aW9uOiBub25lLCBzaG91bGQgbmV2ZXIgc2Nyb2xsXG4gICAgICAgICAgcmV0ID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoc2Nyb2xsQXhpcyA9PT0gJ1hZJykge1xuXG4gICAgICAgICAgLy8gdGhpcyBlbGVtZW50IHNob3VsZCBhbHdheXMgc2Nyb2xsXG4gICAgICAgICAgcmV0ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgdCA9IGluRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG5cbiAgICAgICAgICAvLyBjaGVjayB0aGUgaW50ZW5kZWQgc2Nyb2xsIGF4aXMsIGFuZCBvdGhlciBheGlzXG4gICAgICAgICAgdmFyIGEgPSBzY3JvbGxBeGlzO1xuICAgICAgICAgIHZhciBvYSA9IHNjcm9sbEF4aXMgPT09ICdZJyA/ICdYJyA6ICdZJztcbiAgICAgICAgICB2YXIgZGEgPSBNYXRoLmFicyh0WydjbGllbnQnICsgYV0gLSB0aGlzLmZpcnN0WFlbYV0pO1xuICAgICAgICAgIHZhciBkb2EgPSBNYXRoLmFicyh0WydjbGllbnQnICsgb2FdIC0gdGhpcy5maXJzdFhZW29hXSk7XG5cbiAgICAgICAgICAvLyBpZiBkZWx0YSBpbiB0aGUgc2Nyb2xsIGF4aXMgPiBkZWx0YSBvdGhlciBheGlzLCBzY3JvbGwgaW5zdGVhZCBvZlxuICAgICAgICAgIC8vIG1ha2luZyBldmVudHNcbiAgICAgICAgICByZXQgPSBkYSA+PSBkb2E7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maXJzdFhZID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH1cbiAgICB9LFxuICAgIGZpbmRUb3VjaDogZnVuY3Rpb24oaW5UTCwgaW5JZCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBpblRMLmxlbmd0aCwgdDsgaSA8IGwgJiYgKHQgPSBpblRMW2ldKTsgaSsrKSB7XG4gICAgICAgIGlmICh0LmlkZW50aWZpZXIgPT09IGluSWQpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBJbiBzb21lIGluc3RhbmNlcywgYSB0b3VjaHN0YXJ0IGNhbiBoYXBwZW4gd2l0aG91dCBhIHRvdWNoZW5kLiBUaGlzXG4gICAgLy8gbGVhdmVzIHRoZSBwb2ludGVybWFwIGluIGEgYnJva2VuIHN0YXRlLlxuICAgIC8vIFRoZXJlZm9yZSwgb24gZXZlcnkgdG91Y2hzdGFydCwgd2UgcmVtb3ZlIHRoZSB0b3VjaGVzIHRoYXQgZGlkIG5vdCBmaXJlIGFcbiAgICAvLyB0b3VjaGVuZCBldmVudC5cbiAgICAvLyBUbyBrZWVwIHN0YXRlIGdsb2JhbGx5IGNvbnNpc3RlbnQsIHdlIGZpcmUgYVxuICAgIC8vIHBvaW50ZXJjYW5jZWwgZm9yIHRoaXMgXCJhYmFuZG9uZWRcIiB0b3VjaFxuICAgIHZhY3V1bVRvdWNoZXM6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciB0bCA9IGluRXZlbnQudG91Y2hlcztcblxuICAgICAgLy8gcG9pbnRlcm1hcC5zaXplIHNob3VsZCBiZSA8IHRsLmxlbmd0aCBoZXJlLCBhcyB0aGUgdG91Y2hzdGFydCBoYXMgbm90XG4gICAgICAvLyBiZWVuIHByb2Nlc3NlZCB5ZXQuXG4gICAgICBpZiAodG91Y2hfX3BvaW50ZXJtYXAuc2l6ZSA+PSB0bC5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGQgPSBbXTtcbiAgICAgICAgdG91Y2hfX3BvaW50ZXJtYXAuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG5cbiAgICAgICAgICAvLyBOZXZlciByZW1vdmUgcG9pbnRlcklkID09IDEsIHdoaWNoIGlzIG1vdXNlLlxuICAgICAgICAgIC8vIFRvdWNoIGlkZW50aWZpZXJzIGFyZSAyIHNtYWxsZXIgdGhhbiB0aGVpciBwb2ludGVySWQsIHdoaWNoIGlzIHRoZVxuICAgICAgICAgIC8vIGluZGV4IGluIHBvaW50ZXJtYXAuXG4gICAgICAgICAgaWYgKGtleSAhPT0gMSAmJiAhdGhpcy5maW5kVG91Y2godGwsIGtleSAtIDIpKSB7XG4gICAgICAgICAgICB2YXIgcCA9IHZhbHVlLm91dDtcbiAgICAgICAgICAgIGQucHVzaChwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICBkLmZvckVhY2godGhpcy5jYW5jZWxPdXQsIHRoaXMpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdG91Y2hzdGFydDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdGhpcy52YWN1dW1Ub3VjaGVzKGluRXZlbnQpO1xuICAgICAgdGhpcy5zZXRQcmltYXJ5VG91Y2goaW5FdmVudC5jaGFuZ2VkVG91Y2hlc1swXSk7XG4gICAgICB0aGlzLmRlZHVwU3ludGhNb3VzZShpbkV2ZW50KTtcbiAgICAgIGlmICghdGhpcy5zY3JvbGxpbmcpIHtcbiAgICAgICAgdGhpcy5jbGlja0NvdW50Kys7XG4gICAgICAgIHRoaXMucHJvY2Vzc1RvdWNoZXMoaW5FdmVudCwgdGhpcy5vdmVyRG93bik7XG4gICAgICB9XG4gICAgfSxcbiAgICBvdmVyRG93bjogZnVuY3Rpb24oaW5Qb2ludGVyKSB7XG4gICAgICB0b3VjaF9fcG9pbnRlcm1hcC5zZXQoaW5Qb2ludGVyLnBvaW50ZXJJZCwge1xuICAgICAgICB0YXJnZXQ6IGluUG9pbnRlci50YXJnZXQsXG4gICAgICAgIG91dDogaW5Qb2ludGVyLFxuICAgICAgICBvdXRUYXJnZXQ6IGluUG9pbnRlci50YXJnZXRcbiAgICAgIH0pO1xuICAgICAgX2Rpc3BhdGNoZXIub3ZlcihpblBvaW50ZXIpO1xuICAgICAgX2Rpc3BhdGNoZXIuZW50ZXIoaW5Qb2ludGVyKTtcbiAgICAgIF9kaXNwYXRjaGVyLmRvd24oaW5Qb2ludGVyKTtcbiAgICB9LFxuICAgIHRvdWNobW92ZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKCF0aGlzLnNjcm9sbGluZykge1xuICAgICAgICBpZiAodGhpcy5zaG91bGRTY3JvbGwoaW5FdmVudCkpIHtcbiAgICAgICAgICB0aGlzLnNjcm9sbGluZyA9IHRydWU7XG4gICAgICAgICAgdGhpcy50b3VjaGNhbmNlbChpbkV2ZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbkV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdGhpcy5wcm9jZXNzVG91Y2hlcyhpbkV2ZW50LCB0aGlzLm1vdmVPdmVyT3V0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbW92ZU92ZXJPdXQ6IGZ1bmN0aW9uKGluUG9pbnRlcikge1xuICAgICAgdmFyIGV2ZW50ID0gaW5Qb2ludGVyO1xuICAgICAgdmFyIHBvaW50ZXIgPSB0b3VjaF9fcG9pbnRlcm1hcC5nZXQoZXZlbnQucG9pbnRlcklkKTtcblxuICAgICAgLy8gYSBmaW5nZXIgZHJpZnRlZCBvZmYgdGhlIHNjcmVlbiwgaWdub3JlIGl0XG4gICAgICBpZiAoIXBvaW50ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIG91dEV2ZW50ID0gcG9pbnRlci5vdXQ7XG4gICAgICB2YXIgb3V0VGFyZ2V0ID0gcG9pbnRlci5vdXRUYXJnZXQ7XG4gICAgICBfZGlzcGF0Y2hlci5tb3ZlKGV2ZW50KTtcbiAgICAgIGlmIChvdXRFdmVudCAmJiBvdXRUYXJnZXQgIT09IGV2ZW50LnRhcmdldCkge1xuICAgICAgICBvdXRFdmVudC5yZWxhdGVkVGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBldmVudC5yZWxhdGVkVGFyZ2V0ID0gb3V0VGFyZ2V0O1xuXG4gICAgICAgIC8vIHJlY292ZXIgZnJvbSByZXRhcmdldGluZyBieSBzaGFkb3dcbiAgICAgICAgb3V0RXZlbnQudGFyZ2V0ID0gb3V0VGFyZ2V0O1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0KSB7XG4gICAgICAgICAgX2Rpc3BhdGNoZXIubGVhdmVPdXQob3V0RXZlbnQpO1xuICAgICAgICAgIF9kaXNwYXRjaGVyLmVudGVyT3ZlcihldmVudCk7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAvLyBjbGVhbiB1cCBjYXNlIHdoZW4gZmluZ2VyIGxlYXZlcyB0aGUgc2NyZWVuXG4gICAgICAgICAgZXZlbnQudGFyZ2V0ID0gb3V0VGFyZ2V0O1xuICAgICAgICAgIGV2ZW50LnJlbGF0ZWRUYXJnZXQgPSBudWxsO1xuICAgICAgICAgIHRoaXMuY2FuY2VsT3V0KGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcG9pbnRlci5vdXQgPSBldmVudDtcbiAgICAgIHBvaW50ZXIub3V0VGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgIH0sXG4gICAgdG91Y2hlbmQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHRoaXMuZGVkdXBTeW50aE1vdXNlKGluRXZlbnQpO1xuICAgICAgdGhpcy5wcm9jZXNzVG91Y2hlcyhpbkV2ZW50LCB0aGlzLnVwT3V0KTtcbiAgICB9LFxuICAgIHVwT3V0OiBmdW5jdGlvbihpblBvaW50ZXIpIHtcbiAgICAgIGlmICghdGhpcy5zY3JvbGxpbmcpIHtcbiAgICAgICAgX2Rpc3BhdGNoZXIudXAoaW5Qb2ludGVyKTtcbiAgICAgICAgX2Rpc3BhdGNoZXIub3V0KGluUG9pbnRlcik7XG4gICAgICAgIF9kaXNwYXRjaGVyLmxlYXZlKGluUG9pbnRlcik7XG4gICAgICB9XG4gICAgICB0aGlzLmNsZWFuVXBQb2ludGVyKGluUG9pbnRlcik7XG4gICAgfSxcbiAgICB0b3VjaGNhbmNlbDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdGhpcy5wcm9jZXNzVG91Y2hlcyhpbkV2ZW50LCB0aGlzLmNhbmNlbE91dCk7XG4gICAgfSxcbiAgICBjYW5jZWxPdXQ6IGZ1bmN0aW9uKGluUG9pbnRlcikge1xuICAgICAgX2Rpc3BhdGNoZXIuY2FuY2VsKGluUG9pbnRlcik7XG4gICAgICBfZGlzcGF0Y2hlci5vdXQoaW5Qb2ludGVyKTtcbiAgICAgIF9kaXNwYXRjaGVyLmxlYXZlKGluUG9pbnRlcik7XG4gICAgICB0aGlzLmNsZWFuVXBQb2ludGVyKGluUG9pbnRlcik7XG4gICAgfSxcbiAgICBjbGVhblVwUG9pbnRlcjogZnVuY3Rpb24oaW5Qb2ludGVyKSB7XG4gICAgICB0b3VjaF9fcG9pbnRlcm1hcC5kZWxldGUoaW5Qb2ludGVyLnBvaW50ZXJJZCk7XG4gICAgICB0aGlzLnJlbW92ZVByaW1hcnlQb2ludGVyKGluUG9pbnRlcik7XG4gICAgfSxcblxuICAgIC8vIHByZXZlbnQgc3ludGggbW91c2UgZXZlbnRzIGZyb20gY3JlYXRpbmcgcG9pbnRlciBldmVudHNcbiAgICBkZWR1cFN5bnRoTW91c2U6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBsdHMgPSBtb3VzZS5sYXN0VG91Y2hlcztcbiAgICAgIHZhciB0ID0gaW5FdmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcblxuICAgICAgLy8gb25seSB0aGUgcHJpbWFyeSBmaW5nZXIgd2lsbCBzeW50aCBtb3VzZSBldmVudHNcbiAgICAgIGlmICh0aGlzLmlzUHJpbWFyeVRvdWNoKHQpKSB7XG5cbiAgICAgICAgLy8gcmVtZW1iZXIgeC95IG9mIGxhc3QgdG91Y2hcbiAgICAgICAgdmFyIGx0ID0geyB4OiB0LmNsaWVudFgsIHk6IHQuY2xpZW50WSB9O1xuICAgICAgICBsdHMucHVzaChsdCk7XG4gICAgICAgIHZhciBmbiA9IChmdW5jdGlvbihsdHMsIGx0KSB7XG4gICAgICAgICAgdmFyIGkgPSBsdHMuaW5kZXhPZihsdCk7XG4gICAgICAgICAgaWYgKGkgPiAtMSkge1xuICAgICAgICAgICAgbHRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQobnVsbCwgbHRzLCBsdCk7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIERFRFVQX1RJTUVPVVQpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBpZiAoIUhBU19UT1VDSF9BQ1RJT05fREVMQVkpIHtcbiAgICBJTlNUQUxMRVIgPSBuZXcgaW5zdGFsbGVyKHRvdWNoRXZlbnRzLmVsZW1lbnRBZGRlZCwgdG91Y2hFdmVudHMuZWxlbWVudFJlbW92ZWQsXG4gICAgICB0b3VjaEV2ZW50cy5lbGVtZW50Q2hhbmdlZCwgdG91Y2hFdmVudHMpO1xuICB9XG5cbiAgdmFyIHRvdWNoID0gdG91Y2hFdmVudHM7XG5cbiAgdmFyIG1zX19wb2ludGVybWFwID0gX2Rpc3BhdGNoZXIucG9pbnRlcm1hcDtcbiAgdmFyIEhBU19CSVRNQVBfVFlQRSA9IHdpbmRvdy5NU1BvaW50ZXJFdmVudCAmJlxuICAgIHR5cGVvZiB3aW5kb3cuTVNQb2ludGVyRXZlbnQuTVNQT0lOVEVSX1RZUEVfTU9VU0UgPT09ICdudW1iZXInO1xuICB2YXIgbXNFdmVudHMgPSB7XG4gICAgZXZlbnRzOiBbXG4gICAgICAnTVNQb2ludGVyRG93bicsXG4gICAgICAnTVNQb2ludGVyTW92ZScsXG4gICAgICAnTVNQb2ludGVyVXAnLFxuICAgICAgJ01TUG9pbnRlck91dCcsXG4gICAgICAnTVNQb2ludGVyT3ZlcicsXG4gICAgICAnTVNQb2ludGVyQ2FuY2VsJyxcbiAgICAgICdNU0dvdFBvaW50ZXJDYXB0dXJlJyxcbiAgICAgICdNU0xvc3RQb2ludGVyQ2FwdHVyZSdcbiAgICBdLFxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIF9kaXNwYXRjaGVyLmxpc3Rlbih0YXJnZXQsIHRoaXMuZXZlbnRzKTtcbiAgICB9LFxuICAgIHVucmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgX2Rpc3BhdGNoZXIudW5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgfSxcbiAgICBQT0lOVEVSX1RZUEVTOiBbXG4gICAgICAnJyxcbiAgICAgICd1bmF2YWlsYWJsZScsXG4gICAgICAndG91Y2gnLFxuICAgICAgJ3BlbicsXG4gICAgICAnbW91c2UnXG4gICAgXSxcbiAgICBwcmVwYXJlRXZlbnQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gaW5FdmVudDtcbiAgICAgIGlmIChIQVNfQklUTUFQX1RZUEUpIHtcbiAgICAgICAgZSA9IF9kaXNwYXRjaGVyLmNsb25lRXZlbnQoaW5FdmVudCk7XG4gICAgICAgIGUucG9pbnRlclR5cGUgPSB0aGlzLlBPSU5URVJfVFlQRVNbaW5FdmVudC5wb2ludGVyVHlwZV07XG4gICAgICB9XG4gICAgICByZXR1cm4gZTtcbiAgICB9LFxuICAgIGNsZWFudXA6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICBtc19fcG9pbnRlcm1hcC5kZWxldGUoaWQpO1xuICAgIH0sXG4gICAgTVNQb2ludGVyRG93bjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgbXNfX3BvaW50ZXJtYXAuc2V0KGluRXZlbnQucG9pbnRlcklkLCBpbkV2ZW50KTtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBfZGlzcGF0Y2hlci5kb3duKGUpO1xuICAgIH0sXG4gICAgTVNQb2ludGVyTW92ZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLm1vdmUoZSk7XG4gICAgfSxcbiAgICBNU1BvaW50ZXJVcDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLnVwKGUpO1xuICAgICAgdGhpcy5jbGVhbnVwKGluRXZlbnQucG9pbnRlcklkKTtcbiAgICB9LFxuICAgIE1TUG9pbnRlck91dDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLmxlYXZlT3V0KGUpO1xuICAgIH0sXG4gICAgTVNQb2ludGVyT3ZlcjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLmVudGVyT3ZlcihlKTtcbiAgICB9LFxuICAgIE1TUG9pbnRlckNhbmNlbDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLmNhbmNlbChlKTtcbiAgICAgIHRoaXMuY2xlYW51cChpbkV2ZW50LnBvaW50ZXJJZCk7XG4gICAgfSxcbiAgICBNU0xvc3RQb2ludGVyQ2FwdHVyZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSBfZGlzcGF0Y2hlci5tYWtlRXZlbnQoJ2xvc3Rwb2ludGVyY2FwdHVyZScsIGluRXZlbnQpO1xuICAgICAgX2Rpc3BhdGNoZXIuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9LFxuICAgIE1TR290UG9pbnRlckNhcHR1cmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gX2Rpc3BhdGNoZXIubWFrZUV2ZW50KCdnb3Rwb2ludGVyY2FwdHVyZScsIGluRXZlbnQpO1xuICAgICAgX2Rpc3BhdGNoZXIuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIG1zID0gbXNFdmVudHM7XG5cbiAgZnVuY3Rpb24gcGxhdGZvcm1fZXZlbnRzX19hcHBseVBvbHlmaWxsKCkge1xuXG4gICAgLy8gb25seSBhY3RpdmF0ZSBpZiB0aGlzIHBsYXRmb3JtIGRvZXMgbm90IGhhdmUgcG9pbnRlciBldmVudHNcbiAgICBpZiAoIXdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcbiAgICAgIHdpbmRvdy5Qb2ludGVyRXZlbnQgPSBfUG9pbnRlckV2ZW50O1xuXG4gICAgICBpZiAod2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkKSB7XG4gICAgICAgIHZhciB0cCA9IHdpbmRvdy5uYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cztcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5uYXZpZ2F0b3IsICdtYXhUb3VjaFBvaW50cycsIHtcbiAgICAgICAgICB2YWx1ZTogdHAsXG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgX2Rpc3BhdGNoZXIucmVnaXN0ZXJTb3VyY2UoJ21zJywgbXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX2Rpc3BhdGNoZXIucmVnaXN0ZXJTb3VyY2UoJ21vdXNlJywgbW91c2UpO1xuICAgICAgICBpZiAod2luZG93Lm9udG91Y2hzdGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgX2Rpc3BhdGNoZXIucmVnaXN0ZXJTb3VyY2UoJ3RvdWNoJywgdG91Y2gpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIF9kaXNwYXRjaGVyLnJlZ2lzdGVyKGRvY3VtZW50KTtcbiAgICB9XG4gIH1cblxuICB2YXIgbiA9IHdpbmRvdy5uYXZpZ2F0b3I7XG4gIHZhciBzLCByO1xuICBmdW5jdGlvbiBhc3NlcnREb3duKGlkKSB7XG4gICAgaWYgKCFfZGlzcGF0Y2hlci5wb2ludGVybWFwLmhhcyhpZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZFBvaW50ZXJJZCcpO1xuICAgIH1cbiAgfVxuICBpZiAobi5tc1BvaW50ZXJFbmFibGVkKSB7XG4gICAgcyA9IGZ1bmN0aW9uKHBvaW50ZXJJZCkge1xuICAgICAgYXNzZXJ0RG93bihwb2ludGVySWQpO1xuICAgICAgdGhpcy5tc1NldFBvaW50ZXJDYXB0dXJlKHBvaW50ZXJJZCk7XG4gICAgfTtcbiAgICByID0gZnVuY3Rpb24ocG9pbnRlcklkKSB7XG4gICAgICBhc3NlcnREb3duKHBvaW50ZXJJZCk7XG4gICAgICB0aGlzLm1zUmVsZWFzZVBvaW50ZXJDYXB0dXJlKHBvaW50ZXJJZCk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBzID0gZnVuY3Rpb24gc2V0UG9pbnRlckNhcHR1cmUocG9pbnRlcklkKSB7XG4gICAgICBhc3NlcnREb3duKHBvaW50ZXJJZCk7XG4gICAgICBfZGlzcGF0Y2hlci5zZXRDYXB0dXJlKHBvaW50ZXJJZCwgdGhpcyk7XG4gICAgfTtcbiAgICByID0gZnVuY3Rpb24gcmVsZWFzZVBvaW50ZXJDYXB0dXJlKHBvaW50ZXJJZCkge1xuICAgICAgYXNzZXJ0RG93bihwb2ludGVySWQpO1xuICAgICAgX2Rpc3BhdGNoZXIucmVsZWFzZUNhcHR1cmUocG9pbnRlcklkLCB0aGlzKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gX2NhcHR1cmVfX2FwcGx5UG9seWZpbGwoKSB7XG4gICAgaWYgKHdpbmRvdy5FbGVtZW50ICYmICFFbGVtZW50LnByb3RvdHlwZS5zZXRQb2ludGVyQ2FwdHVyZSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoRWxlbWVudC5wcm90b3R5cGUsIHtcbiAgICAgICAgJ3NldFBvaW50ZXJDYXB0dXJlJzoge1xuICAgICAgICAgIHZhbHVlOiBzXG4gICAgICAgIH0sXG4gICAgICAgICdyZWxlYXNlUG9pbnRlckNhcHR1cmUnOiB7XG4gICAgICAgICAgdmFsdWU6IHJcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgYXBwbHlBdHRyaWJ1dGVTdHlsZXMoKTtcbiAgcGxhdGZvcm1fZXZlbnRzX19hcHBseVBvbHlmaWxsKCk7XG4gIF9jYXB0dXJlX19hcHBseVBvbHlmaWxsKCk7XG5cbiAgdmFyIHBvaW50ZXJldmVudHMgPSB7XG4gICAgZGlzcGF0Y2hlcjogX2Rpc3BhdGNoZXIsXG4gICAgSW5zdGFsbGVyOiBpbnN0YWxsZXIsXG4gICAgUG9pbnRlckV2ZW50OiBfUG9pbnRlckV2ZW50LFxuICAgIFBvaW50ZXJNYXA6IF9wb2ludGVybWFwLFxuICAgIHRhcmdldEZpbmRpbmc6IHRhcmdldGluZ1xuICB9O1xuXG4gIHJldHVybiBwb2ludGVyZXZlbnRzO1xuXG59KSk7Il19
