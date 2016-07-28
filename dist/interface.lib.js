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
        lastValue = this.value,
        w = this;

    if (Array.isArray(value)) {
      value = value.map(function (v) {
        return Widget.runFilters(v, _this);
      });
    } else {
      value = this.runFilters(value, this);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idXR0b24uanMiLCJqcy9jYW52YXNXaWRnZXQuanMiLCJqcy9jb21tdW5pY2F0aW9uLmpzIiwianMvZG9tV2lkZ2V0LmpzIiwianMvZmlsdGVycy5qcyIsImpzL2luZGV4LmpzIiwianMva25vYi5qcyIsImpzL21lbnUuanMiLCJqcy9wYW5lbC5qcyIsImpzL3NsaWRlci5qcyIsImpzL3V0aWxpdGllcy5qcyIsImpzL3dpZGdldC5qcyIsImpzL3dpZGdldExhYmVsLmpzIiwibm9kZV9tb2R1bGVzL3BlcGpzL2Rpc3QvcGVwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7Ozs7OztBQVdBLElBQUksU0FBUyxPQUFPLE1BQVAsd0JBQWI7O0FBRUEsT0FBTyxNQUFQLENBQWUsTUFBZixFQUF1Qjs7Ozs7Ozs7Ozs7QUFXckIsWUFBVTtBQUNSLGFBQVEsQ0FEQTtBQUVSLFdBQU0sQ0FGRTtBQUdSLFlBQVEsS0FIQTs7Ozs7Ozs7O0FBWVIsV0FBUTtBQVpBLEdBWFc7Ozs7Ozs7OztBQWlDckIsUUFqQ3FCLGtCQWlDYixLQWpDYSxFQWlDTDtBQUNkLFFBQUksU0FBUyxPQUFPLE1BQVAsQ0FBZSxJQUFmLENBQWI7O0FBRUEsMkJBQWEsTUFBYixDQUFvQixJQUFwQixDQUEwQixNQUExQjs7QUFFQSxXQUFPLE1BQVAsQ0FBZSxNQUFmLEVBQXVCLE9BQU8sUUFBOUIsRUFBd0MsS0FBeEM7O0FBRUEsUUFBSSxNQUFNLEtBQVYsRUFBa0IsT0FBTyxPQUFQLEdBQWlCLE1BQU0sS0FBdkI7O0FBRWxCLFdBQU8sSUFBUDs7QUFFQSxXQUFPLE1BQVA7QUFDRCxHQTdDb0I7Ozs7Ozs7O0FBb0RyQixNQXBEcUIsa0JBb0RkO0FBQ0wsU0FBSyxHQUFMLENBQVMsU0FBVCxHQUF1QixLQUFLLE9BQUwsS0FBaUIsQ0FBakIsR0FBcUIsS0FBSyxJQUExQixHQUFp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QXFCLEtBQUssS0FBMUI7QUFDQSxTQUFLLEdBQUwsQ0FBUyxJQUFULEdBQWdCLEtBQUssSUFBckI7QUFDQSxTQUFLLEdBQUwsQ0FBUyxRQUFULENBQW1CLEtBQUssSUFBeEIsRUFBOEIsQ0FBOUIsRUFBZ0MsQ0FBaEMsRUFBa0MsS0FBbEM7QUFDRDtBQXhDZSxDQUFsQjs7a0JBNENlLFc7OztBQzVDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgQ2FudmFzV2lkZ2V0IGZyb20gJy4vY2FudmFzV2lkZ2V0J1xuXG4vKipcbiAqIEEgQnV0dG9uIHdpdGggdGhyZWUgZGlmZmVyZW50IHN0eWxlczogJ21vbWVudGFyeScgdHJpZ2dlcnMgYSBmbGFzaCBhbmQgaW5zdGFuZW91cyBvdXRwdXQsIFxuICogJ2hvbGQnIG91dHB1dHMgdGhlIGJ1dHRvbnMgbWF4aW11bSB2YWx1ZSB1bnRpbCBpdCBpcyByZWxlYXNlZCwgYW5kICd0b2dnbGUnIGFsdGVybmF0ZXMgXG4gKiBiZXR3ZWVuIG91dHB1dHRpbmcgbWF4aW11bSBhbmQgbWluaW11bSB2YWx1ZXMgb24gcHJlc3MuIFxuICogXG4gKiBAbW9kdWxlIEJ1dHRvblxuICogQGF1Z21lbnRzIENhbnZhc1dpZGdldFxuICovIFxuXG5sZXQgQnV0dG9uID0gT2JqZWN0LmNyZWF0ZSggQ2FudmFzV2lkZ2V0IClcblxuT2JqZWN0LmFzc2lnbiggQnV0dG9uLCB7XG5cbiAgLyoqIEBsZW5kcyBCdXR0b24ucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBCdXR0b24gaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIEJ1dHRvblxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgX192YWx1ZTowLFxuICAgIHZhbHVlOjAsXG4gICAgYWN0aXZlOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBzdHlsZSBwcm9wZXJ0eSBjYW4gYmUgJ21vbWVudGFyeScsICdob2xkJywgb3IgJ3RvZ2dsZScuIFRoaXNcbiAgICAgKiBkZXRlcm1pbmVzIHRoZSBpbnRlcmFjdGlvbiBvZiB0aGUgQnV0dG9uIGluc3RhbmNlLlxuICAgICAqIEBtZW1iZXJvZiBCdXR0b25cbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqL1xuICAgIHN0eWxlOiAgJ3RvZ2dsZSdcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IEJ1dHRvbiBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIEJ1dHRvblxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXSAtIEEgZGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGluaXRpYWxpemUgYSBCdXR0b24gaW5zdGFuY2Ugd2l0aC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgYnV0dG9uID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgQ2FudmFzV2lkZ2V0LmNyZWF0ZS5jYWxsKCBidXR0b24gKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggYnV0dG9uLCBCdXR0b24uZGVmYXVsdHMsIHByb3BzIClcblxuICAgIGlmKCBwcm9wcy52YWx1ZSApIGJ1dHRvbi5fX3ZhbHVlID0gcHJvcHMudmFsdWVcblxuICAgIGJ1dHRvbi5pbml0KClcblxuICAgIHJldHVybiBidXR0b25cbiAgfSxcblxuICAvKipcbiAgICogRHJhdyB0aGUgQnV0dG9uIGludG8gaXRzIGNhbnZhcyBjb250ZXh0IHVzaW5nIHRoZSBjdXJyZW50IC5fX3ZhbHVlIHByb3BlcnR5IGFuZCBidXR0b24gc3R5bGUuXG4gICAqIEBtZW1iZXJvZiBCdXR0b25cbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBkcmF3KCkge1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSAgID0gdGhpcy5fX3ZhbHVlID09PSAxID8gdGhpcy5maWxsIDogdGhpcy5iYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVxuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsMCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcblxuICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QoIDAsMCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcbiAgfSxcblxuICBhZGRFdmVudHMoKSB7XG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZXZlbnRzICkge1xuICAgICAgdGhpc1sga2V5IF0gPSB0aGlzLmV2ZW50c1sga2V5IF0uYmluZCggdGhpcyApIFxuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcmRvd24nLCAgdGhpcy5wb2ludGVyZG93biApXG4gIH0sXG5cbiAgZXZlbnRzOiB7XG4gICAgcG9pbnRlcmRvd24oIGUgKSB7XG4gICAgICAvLyBvbmx5IGhvbGQgbmVlZHMgdG8gbGlzdGVuIGZvciBwb2ludGVydXAgZXZlbnRzOyB0b2dnbGUgYW5kIG1vbWVudGFyeSBvbmx5IGNhcmUgYWJvdXQgcG9pbnRlcmRvd25cbiAgICAgIGlmKCB0aGlzLnN0eWxlID09PSAnaG9sZCcgKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZVxuICAgICAgICB0aGlzLnBvaW50ZXJJZCA9IGUucG9pbnRlcklkXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgdGhpcy5wb2ludGVydXAgKSBcbiAgICAgIH1cblxuICAgICAgaWYoIHRoaXMuc3R5bGUgPT09ICd0b2dnbGUnICkge1xuICAgICAgICB0aGlzLl9fdmFsdWUgPSB0aGlzLl9fdmFsdWUgPT09IDEgPyAwIDogMVxuICAgICAgfWVsc2UgaWYoIHRoaXMuc3R5bGUgPT09ICdtb21lbnRhcnknICkge1xuICAgICAgICB0aGlzLl9fdmFsdWUgPSAxXG4gICAgICAgIHNldFRpbWVvdXQoICgpPT4geyB0aGlzLl9fdmFsdWUgPSAwOyB0aGlzLmRyYXcoKSB9LCA1MCApXG4gICAgICB9ZWxzZSBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvbGQnICkge1xuICAgICAgICB0aGlzLl9fdmFsdWUgPSAxXG4gICAgICB9XG4gICAgICBcbiAgICAgIHRoaXMub3V0cHV0KClcblxuICAgICAgdGhpcy5kcmF3KClcbiAgICB9LFxuXG4gICAgcG9pbnRlcnVwKCBlICkge1xuICAgICAgaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCAmJiB0aGlzLnN0eWxlID09PSAnaG9sZCcgKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApXG5cbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gMFxuICAgICAgICB0aGlzLm91dHB1dCgpXG5cbiAgICAgICAgdGhpcy5kcmF3KClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IEJ1dHRvblxuIiwiaW1wb3J0IERPTVdpZGdldCBmcm9tICcuL2RvbVdpZGdldCdcbmltcG9ydCBVdGlsaXRpZXMgZnJvbSAnLi91dGlsaXRpZXMnXG5pbXBvcnQgV2lkZ2V0TGFiZWwgZnJvbSAnLi93aWRnZXRMYWJlbCdcblxuLyoqXG4gKiBDYW52YXNXaWRnZXQgaXMgdGhlIGJhc2UgY2xhc3MgZm9yIHdpZGdldHMgdGhhdCB1c2UgSFRNTCBjYW52YXMgZWxlbWVudHMuXG4gKiBAbW9kdWxlIENhbnZhc1dpZGdldFxuICogQGF1Z21lbnRzIERPTVdpZGdldFxuICovIFxuXG5sZXQgQ2FudmFzV2lkZ2V0ID0gT2JqZWN0LmNyZWF0ZSggRE9NV2lkZ2V0IClcblxuT2JqZWN0LmFzc2lnbiggQ2FudmFzV2lkZ2V0LCB7XG4gIC8qKiBAbGVuZHMgQ2FudmFzV2lkZ2V0LnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IGNvbG9ycyBhbmQgY2FudmFzIGNvbnRleHQgcHJvcGVydGllcyBmb3IgdXNlIGluIENhbnZhc1dpZGdldHNcbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIGJhY2tncm91bmQ6JyM4ODgnLFxuICAgIGZpbGw6JyNhYWEnLFxuICAgIHN0cm9rZToncmdiYSgyNTUsMjU1LDI1NSwuMyknLFxuICAgIGxpbmVXaWR0aDo0LFxuICAgIGRlZmF1bHRMYWJlbDoge1xuICAgICAgeDouNSwgeTouNSwgYWxpZ246J2NlbnRlcicsIHdpZHRoOjEsIHRleHQ6J2RlbW8nXG4gICAgfSxcbiAgICBzaG91bGREaXNwbGF5VmFsdWU6ZmFsc2VcbiAgfSxcbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBDYW52YXNXaWRnZXQgaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIENhbnZhc1dpZGdldFxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBzaG91bGRVc2VUb3VjaCA9IFV0aWxpdGllcy5nZXRNb2RlKCkgPT09ICd0b3VjaCdcbiAgICBcbiAgICBET01XaWRnZXQuY3JlYXRlLmNhbGwoIHRoaXMgKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggdGhpcywgQ2FudmFzV2lkZ2V0LmRlZmF1bHRzKVxuXG4gICAgLyoqXG4gICAgICogU3RvcmUgYSByZWZlcmVuY2UgdG8gdGhlIGNhbnZhcyAyRCBjb250ZXh0LlxuICAgICAqIEBtZW1iZXJvZiBDYW52YXNXaWRnZXRcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfVxuICAgICAqL1xuICAgIHRoaXMuY3R4ID0gdGhpcy5lbGVtZW50LmdldENvbnRleHQoICcyZCcgKVxuXG4gICAgdGhpcy5hcHBseUhhbmRsZXJzKCBzaG91bGRVc2VUb3VjaCApXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIHRoZSBjYW52YXMgZWxlbWVudCB1c2VkIGJ5IHRoZSB3aWRnZXQgYW5kIHNldFxuICAgKiBzb21lIGRlZmF1bHQgQ1NTIHZhbHVlcy5cbiAgICogQG1lbWJlcm9mIENhbnZhc1dpZGdldFxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGVFbGVtZW50KCkge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKVxuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCAndG91Y2gtYWN0aW9uJywgJ25vbmUnIClcbiAgICBlbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSAgPSAnYmxvY2snXG4gICAgXG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfSxcblxuICBhcHBseUhhbmRsZXJzKCBzaG91bGRVc2VUb3VjaD1mYWxzZSApIHtcbiAgICBsZXQgaGFuZGxlcnMgPSBzaG91bGRVc2VUb3VjaCA/IENhbnZhc1dpZGdldC5oYW5kbGVycy50b3VjaCA6IENhbnZhc1dpZGdldC5oYW5kbGVycy5tb3VzZVxuICAgIFxuICAgIC8vIHdpZGdldHMgaGF2ZSBpanMgZGVmaW5lZCBoYW5kbGVycyBzdG9yZWQgaW4gdGhlIF9ldmVudHMgYXJyYXksXG4gICAgLy8gYW5kIHVzZXItZGVmaW5lZCBldmVudHMgc3RvcmVkIHdpdGggJ29uJyBwcmVmaXhlcyAoZS5nLiBvbmNsaWNrLCBvbm1vdXNlZG93bilcbiAgICBmb3IoIGxldCBoYW5kbGVyTmFtZSBvZiBoYW5kbGVycyApIHtcbiAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCBoYW5kbGVyTmFtZSwgZXZlbnQgPT4ge1xuICAgICAgICBpZiggdHlwZW9mIHRoaXNbICdvbicgKyBoYW5kbGVyTmFtZSBdICA9PT0gJ2Z1bmN0aW9uJyAgKSB0aGlzWyAnb24nICsgaGFuZGxlck5hbWUgXSggZXZlbnQgKVxuICAgICAgfSlcbiAgICB9XG5cbiAgfSxcblxuICBoYW5kbGVyczoge1xuICAgIG1vdXNlOiBbXG4gICAgICAnbW91c2V1cCcsXG4gICAgICAnbW91c2Vtb3ZlJyxcbiAgICAgICdtb3VzZWRvd24nLFxuICAgIF0sXG4gICAgdG91Y2g6IFtdXG4gIH0sXG5cbiAgYWRkTGFiZWwoKSB7XG4gICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbiggeyBjdHg6IHRoaXMuY3R4IH0sIHRoaXMubGFiZWwgfHwgdGhpcy5kZWZhdWx0TGFiZWwgKSxcbiAgICAgICAgbGFiZWwgPSBXaWRnZXRMYWJlbC5jcmVhdGUoIHByb3BzIClcblxuICAgIHRoaXMubGFiZWwgPSBsYWJlbFxuICAgIHRoaXMuX2RyYXcgPSB0aGlzLmRyYXdcbiAgICB0aGlzLmRyYXcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2RyYXcoKVxuICAgICAgdGhpcy5sYWJlbC5kcmF3KClcbiAgICB9XG4gIH0sXG5cbiAgX19hZGRUb1BhbmVsKCBwYW5lbCApIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IHBhbmVsXG5cbiAgICBpZiggdHlwZW9mIHRoaXMuYWRkRXZlbnRzID09PSAnZnVuY3Rpb24nICkgdGhpcy5hZGRFdmVudHMoKVxuXG4gICAgLy8gY2FsbGVkIGlmIHdpZGdldCB1c2VzIERPTVdpZGdldCBhcyBwcm90b3R5cGU7IC5wbGFjZSBpbmhlcml0ZWQgZnJvbSBET01XaWRnZXRcbiAgICB0aGlzLnBsYWNlKCkgXG5cbiAgICBpZiggdGhpcy5sYWJlbCB8fCB0aGlzLnNob3VsZERpc3BsYXlWYWx1ZSApIHRoaXMuYWRkTGFiZWwoKVxuICAgIGlmKCB0aGlzLnNob3VsZERpc3BsYXlWYWx1ZSApIHtcbiAgICAgIHRoaXMuX19wb3N0ZmlsdGVycy5wdXNoKCAoIHZhbHVlICkgPT4geyBcbiAgICAgICAgdGhpcy5sYWJlbC50ZXh0ID0gdmFsdWUudG9GaXhlZCggNSApXG4gICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5kcmF3KCkgICAgIFxuXG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IENhbnZhc1dpZGdldFxuIiwiaW1wb3J0IFdpZGdldCBmcm9tICcuL3dpZGdldCdcblxubGV0IENvbW11bmljYXRpb24gPSB7XG4gIFNvY2tldCA6IG51bGwsXG4gIGluaXRpYWxpemVkOiBmYWxzZSxcblxuICBpbml0KCkge1xuICAgIHRoaXMuU29ja2V0ID0gbmV3IFdlYlNvY2tldCggdGhpcy5nZXRTZXJ2ZXJBZGRyZXNzKCkgKVxuICAgIHRoaXMuU29ja2V0Lm9ubWVzc2FnZSA9IHRoaXMub25tZXNzYWdlXG5cbiAgICBsZXQgZnVsbExvY2F0aW9uID0gd2luZG93LmxvY2F0aW9uLnRvU3RyaW5nKCksXG4gICAgICAgIGxvY2F0aW9uU3BsaXQgPSBmdWxsTG9jYXRpb24uc3BsaXQoICcvJyApLFxuICAgICAgICBpbnRlcmZhY2VOYW1lID0gbG9jYXRpb25TcGxpdFsgbG9jYXRpb25TcGxpdC5sZW5ndGggLSAxIF1cbiAgICBcbiAgICB0aGlzLlNvY2tldC5vbm9wZW4gPSAoKT0+IHtcbiAgICAgIHRoaXMuU29ja2V0LnNlbmQoIEpTT04uc3RyaW5naWZ5KHsgdHlwZTonbWV0YScsIGludGVyZmFjZU5hbWUsIGtleToncmVnaXN0ZXInIH0pIClcbiAgICB9XG5cbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZVxuICB9LFxuXG4gIGdldFNlcnZlckFkZHJlc3MoKSB7XG4gICAgbGV0IGV4cHIsIHNvY2tldElQQW5kUG9ydCwgc29ja2V0U3RyaW5nLCBpcCwgcG9ydFxuXG4gICAgZXhwciA9IC9bLWEtekEtWjAtOS5dKyg6KDY1NTNbMC01XXw2NTVbMC0yXVxcZHw2NVswLTRdXFxkezJ9fDZbMC00XVxcZHszfXxbMS01XVxcZHs0fXxbMS05XVxcZHswLDN9KSkvXG5cbiAgICBzb2NrZXRJUEFuZFBvcnQgPSBleHByLmV4ZWMoIHdpbmRvdy5sb2NhdGlvbi50b1N0cmluZygpIClbIDAgXS5zcGxpdCggJzonIClcbiAgICBpcCA9IHNvY2tldElQQW5kUG9ydFsgMCBdXG4gICAgcG9ydCA9IHBhcnNlSW50KCBzb2NrZXRJUEFuZFBvcnRbIDEgXSApXG5cbiAgICBzb2NrZXRTdHJpbmcgPSBgd3M6Ly8ke2lwfToke3BvcnR9YFxuXG4gICAgcmV0dXJuIHNvY2tldFN0cmluZ1xuICB9LFxuXG4gIG9ubWVzc2FnZSggZSApIHtcbiAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoIGUuZGF0YSApXG4gICAgaWYoIGRhdGEudHlwZSA9PT0gJ29zYycgKSB7XG4gICAgICBDb21tdW5pY2F0aW9uLk9TQy5fcmVjZWl2ZSggZS5kYXRhICk7XG4gICAgfWVsc2Uge1xuICAgICAgaWYoIENvbW11bmljYXRpb24uU29ja2V0LnJlY2VpdmUgKSB7XG4gICAgICAgIENvbW11bmljYXRpb24uU29ja2V0LnJlY2VpdmUoIGRhdGEuYWRkcmVzcywgZGF0YS5wYXJhbWV0ZXJzICApXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIE9TQyA6IHtcbiAgICBjYWxsYmFja3M6IHt9LFxuICAgIG9ubWVzc2FnZTogbnVsbCxcblxuICAgIHNlbmQoIGFkZHJlc3MsIHBhcmFtZXRlcnMgKSB7XG4gICAgICBpZiggQ29tbXVuaWNhdGlvbi5Tb2NrZXQucmVhZHlTdGF0ZSA9PT0gMSApIHtcbiAgICAgICAgaWYoIHR5cGVvZiBhZGRyZXNzID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICBsZXQgbXNnID0ge1xuICAgICAgICAgICAgdHlwZSA6IFwib3NjXCIsXG4gICAgICAgICAgICBhZGRyZXNzLFxuICAgICAgICAgICAgJ3BhcmFtZXRlcnMnOiBBcnJheS5pc0FycmF5KCBwYXJhbWV0ZXJzICkgPyBwYXJhbWV0ZXJzIDogWyBwYXJhbWV0ZXJzIF0sXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgQ29tbXVuaWNhdGlvbi5Tb2NrZXQuc2VuZCggSlNPTi5zdHJpbmdpZnkoIG1zZyApIClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoICdJbnZhbGlkIG9zYyBtZXNzYWdlOicsIGFyZ3VtZW50cyApICAgXG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICB0aHJvdyBFcnJvciggJ1NvY2tldCBpcyBub3QgeWV0IGNvbm5lY3RlZDsgY2Fubm90IHNlbmQgT1NDIG1lc3NzYWdlcy4nIClcbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICByZWNlaXZlKCBkYXRhICkge1xuICAgICAgbGV0IG1zZyA9IEpTT04ucGFyc2UoIGRhdGEgKVxuXG4gICAgICBpZiggbXNnLmFkZHJlc3MgaW4gdGhpcy5jYWxsYmFja3MgKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzWyBtc2cuYWRkcmVzcyBdKCBtc2cucGFyYW1ldGVycyApXG4gICAgICB9ZWxzZXtcbiAgICAgICAgZm9yKCBsZXQgd2lkZ2V0IG9mIFdpZGdldC53aWRnZXRzICkge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coIFwiQ0hFQ0tcIiwgY2hpbGQua2V5LCBtc2cuYWRkcmVzcyApXG4gICAgICAgICAgaWYoIHdpZGdldC5rZXkgPT09IG1zZy5hZGRyZXNzICkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggY2hpbGQua2V5LCBtc2cucGFyYW1ldGVycyApXG4gICAgICAgICAgICB3aWRnZXQuc2V0VmFsdWUuYXBwbHkoIHdpZGdldCwgbXNnLnBhcmFtZXRlcnMgKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICB9ICAgIFxuXG4gICAgICAgIGlmKCB0aGlzLm9ubWVzc2FnZSAhPT0gbnVsbCApIHsgXG4gICAgICAgICAgdGhpcy5yZWNlaXZlKCBtc2cuYWRkcmVzcywgbXNnLnR5cGV0YWdzLCBtc2cucGFyYW1ldGVycyApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBDb21tdW5pY2F0aW9uXG4iLCJpbXBvcnQgV2lkZ2V0IGZyb20gJy4vd2lkZ2V0J1xuaW1wb3J0IFV0aWxpdGllcyBmcm9tICcuL3V0aWxpdGllcydcblxuLyoqXG4gKiBET01XaWRnZXQgaXMgdGhlIGJhc2UgY2xhc3MgZm9yIHdpZGdldHMgdGhhdCB1c2UgSFRNTCBjYW52YXMgZWxlbWVudHMuXG4gKiBAYXVnbWVudHMgV2lkZ2V0XG4gKi9cblxubGV0IERPTVdpZGdldCA9IE9iamVjdC5jcmVhdGUoIFdpZGdldCApXG5cbk9iamVjdC5hc3NpZ24oIERPTVdpZGdldCwge1xuICAvKiogQGxlbmRzIERPTVdpZGdldC5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIERPTVdpZGdldHNcbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIHg6MCx5OjAsd2lkdGg6LjI1LGhlaWdodDouMjUsXG4gICAgYXR0YWNoZWQ6ZmFsc2UsXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBET01XaWRnZXQgaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIERPTVdpZGdldFxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoKSB7XG4gICAgbGV0IHNob3VsZFVzZVRvdWNoID0gVXRpbGl0aWVzLmdldE1vZGUoKSA9PT0gJ3RvdWNoJ1xuICAgIFxuICAgIFdpZGdldC5jcmVhdGUuY2FsbCggdGhpcyApXG5cbiAgICBPYmplY3QuYXNzaWduKCB0aGlzLCBET01XaWRnZXQuZGVmYXVsdHMgKVxuXG4gICAgLy8gQUxMIElOU1RBTkNFUyBPRiBET01XSURHRVQgTVVTVCBJTVBMRU1FTlQgQ1JFQVRFIEVMRU1FTlRcbiAgICBpZiggdHlwZW9mIHRoaXMuY3JlYXRlRWxlbWVudCA9PT0gJ2Z1bmN0aW9uJyApIHtcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgRE9NIGVsZW1lbnQgdXNlZCBieSB0aGUgRE9NV2lkZ2V0XG4gICAgICAgKiBAbWVtYmVyb2YgRE9NV2lkZ2V0XG4gICAgICAgKiBAaW5zdGFuY2VcbiAgICAgICAqL1xuICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5jcmVhdGVFbGVtZW50KClcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ3dpZGdldCBpbmhlcml0aW5nIGZyb20gRE9NV2lkZ2V0IGRvZXMgbm90IGltcGxlbWVudCBjcmVhdGVFbGVtZW50IG1ldGhvZDsgdGhpcyBpcyByZXF1aXJlZC4nIClcbiAgICB9XG4gIH0sXG4gIFxuICAvKipcbiAgICogQ3JlYXRlIGEgRE9NIGVsZW1lbnQgdG8gYmUgcGxhY2VkIGluIGEgUGFuZWwuXG4gICAqIEB2aXJ0dWFsXG4gICAqIEBtZW1iZXJvZiBET01XaWRnZXRcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlRWxlbWVudCgpIHtcbiAgICB0aHJvdyBFcnJvciggJ2FsbCBzdWJjbGFzc2VzIG9mIERPTVdpZGdldCBtdXN0IGltcGxlbWVudCBjcmVhdGVFbGVtZW50KCknIClcbiAgfSxcblxuICAvKipcbiAgICogdXNlIENTUyB0byBwb3NpdGlvbiBlbGVtZW50IGVsZW1lbnQgb2Ygd2lkZ2V0XG4gICAqIEBtZW1iZXJvZiBET01XaWRnZXRcbiAgICovXG4gIHBsYWNlKCkge1xuICAgIGxldCBjb250YWluZXJXaWR0aCA9IHRoaXMuY29udGFpbmVyLmdldFdpZHRoKCksXG4gICAgICAgIGNvbnRhaW5lckhlaWdodD0gdGhpcy5jb250YWluZXIuZ2V0SGVpZ2h0KCksXG4gICAgICAgIHdpZHRoICA9IHRoaXMud2lkdGggIDw9IDEgPyBjb250YWluZXJXaWR0aCAgKiB0aGlzLndpZHRoIDogdGhpcy53aWR0aCxcbiAgICAgICAgaGVpZ2h0ID0gdGhpcy5oZWlnaHQgPD0gMSA/IGNvbnRhaW5lckhlaWdodCAqIHRoaXMuaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgeCAgICAgID0gdGhpcy54IDwgMSA/IGNvbnRhaW5lcldpZHRoICAqIHRoaXMueCA6IHRoaXMueCxcbiAgICAgICAgeSAgICAgID0gdGhpcy55IDwgMSA/IGNvbnRhaW5lckhlaWdodCAqIHRoaXMueSA6IHRoaXMueVxuXG4gICAgaWYoICF0aGlzLmF0dGFjaGVkICkge1xuICAgICAgdGhpcy5hdHRhY2hlZCA9IHRydWVcbiAgICB9XG4gIFxuICAgIGlmKCB0aGlzLmlzU3F1YXJlICkge1xuICAgICAgaWYoIGhlaWdodCA+IHdpZHRoICkge1xuICAgICAgICBoZWlnaHQgPSB3aWR0aFxuICAgICAgfWVsc2V7XG4gICAgICAgIHdpZHRoID0gaGVpZ2h0XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50LndpZHRoICA9IHdpZHRoXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnXG4gICAgdGhpcy5lbGVtZW50LmhlaWdodCA9IGhlaWdodFxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSB4XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCAgPSB5XG5cbiAgICAvKipcbiAgICAgKiBCb3VuZGluZyBib3gsIGluIGFic29sdXRlIGNvb3JkaW5hdGVzLCBvZiB0aGUgRE9NV2lkZ2V0XG4gICAgICogQG1lbWJlcm9mIERPTVdpZGdldFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5yZWN0ID0gdGhpcy5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIFxuICB9LFxuICBcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IERPTVdpZGdldFxuIiwibGV0IEZpbHRlcnMgPSB7XG4gIFNjYWxlKCBpbm1pbj0wLCBpbm1heD0xLCBvdXRtaW49LTEsIG91dG1heD0xICkge1xuICAgIGxldCBpbnJhbmdlICA9IGlubWF4IC0gaW5taW4sXG4gICAgICAgIG91dHJhbmdlID0gb3V0bWF4IC0gb3V0bWluLFxuICAgICAgICByYW5nZVJhdGlvID0gb3V0cmFuZ2UgLyBpbnJhbmdlXG5cbiAgICByZXR1cm4gaW5wdXQgPT4gb3V0bWluICsgaW5wdXQgKiByYW5nZVJhdGlvXG4gIH0sXG59XG5cbmV4cG9ydCBkZWZhdWx0IEZpbHRlcnNcbiIsIi8vIEV2ZXJ5dGhpbmcgd2UgbmVlZCB0byBpbmNsdWRlIGdvZXMgaGVyZSBhbmQgaXMgZmVkIHRvIGJyb3dzZXJpZnkgaW4gdGhlIGd1bHBmaWxlLmpzXG5cbmltcG9ydCBQYW5lbCBmcm9tICcuL3BhbmVsJ1xuaW1wb3J0IFNsaWRlciBmcm9tICcuL3NsaWRlcidcbmltcG9ydCBCdXR0b24gZnJvbSAnLi9idXR0b24nXG5pbXBvcnQgTWVudSBmcm9tICcuL21lbnUnXG5pbXBvcnQgQ29tbXVuaWNhdGlvbiBmcm9tICcuL2NvbW11bmljYXRpb24nXG5pbXBvcnQgUEVQIGZyb20gJ3BlcGpzJ1xuaW1wb3J0IEtub2IgZnJvbSAnLi9rbm9iJ1xuXG5leHBvcnQge1xuICBQYW5lbCwgU2xpZGVyLCBCdXR0b24sIE1lbnUsIENvbW11bmljYXRpb24sIEtub2Jcbn1cbiIsImltcG9ydCBDYW52YXNXaWRnZXQgZnJvbSAnLi9jYW52YXNXaWRnZXQuanMnXG5cbi8qKlxuICogQSBob3Jpem9udGFsIG9yIHZlcnRpY2FsIGZhZGVyLiBcbiAqIEBtb2R1bGUgS25vYlxuICogQGF1Z21lbnRzIENhbnZhc1dpZGdldFxuICovIFxuXG5sZXQgS25vYiA9IE9iamVjdC5jcmVhdGUoIENhbnZhc1dpZGdldCApIFxuXG5PYmplY3QuYXNzaWduKCBLbm9iLCB7XG4gIC8qKiBAbGVuZHMgS25vYi5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIEtub2IgaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIEtub2JcbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIF9fdmFsdWU6LjUsIC8vIGFsd2F5cyAwLTEsIG5vdCBmb3IgZW5kLXVzZXJzXG4gICAgdmFsdWU6LjUsICAgLy8gZW5kLXVzZXIgdmFsdWUgdGhhdCBtYXkgYmUgZmlsdGVyZWRcbiAgICBhY3RpdmU6IGZhbHNlLFxuICAgIGtub2JCdWZmZXI6MjAsXG4gICAgdXNlc1JvdGF0aW9uOmZhbHNlLFxuICAgIGxhc3RQb3NpdGlvbjowLFxuICAgIGlzU3F1YXJlOnRydWUsXG4gICAgLyoqXG4gICAgICogVGhlIHN0eWxlIHByb3BlcnR5IGNhbiBiZSBlaXRoZXIgJ2hvcml6b250YWwnICh0aGUgZGVmYXVsdCkgb3IgJ3ZlcnRpY2FsJy4gVGhpc1xuICAgICAqIGRldGVybWluZXMgdGhlIG9yaWVudGF0aW9uIG9mIHRoZSBLbm9iIGluc3RhbmNlLlxuICAgICAqIEBtZW1iZXJvZiBLbm9iXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBzdHlsZTogICdob3Jpem9udGFsJ1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgS25vYiBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIEtub2JcbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wc10gLSBBIGRpY3Rpb25hcnkgb2YgcHJvcGVydGllcyB0byBpbml0aWFsaXplIEtub2Igd2l0aC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQga25vYiA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIC8vIGFwcGx5IFdpZGdldCBkZWZhdWx0cywgdGhlbiBvdmVyd3JpdGUgKGlmIGFwcGxpY2FibGUpIHdpdGggS25vYiBkZWZhdWx0c1xuICAgIENhbnZhc1dpZGdldC5jcmVhdGUuY2FsbCgga25vYiApXG5cbiAgICAvLyAuLi5hbmQgdGhlbiBmaW5hbGx5IG92ZXJyaWRlIHdpdGggdXNlciBkZWZhdWx0c1xuICAgIE9iamVjdC5hc3NpZ24oIGtub2IsIEtub2IuZGVmYXVsdHMsIHByb3BzIClcblxuICAgIC8vIHNldCB1bmRlcmx5aW5nIHZhbHVlIGlmIG5lY2Vzc2FyeS4uLiBUT0RPOiBob3cgc2hvdWxkIHRoaXMgYmUgc2V0IGdpdmVuIG1pbi9tYXg/XG4gICAgaWYoIHByb3BzLnZhbHVlICkga25vYi5fX3ZhbHVlID0gcHJvcHMudmFsdWVcbiAgICBcbiAgICAvLyBpbmhlcml0cyBmcm9tIFdpZGdldFxuICAgIGtub2IuaW5pdCgpXG5cbiAgICByZXR1cm4ga25vYlxuICB9LFxuXG4gIC8qKlxuICAgKiBEcmF3IHRoZSBLbm9iIG9udG8gaXRzIGNhbnZhcyBjb250ZXh0IHVzaW5nIHRoZSBjdXJyZW50IC5fX3ZhbHVlIHByb3BlcnR5LlxuICAgKiBAbWVtYmVyb2YgS25vYlxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGRyYXcoKSB7XG4gICAgLy8gZHJhdyBiYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlICAgPSB0aGlzLmNvbnRhaW5lci5iYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVxuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCAgID0gdGhpcy5saW5lV2lkdGhcblxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLDAsIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCApXG5cbiAgICBsZXQgeCA9IDAsXG4gICAgICAgIHkgPSAwLFxuICAgICAgICB3aWR0aCA9IHRoaXMucmVjdC53aWR0aCxcbiAgICAgICAgaGVpZ2h0PSB0aGlzLnJlY3QuaGVpZ2h0LFxuICAgICAgICByYWRpdXMgPSB3aWR0aCAvIDJcbiAgICBcbiAgICB0aGlzLmN0eC5maWxsUmVjdCggeCwgeSwgd2lkdGgsIGhlaWdodCApXG4gICAgLy90aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlXG5cbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmJhY2tncm91bmQgLy8gZHJhdyBiYWNrZ3JvdW5kIG9mIHdpZGdldCBmaXJzdFxuXG4gICAgbGV0IGFuZ2xlMCA9IE1hdGguUEkgKiAuNixcbiAgICAgICAgYW5nbGUxID0gTWF0aC5QSSAqIC40XG5cbiAgICB0aGlzLmN0eC5iZWdpblBhdGgoKVxuICAgIHRoaXMuY3R4LmFyYyggeCArIHJhZGl1cywgeSArIHJhZGl1cywgcmFkaXVzIC0gdGhpcy5rbm9iQnVmZmVyLCAgICAgICAgIGFuZ2xlMCwgYW5nbGUxLCBmYWxzZSApXG4gICAgdGhpcy5jdHguYXJjKCB4ICsgcmFkaXVzLCB5ICsgcmFkaXVzLCAocmFkaXVzIC0gdGhpcy5rbm9iQnVmZmVyKSAqIC41ICwgYW5nbGUxLCBhbmdsZTAsIHRydWUgIClcdFx0XG4gICAgdGhpcy5jdHguY2xvc2VQYXRoKClcbiAgICBcbiAgICB0aGlzLmN0eC5maWxsKClcblxuICAgIGxldCBhbmdsZTJcbiAgICBpZighdGhpcy5pc0ludmVydGVkKSAgeyBcbiAgICAgIGFuZ2xlMiA9IE1hdGguUEkgKiAuNiArIHRoaXMuX192YWx1ZSAqIDEuOCAgKiBNYXRoLlBJXG4gICAgICBpZiggYW5nbGUyID4gMiAqIE1hdGguUEkpIGFuZ2xlMiAtPSAyICogTWF0aC5QSVxuICAgIH1lbHNle1xuICAgICAgYW5nbGUyID0gTWF0aC5QSSAqICgwLjQgLSAoMS44ICogdGhpcy5fX3ZhbHVlKSlcbiAgICB9XG5cbiAgICB0aGlzLmN0eC5iZWdpblBhdGgoKVxuXG4gICAgaWYoIXRoaXMuaXNJbnZlcnRlZCkge1xuICAgICAgdGhpcy5jdHguYXJjKCB4ICsgcmFkaXVzLCB5ICsgcmFkaXVzLCByYWRpdXMgLSB0aGlzLmtub2JCdWZmZXIsIGFuZ2xlMCwgYW5nbGUyLCBmYWxzZSApXG4gICAgICB0aGlzLmN0eC5hcmMoIHggKyByYWRpdXMsIHkgKyByYWRpdXMsIChyYWRpdXMgLSB0aGlzLmtub2JCdWZmZXIpICogLjUsIGFuZ2xlMiwgYW5nbGUwLCB0cnVlIClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdHguYXJjKCB4ICsgcmFkaXVzLCB5ICsgcmFkaXVzLCByYWRpdXMgLSB0aGlzLmtub2JCdWZmZXIsIGFuZ2xlMSwgYW5nbGUyICx0cnVlIClcbiAgICAgIHRoaXMuY3R4LmFyYyggeCArIHJhZGl1cywgeSArIHJhZGl1cywgKHJhZGl1cyAtIHRoaXMua25vYkJ1ZmZlcikgKiAuNSwgYW5nbGUyLCBhbmdsZTEsIGZhbHNlIClcbiAgICB9XG5cbiAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKVxuXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5maWxsXG4gICAgdGhpcy5jdHguZmlsbCgpXG4gIFxuICB9LFxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICAvLyBjcmVhdGUgZXZlbnQgaGFuZGxlcnMgYm91bmQgdG8gdGhlIGN1cnJlbnQgb2JqZWN0LCBvdGhlcndpc2UgXG4gICAgLy8gdGhlICd0aGlzJyBrZXl3b3JkIHdpbGwgcmVmZXIgdG8gdGhlIHdpbmRvdyBvYmplY3QgaW4gdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZXZlbnRzICkge1xuICAgICAgdGhpc1sga2V5IF0gPSB0aGlzLmV2ZW50c1sga2V5IF0uYmluZCggdGhpcyApIFxuICAgIH1cblxuICAgIC8vIG9ubHkgbGlzdGVuIGZvciBtb3VzZWRvd24gaW50aWFsbHk7IG1vdXNlbW92ZSBhbmQgbW91c2V1cCBhcmUgcmVnaXN0ZXJlZCBvbiBtb3VzZWRvd25cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgIHRoaXMucG9pbnRlcmRvd24gKVxuICB9LFxuXG4gIGV2ZW50czoge1xuICAgIHBvaW50ZXJkb3duKCBlICkge1xuICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlXG4gICAgICB0aGlzLnBvaW50ZXJJZCA9IGUucG9pbnRlcklkXG5cbiAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIC8vIGNoYW5nZSBrbm9iIHZhbHVlIG9uIGNsaWNrIC8gdG91Y2hkb3duXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgLy8gb25seSBsaXN0ZW4gZm9yIHVwIGFuZCBtb3ZlIGV2ZW50cyBhZnRlciBwb2ludGVyZG93biBcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgIH0sXG5cbiAgICBwb2ludGVydXAoIGUgKSB7XG4gICAgICBpZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICkge1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBwb2ludGVybW92ZSggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApXG4gICAgICB9XG4gICAgfSxcbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSB2YWx1ZSBiZXR3ZWVuIDAtMSBnaXZlbiB0aGUgY3VycmVudCBwb2ludGVyIHBvc2l0aW9uIGluIHJlbGF0aW9uXG4gICAqIHRvIHRoZSBLbm9iJ3MgcG9zaXRpb24sIGFuZCB0cmlnZ2VycyBvdXRwdXQuXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAbWVtYmVyb2YgS25vYlxuICAgKiBAcGFyYW0ge1BvaW50ZXJFdmVudH0gZSAtIFRoZSBwb2ludGVyIGV2ZW50IHRvIGJlIHByb2Nlc3NlZC5cbiAgICovXG5cbiAgcHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIHtcbiAgICBsZXQgeE9mZnNldCA9IGUuY2xpZW50WCwgeU9mZnNldCA9IGUuY2xpZW50WVxuXG4gICAgbGV0IHJhZGl1cyA9IHRoaXMucmVjdC53aWR0aCAvIDI7XG4gICAgdGhpcy5sYXN0VmFsdWUgPSB0aGlzLnZhbHVlO1xuXG4gICAgaWYoICF0aGlzLnVzZXNSb3RhdGlvbiApIHtcbiAgICAgIGlmKCB0aGlzLmxhc3RQb3NpdGlvbiAhPT0gLTEgKSB7IFxuICAgICAgICAvL3RoaXMuX192YWx1ZSAtPSAoIHlPZmZzZXQgLSB0aGlzLmxhc3RQb3NpdGlvbiApIC8gKHJhZGl1cyAqIDIpO1xuICAgICAgICB0aGlzLl9fdmFsdWUgPSAxIC0geU9mZnNldCAvIHRoaXMucmVjdC5oZWlnaHRcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIHZhciB4ZGlmZiA9IHJhZGl1cyAtIHhPZmZzZXQ7XG4gICAgICB2YXIgeWRpZmYgPSByYWRpdXMgLSB5T2Zmc2V0O1xuICAgICAgdmFyIGFuZ2xlID0gTWF0aC5QSSArIE1hdGguYXRhbjIoeWRpZmYsIHhkaWZmKTtcbiAgICAgIHRoaXMuX192YWx1ZSA9ICAoKGFuZ2xlICsgKE1hdGguUEkgKiAxLjUpKSAlIChNYXRoLlBJICogMikpIC8gKE1hdGguUEkgKiAyKTtcblxuICAgICAgaWYodGhpcy5sYXN0Um90YXRpb25WYWx1ZSA+IC44ICYmIHRoaXMuX192YWx1ZSA8IC4yKSB7XG4gICAgICAgIHRoaXMuX192YWx1ZSA9IDE7XG4gICAgICB9ZWxzZSBpZih0aGlzLmxhc3RSb3RhdGlvblZhbHVlIDwgLjIgJiYgdGhpcy5fX3ZhbHVlID4gLjgpIHtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fX3ZhbHVlID4gMSkgdGhpcy5fX3ZhbHVlID0gMTtcbiAgICBpZiAodGhpcy5fX3ZhbHVlIDwgMCkgdGhpcy5fX3ZhbHVlID0gMDtcblxuICAgIHRoaXMubGFzdFJvdGF0aW9uVmFsdWUgPSB0aGlzLl9fdmFsdWU7XG4gICAgdGhpcy5sYXN0UG9zaXRpb24gPSB5T2Zmc2V0O1xuXG4gICAgbGV0IHNob3VsZERyYXcgPSB0aGlzLm91dHB1dCgpXG4gICAgXG4gICAgaWYoIHNob3VsZERyYXcgKSB0aGlzLmRyYXcoKVxuICB9LFxuXG4gIC8vX19hZGRUb1BhbmVsKCBwYW5lbCApIHtcbiAgLy8gIHRoaXMuY29udGFpbmVyID0gcGFuZWxcblxuICAvLyAgaWYoIHR5cGVvZiB0aGlzLmFkZEV2ZW50cyA9PT0gJ2Z1bmN0aW9uJyApIHRoaXMuYWRkRXZlbnRzKClcblxuICAvLyAgLy8gY2FsbGVkIGlmIHdpZGdldCB1c2VzIERPTVdpZGdldCBhcyBwcm90b3R5cGU7IC5wbGFjZSBpbmhlcml0ZWQgZnJvbSBET01XaWRnZXRcbiAgICBcbiAgLy8gIHRoaXMucGxhY2UoIHRydWUgKSBcblxuICAvLyAgaWYoIHRoaXMubGFiZWwgKSB0aGlzLmFkZExhYmVsKClcblxuICAvLyAgdGhpcy5kcmF3KCkgICAgIFxuXG4gIC8vfVxuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEtub2JcbiIsImltcG9ydCBET01XaWRnZXQgZnJvbSAnLi9kb21XaWRnZXQuanMnXG5cbi8qKlxuICogQSBIVE1MIHNlbGVjdCBlbGVtZW50LCBmb3IgcGlja2luZyBpdGVtcyBmcm9tIGEgZHJvcC1kb3duIG1lbnUuIFxuICogXG4gKiBAbW9kdWxlIE1lbnVcbiAqIEBhdWdtZW50cyBET01XaWRnZXRcbiAqLyBcbmxldCBNZW51ID0gT2JqZWN0LmNyZWF0ZSggRE9NV2lkZ2V0ICkgXG5cbk9iamVjdC5hc3NpZ24oIE1lbnUsIHtcbiAgLyoqIEBsZW5kcyBNZW51LnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgTWVudSBpbnN0YW5jZXMuXG4gICAqIERlZmF1bHRzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHVzZXItZGVmaW5lZCBwcm9wZXJ0aWVzIHBhc3NlZCB0b1xuICAgKiBjb25zdHJ1dG9yLlxuICAgKiBAbWVtYmVyb2YgTWVudVxuICAgKiBAc3RhdGljXG4gICAqLyBcbiAgZGVmYXVsdHM6IHtcbiAgICBfX3ZhbHVlOjAsXG4gICAgdmFsdWU6MCxcbiAgICBiYWNrZ3JvdW5kOicjMzMzJyxcbiAgICBmaWxsOicjNzc3JyxcbiAgICBzdHJva2U6JyNhYWEnLFxuICAgIGJvcmRlcldpZHRoOjQsXG5cbiAgLyoqXG4gICAqIFRoZSBvcHRpb25zIGFycmF5IHN0b3JlcyB0aGUgZGlmZmVyZW50IHBvc3NpYmxlIHZhbHVlcyBmb3IgdGhlIE1lbnVcbiAgICogd2lkZ2V0LiBUaGVyZSBhcmUgdXNlZCB0byBjcmVhdGUgSFRNTCBvcHRpb24gZWxlbWVudHMgd2hpY2ggYXJlIHRoZW5cbiAgICogYXR0YWNoZWQgdG8gdGhlIHByaW1hcnkgc2VsZWN0IGVsZW1lbnQgdXNlZCBieSB0aGUgTWVudS5cbiAgICogQG1lbWJlcm9mIE1lbnVcbiAgICogQGluc3RhbmNlXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICovIFxuICAgIG9wdGlvbnM6W10sXG4gICAgb252YWx1ZWNoYW5nZTpudWxsXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBNZW51IGluc3RhbmNlLlxuICAgKiBAbWVtYmVyb2YgTWVudVxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXSAtIEEgZGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGluaXRpYWxpemUgYSBNZW51IHdpdGguXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSggcHJvcHMgKSB7XG4gICAgbGV0IG1lbnUgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICBET01XaWRnZXQuY3JlYXRlLmNhbGwoIG1lbnUgKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggbWVudSwgTWVudS5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgbWVudS5jcmVhdGVPcHRpb25zKClcblxuICAgIG1lbnUuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnY2hhbmdlJywgKCBlICk9PiB7XG4gICAgICBtZW51Ll9fdmFsdWUgPSBlLnRhcmdldC52YWx1ZVxuICAgICAgbWVudS5vdXRwdXQoKVxuXG4gICAgICBpZiggbWVudS5vbnZhbHVlY2hhbmdlICE9PSBudWxsICkge1xuICAgICAgICBtZW51Lm9udmFsdWVjaGFuZ2UoIG1lbnUudmFsdWUgIClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIG1lbnVcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIHByaW1hcnkgRE9NIGVsZW1lbnQgKHNlbGVjdCkgdG8gYmUgcGxhY2VkIGluIGEgUGFuZWwuXG4gICAqIEBtZW1iZXJvZiBNZW51IFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGNyZWF0ZUVsZW1lbnQoKSB7XG4gICAgbGV0IHNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzZWxlY3QnIClcblxuICAgIHJldHVybiBzZWxlY3RcbiAgfSxcblxuICAvKipcbiAgICogR2VuZXJhdGUgb3B0aW9uIGVsZW1lbnRzIGZvciBtZW51LiBSZW1vdmVzIHByZXZpb3VzbHkgYXBwZW5kZWQgZWxlbWVudHMuXG4gICAqIEBtZW1iZXJvZiBNZW51IFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGNyZWF0ZU9wdGlvbnMoKSB7XG4gICAgdGhpcy5lbGVtZW50LmlubmVySFRNTCA9ICcnXG5cbiAgICBmb3IoIGxldCBvcHRpb24gb2YgdGhpcy5vcHRpb25zICkge1xuICAgICAgbGV0IG9wdGlvbkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ29wdGlvbicgKVxuICAgICAgb3B0aW9uRWwuc2V0QXR0cmlidXRlKCAndmFsdWUnLCBvcHRpb24gKVxuICAgICAgb3B0aW9uRWwuaW5uZXJUZXh0ID0gb3B0aW9uXG4gICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoIG9wdGlvbkVsIClcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIE92ZXJyaWRkZW4gdmlydHVhbCBtZXRob2QgdG8gYWRkIGVsZW1lbnQgdG8gcGFuZWwuXG4gICAqIEBwcml2YXRlXG4gICAqIEBtZW1iZXJvZiBNZW51IFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIF9fYWRkVG9QYW5lbCggcGFuZWwgKSB7XG4gICAgdGhpcy5jb250YWluZXIgPSBwYW5lbFxuXG4gICAgaWYoIHR5cGVvZiB0aGlzLmFkZEV2ZW50cyA9PT0gJ2Z1bmN0aW9uJyApIHRoaXMuYWRkRXZlbnRzKClcblxuICAgIC8vIGNhbGxlZCBpZiB3aWRnZXQgdXNlcyBET01XaWRnZXQgYXMgcHJvdG90eXBlOyAucGxhY2UgaW5oZXJpdGVkIGZyb20gRE9NV2lkZ2V0XG4gICAgdGhpcy5wbGFjZSgpIFxuICB9XG5cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IE1lbnVcbiIsImxldCBQYW5lbCA9IHtcbiAgZGVmYXVsdHM6IHtcbiAgICBmdWxsc2NyZWVuOmZhbHNlLFxuICAgIGJhY2tncm91bmQ6JyMzMzMnXG4gIH0sXG4gIFxuICAvLyBjbGFzcyB2YXJpYWJsZSBmb3IgcmVmZXJlbmNlIHRvIGFsbCBwYW5lbHNcbiAgcGFuZWxzOltdLFxuXG4gIGNyZWF0ZSggcHJvcHMgPSBudWxsICkge1xuICAgIGxldCBwYW5lbCA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIC8vIGRlZmF1bHQ6IGZ1bGwgd2luZG93IGludGVyZmFjZVxuICAgIGlmKCBwcm9wcyA9PT0gbnVsbCApIHtcbiAgICAgICAgXG4gICAgICBPYmplY3QuYXNzaWduKCBwYW5lbCwgUGFuZWwuZGVmYXVsdHMsIHtcbiAgICAgICAgeDowLFxuICAgICAgICB5OjAsXG4gICAgICAgIHdpZHRoOjEsXG4gICAgICAgIGhlaWdodDoxLFxuICAgICAgICBfX3g6IDAsXG4gICAgICAgIF9feTogMCxcbiAgICAgICAgX193aWR0aDogbnVsbCxcbiAgICAgICAgX19oZWlnaHQ6bnVsbCxcbiAgICAgICAgZnVsbHNjcmVlbjogdHJ1ZSxcbiAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICB9KVxuICAgICAgXG4gICAgICBwYW5lbC5kaXYgPSBwYW5lbC5fX2NyZWF0ZUhUTUxFbGVtZW50KClcbiAgICAgIHBhbmVsLmxheW91dCgpXG5cbiAgICAgIGxldCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJ2JvZHknIClcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoIHBhbmVsLmRpdiApXG4gICAgfVxuICAgIFxuICAgIFBhbmVsLnBhbmVscy5wdXNoKCBwYW5lbCApXG5cbiAgICByZXR1cm4gcGFuZWxcbiAgfSxcbiAgXG4gIF9fY3JlYXRlSFRNTEVsZW1lbnQoKSB7XG4gICAgbGV0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnIClcbiAgICBkaXYuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG4gICAgZGl2LnN0eWxlLmRpc3BsYXkgID0gJ2Jsb2NrJ1xuICAgIGRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmJhY2tncm91bmRcbiAgICBcbiAgICByZXR1cm4gZGl2XG4gIH0sXG5cbiAgbGF5b3V0KCkge1xuICAgIGlmKCB0aGlzLmZ1bGxzY3JlZW4gKSB7XG4gICAgICB0aGlzLl9fd2lkdGggID0gd2luZG93LmlubmVyV2lkdGhcbiAgICAgIHRoaXMuX19oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgIHRoaXMuX194ICAgICAgPSB0aGlzLnggKiB0aGlzLl9fd2lkdGhcbiAgICAgIHRoaXMuX195ICAgICAgPSB0aGlzLnkgKiB0aGlzLl9faGVpZ2h0XG5cbiAgICAgIHRoaXMuZGl2LnN0eWxlLndpZHRoICA9IHRoaXMuX193aWR0aCArICdweCdcbiAgICAgIHRoaXMuZGl2LnN0eWxlLmhlaWdodCA9IHRoaXMuX19oZWlnaHQgKyAncHgnXG4gICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ICAgPSB0aGlzLl9feCArICdweCdcbiAgICAgIHRoaXMuZGl2LnN0eWxlLnRvcCAgICA9IHRoaXMuX195ICsgJ3B4J1xuICAgIH1cbiAgfSxcblxuICBnZXRXaWR0aCgpICB7IHJldHVybiB0aGlzLl9fd2lkdGggIH0sXG4gIGdldEhlaWdodCgpIHsgcmV0dXJuIHRoaXMuX19oZWlnaHQgfSxcblxuICBhZGQoIC4uLndpZGdldHMgKSB7XG4gICAgZm9yKCBsZXQgd2lkZ2V0IG9mIHdpZGdldHMgKSB7XG5cbiAgICAgIC8vIGNoZWNrIHRvIG1ha2Ugc3VyZSB3aWRnZXQgaGFzIG5vdCBiZWVuIGFscmVhZHkgYWRkZWRcbiAgICAgIGlmKCB0aGlzLmNoaWxkcmVuLmluZGV4T2YoIHdpZGdldCApID09PSAtMSApIHtcbiAgICAgICAgaWYoIHR5cGVvZiB3aWRnZXQuX19hZGRUb1BhbmVsID09PSAnZnVuY3Rpb24nICkge1xuICAgICAgICAgIHRoaXMuZGl2LmFwcGVuZENoaWxkKCB3aWRnZXQuZWxlbWVudCApXG4gICAgICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKCB3aWRnZXQgKVxuXG4gICAgICAgICAgd2lkZ2V0Ll9fYWRkVG9QYW5lbCggdGhpcyApXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRocm93IEVycm9yKCAnV2lkZ2V0IGNhbm5vdCBiZSBhZGRlZCB0byBwYW5lbDsgaXQgZG9lcyBub3QgY29udGFpbiB0aGUgbWV0aG9kIC5fX2FkZFRvUGFuZWwnIClcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIHRocm93IEVycm9yKCAnV2lkZ2V0IGlzIGFscmVhZHkgYWRkZWQgdG8gcGFuZWwuJyApXG4gICAgICB9XG4gICAgfVxuICB9LFxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IFBhbmVsIFxuIiwiaW1wb3J0IENhbnZhc1dpZGdldCBmcm9tICcuL2NhbnZhc1dpZGdldC5qcydcblxuLyoqXG4gKiBBIGhvcml6b250YWwgb3IgdmVydGljYWwgZmFkZXIuIFxuICogQG1vZHVsZSBTbGlkZXJcbiAqIEBhdWdtZW50cyBDYW52YXNXaWRnZXRcbiAqLyBcblxubGV0IFNsaWRlciA9IE9iamVjdC5jcmVhdGUoIENhbnZhc1dpZGdldCApIFxuXG5PYmplY3QuYXNzaWduKCBTbGlkZXIsIHtcbiAgLyoqIEBsZW5kcyBTbGlkZXIucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBTbGlkZXIgaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIFNsaWRlclxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgX192YWx1ZTouNSwgLy8gYWx3YXlzIDAtMSwgbm90IGZvciBlbmQtdXNlcnNcbiAgICB2YWx1ZTouNSwgICAvLyBlbmQtdXNlciB2YWx1ZSB0aGF0IG1heSBiZSBmaWx0ZXJlZFxuICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgLyoqXG4gICAgICogVGhlIHN0eWxlIHByb3BlcnR5IGNhbiBiZSBlaXRoZXIgJ2hvcml6b250YWwnICh0aGUgZGVmYXVsdCkgb3IgJ3ZlcnRpY2FsJy4gVGhpc1xuICAgICAqIGRldGVybWluZXMgdGhlIG9yaWVudGF0aW9uIG9mIHRoZSBTbGlkZXIgaW5zdGFuY2UuXG4gICAgICogQG1lbWJlcm9mIFNsaWRlclxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgc3R5bGU6ICAnaG9yaXpvbnRhbCdcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IFNsaWRlciBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIFNsaWRlclxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXSAtIEEgZGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGluaXRpYWxpemUgU2xpZGVyIHdpdGguXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSggcHJvcHMgKSB7XG4gICAgbGV0IHNsaWRlciA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIC8vIGFwcGx5IFdpZGdldCBkZWZhdWx0cywgdGhlbiBvdmVyd3JpdGUgKGlmIGFwcGxpY2FibGUpIHdpdGggU2xpZGVyIGRlZmF1bHRzXG4gICAgQ2FudmFzV2lkZ2V0LmNyZWF0ZS5jYWxsKCBzbGlkZXIgKVxuXG4gICAgLy8gLi4uYW5kIHRoZW4gZmluYWxseSBvdmVycmlkZSB3aXRoIHVzZXIgZGVmYXVsdHNcbiAgICBPYmplY3QuYXNzaWduKCBzbGlkZXIsIFNsaWRlci5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgLy8gc2V0IHVuZGVybHlpbmcgdmFsdWUgaWYgbmVjZXNzYXJ5Li4uIFRPRE86IGhvdyBzaG91bGQgdGhpcyBiZSBzZXQgZ2l2ZW4gbWluL21heD9cbiAgICBpZiggcHJvcHMudmFsdWUgKSBzbGlkZXIuX192YWx1ZSA9IHByb3BzLnZhbHVlXG4gICAgXG4gICAgLy8gaW5oZXJpdHMgZnJvbSBXaWRnZXRcbiAgICBzbGlkZXIuaW5pdCgpXG5cbiAgICByZXR1cm4gc2xpZGVyXG4gIH0sXG5cbiAgLyoqXG4gICAqIERyYXcgdGhlIFNsaWRlciBvbnRvIGl0cyBjYW52YXMgY29udGV4dCB1c2luZyB0aGUgY3VycmVudCAuX192YWx1ZSBwcm9wZXJ0eS5cbiAgICogQG1lbWJlcm9mIFNsaWRlclxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGRyYXcoKSB7XG4gICAgLy8gZHJhdyBiYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlICAgPSB0aGlzLmJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlXG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGhcbiAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuXG4gICAgLy8gZHJhdyBmaWxsIChzbGlkZXIgdmFsdWUgcmVwcmVzZW50YXRpb24pXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5maWxsXG5cbiAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvcml6b250YWwnIClcbiAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLCAwLCB0aGlzLnJlY3Qud2lkdGggKiB0aGlzLl9fdmFsdWUsIHRoaXMucmVjdC5oZWlnaHQgKVxuICAgIGVsc2VcbiAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLCB0aGlzLnJlY3QuaGVpZ2h0IC0gdGhpcy5fX3ZhbHVlICogdGhpcy5yZWN0LmhlaWdodCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0ICogdGhpcy5fX3ZhbHVlIClcblxuICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QoIDAsMCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcbiAgfSxcblxuICBhZGRFdmVudHMoKSB7XG4gICAgLy8gY3JlYXRlIGV2ZW50IGhhbmRsZXJzIGJvdW5kIHRvIHRoZSBjdXJyZW50IG9iamVjdCwgb3RoZXJ3aXNlIFxuICAgIC8vIHRoZSAndGhpcycga2V5d29yZCB3aWxsIHJlZmVyIHRvIHRoZSB3aW5kb3cgb2JqZWN0IGluIHRoZSBldmVudCBoYW5kbGVyc1xuICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmV2ZW50cyApIHtcbiAgICAgIHRoaXNbIGtleSBdID0gdGhpcy5ldmVudHNbIGtleSBdLmJpbmQoIHRoaXMgKSBcbiAgICB9XG5cbiAgICAvLyBvbmx5IGxpc3RlbiBmb3IgbW91c2Vkb3duIGludGlhbGx5OyBtb3VzZW1vdmUgYW5kIG1vdXNldXAgYXJlIHJlZ2lzdGVyZWQgb24gbW91c2Vkb3duXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVyZG93bicsICB0aGlzLnBvaW50ZXJkb3duIClcbiAgfSxcblxuICBldmVudHM6IHtcbiAgICBwb2ludGVyZG93biggZSApIHtcbiAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZVxuICAgICAgdGhpcy5wb2ludGVySWQgPSBlLnBvaW50ZXJJZFxuXG4gICAgICB0aGlzLnByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKSAvLyBjaGFuZ2Ugc2xpZGVyIHZhbHVlIG9uIGNsaWNrIC8gdG91Y2hkb3duXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgLy8gb25seSBsaXN0ZW4gZm9yIHVwIGFuZCBtb3ZlIGV2ZW50cyBhZnRlciBwb2ludGVyZG93biBcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgIH0sXG5cbiAgICBwb2ludGVydXAoIGUgKSB7XG4gICAgICBpZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICkge1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBwb2ludGVybW92ZSggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApXG4gICAgICB9XG4gICAgfSxcbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSB2YWx1ZSBiZXR3ZWVuIDAtMSBnaXZlbiB0aGUgY3VycmVudCBwb2ludGVyIHBvc2l0aW9uIGluIHJlbGF0aW9uXG4gICAqIHRvIHRoZSBTbGlkZXIncyBwb3NpdGlvbiwgYW5kIHRyaWdnZXJzIG91dHB1dC5cbiAgICogQGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBTbGlkZXJcbiAgICogQHBhcmFtIHtQb2ludGVyRXZlbnR9IGUgLSBUaGUgcG9pbnRlciBldmVudCB0byBiZSBwcm9jZXNzZWQuXG4gICAqL1xuICBwcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlICkge1xuICAgIGxldCBwcmV2VmFsdWUgPSB0aGlzLnZhbHVlXG5cbiAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvcml6b250YWwnICkge1xuICAgICAgdGhpcy5fX3ZhbHVlID0gKCBlLmNsaWVudFggLSB0aGlzLnJlY3QubGVmdCApIC8gdGhpcy5yZWN0LndpZHRoXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLl9fdmFsdWUgPSAxIC0gKCBlLmNsaWVudFkgLSB0aGlzLnJlY3QudG9wICApIC8gdGhpcy5yZWN0LmhlaWdodCBcbiAgICB9XG5cbiAgICAvLyBjbGFtcCBfX3ZhbHVlLCB3aGljaCBpcyBvbmx5IHVzZWQgaW50ZXJuYWxseVxuICAgIGlmKCB0aGlzLl9fdmFsdWUgPiAxICkgdGhpcy5fX3ZhbHVlID0gMVxuICAgIGlmKCB0aGlzLl9fdmFsdWUgPCAwICkgdGhpcy5fX3ZhbHVlID0gMFxuXG4gICAgbGV0IHNob3VsZERyYXcgPSB0aGlzLm91dHB1dCgpXG4gICAgXG4gICAgaWYoIHNob3VsZERyYXcgKSB0aGlzLmRyYXcoKVxuICB9LFxuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNsaWRlclxuIiwibGV0IFV0aWxpdGllcyA9IHtcblxuICBnZXRNb2RlKCkge1xuICAgIHJldHVybiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgPyAndG91Y2gnIDogJ21vdXNlJ1xuICB9LFxuXG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgVXRpbGl0aWVzXG4iLCJpbXBvcnQgRmlsdGVycyBmcm9tICcuL2ZpbHRlcnMnXG5pbXBvcnQgQ29tbXVuaWNhdGlvbiBmcm9tICcuL2NvbW11bmljYXRpb24uanMnXG5cbi8qKlxuICogV2lkZ2V0IGlzIHRoZSBiYXNlIGNsYXNzIHRoYXQgYWxsIG90aGVyIFVJIGVsZW1lbnRzIGluaGVyaXRzIGZyb20uIEl0IHByaW1hcmlseVxuICogaW5jbHVkZXMgbWV0aG9kcyBmb3IgZmlsdGVyaW5nIC8gc2NhbGluZyBvdXRwdXQuXG4gKiBAbW9kdWxlIFdpZGdldFxuICovXG5cblxubGV0IFdpZGdldCA9IHtcbiAgLyoqIEBsZW5kcyBXaWRnZXQucHJvdG90eXBlICovXG4gIFxuICAvKipcbiAgICogc3RvcmUgYWxsIGluc3RhbnRpYXRlZCB3aWRnZXRzLlxuICAgKiBAdHlwZSB7QXJyYXkuPFdpZGdldD59XG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgd2lkZ2V0czogW10sXG4gIGxhc3RWYWx1ZTogbnVsbCxcbiAgb252YWx1ZWNoYW5nZTogbnVsbCxcblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIHdpZGdldHNcbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIG1pbjowLCBtYXg6MSxcbiAgICBzY2FsZU91dHB1dDp0cnVlLCAvLyBhcHBseSBzY2FsZSBmaWx0ZXIgYnkgZGVmYXVsdCBmb3IgbWluIC8gbWF4IHJhbmdlc1xuICAgIHRhcmdldDpudWxsLFxuICAgIF9fcHJldlZhbHVlOm51bGxcbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgV2lkZ2V0IGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBXaWRnZXRcbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCkge1xuICAgIE9iamVjdC5hc3NpZ24oIHRoaXMsIFdpZGdldC5kZWZhdWx0cyApXG4gICAgXG4gICAgLyoqIFxuICAgICAqIFN0b3JlcyBmaWx0ZXJzIGZvciB0cmFuc2Zvcm1pbmcgd2lkZ2V0IG91dHB1dC5cbiAgICAgKiBAbWVtYmVyb2YgV2lkZ2V0XG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5maWx0ZXJzID0gW11cblxuICAgIHRoaXMuX19wcmVmaWx0ZXJzID0gW11cbiAgICB0aGlzLl9fcG9zdGZpbHRlcnMgPSBbXVxuXG4gICAgV2lkZ2V0LndpZGdldHMucHVzaCggdGhpcyApXG5cbiAgICByZXR1cm4gdGhpc1xuICB9LFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXphdGlvbiBtZXRob2QgZm9yIHdpZGdldHMuIENoZWNrcyB0byBzZWUgaWYgd2lkZ2V0IGNvbnRhaW5zXG4gICAqIGEgJ3RhcmdldCcgcHJvcGVydHk7IGlmIHNvLCBtYWtlcyBzdXJlIHRoYXQgY29tbXVuaWNhdGlvbiB3aXRoIHRoYXRcbiAgICogdGFyZ2V0IGlzIGluaXRpYWxpemVkLlxuICAgKiBAbWVtYmVyb2YgV2lkZ2V0XG4gICAqIEBpbnN0YW5jZVxuICAgKi9cblxuICBpbml0KCkge1xuICAgIGlmKCB0aGlzLnRhcmdldCAmJiB0aGlzLnRhcmdldCA9PT0gJ29zYycgfHwgdGhpcy50YXJnZXQgPT09ICdtaWRpJyApIHtcbiAgICAgIGlmKCAhQ29tbXVuaWNhdGlvbi5pbml0aWFsaXplZCApIENvbW11bmljYXRpb24uaW5pdCgpXG4gICAgfVxuXG4gICAgLy8gaWYgbWluL21heCBhcmUgbm90IDAtMSBhbmQgc2NhbGluZyBpcyBub3QgZGlzYWJsZWRcbiAgICBpZiggdGhpcy5zY2FsZU91dHB1dCAmJiAodGhpcy5taW4gIT09IDAgfHwgdGhpcy5tYXggIT09IDEgKSkgeyAgICAgIFxuICAgICAgdGhpcy5fX3ByZWZpbHRlcnMucHVzaCggXG4gICAgICAgIEZpbHRlcnMuU2NhbGUoIDAsMSx0aGlzLm1pbix0aGlzLm1heCApIFxuICAgICAgKVxuICAgIH1cbiAgfSxcblxuICBydW5GaWx0ZXJzKCB2YWx1ZSwgd2lkZ2V0ICkge1xuICAgIGZvciggbGV0IGZpbHRlciBvZiB3aWRnZXQuX19wcmVmaWx0ZXJzICkgIHZhbHVlID0gZmlsdGVyKCB2YWx1ZSApXG4gICAgZm9yKCBsZXQgZmlsdGVyIG9mIHdpZGdldC5maWx0ZXJzICkgICAgICAgdmFsdWUgPSBmaWx0ZXIoIHZhbHVlIClcbiAgICBmb3IoIGxldCBmaWx0ZXIgb2Ygd2lkZ2V0Ll9fcG9zdGZpbHRlcnMgKSB2YWx1ZSA9IGZpbHRlciggdmFsdWUgKVxuICAgXG4gICAgcmV0dXJuIHZhbHVlXG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZXMgb3V0cHV0IG9mIHdpZGdldCBieSBydW5uaW5nIC5fX3ZhbHVlIHByb3BlcnR5IHRocm91Z2ggZmlsdGVyIGNoYWluLlxuICAgKiBUaGUgcmVzdWx0IGlzIHN0b3JlZCBpbiB0aGUgLnZhbHVlIHByb3BlcnR5IG9mIHRoZSB3aWRnZXQsIHdoaWNoIGlzIHRoZW5cbiAgICogcmV0dXJuZWQuXG4gICAqIEBtZW1iZXJvZiBXaWRnZXRcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBvdXRwdXQoKSB7XG4gICAgbGV0IHZhbHVlID0gdGhpcy5fX3ZhbHVlLCBuZXdWYWx1ZUdlbmVyYXRlZCA9IGZhbHNlLCBsYXN0VmFsdWUgPSB0aGlzLnZhbHVlLCB3ID0gdGhpc1xuXG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLm1hcCggdiA9PiBXaWRnZXQucnVuRmlsdGVycyggdiwgdGhpcyApIClcbiAgICB9ZWxzZXtcbiAgICAgIHZhbHVlID0gdGhpcy5ydW5GaWx0ZXJzKCB2YWx1ZSwgdGhpcyApXG4gICAgfVxuICAgIFxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICAgIFxuICAgIGlmKCB0aGlzLnRhcmdldCAhPT0gbnVsbCApIHRoaXMudHJhbnNtaXQoIHRoaXMudmFsdWUgKVxuXG4gICAgaWYoIHRoaXMuX192YWx1ZSAhPT0gdGhpcy5fX3ByZXZWYWx1ZSApIHtcbiAgICAgIG5ld1ZhbHVlR2VuZXJhdGVkID0gdHJ1ZVxuXG4gICAgICBpZiggdGhpcy5vbnZhbHVlY2hhbmdlICE9PSBudWxsICkgdGhpcy5vbnZhbHVlY2hhbmdlKCB0aGlzLnZhbHVlLCBsYXN0VmFsdWUgKVxuICAgIH1cblxuICAgIHRoaXMuX19wcmV2VmFsdWUgPSB0aGlzLl9fdmFsdWVcbiAgICAvLyBuZXdWYWx1ZUdlbmVyYXRlZCBjYW4gYmUgdXNlIHRvIGRldGVybWluZSBpZiB3aWRnZXQgc2hvdWxkIGRyYXdcbiAgICByZXR1cm4gbmV3VmFsdWVHZW5lcmF0ZWRcbiAgfSxcblxuICAvKipcbiAgICogSWYgdGhlIHdpZGdldCBoYXMgYSByZW1vdGUgdGFyZ2V0IChub3QgYSB0YXJnZXQgaW5zaWRlIHRoZSBpbnRlcmZhY2Ugd2ViIHBhZ2UpXG4gICAqIHRoaXMgd2lsbCB0cmFuc21pdCB0aGUgd2lkZ2V0cyB2YWx1ZSB0byB0aGUgcmVtb3RlIGRlc3RpbmF0aW9uLlxuICAgKiBAbWVtYmVyb2YgV2lkZ2V0XG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgdHJhbnNtaXQoKSB7XG4gICAgaWYoIHRoaXMudGFyZ2V0ID09PSAnb3NjJyApIHtcbiAgICAgIENvbW11bmljYXRpb24uT1NDLnNlbmQoIHRoaXMuYWRkcmVzcywgdGhpcy52YWx1ZSApXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdpZGdldFxuIiwibGV0IFdpZGdldExhYmVsID0ge1xuXG4gIGRlZmF1bHRzOiB7XG4gICAgc2l6ZToyNCxcbiAgICBmYWNlOidzYW5zLXNlcmlmJyxcbiAgICBmaWxsOid3aGl0ZScsXG4gICAgYWxpZ246J2NlbnRlcicsXG4gICAgYmFja2dyb3VuZDpudWxsLFxuICAgIHdpZHRoOjFcbiAgfSxcblxuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBsYWJlbCA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggbGFiZWwsIHRoaXMuZGVmYXVsdHMsIHByb3BzIClcblxuICAgIGlmKCB0eXBlb2YgbGFiZWwuY3R4ID09PSB1bmRlZmluZWQgKSB0aHJvdyBFcnJvciggJ1dpZGdldExhYmVscyBtdXN0IGJlIGNvbnN0cnVjdGVkIHdpdGggYSBjYW52YXMgY29udGV4dCAoY3R4KSBhcmd1bWVudCcgKVxuICAgIFxuICAgIGxhYmVsLmZvbnQgPSBgJHtsYWJlbC5zaXplfXB4ICR7bGFiZWwuZmFjZX1gXG5cbiAgICByZXR1cm4gbGFiZWxcbiAgfSxcblxuICBkcmF3KCkge1xuICAgIGxldCBjbnZzID0gdGhpcy5jdHguY2FudmFzLFxuICAgICAgICBjd2lkdGggPSBjbnZzLndpZHRoLFxuICAgICAgICBjaGVpZ2h0PSBjbnZzLmhlaWdodCxcbiAgICAgICAgeCAgICAgID0gdGhpcy54ICogY3dpZHRoLFxuICAgICAgICB5ICAgICAgPSB0aGlzLnkgKiBjaGVpZ2h0LFxuICAgICAgICB3aWR0aCAgPSB0aGlzLndpZHRoICogY3dpZHRoXG5cbiAgICBpZiggdGhpcy5iYWNrZ3JvdW5kICE9PSBudWxsICkge1xuICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5iYWNrZ3JvdW5kXG4gICAgICB0aGlzLmN0eC5maWxsUmVjdCggeCx5LHdpZHRoLHRoaXMuc2l6ZSArIDEwIClcbiAgICB9XG4gICAgXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5maWxsXG4gICAgdGhpcy5jdHgudGV4dEFsaWduID0gdGhpcy5hbGlnblxuICAgIHRoaXMuY3R4LmZvbnQgPSB0aGlzLmZvbnRcbiAgICB0aGlzLmN0eC5maWxsVGV4dCggdGhpcy50ZXh0LCB4LHksd2lkdGggKSAgICBcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFdpZGdldExhYmVsXG4iLCIvKiFcbiAqIFBFUCB2MC40LjEgfCBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L1BFUFxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnMgfCBodHRwOi8vanF1ZXJ5Lm9yZy9saWNlbnNlXG4gKi9cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgZ2xvYmFsLlBvaW50ZXJFdmVudHNQb2x5ZmlsbCA9IGZhY3RvcnkoKVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogVGhpcyBpcyB0aGUgY29uc3RydWN0b3IgZm9yIG5ldyBQb2ludGVyRXZlbnRzLlxuICAgKlxuICAgKiBOZXcgUG9pbnRlciBFdmVudHMgbXVzdCBiZSBnaXZlbiBhIHR5cGUsIGFuZCBhbiBvcHRpb25hbCBkaWN0aW9uYXJ5IG9mXG4gICAqIGluaXRpYWxpemF0aW9uIHByb3BlcnRpZXMuXG4gICAqXG4gICAqIER1ZSB0byBjZXJ0YWluIHBsYXRmb3JtIHJlcXVpcmVtZW50cywgZXZlbnRzIHJldHVybmVkIGZyb20gdGhlIGNvbnN0cnVjdG9yXG4gICAqIGlkZW50aWZ5IGFzIE1vdXNlRXZlbnRzLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtTdHJpbmd9IGluVHlwZSBUaGUgdHlwZSBvZiB0aGUgZXZlbnQgdG8gY3JlYXRlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW2luRGljdF0gQW4gb3B0aW9uYWwgZGljdGlvbmFyeSBvZiBpbml0aWFsIGV2ZW50IHByb3BlcnRpZXMuXG4gICAqIEByZXR1cm4ge0V2ZW50fSBBIG5ldyBQb2ludGVyRXZlbnQgb2YgdHlwZSBgaW5UeXBlYCwgaW5pdGlhbGl6ZWQgd2l0aCBwcm9wZXJ0aWVzIGZyb20gYGluRGljdGAuXG4gICAqL1xuICB2YXIgTU9VU0VfUFJPUFMgPSBbXG4gICAgJ2J1YmJsZXMnLFxuICAgICdjYW5jZWxhYmxlJyxcbiAgICAndmlldycsXG4gICAgJ2RldGFpbCcsXG4gICAgJ3NjcmVlblgnLFxuICAgICdzY3JlZW5ZJyxcbiAgICAnY2xpZW50WCcsXG4gICAgJ2NsaWVudFknLFxuICAgICdjdHJsS2V5JyxcbiAgICAnYWx0S2V5JyxcbiAgICAnc2hpZnRLZXknLFxuICAgICdtZXRhS2V5JyxcbiAgICAnYnV0dG9uJyxcbiAgICAncmVsYXRlZFRhcmdldCcsXG4gICAgJ3BhZ2VYJyxcbiAgICAncGFnZVknXG4gIF07XG5cbiAgdmFyIE1PVVNFX0RFRkFVTFRTID0gW1xuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIG51bGwsXG4gICAgbnVsbCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIDAsXG4gICAgbnVsbCxcbiAgICAwLFxuICAgIDBcbiAgXTtcblxuICBmdW5jdGlvbiBQb2ludGVyRXZlbnQoaW5UeXBlLCBpbkRpY3QpIHtcbiAgICBpbkRpY3QgPSBpbkRpY3QgfHwgT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgZS5pbml0RXZlbnQoaW5UeXBlLCBpbkRpY3QuYnViYmxlcyB8fCBmYWxzZSwgaW5EaWN0LmNhbmNlbGFibGUgfHwgZmFsc2UpO1xuXG4gICAgLy8gZGVmaW5lIGluaGVyaXRlZCBNb3VzZUV2ZW50IHByb3BlcnRpZXNcbiAgICAvLyBza2lwIGJ1YmJsZXMgYW5kIGNhbmNlbGFibGUgc2luY2UgdGhleSdyZSBzZXQgYWJvdmUgaW4gaW5pdEV2ZW50KClcbiAgICBmb3IgKHZhciBpID0gMiwgcDsgaSA8IE1PVVNFX1BST1BTLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwID0gTU9VU0VfUFJPUFNbaV07XG4gICAgICBlW3BdID0gaW5EaWN0W3BdIHx8IE1PVVNFX0RFRkFVTFRTW2ldO1xuICAgIH1cbiAgICBlLmJ1dHRvbnMgPSBpbkRpY3QuYnV0dG9ucyB8fCAwO1xuXG4gICAgLy8gU3BlYyByZXF1aXJlcyB0aGF0IHBvaW50ZXJzIHdpdGhvdXQgcHJlc3N1cmUgc3BlY2lmaWVkIHVzZSAwLjUgZm9yIGRvd25cbiAgICAvLyBzdGF0ZSBhbmQgMCBmb3IgdXAgc3RhdGUuXG4gICAgdmFyIHByZXNzdXJlID0gMDtcbiAgICBpZiAoaW5EaWN0LnByZXNzdXJlKSB7XG4gICAgICBwcmVzc3VyZSA9IGluRGljdC5wcmVzc3VyZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJlc3N1cmUgPSBlLmJ1dHRvbnMgPyAwLjUgOiAwO1xuICAgIH1cblxuICAgIC8vIGFkZCB4L3kgcHJvcGVydGllcyBhbGlhc2VkIHRvIGNsaWVudFgvWVxuICAgIGUueCA9IGUuY2xpZW50WDtcbiAgICBlLnkgPSBlLmNsaWVudFk7XG5cbiAgICAvLyBkZWZpbmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIFBvaW50ZXJFdmVudCBpbnRlcmZhY2VcbiAgICBlLnBvaW50ZXJJZCA9IGluRGljdC5wb2ludGVySWQgfHwgMDtcbiAgICBlLndpZHRoID0gaW5EaWN0LndpZHRoIHx8IDA7XG4gICAgZS5oZWlnaHQgPSBpbkRpY3QuaGVpZ2h0IHx8IDA7XG4gICAgZS5wcmVzc3VyZSA9IHByZXNzdXJlO1xuICAgIGUudGlsdFggPSBpbkRpY3QudGlsdFggfHwgMDtcbiAgICBlLnRpbHRZID0gaW5EaWN0LnRpbHRZIHx8IDA7XG4gICAgZS5wb2ludGVyVHlwZSA9IGluRGljdC5wb2ludGVyVHlwZSB8fCAnJztcbiAgICBlLmh3VGltZXN0YW1wID0gaW5EaWN0Lmh3VGltZXN0YW1wIHx8IDA7XG4gICAgZS5pc1ByaW1hcnkgPSBpbkRpY3QuaXNQcmltYXJ5IHx8IGZhbHNlO1xuICAgIHJldHVybiBlO1xuICB9XG5cbiAgdmFyIF9Qb2ludGVyRXZlbnQgPSBQb2ludGVyRXZlbnQ7XG5cbiAgLyoqXG4gICAqIFRoaXMgbW9kdWxlIGltcGxlbWVudHMgYSBtYXAgb2YgcG9pbnRlciBzdGF0ZXNcbiAgICovXG4gIHZhciBVU0VfTUFQID0gd2luZG93Lk1hcCAmJiB3aW5kb3cuTWFwLnByb3RvdHlwZS5mb3JFYWNoO1xuICB2YXIgUG9pbnRlck1hcCA9IFVTRV9NQVAgPyBNYXAgOiBTcGFyc2VBcnJheU1hcDtcblxuICBmdW5jdGlvbiBTcGFyc2VBcnJheU1hcCgpIHtcbiAgICB0aGlzLmFycmF5ID0gW107XG4gICAgdGhpcy5zaXplID0gMDtcbiAgfVxuXG4gIFNwYXJzZUFycmF5TWFwLnByb3RvdHlwZSA9IHtcbiAgICBzZXQ6IGZ1bmN0aW9uKGssIHYpIHtcbiAgICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlKGspO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmhhcyhrKSkge1xuICAgICAgICB0aGlzLnNpemUrKztcbiAgICAgIH1cbiAgICAgIHRoaXMuYXJyYXlba10gPSB2O1xuICAgIH0sXG4gICAgaGFzOiBmdW5jdGlvbihrKSB7XG4gICAgICByZXR1cm4gdGhpcy5hcnJheVtrXSAhPT0gdW5kZWZpbmVkO1xuICAgIH0sXG4gICAgZGVsZXRlOiBmdW5jdGlvbihrKSB7XG4gICAgICBpZiAodGhpcy5oYXMoaykpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuYXJyYXlba107XG4gICAgICAgIHRoaXMuc2l6ZS0tO1xuICAgICAgfVxuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbihrKSB7XG4gICAgICByZXR1cm4gdGhpcy5hcnJheVtrXTtcbiAgICB9LFxuICAgIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYXJyYXkubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgfSxcblxuICAgIC8vIHJldHVybiB2YWx1ZSwga2V5LCBtYXBcbiAgICBmb3JFYWNoOiBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgcmV0dXJuIHRoaXMuYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2LCBrKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdiwgaywgdGhpcyk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9wb2ludGVybWFwID0gUG9pbnRlck1hcDtcblxuICB2YXIgQ0xPTkVfUFJPUFMgPSBbXG5cbiAgICAvLyBNb3VzZUV2ZW50XG4gICAgJ2J1YmJsZXMnLFxuICAgICdjYW5jZWxhYmxlJyxcbiAgICAndmlldycsXG4gICAgJ2RldGFpbCcsXG4gICAgJ3NjcmVlblgnLFxuICAgICdzY3JlZW5ZJyxcbiAgICAnY2xpZW50WCcsXG4gICAgJ2NsaWVudFknLFxuICAgICdjdHJsS2V5JyxcbiAgICAnYWx0S2V5JyxcbiAgICAnc2hpZnRLZXknLFxuICAgICdtZXRhS2V5JyxcbiAgICAnYnV0dG9uJyxcbiAgICAncmVsYXRlZFRhcmdldCcsXG5cbiAgICAvLyBET00gTGV2ZWwgM1xuICAgICdidXR0b25zJyxcblxuICAgIC8vIFBvaW50ZXJFdmVudFxuICAgICdwb2ludGVySWQnLFxuICAgICd3aWR0aCcsXG4gICAgJ2hlaWdodCcsXG4gICAgJ3ByZXNzdXJlJyxcbiAgICAndGlsdFgnLFxuICAgICd0aWx0WScsXG4gICAgJ3BvaW50ZXJUeXBlJyxcbiAgICAnaHdUaW1lc3RhbXAnLFxuICAgICdpc1ByaW1hcnknLFxuXG4gICAgLy8gZXZlbnQgaW5zdGFuY2VcbiAgICAndHlwZScsXG4gICAgJ3RhcmdldCcsXG4gICAgJ2N1cnJlbnRUYXJnZXQnLFxuICAgICd3aGljaCcsXG4gICAgJ3BhZ2VYJyxcbiAgICAncGFnZVknLFxuICAgICd0aW1lU3RhbXAnXG4gIF07XG5cbiAgdmFyIENMT05FX0RFRkFVTFRTID0gW1xuXG4gICAgLy8gTW91c2VFdmVudFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIG51bGwsXG4gICAgbnVsbCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIDAsXG4gICAgbnVsbCxcblxuICAgIC8vIERPTSBMZXZlbCAzXG4gICAgMCxcblxuICAgIC8vIFBvaW50ZXJFdmVudFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgICcnLFxuICAgIDAsXG4gICAgZmFsc2UsXG5cbiAgICAvLyBldmVudCBpbnN0YW5jZVxuICAgICcnLFxuICAgIG51bGwsXG4gICAgbnVsbCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwXG4gIF07XG5cbiAgdmFyIEJPVU5EQVJZX0VWRU5UUyA9IHtcbiAgICAncG9pbnRlcm92ZXInOiAxLFxuICAgICdwb2ludGVyb3V0JzogMSxcbiAgICAncG9pbnRlcmVudGVyJzogMSxcbiAgICAncG9pbnRlcmxlYXZlJzogMVxuICB9O1xuXG4gIHZhciBIQVNfU1ZHX0lOU1RBTkNFID0gKHR5cGVvZiBTVkdFbGVtZW50SW5zdGFuY2UgIT09ICd1bmRlZmluZWQnKTtcblxuICAvKipcbiAgICogVGhpcyBtb2R1bGUgaXMgZm9yIG5vcm1hbGl6aW5nIGV2ZW50cy4gTW91c2UgYW5kIFRvdWNoIGV2ZW50cyB3aWxsIGJlXG4gICAqIGNvbGxlY3RlZCBoZXJlLCBhbmQgZmlyZSBQb2ludGVyRXZlbnRzIHRoYXQgaGF2ZSB0aGUgc2FtZSBzZW1hbnRpY3MsIG5vXG4gICAqIG1hdHRlciB0aGUgc291cmNlLlxuICAgKiBFdmVudHMgZmlyZWQ6XG4gICAqICAgLSBwb2ludGVyZG93bjogYSBwb2ludGluZyBpcyBhZGRlZFxuICAgKiAgIC0gcG9pbnRlcnVwOiBhIHBvaW50ZXIgaXMgcmVtb3ZlZFxuICAgKiAgIC0gcG9pbnRlcm1vdmU6IGEgcG9pbnRlciBpcyBtb3ZlZFxuICAgKiAgIC0gcG9pbnRlcm92ZXI6IGEgcG9pbnRlciBjcm9zc2VzIGludG8gYW4gZWxlbWVudFxuICAgKiAgIC0gcG9pbnRlcm91dDogYSBwb2ludGVyIGxlYXZlcyBhbiBlbGVtZW50XG4gICAqICAgLSBwb2ludGVyY2FuY2VsOiBhIHBvaW50ZXIgd2lsbCBubyBsb25nZXIgZ2VuZXJhdGUgZXZlbnRzXG4gICAqL1xuICB2YXIgZGlzcGF0Y2hlciA9IHtcbiAgICBwb2ludGVybWFwOiBuZXcgX3BvaW50ZXJtYXAoKSxcbiAgICBldmVudE1hcDogT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICBjYXB0dXJlSW5mbzogT2JqZWN0LmNyZWF0ZShudWxsKSxcblxuICAgIC8vIFNjb3BlIG9iamVjdHMgZm9yIG5hdGl2ZSBldmVudHMuXG4gICAgLy8gVGhpcyBleGlzdHMgZm9yIGVhc2Ugb2YgdGVzdGluZy5cbiAgICBldmVudFNvdXJjZXM6IE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgZXZlbnRTb3VyY2VMaXN0OiBbXSxcbiAgICAvKipcbiAgICAgKiBBZGQgYSBuZXcgZXZlbnQgc291cmNlIHRoYXQgd2lsbCBnZW5lcmF0ZSBwb2ludGVyIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIGBpblNvdXJjZWAgbXVzdCBjb250YWluIGFuIGFycmF5IG9mIGV2ZW50IG5hbWVzIG5hbWVkIGBldmVudHNgLCBhbmRcbiAgICAgKiBmdW5jdGlvbnMgd2l0aCB0aGUgbmFtZXMgc3BlY2lmaWVkIGluIHRoZSBgZXZlbnRzYCBhcnJheS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBBIG5hbWUgZm9yIHRoZSBldmVudCBzb3VyY2VcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc291cmNlIEEgbmV3IHNvdXJjZSBvZiBwbGF0Zm9ybSBldmVudHMuXG4gICAgICovXG4gICAgcmVnaXN0ZXJTb3VyY2U6IGZ1bmN0aW9uKG5hbWUsIHNvdXJjZSkge1xuICAgICAgdmFyIHMgPSBzb3VyY2U7XG4gICAgICB2YXIgbmV3RXZlbnRzID0gcy5ldmVudHM7XG4gICAgICBpZiAobmV3RXZlbnRzKSB7XG4gICAgICAgIG5ld0V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBpZiAoc1tlXSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudE1hcFtlXSA9IHNbZV0uYmluZChzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB0aGlzLmV2ZW50U291cmNlc1tuYW1lXSA9IHM7XG4gICAgICAgIHRoaXMuZXZlbnRTb3VyY2VMaXN0LnB1c2gocyk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZWdpc3RlcjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdmFyIGwgPSB0aGlzLmV2ZW50U291cmNlTGlzdC5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMCwgZXM7IChpIDwgbCkgJiYgKGVzID0gdGhpcy5ldmVudFNvdXJjZUxpc3RbaV0pOyBpKyspIHtcblxuICAgICAgICAvLyBjYWxsIGV2ZW50c291cmNlIHJlZ2lzdGVyXG4gICAgICAgIGVzLnJlZ2lzdGVyLmNhbGwoZXMsIGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdW5yZWdpc3RlcjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdmFyIGwgPSB0aGlzLmV2ZW50U291cmNlTGlzdC5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMCwgZXM7IChpIDwgbCkgJiYgKGVzID0gdGhpcy5ldmVudFNvdXJjZUxpc3RbaV0pOyBpKyspIHtcblxuICAgICAgICAvLyBjYWxsIGV2ZW50c291cmNlIHJlZ2lzdGVyXG4gICAgICAgIGVzLnVucmVnaXN0ZXIuY2FsbChlcywgZWxlbWVudCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBjb250YWluczogLypzY29wZS5leHRlcm5hbC5jb250YWlucyB8fCAqL2Z1bmN0aW9uKGNvbnRhaW5lciwgY29udGFpbmVkKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gY29udGFpbmVyLmNvbnRhaW5zKGNvbnRhaW5lZCk7XG4gICAgICB9IGNhdGNoIChleCkge1xuXG4gICAgICAgIC8vIG1vc3QgbGlrZWx5OiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0yMDg0MjdcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBFVkVOVFNcbiAgICBkb3duOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSB0cnVlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJkb3duJywgaW5FdmVudCk7XG4gICAgfSxcbiAgICBtb3ZlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSB0cnVlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJtb3ZlJywgaW5FdmVudCk7XG4gICAgfSxcbiAgICB1cDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVydXAnLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIGVudGVyOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSBmYWxzZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVyZW50ZXInLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIGxlYXZlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSBmYWxzZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVybGVhdmUnLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIG92ZXI6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IHRydWU7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcm92ZXInLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIG91dDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVyb3V0JywgaW5FdmVudCk7XG4gICAgfSxcbiAgICBjYW5jZWw6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IHRydWU7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcmNhbmNlbCcsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgbGVhdmVPdXQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB0aGlzLm91dChldmVudCk7XG4gICAgICBpZiAoIXRoaXMuY29udGFpbnMoZXZlbnQudGFyZ2V0LCBldmVudC5yZWxhdGVkVGFyZ2V0KSkge1xuICAgICAgICB0aGlzLmxlYXZlKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVudGVyT3ZlcjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHRoaXMub3ZlcihldmVudCk7XG4gICAgICBpZiAoIXRoaXMuY29udGFpbnMoZXZlbnQudGFyZ2V0LCBldmVudC5yZWxhdGVkVGFyZ2V0KSkge1xuICAgICAgICB0aGlzLmVudGVyKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gTElTVEVORVIgTE9HSUNcbiAgICBldmVudEhhbmRsZXI6IGZ1bmN0aW9uKGluRXZlbnQpIHtcblxuICAgICAgLy8gVGhpcyBpcyB1c2VkIHRvIHByZXZlbnQgbXVsdGlwbGUgZGlzcGF0Y2ggb2YgcG9pbnRlcmV2ZW50cyBmcm9tXG4gICAgICAvLyBwbGF0Zm9ybSBldmVudHMuIFRoaXMgY2FuIGhhcHBlbiB3aGVuIHR3byBlbGVtZW50cyBpbiBkaWZmZXJlbnQgc2NvcGVzXG4gICAgICAvLyBhcmUgc2V0IHVwIHRvIGNyZWF0ZSBwb2ludGVyIGV2ZW50cywgd2hpY2ggaXMgcmVsZXZhbnQgdG8gU2hhZG93IERPTS5cbiAgICAgIGlmIChpbkV2ZW50Ll9oYW5kbGVkQnlQRSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgdHlwZSA9IGluRXZlbnQudHlwZTtcbiAgICAgIHZhciBmbiA9IHRoaXMuZXZlbnRNYXAgJiYgdGhpcy5ldmVudE1hcFt0eXBlXTtcbiAgICAgIGlmIChmbikge1xuICAgICAgICBmbihpbkV2ZW50KTtcbiAgICAgIH1cbiAgICAgIGluRXZlbnQuX2hhbmRsZWRCeVBFID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLy8gc2V0IHVwIGV2ZW50IGxpc3RlbmVyc1xuICAgIGxpc3RlbjogZnVuY3Rpb24odGFyZ2V0LCBldmVudHMpIHtcbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5hZGRFdmVudCh0YXJnZXQsIGUpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8vIHJlbW92ZSBldmVudCBsaXN0ZW5lcnNcbiAgICB1bmxpc3RlbjogZnVuY3Rpb24odGFyZ2V0LCBldmVudHMpIHtcbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudCh0YXJnZXQsIGUpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSxcbiAgICBhZGRFdmVudDogLypzY29wZS5leHRlcm5hbC5hZGRFdmVudCB8fCAqL2Z1bmN0aW9uKHRhcmdldCwgZXZlbnROYW1lKSB7XG4gICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuYm91bmRIYW5kbGVyKTtcbiAgICB9LFxuICAgIHJlbW92ZUV2ZW50OiAvKnNjb3BlLmV4dGVybmFsLnJlbW92ZUV2ZW50IHx8ICovZnVuY3Rpb24odGFyZ2V0LCBldmVudE5hbWUpIHtcbiAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdGhpcy5ib3VuZEhhbmRsZXIpO1xuICAgIH0sXG5cbiAgICAvLyBFVkVOVCBDUkVBVElPTiBBTkQgVFJBQ0tJTkdcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IEV2ZW50IG9mIHR5cGUgYGluVHlwZWAsIGJhc2VkIG9uIHRoZSBpbmZvcm1hdGlvbiBpblxuICAgICAqIGBpbkV2ZW50YC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpblR5cGUgQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB0eXBlIG9mIGV2ZW50IHRvIGNyZWF0ZVxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGluRXZlbnQgQSBwbGF0Zm9ybSBldmVudCB3aXRoIGEgdGFyZ2V0XG4gICAgICogQHJldHVybiB7RXZlbnR9IEEgUG9pbnRlckV2ZW50IG9mIHR5cGUgYGluVHlwZWBcbiAgICAgKi9cbiAgICBtYWtlRXZlbnQ6IGZ1bmN0aW9uKGluVHlwZSwgaW5FdmVudCkge1xuXG4gICAgICAvLyByZWxhdGVkVGFyZ2V0IG11c3QgYmUgbnVsbCBpZiBwb2ludGVyIGlzIGNhcHR1cmVkXG4gICAgICBpZiAodGhpcy5jYXB0dXJlSW5mb1tpbkV2ZW50LnBvaW50ZXJJZF0pIHtcbiAgICAgICAgaW5FdmVudC5yZWxhdGVkVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHZhciBlID0gbmV3IF9Qb2ludGVyRXZlbnQoaW5UeXBlLCBpbkV2ZW50KTtcbiAgICAgIGlmIChpbkV2ZW50LnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQgPSBpbkV2ZW50LnByZXZlbnREZWZhdWx0O1xuICAgICAgfVxuICAgICAgZS5fdGFyZ2V0ID0gZS5fdGFyZ2V0IHx8IGluRXZlbnQudGFyZ2V0O1xuICAgICAgcmV0dXJuIGU7XG4gICAgfSxcblxuICAgIC8vIG1ha2UgYW5kIGRpc3BhdGNoIGFuIGV2ZW50IGluIG9uZSBjYWxsXG4gICAgZmlyZUV2ZW50OiBmdW5jdGlvbihpblR5cGUsIGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5tYWtlRXZlbnQoaW5UeXBlLCBpbkV2ZW50KTtcbiAgICAgIHJldHVybiB0aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc25hcHNob3Qgb2YgaW5FdmVudCwgd2l0aCB3cml0YWJsZSBwcm9wZXJ0aWVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtFdmVudH0gaW5FdmVudCBBbiBldmVudCB0aGF0IGNvbnRhaW5zIHByb3BlcnRpZXMgdG8gY29weS5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEFuIG9iamVjdCBjb250YWluaW5nIHNoYWxsb3cgY29waWVzIG9mIGBpbkV2ZW50YCdzXG4gICAgICogICAgcHJvcGVydGllcy5cbiAgICAgKi9cbiAgICBjbG9uZUV2ZW50OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZXZlbnRDb3B5ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgIHZhciBwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBDTE9ORV9QUk9QUy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwID0gQ0xPTkVfUFJPUFNbaV07XG4gICAgICAgIGV2ZW50Q29weVtwXSA9IGluRXZlbnRbcF0gfHwgQ0xPTkVfREVGQVVMVFNbaV07XG5cbiAgICAgICAgLy8gV29yayBhcm91bmQgU1ZHSW5zdGFuY2VFbGVtZW50IHNoYWRvdyB0cmVlXG4gICAgICAgIC8vIFJldHVybiB0aGUgPHVzZT4gZWxlbWVudCB0aGF0IGlzIHJlcHJlc2VudGVkIGJ5IHRoZSBpbnN0YW5jZSBmb3IgU2FmYXJpLCBDaHJvbWUsIElFLlxuICAgICAgICAvLyBUaGlzIGlzIHRoZSBiZWhhdmlvciBpbXBsZW1lbnRlZCBieSBGaXJlZm94LlxuICAgICAgICBpZiAoSEFTX1NWR19JTlNUQU5DRSAmJiAocCA9PT0gJ3RhcmdldCcgfHwgcCA9PT0gJ3JlbGF0ZWRUYXJnZXQnKSkge1xuICAgICAgICAgIGlmIChldmVudENvcHlbcF0gaW5zdGFuY2VvZiBTVkdFbGVtZW50SW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGV2ZW50Q29weVtwXSA9IGV2ZW50Q29weVtwXS5jb3JyZXNwb25kaW5nVXNlRWxlbWVudDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8ga2VlcCB0aGUgc2VtYW50aWNzIG9mIHByZXZlbnREZWZhdWx0XG4gICAgICBpZiAoaW5FdmVudC5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICBldmVudENvcHkucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpbkV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gZXZlbnRDb3B5O1xuICAgIH0sXG4gICAgZ2V0VGFyZ2V0OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgY2FwdHVyZSA9IHRoaXMuY2FwdHVyZUluZm9baW5FdmVudC5wb2ludGVySWRdO1xuICAgICAgaWYgKCFjYXB0dXJlKSB7XG4gICAgICAgIHJldHVybiBpbkV2ZW50Ll90YXJnZXQ7XG4gICAgICB9XG4gICAgICBpZiAoaW5FdmVudC5fdGFyZ2V0ID09PSBjYXB0dXJlIHx8ICEoaW5FdmVudC50eXBlIGluIEJPVU5EQVJZX0VWRU5UUykpIHtcbiAgICAgICAgcmV0dXJuIGNhcHR1cmU7XG4gICAgICB9XG4gICAgfSxcbiAgICBzZXRDYXB0dXJlOiBmdW5jdGlvbihpblBvaW50ZXJJZCwgaW5UYXJnZXQpIHtcbiAgICAgIGlmICh0aGlzLmNhcHR1cmVJbmZvW2luUG9pbnRlcklkXSkge1xuICAgICAgICB0aGlzLnJlbGVhc2VDYXB0dXJlKGluUG9pbnRlcklkKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2FwdHVyZUluZm9baW5Qb2ludGVySWRdID0gaW5UYXJnZXQ7XG4gICAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgZS5pbml0RXZlbnQoJ2dvdHBvaW50ZXJjYXB0dXJlJywgdHJ1ZSwgZmFsc2UpO1xuICAgICAgZS5wb2ludGVySWQgPSBpblBvaW50ZXJJZDtcbiAgICAgIHRoaXMuaW1wbGljaXRSZWxlYXNlID0gdGhpcy5yZWxlYXNlQ2FwdHVyZS5iaW5kKHRoaXMsIGluUG9pbnRlcklkKTtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJ1cCcsIHRoaXMuaW1wbGljaXRSZWxlYXNlKTtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJjYW5jZWwnLCB0aGlzLmltcGxpY2l0UmVsZWFzZSk7XG4gICAgICBlLl90YXJnZXQgPSBpblRhcmdldDtcbiAgICAgIHRoaXMuYXN5bmNEaXNwYXRjaEV2ZW50KGUpO1xuICAgIH0sXG4gICAgcmVsZWFzZUNhcHR1cmU6IGZ1bmN0aW9uKGluUG9pbnRlcklkKSB7XG4gICAgICB2YXIgdCA9IHRoaXMuY2FwdHVyZUluZm9baW5Qb2ludGVySWRdO1xuICAgICAgaWYgKHQpIHtcbiAgICAgICAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgICAgZS5pbml0RXZlbnQoJ2xvc3Rwb2ludGVyY2FwdHVyZScsIHRydWUsIGZhbHNlKTtcbiAgICAgICAgZS5wb2ludGVySWQgPSBpblBvaW50ZXJJZDtcbiAgICAgICAgdGhpcy5jYXB0dXJlSW5mb1tpblBvaW50ZXJJZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJ1cCcsIHRoaXMuaW1wbGljaXRSZWxlYXNlKTtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmNhbmNlbCcsIHRoaXMuaW1wbGljaXRSZWxlYXNlKTtcbiAgICAgICAgZS5fdGFyZ2V0ID0gdDtcbiAgICAgICAgdGhpcy5hc3luY0Rpc3BhdGNoRXZlbnQoZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaGVzIHRoZSBldmVudCB0byBpdHMgdGFyZ2V0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtFdmVudH0gaW5FdmVudCBUaGUgZXZlbnQgdG8gYmUgZGlzcGF0Y2hlZC5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBUcnVlIGlmIGFuIGV2ZW50IGhhbmRsZXIgcmV0dXJucyB0cnVlLCBmYWxzZSBvdGhlcndpc2UuXG4gICAgICovXG4gICAgZGlzcGF0Y2hFdmVudDogLypzY29wZS5leHRlcm5hbC5kaXNwYXRjaEV2ZW50IHx8ICovZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIHQgPSB0aGlzLmdldFRhcmdldChpbkV2ZW50KTtcbiAgICAgIGlmICh0KSB7XG4gICAgICAgIHJldHVybiB0LmRpc3BhdGNoRXZlbnQoaW5FdmVudCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhc3luY0Rpc3BhdGNoRXZlbnQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmRpc3BhdGNoRXZlbnQuYmluZCh0aGlzLCBpbkV2ZW50KSk7XG4gICAgfVxuICB9O1xuICBkaXNwYXRjaGVyLmJvdW5kSGFuZGxlciA9IGRpc3BhdGNoZXIuZXZlbnRIYW5kbGVyLmJpbmQoZGlzcGF0Y2hlcik7XG5cbiAgdmFyIF9kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcblxuICB2YXIgdGFyZ2V0aW5nID0ge1xuICAgIHNoYWRvdzogZnVuY3Rpb24oaW5FbCkge1xuICAgICAgaWYgKGluRWwpIHtcbiAgICAgICAgcmV0dXJuIGluRWwuc2hhZG93Um9vdCB8fCBpbkVsLndlYmtpdFNoYWRvd1Jvb3Q7XG4gICAgICB9XG4gICAgfSxcbiAgICBjYW5UYXJnZXQ6IGZ1bmN0aW9uKHNoYWRvdykge1xuICAgICAgcmV0dXJuIHNoYWRvdyAmJiBCb29sZWFuKHNoYWRvdy5lbGVtZW50RnJvbVBvaW50KTtcbiAgICB9LFxuICAgIHRhcmdldGluZ1NoYWRvdzogZnVuY3Rpb24oaW5FbCkge1xuICAgICAgdmFyIHMgPSB0aGlzLnNoYWRvdyhpbkVsKTtcbiAgICAgIGlmICh0aGlzLmNhblRhcmdldChzKSkge1xuICAgICAgICByZXR1cm4gcztcbiAgICAgIH1cbiAgICB9LFxuICAgIG9sZGVyU2hhZG93OiBmdW5jdGlvbihzaGFkb3cpIHtcbiAgICAgIHZhciBvcyA9IHNoYWRvdy5vbGRlclNoYWRvd1Jvb3Q7XG4gICAgICBpZiAoIW9zKSB7XG4gICAgICAgIHZhciBzZSA9IHNoYWRvdy5xdWVyeVNlbGVjdG9yKCdzaGFkb3cnKTtcbiAgICAgICAgaWYgKHNlKSB7XG4gICAgICAgICAgb3MgPSBzZS5vbGRlclNoYWRvd1Jvb3Q7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvcztcbiAgICB9LFxuICAgIGFsbFNoYWRvd3M6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHZhciBzaGFkb3dzID0gW107XG4gICAgICB2YXIgcyA9IHRoaXMuc2hhZG93KGVsZW1lbnQpO1xuICAgICAgd2hpbGUgKHMpIHtcbiAgICAgICAgc2hhZG93cy5wdXNoKHMpO1xuICAgICAgICBzID0gdGhpcy5vbGRlclNoYWRvdyhzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzaGFkb3dzO1xuICAgIH0sXG4gICAgc2VhcmNoUm9vdDogZnVuY3Rpb24oaW5Sb290LCB4LCB5KSB7XG4gICAgICBpZiAoaW5Sb290KSB7XG4gICAgICAgIHZhciB0ID0gaW5Sb290LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG4gICAgICAgIHZhciBzdCwgc3I7XG5cbiAgICAgICAgLy8gaXMgZWxlbWVudCBhIHNoYWRvdyBob3N0P1xuICAgICAgICBzciA9IHRoaXMudGFyZ2V0aW5nU2hhZG93KHQpO1xuICAgICAgICB3aGlsZSAoc3IpIHtcblxuICAgICAgICAgIC8vIGZpbmQgdGhlIHRoZSBlbGVtZW50IGluc2lkZSB0aGUgc2hhZG93IHJvb3RcbiAgICAgICAgICBzdCA9IHNyLmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG4gICAgICAgICAgaWYgKCFzdCkge1xuXG4gICAgICAgICAgICAvLyBjaGVjayBmb3Igb2xkZXIgc2hhZG93c1xuICAgICAgICAgICAgc3IgPSB0aGlzLm9sZGVyU2hhZG93KHNyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvLyBzaGFkb3dlZCBlbGVtZW50IG1heSBjb250YWluIGEgc2hhZG93IHJvb3RcbiAgICAgICAgICAgIHZhciBzc3IgPSB0aGlzLnRhcmdldGluZ1NoYWRvdyhzdCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2hSb290KHNzciwgeCwgeSkgfHwgc3Q7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gbGlnaHQgZG9tIGVsZW1lbnQgaXMgdGhlIHRhcmdldFxuICAgICAgICByZXR1cm4gdDtcbiAgICAgIH1cbiAgICB9LFxuICAgIG93bmVyOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgcyA9IGVsZW1lbnQ7XG5cbiAgICAgIC8vIHdhbGsgdXAgdW50aWwgeW91IGhpdCB0aGUgc2hhZG93IHJvb3Qgb3IgZG9jdW1lbnRcbiAgICAgIHdoaWxlIChzLnBhcmVudE5vZGUpIHtcbiAgICAgICAgcyA9IHMucGFyZW50Tm9kZTtcbiAgICAgIH1cblxuICAgICAgLy8gdGhlIG93bmVyIGVsZW1lbnQgaXMgZXhwZWN0ZWQgdG8gYmUgYSBEb2N1bWVudCBvciBTaGFkb3dSb290XG4gICAgICBpZiAocy5ub2RlVHlwZSAhPT0gTm9kZS5ET0NVTUVOVF9OT0RFICYmIHMubm9kZVR5cGUgIT09IE5vZGUuRE9DVU1FTlRfRlJBR01FTlRfTk9ERSkge1xuICAgICAgICBzID0gZG9jdW1lbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gcztcbiAgICB9LFxuICAgIGZpbmRUYXJnZXQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciB4ID0gaW5FdmVudC5jbGllbnRYO1xuICAgICAgdmFyIHkgPSBpbkV2ZW50LmNsaWVudFk7XG5cbiAgICAgIC8vIGlmIHRoZSBsaXN0ZW5lciBpcyBpbiB0aGUgc2hhZG93IHJvb3QsIGl0IGlzIG11Y2ggZmFzdGVyIHRvIHN0YXJ0IHRoZXJlXG4gICAgICB2YXIgcyA9IHRoaXMub3duZXIoaW5FdmVudC50YXJnZXQpO1xuXG4gICAgICAvLyBpZiB4LCB5IGlzIG5vdCBpbiB0aGlzIHJvb3QsIGZhbGwgYmFjayB0byBkb2N1bWVudCBzZWFyY2hcbiAgICAgIGlmICghcy5lbGVtZW50RnJvbVBvaW50KHgsIHkpKSB7XG4gICAgICAgIHMgPSBkb2N1bWVudDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnNlYXJjaFJvb3QocywgeCwgeSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBUaGlzIG1vZHVsZSB1c2VzIE11dGF0aW9uIE9ic2VydmVycyB0byBkeW5hbWljYWxseSBhZGp1c3Qgd2hpY2ggbm9kZXMgd2lsbFxuICAgKiBnZW5lcmF0ZSBQb2ludGVyIEV2ZW50cy5cbiAgICpcbiAgICogQWxsIG5vZGVzIHRoYXQgd2lzaCB0byBnZW5lcmF0ZSBQb2ludGVyIEV2ZW50cyBtdXN0IGhhdmUgdGhlIGF0dHJpYnV0ZVxuICAgKiBgdG91Y2gtYWN0aW9uYCBzZXQgdG8gYG5vbmVgLlxuICAgKi9cbiAgdmFyIGZvckVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsLmJpbmQoQXJyYXkucHJvdG90eXBlLmZvckVhY2gpO1xuICB2YXIgbWFwID0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsLmJpbmQoQXJyYXkucHJvdG90eXBlLm1hcCk7XG4gIHZhciB0b0FycmF5ID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwuYmluZChBcnJheS5wcm90b3R5cGUuc2xpY2UpO1xuICB2YXIgZmlsdGVyID0gQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsLmJpbmQoQXJyYXkucHJvdG90eXBlLmZpbHRlcik7XG4gIHZhciBNTyA9IHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyIHx8IHdpbmRvdy5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xuICB2YXIgU0VMRUNUT1IgPSAnW3RvdWNoLWFjdGlvbl0nO1xuICB2YXIgT0JTRVJWRVJfSU5JVCA9IHtcbiAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgIGF0dHJpYnV0ZU9sZFZhbHVlOiB0cnVlLFxuICAgIGF0dHJpYnV0ZUZpbHRlcjogWyd0b3VjaC1hY3Rpb24nXVxuICB9O1xuXG4gIGZ1bmN0aW9uIEluc3RhbGxlcihhZGQsIHJlbW92ZSwgY2hhbmdlZCwgYmluZGVyKSB7XG4gICAgdGhpcy5hZGRDYWxsYmFjayA9IGFkZC5iaW5kKGJpbmRlcik7XG4gICAgdGhpcy5yZW1vdmVDYWxsYmFjayA9IHJlbW92ZS5iaW5kKGJpbmRlcik7XG4gICAgdGhpcy5jaGFuZ2VkQ2FsbGJhY2sgPSBjaGFuZ2VkLmJpbmQoYmluZGVyKTtcbiAgICBpZiAoTU8pIHtcbiAgICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgTU8odGhpcy5tdXRhdGlvbldhdGNoZXIuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgSW5zdGFsbGVyLnByb3RvdHlwZSA9IHtcbiAgICB3YXRjaFN1YnRyZWU6IGZ1bmN0aW9uKHRhcmdldCkge1xuXG4gICAgICAvLyBPbmx5IHdhdGNoIHNjb3BlcyB0aGF0IGNhbiB0YXJnZXQgZmluZCwgYXMgdGhlc2UgYXJlIHRvcC1sZXZlbC5cbiAgICAgIC8vIE90aGVyd2lzZSB3ZSBjYW4gc2VlIGR1cGxpY2F0ZSBhZGRpdGlvbnMgYW5kIHJlbW92YWxzIHRoYXQgYWRkIG5vaXNlLlxuICAgICAgLy9cbiAgICAgIC8vIFRPRE8oZGZyZWVkbWFuKTogRm9yIHNvbWUgaW5zdGFuY2VzIHdpdGggU2hhZG93RE9NUG9seWZpbGwsIHdlIGNhbiBzZWVcbiAgICAgIC8vIGEgcmVtb3ZhbCB3aXRob3V0IGFuIGluc2VydGlvbiB3aGVuIGEgbm9kZSBpcyByZWRpc3RyaWJ1dGVkIGFtb25nXG4gICAgICAvLyBzaGFkb3dzLiBTaW5jZSBpdCBhbGwgZW5kcyB1cCBjb3JyZWN0IGluIHRoZSBkb2N1bWVudCwgd2F0Y2hpbmcgb25seVxuICAgICAgLy8gdGhlIGRvY3VtZW50IHdpbGwgeWllbGQgdGhlIGNvcnJlY3QgbXV0YXRpb25zIHRvIHdhdGNoLlxuICAgICAgaWYgKHRoaXMub2JzZXJ2ZXIgJiYgdGFyZ2V0aW5nLmNhblRhcmdldCh0YXJnZXQpKSB7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZSh0YXJnZXQsIE9CU0VSVkVSX0lOSVQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZW5hYmxlT25TdWJ0cmVlOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIHRoaXMud2F0Y2hTdWJ0cmVlKHRhcmdldCk7XG4gICAgICBpZiAodGFyZ2V0ID09PSBkb2N1bWVudCAmJiBkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB7XG4gICAgICAgIHRoaXMuaW5zdGFsbE9uTG9hZCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pbnN0YWxsTmV3U3VidHJlZSh0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgaW5zdGFsbE5ld1N1YnRyZWU6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgZm9yRWFjaCh0aGlzLmZpbmRFbGVtZW50cyh0YXJnZXQpLCB0aGlzLmFkZEVsZW1lbnQsIHRoaXMpO1xuICAgIH0sXG4gICAgZmluZEVsZW1lbnRzOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIGlmICh0YXJnZXQucXVlcnlTZWxlY3RvckFsbCkge1xuICAgICAgICByZXR1cm4gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoU0VMRUNUT1IpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdO1xuICAgIH0sXG4gICAgcmVtb3ZlRWxlbWVudDogZnVuY3Rpb24oZWwpIHtcbiAgICAgIHRoaXMucmVtb3ZlQ2FsbGJhY2soZWwpO1xuICAgIH0sXG4gICAgYWRkRWxlbWVudDogZnVuY3Rpb24oZWwpIHtcbiAgICAgIHRoaXMuYWRkQ2FsbGJhY2soZWwpO1xuICAgIH0sXG4gICAgZWxlbWVudENoYW5nZWQ6IGZ1bmN0aW9uKGVsLCBvbGRWYWx1ZSkge1xuICAgICAgdGhpcy5jaGFuZ2VkQ2FsbGJhY2soZWwsIG9sZFZhbHVlKTtcbiAgICB9LFxuICAgIGNvbmNhdExpc3RzOiBmdW5jdGlvbihhY2N1bSwgbGlzdCkge1xuICAgICAgcmV0dXJuIGFjY3VtLmNvbmNhdCh0b0FycmF5KGxpc3QpKTtcbiAgICB9LFxuXG4gICAgLy8gcmVnaXN0ZXIgYWxsIHRvdWNoLWFjdGlvbiA9IG5vbmUgbm9kZXMgb24gZG9jdW1lbnQgbG9hZFxuICAgIGluc3RhbGxPbkxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncmVhZHlzdGF0ZWNoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgIHRoaXMuaW5zdGFsbE5ld1N1YnRyZWUoZG9jdW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG4gICAgaXNFbGVtZW50OiBmdW5jdGlvbihuKSB7XG4gICAgICByZXR1cm4gbi5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREU7XG4gICAgfSxcbiAgICBmbGF0dGVuTXV0YXRpb25UcmVlOiBmdW5jdGlvbihpbk5vZGVzKSB7XG5cbiAgICAgIC8vIGZpbmQgY2hpbGRyZW4gd2l0aCB0b3VjaC1hY3Rpb25cbiAgICAgIHZhciB0cmVlID0gbWFwKGluTm9kZXMsIHRoaXMuZmluZEVsZW1lbnRzLCB0aGlzKTtcblxuICAgICAgLy8gbWFrZSBzdXJlIHRoZSBhZGRlZCBub2RlcyBhcmUgYWNjb3VudGVkIGZvclxuICAgICAgdHJlZS5wdXNoKGZpbHRlcihpbk5vZGVzLCB0aGlzLmlzRWxlbWVudCkpO1xuXG4gICAgICAvLyBmbGF0dGVuIHRoZSBsaXN0XG4gICAgICByZXR1cm4gdHJlZS5yZWR1Y2UodGhpcy5jb25jYXRMaXN0cywgW10pO1xuICAgIH0sXG4gICAgbXV0YXRpb25XYXRjaGVyOiBmdW5jdGlvbihtdXRhdGlvbnMpIHtcbiAgICAgIG11dGF0aW9ucy5mb3JFYWNoKHRoaXMubXV0YXRpb25IYW5kbGVyLCB0aGlzKTtcbiAgICB9LFxuICAgIG11dGF0aW9uSGFuZGxlcjogZnVuY3Rpb24obSkge1xuICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcpIHtcbiAgICAgICAgdmFyIGFkZGVkID0gdGhpcy5mbGF0dGVuTXV0YXRpb25UcmVlKG0uYWRkZWROb2Rlcyk7XG4gICAgICAgIGFkZGVkLmZvckVhY2godGhpcy5hZGRFbGVtZW50LCB0aGlzKTtcbiAgICAgICAgdmFyIHJlbW92ZWQgPSB0aGlzLmZsYXR0ZW5NdXRhdGlvblRyZWUobS5yZW1vdmVkTm9kZXMpO1xuICAgICAgICByZW1vdmVkLmZvckVhY2godGhpcy5yZW1vdmVFbGVtZW50LCB0aGlzKTtcbiAgICAgIH0gZWxzZSBpZiAobS50eXBlID09PSAnYXR0cmlidXRlcycpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Q2hhbmdlZChtLnRhcmdldCwgbS5vbGRWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHZhciBpbnN0YWxsZXIgPSBJbnN0YWxsZXI7XG5cbiAgZnVuY3Rpb24gc2hhZG93U2VsZWN0b3Iodikge1xuICAgIHJldHVybiAnYm9keSAvc2hhZG93LWRlZXAvICcgKyBzZWxlY3Rvcih2KTtcbiAgfVxuICBmdW5jdGlvbiBzZWxlY3Rvcih2KSB7XG4gICAgcmV0dXJuICdbdG91Y2gtYWN0aW9uPVwiJyArIHYgKyAnXCJdJztcbiAgfVxuICBmdW5jdGlvbiBydWxlKHYpIHtcbiAgICByZXR1cm4gJ3sgLW1zLXRvdWNoLWFjdGlvbjogJyArIHYgKyAnOyB0b3VjaC1hY3Rpb246ICcgKyB2ICsgJzsgdG91Y2gtYWN0aW9uLWRlbGF5OiBub25lOyB9JztcbiAgfVxuICB2YXIgYXR0cmliMmNzcyA9IFtcbiAgICAnbm9uZScsXG4gICAgJ2F1dG8nLFxuICAgICdwYW4teCcsXG4gICAgJ3Bhbi15JyxcbiAgICB7XG4gICAgICBydWxlOiAncGFuLXggcGFuLXknLFxuICAgICAgc2VsZWN0b3JzOiBbXG4gICAgICAgICdwYW4teCBwYW4teScsXG4gICAgICAgICdwYW4teSBwYW4teCdcbiAgICAgIF1cbiAgICB9XG4gIF07XG4gIHZhciBzdHlsZXMgPSAnJztcblxuICAvLyBvbmx5IGluc3RhbGwgc3R5bGVzaGVldCBpZiB0aGUgYnJvd3NlciBoYXMgdG91Y2ggYWN0aW9uIHN1cHBvcnRcbiAgdmFyIGhhc05hdGl2ZVBFID0gd2luZG93LlBvaW50ZXJFdmVudCB8fCB3aW5kb3cuTVNQb2ludGVyRXZlbnQ7XG5cbiAgLy8gb25seSBhZGQgc2hhZG93IHNlbGVjdG9ycyBpZiBzaGFkb3dkb20gaXMgc3VwcG9ydGVkXG4gIHZhciBoYXNTaGFkb3dSb290ID0gIXdpbmRvdy5TaGFkb3dET01Qb2x5ZmlsbCAmJiBkb2N1bWVudC5oZWFkLmNyZWF0ZVNoYWRvd1Jvb3Q7XG5cbiAgZnVuY3Rpb24gYXBwbHlBdHRyaWJ1dGVTdHlsZXMoKSB7XG4gICAgaWYgKGhhc05hdGl2ZVBFKSB7XG4gICAgICBhdHRyaWIyY3NzLmZvckVhY2goZnVuY3Rpb24ocikge1xuICAgICAgICBpZiAoU3RyaW5nKHIpID09PSByKSB7XG4gICAgICAgICAgc3R5bGVzICs9IHNlbGVjdG9yKHIpICsgcnVsZShyKSArICdcXG4nO1xuICAgICAgICAgIGlmIChoYXNTaGFkb3dSb290KSB7XG4gICAgICAgICAgICBzdHlsZXMgKz0gc2hhZG93U2VsZWN0b3IocikgKyBydWxlKHIpICsgJ1xcbic7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0eWxlcyArPSByLnNlbGVjdG9ycy5tYXAoc2VsZWN0b3IpICsgcnVsZShyLnJ1bGUpICsgJ1xcbic7XG4gICAgICAgICAgaWYgKGhhc1NoYWRvd1Jvb3QpIHtcbiAgICAgICAgICAgIHN0eWxlcyArPSByLnNlbGVjdG9ycy5tYXAoc2hhZG93U2VsZWN0b3IpICsgcnVsZShyLnJ1bGUpICsgJ1xcbic7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgIGVsLnRleHRDb250ZW50ID0gc3R5bGVzO1xuICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChlbCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIG1vdXNlX19wb2ludGVybWFwID0gX2Rpc3BhdGNoZXIucG9pbnRlcm1hcDtcblxuICAvLyByYWRpdXMgYXJvdW5kIHRvdWNoZW5kIHRoYXQgc3dhbGxvd3MgbW91c2UgZXZlbnRzXG4gIHZhciBERURVUF9ESVNUID0gMjU7XG5cbiAgLy8gbGVmdCwgbWlkZGxlLCByaWdodCwgYmFjaywgZm9yd2FyZFxuICB2YXIgQlVUVE9OX1RPX0JVVFRPTlMgPSBbMSwgNCwgMiwgOCwgMTZdO1xuXG4gIHZhciBIQVNfQlVUVE9OUyA9IGZhbHNlO1xuICB0cnkge1xuICAgIEhBU19CVVRUT05TID0gbmV3IE1vdXNlRXZlbnQoJ3Rlc3QnLCB7IGJ1dHRvbnM6IDEgfSkuYnV0dG9ucyA9PT0gMTtcbiAgfSBjYXRjaCAoZSkge31cblxuICAvLyBoYW5kbGVyIGJsb2NrIGZvciBuYXRpdmUgbW91c2UgZXZlbnRzXG4gIHZhciBtb3VzZUV2ZW50cyA9IHtcbiAgICBQT0lOVEVSX0lEOiAxLFxuICAgIFBPSU5URVJfVFlQRTogJ21vdXNlJyxcbiAgICBldmVudHM6IFtcbiAgICAgICdtb3VzZWRvd24nLFxuICAgICAgJ21vdXNlbW92ZScsXG4gICAgICAnbW91c2V1cCcsXG4gICAgICAnbW91c2VvdmVyJyxcbiAgICAgICdtb3VzZW91dCdcbiAgICBdLFxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIF9kaXNwYXRjaGVyLmxpc3Rlbih0YXJnZXQsIHRoaXMuZXZlbnRzKTtcbiAgICB9LFxuICAgIHVucmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgX2Rpc3BhdGNoZXIudW5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgfSxcbiAgICBsYXN0VG91Y2hlczogW10sXG5cbiAgICAvLyBjb2xsaWRlIHdpdGggdGhlIGdsb2JhbCBtb3VzZSBsaXN0ZW5lclxuICAgIGlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2g6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBsdHMgPSB0aGlzLmxhc3RUb3VjaGVzO1xuICAgICAgdmFyIHggPSBpbkV2ZW50LmNsaWVudFg7XG4gICAgICB2YXIgeSA9IGluRXZlbnQuY2xpZW50WTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbHRzLmxlbmd0aCwgdDsgaSA8IGwgJiYgKHQgPSBsdHNbaV0pOyBpKyspIHtcblxuICAgICAgICAvLyBzaW11bGF0ZWQgbW91c2UgZXZlbnRzIHdpbGwgYmUgc3dhbGxvd2VkIG5lYXIgYSBwcmltYXJ5IHRvdWNoZW5kXG4gICAgICAgIHZhciBkeCA9IE1hdGguYWJzKHggLSB0LngpO1xuICAgICAgICB2YXIgZHkgPSBNYXRoLmFicyh5IC0gdC55KTtcbiAgICAgICAgaWYgKGR4IDw9IERFRFVQX0RJU1QgJiYgZHkgPD0gREVEVVBfRElTVCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBwcmVwYXJlRXZlbnQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gX2Rpc3BhdGNoZXIuY2xvbmVFdmVudChpbkV2ZW50KTtcblxuICAgICAgLy8gZm9yd2FyZCBtb3VzZSBwcmV2ZW50RGVmYXVsdFxuICAgICAgdmFyIHBkID0gZS5wcmV2ZW50RGVmYXVsdDtcbiAgICAgIGUucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaW5FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBwZCgpO1xuICAgICAgfTtcbiAgICAgIGUucG9pbnRlcklkID0gdGhpcy5QT0lOVEVSX0lEO1xuICAgICAgZS5pc1ByaW1hcnkgPSB0cnVlO1xuICAgICAgZS5wb2ludGVyVHlwZSA9IHRoaXMuUE9JTlRFUl9UWVBFO1xuICAgICAgcmV0dXJuIGU7XG4gICAgfSxcbiAgICBwcmVwYXJlQnV0dG9uc0Zvck1vdmU6IGZ1bmN0aW9uKGUsIGluRXZlbnQpIHtcbiAgICAgIHZhciBwID0gbW91c2VfX3BvaW50ZXJtYXAuZ2V0KHRoaXMuUE9JTlRFUl9JRCk7XG4gICAgICBlLmJ1dHRvbnMgPSBwID8gcC5idXR0b25zIDogMDtcbiAgICAgIGluRXZlbnQuYnV0dG9ucyA9IGUuYnV0dG9ucztcbiAgICB9LFxuICAgIG1vdXNlZG93bjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKCF0aGlzLmlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2goaW5FdmVudCkpIHtcbiAgICAgICAgdmFyIHAgPSBtb3VzZV9fcG9pbnRlcm1hcC5nZXQodGhpcy5QT0lOVEVSX0lEKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgaWYgKCFIQVNfQlVUVE9OUykge1xuICAgICAgICAgIGUuYnV0dG9ucyA9IEJVVFRPTl9UT19CVVRUT05TW2UuYnV0dG9uXTtcbiAgICAgICAgICBpZiAocCkgeyBlLmJ1dHRvbnMgfD0gcC5idXR0b25zOyB9XG4gICAgICAgICAgaW5FdmVudC5idXR0b25zID0gZS5idXR0b25zO1xuICAgICAgICB9XG4gICAgICAgIG1vdXNlX19wb2ludGVybWFwLnNldCh0aGlzLlBPSU5URVJfSUQsIGluRXZlbnQpO1xuICAgICAgICBpZiAoIXApIHtcbiAgICAgICAgICBfZGlzcGF0Y2hlci5kb3duKGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9kaXNwYXRjaGVyLm1vdmUoZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdXNlbW92ZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKCF0aGlzLmlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2goaW5FdmVudCkpIHtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgaWYgKCFIQVNfQlVUVE9OUykgeyB0aGlzLnByZXBhcmVCdXR0b25zRm9yTW92ZShlLCBpbkV2ZW50KTsgfVxuICAgICAgICBfZGlzcGF0Y2hlci5tb3ZlKGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbW91c2V1cDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKCF0aGlzLmlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2goaW5FdmVudCkpIHtcbiAgICAgICAgdmFyIHAgPSBtb3VzZV9fcG9pbnRlcm1hcC5nZXQodGhpcy5QT0lOVEVSX0lEKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgaWYgKCFIQVNfQlVUVE9OUykge1xuICAgICAgICAgIHZhciB1cCA9IEJVVFRPTl9UT19CVVRUT05TW2UuYnV0dG9uXTtcblxuICAgICAgICAgIC8vIFByb2R1Y2VzIHdyb25nIHN0YXRlIG9mIGJ1dHRvbnMgaW4gQnJvd3NlcnMgd2l0aG91dCBgYnV0dG9uc2Agc3VwcG9ydFxuICAgICAgICAgIC8vIHdoZW4gYSBtb3VzZSBidXR0b24gdGhhdCB3YXMgcHJlc3NlZCBvdXRzaWRlIHRoZSBkb2N1bWVudCBpcyByZWxlYXNlZFxuICAgICAgICAgIC8vIGluc2lkZSBhbmQgb3RoZXIgYnV0dG9ucyBhcmUgc3RpbGwgcHJlc3NlZCBkb3duLlxuICAgICAgICAgIGUuYnV0dG9ucyA9IHAgPyBwLmJ1dHRvbnMgJiB+dXAgOiAwO1xuICAgICAgICAgIGluRXZlbnQuYnV0dG9ucyA9IGUuYnV0dG9ucztcbiAgICAgICAgfVxuICAgICAgICBtb3VzZV9fcG9pbnRlcm1hcC5zZXQodGhpcy5QT0lOVEVSX0lELCBpbkV2ZW50KTtcblxuICAgICAgICAvLyBTdXBwb3J0OiBGaXJlZm94IDw9NDQgb25seVxuICAgICAgICAvLyBGRiBVYnVudHUgaW5jbHVkZXMgdGhlIGxpZnRlZCBidXR0b24gaW4gdGhlIGBidXR0b25zYCBwcm9wZXJ0eSBvblxuICAgICAgICAvLyBtb3VzZXVwLlxuICAgICAgICAvLyBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0xMjIzMzY2XG4gICAgICAgIGlmIChlLmJ1dHRvbnMgPT09IDAgfHwgZS5idXR0b25zID09PSBCVVRUT05fVE9fQlVUVE9OU1tlLmJ1dHRvbl0pIHtcbiAgICAgICAgICB0aGlzLmNsZWFudXBNb3VzZSgpO1xuICAgICAgICAgIF9kaXNwYXRjaGVyLnVwKGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9kaXNwYXRjaGVyLm1vdmUoZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdXNlb3ZlcjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKCF0aGlzLmlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2goaW5FdmVudCkpIHtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgaWYgKCFIQVNfQlVUVE9OUykgeyB0aGlzLnByZXBhcmVCdXR0b25zRm9yTW92ZShlLCBpbkV2ZW50KTsgfVxuICAgICAgICBfZGlzcGF0Y2hlci5lbnRlck92ZXIoZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBtb3VzZW91dDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKCF0aGlzLmlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2goaW5FdmVudCkpIHtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgaWYgKCFIQVNfQlVUVE9OUykgeyB0aGlzLnByZXBhcmVCdXR0b25zRm9yTW92ZShlLCBpbkV2ZW50KTsgfVxuICAgICAgICBfZGlzcGF0Y2hlci5sZWF2ZU91dChlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNhbmNlbDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLmNhbmNlbChlKTtcbiAgICAgIHRoaXMuY2xlYW51cE1vdXNlKCk7XG4gICAgfSxcbiAgICBjbGVhbnVwTW91c2U6IGZ1bmN0aW9uKCkge1xuICAgICAgbW91c2VfX3BvaW50ZXJtYXAuZGVsZXRlKHRoaXMuUE9JTlRFUl9JRCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBtb3VzZSA9IG1vdXNlRXZlbnRzO1xuXG4gIHZhciBjYXB0dXJlSW5mbyA9IF9kaXNwYXRjaGVyLmNhcHR1cmVJbmZvO1xuICB2YXIgZmluZFRhcmdldCA9IHRhcmdldGluZy5maW5kVGFyZ2V0LmJpbmQodGFyZ2V0aW5nKTtcbiAgdmFyIGFsbFNoYWRvd3MgPSB0YXJnZXRpbmcuYWxsU2hhZG93cy5iaW5kKHRhcmdldGluZyk7XG4gIHZhciB0b3VjaF9fcG9pbnRlcm1hcCA9IF9kaXNwYXRjaGVyLnBvaW50ZXJtYXA7XG5cbiAgLy8gVGhpcyBzaG91bGQgYmUgbG9uZyBlbm91Z2ggdG8gaWdub3JlIGNvbXBhdCBtb3VzZSBldmVudHMgbWFkZSBieSB0b3VjaFxuICB2YXIgREVEVVBfVElNRU9VVCA9IDI1MDA7XG4gIHZhciBDTElDS19DT1VOVF9USU1FT1VUID0gMjAwO1xuICB2YXIgQVRUUklCID0gJ3RvdWNoLWFjdGlvbic7XG4gIHZhciBJTlNUQUxMRVI7XG5cbiAgLy8gVGhlIHByZXNlbmNlIG9mIHRvdWNoIGV2ZW50IGhhbmRsZXJzIGJsb2NrcyBzY3JvbGxpbmcsIGFuZCBzbyB3ZSBtdXN0IGJlIGNhcmVmdWwgdG9cbiAgLy8gYXZvaWQgYWRkaW5nIGhhbmRsZXJzIHVubmVjZXNzYXJpbHkuICBDaHJvbWUgcGxhbnMgdG8gYWRkIGEgdG91Y2gtYWN0aW9uLWRlbGF5IHByb3BlcnR5XG4gIC8vIChjcmJ1Zy5jb20vMzI5NTU5KSB0byBhZGRyZXNzIHRoaXMsIGFuZCBvbmNlIHdlIGhhdmUgdGhhdCB3ZSBjYW4gb3B0LWluIHRvIGEgc2ltcGxlclxuICAvLyBoYW5kbGVyIHJlZ2lzdHJhdGlvbiBtZWNoYW5pc20uICBSYXRoZXIgdGhhbiB0cnkgdG8gcHJlZGljdCBob3cgZXhhY3RseSB0byBvcHQtaW4gdG9cbiAgLy8gdGhhdCB3ZSdsbCBqdXN0IGxlYXZlIHRoaXMgZGlzYWJsZWQgdW50aWwgdGhlcmUgaXMgYSBidWlsZCBvZiBDaHJvbWUgdG8gdGVzdC5cbiAgdmFyIEhBU19UT1VDSF9BQ1RJT05fREVMQVkgPSBmYWxzZTtcblxuICAvLyBoYW5kbGVyIGJsb2NrIGZvciBuYXRpdmUgdG91Y2ggZXZlbnRzXG4gIHZhciB0b3VjaEV2ZW50cyA9IHtcbiAgICBldmVudHM6IFtcbiAgICAgICd0b3VjaHN0YXJ0JyxcbiAgICAgICd0b3VjaG1vdmUnLFxuICAgICAgJ3RvdWNoZW5kJyxcbiAgICAgICd0b3VjaGNhbmNlbCdcbiAgICBdLFxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIGlmIChIQVNfVE9VQ0hfQUNUSU9OX0RFTEFZKSB7XG4gICAgICAgIF9kaXNwYXRjaGVyLmxpc3Rlbih0YXJnZXQsIHRoaXMuZXZlbnRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIElOU1RBTExFUi5lbmFibGVPblN1YnRyZWUodGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHVucmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgaWYgKEhBU19UT1VDSF9BQ1RJT05fREVMQVkpIHtcbiAgICAgICAgX2Rpc3BhdGNoZXIudW5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIFRPRE8oZGZyZWVkbWFuKTogaXMgaXQgd29ydGggaXQgdG8gZGlzY29ubmVjdCB0aGUgTU8/XG4gICAgICB9XG4gICAgfSxcbiAgICBlbGVtZW50QWRkZWQ6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICB2YXIgYSA9IGVsLmdldEF0dHJpYnV0ZShBVFRSSUIpO1xuICAgICAgdmFyIHN0ID0gdGhpcy50b3VjaEFjdGlvblRvU2Nyb2xsVHlwZShhKTtcbiAgICAgIGlmIChzdCkge1xuICAgICAgICBlbC5fc2Nyb2xsVHlwZSA9IHN0O1xuICAgICAgICBfZGlzcGF0Y2hlci5saXN0ZW4oZWwsIHRoaXMuZXZlbnRzKTtcblxuICAgICAgICAvLyBzZXQgdG91Y2gtYWN0aW9uIG9uIHNoYWRvd3MgYXMgd2VsbFxuICAgICAgICBhbGxTaGFkb3dzKGVsKS5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgICBzLl9zY3JvbGxUeXBlID0gc3Q7XG4gICAgICAgICAgX2Rpc3BhdGNoZXIubGlzdGVuKHMsIHRoaXMuZXZlbnRzKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlbGVtZW50UmVtb3ZlZDogZnVuY3Rpb24oZWwpIHtcbiAgICAgIGVsLl9zY3JvbGxUeXBlID0gdW5kZWZpbmVkO1xuICAgICAgX2Rpc3BhdGNoZXIudW5saXN0ZW4oZWwsIHRoaXMuZXZlbnRzKTtcblxuICAgICAgLy8gcmVtb3ZlIHRvdWNoLWFjdGlvbiBmcm9tIHNoYWRvd1xuICAgICAgYWxsU2hhZG93cyhlbCkuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgICAgIHMuX3Njcm9sbFR5cGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIF9kaXNwYXRjaGVyLnVubGlzdGVuKHMsIHRoaXMuZXZlbnRzKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG4gICAgZWxlbWVudENoYW5nZWQ6IGZ1bmN0aW9uKGVsLCBvbGRWYWx1ZSkge1xuICAgICAgdmFyIGEgPSBlbC5nZXRBdHRyaWJ1dGUoQVRUUklCKTtcbiAgICAgIHZhciBzdCA9IHRoaXMudG91Y2hBY3Rpb25Ub1Njcm9sbFR5cGUoYSk7XG4gICAgICB2YXIgb2xkU3QgPSB0aGlzLnRvdWNoQWN0aW9uVG9TY3JvbGxUeXBlKG9sZFZhbHVlKTtcblxuICAgICAgLy8gc2ltcGx5IHVwZGF0ZSBzY3JvbGxUeXBlIGlmIGxpc3RlbmVycyBhcmUgYWxyZWFkeSBlc3RhYmxpc2hlZFxuICAgICAgaWYgKHN0ICYmIG9sZFN0KSB7XG4gICAgICAgIGVsLl9zY3JvbGxUeXBlID0gc3Q7XG4gICAgICAgIGFsbFNoYWRvd3MoZWwpLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgICAgIHMuX3Njcm9sbFR5cGUgPSBzdDtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9IGVsc2UgaWYgKG9sZFN0KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudFJlbW92ZWQoZWwpO1xuICAgICAgfSBlbHNlIGlmIChzdCkge1xuICAgICAgICB0aGlzLmVsZW1lbnRBZGRlZChlbCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzY3JvbGxUeXBlczoge1xuICAgICAgRU1JVFRFUjogJ25vbmUnLFxuICAgICAgWFNDUk9MTEVSOiAncGFuLXgnLFxuICAgICAgWVNDUk9MTEVSOiAncGFuLXknLFxuICAgICAgU0NST0xMRVI6IC9eKD86cGFuLXggcGFuLXkpfCg/OnBhbi15IHBhbi14KXxhdXRvJC9cbiAgICB9LFxuICAgIHRvdWNoQWN0aW9uVG9TY3JvbGxUeXBlOiBmdW5jdGlvbih0b3VjaEFjdGlvbikge1xuICAgICAgdmFyIHQgPSB0b3VjaEFjdGlvbjtcbiAgICAgIHZhciBzdCA9IHRoaXMuc2Nyb2xsVHlwZXM7XG4gICAgICBpZiAodCA9PT0gJ25vbmUnKSB7XG4gICAgICAgIHJldHVybiAnbm9uZSc7XG4gICAgICB9IGVsc2UgaWYgKHQgPT09IHN0LlhTQ1JPTExFUikge1xuICAgICAgICByZXR1cm4gJ1gnO1xuICAgICAgfSBlbHNlIGlmICh0ID09PSBzdC5ZU0NST0xMRVIpIHtcbiAgICAgICAgcmV0dXJuICdZJztcbiAgICAgIH0gZWxzZSBpZiAoc3QuU0NST0xMRVIuZXhlYyh0KSkge1xuICAgICAgICByZXR1cm4gJ1hZJztcbiAgICAgIH1cbiAgICB9LFxuICAgIFBPSU5URVJfVFlQRTogJ3RvdWNoJyxcbiAgICBmaXJzdFRvdWNoOiBudWxsLFxuICAgIGlzUHJpbWFyeVRvdWNoOiBmdW5jdGlvbihpblRvdWNoKSB7XG4gICAgICByZXR1cm4gdGhpcy5maXJzdFRvdWNoID09PSBpblRvdWNoLmlkZW50aWZpZXI7XG4gICAgfSxcbiAgICBzZXRQcmltYXJ5VG91Y2g6IGZ1bmN0aW9uKGluVG91Y2gpIHtcblxuICAgICAgLy8gc2V0IHByaW1hcnkgdG91Y2ggaWYgdGhlcmUgbm8gcG9pbnRlcnMsIG9yIHRoZSBvbmx5IHBvaW50ZXIgaXMgdGhlIG1vdXNlXG4gICAgICBpZiAodG91Y2hfX3BvaW50ZXJtYXAuc2l6ZSA9PT0gMCB8fCAodG91Y2hfX3BvaW50ZXJtYXAuc2l6ZSA9PT0gMSAmJiB0b3VjaF9fcG9pbnRlcm1hcC5oYXMoMSkpKSB7XG4gICAgICAgIHRoaXMuZmlyc3RUb3VjaCA9IGluVG91Y2guaWRlbnRpZmllcjtcbiAgICAgICAgdGhpcy5maXJzdFhZID0geyBYOiBpblRvdWNoLmNsaWVudFgsIFk6IGluVG91Y2guY2xpZW50WSB9O1xuICAgICAgICB0aGlzLnNjcm9sbGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNhbmNlbFJlc2V0Q2xpY2tDb3VudCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlUHJpbWFyeVBvaW50ZXI6IGZ1bmN0aW9uKGluUG9pbnRlcikge1xuICAgICAgaWYgKGluUG9pbnRlci5pc1ByaW1hcnkpIHtcbiAgICAgICAgdGhpcy5maXJzdFRvdWNoID0gbnVsbDtcbiAgICAgICAgdGhpcy5maXJzdFhZID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZXNldENsaWNrQ291bnQoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNsaWNrQ291bnQ6IDAsXG4gICAgcmVzZXRJZDogbnVsbCxcbiAgICByZXNldENsaWNrQ291bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuY2xpY2tDb3VudCA9IDA7XG4gICAgICAgIHRoaXMucmVzZXRJZCA9IG51bGw7XG4gICAgICB9LmJpbmQodGhpcyk7XG4gICAgICB0aGlzLnJlc2V0SWQgPSBzZXRUaW1lb3V0KGZuLCBDTElDS19DT1VOVF9USU1FT1VUKTtcbiAgICB9LFxuICAgIGNhbmNlbFJlc2V0Q2xpY2tDb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5yZXNldElkKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlc2V0SWQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdHlwZVRvQnV0dG9uczogZnVuY3Rpb24odHlwZSkge1xuICAgICAgdmFyIHJldCA9IDA7XG4gICAgICBpZiAodHlwZSA9PT0gJ3RvdWNoc3RhcnQnIHx8IHR5cGUgPT09ICd0b3VjaG1vdmUnKSB7XG4gICAgICAgIHJldCA9IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG4gICAgdG91Y2hUb1BvaW50ZXI6IGZ1bmN0aW9uKGluVG91Y2gpIHtcbiAgICAgIHZhciBjdGUgPSB0aGlzLmN1cnJlbnRUb3VjaEV2ZW50O1xuICAgICAgdmFyIGUgPSBfZGlzcGF0Y2hlci5jbG9uZUV2ZW50KGluVG91Y2gpO1xuXG4gICAgICAvLyBXZSByZXNlcnZlIHBvaW50ZXJJZCAxIGZvciBNb3VzZS5cbiAgICAgIC8vIFRvdWNoIGlkZW50aWZpZXJzIGNhbiBzdGFydCBhdCAwLlxuICAgICAgLy8gQWRkIDIgdG8gdGhlIHRvdWNoIGlkZW50aWZpZXIgZm9yIGNvbXBhdGliaWxpdHkuXG4gICAgICB2YXIgaWQgPSBlLnBvaW50ZXJJZCA9IGluVG91Y2guaWRlbnRpZmllciArIDI7XG4gICAgICBlLnRhcmdldCA9IGNhcHR1cmVJbmZvW2lkXSB8fCBmaW5kVGFyZ2V0KGUpO1xuICAgICAgZS5idWJibGVzID0gdHJ1ZTtcbiAgICAgIGUuY2FuY2VsYWJsZSA9IHRydWU7XG4gICAgICBlLmRldGFpbCA9IHRoaXMuY2xpY2tDb3VudDtcbiAgICAgIGUuYnV0dG9uID0gMDtcbiAgICAgIGUuYnV0dG9ucyA9IHRoaXMudHlwZVRvQnV0dG9ucyhjdGUudHlwZSk7XG4gICAgICBlLndpZHRoID0gaW5Ub3VjaC5yYWRpdXNYIHx8IGluVG91Y2gud2Via2l0UmFkaXVzWCB8fCAwO1xuICAgICAgZS5oZWlnaHQgPSBpblRvdWNoLnJhZGl1c1kgfHwgaW5Ub3VjaC53ZWJraXRSYWRpdXNZIHx8IDA7XG4gICAgICBlLnByZXNzdXJlID0gaW5Ub3VjaC5mb3JjZSB8fCBpblRvdWNoLndlYmtpdEZvcmNlIHx8IDAuNTtcbiAgICAgIGUuaXNQcmltYXJ5ID0gdGhpcy5pc1ByaW1hcnlUb3VjaChpblRvdWNoKTtcbiAgICAgIGUucG9pbnRlclR5cGUgPSB0aGlzLlBPSU5URVJfVFlQRTtcblxuICAgICAgLy8gZm9yd2FyZCB0b3VjaCBwcmV2ZW50RGVmYXVsdHNcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIGUucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5zY3JvbGxpbmcgPSBmYWxzZTtcbiAgICAgICAgc2VsZi5maXJzdFhZID0gbnVsbDtcbiAgICAgICAgY3RlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIGU7XG4gICAgfSxcbiAgICBwcm9jZXNzVG91Y2hlczogZnVuY3Rpb24oaW5FdmVudCwgaW5GdW5jdGlvbikge1xuICAgICAgdmFyIHRsID0gaW5FdmVudC5jaGFuZ2VkVG91Y2hlcztcbiAgICAgIHRoaXMuY3VycmVudFRvdWNoRXZlbnQgPSBpbkV2ZW50O1xuICAgICAgZm9yICh2YXIgaSA9IDAsIHQ7IGkgPCB0bC5sZW5ndGg7IGkrKykge1xuICAgICAgICB0ID0gdGxbaV07XG4gICAgICAgIGluRnVuY3Rpb24uY2FsbCh0aGlzLCB0aGlzLnRvdWNoVG9Qb2ludGVyKHQpKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gRm9yIHNpbmdsZSBheGlzIHNjcm9sbGVycywgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBlbGVtZW50IHNob3VsZCBlbWl0XG4gICAgLy8gcG9pbnRlciBldmVudHMgb3IgYmVoYXZlIGFzIGEgc2Nyb2xsZXJcbiAgICBzaG91bGRTY3JvbGw6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmICh0aGlzLmZpcnN0WFkpIHtcbiAgICAgICAgdmFyIHJldDtcbiAgICAgICAgdmFyIHNjcm9sbEF4aXMgPSBpbkV2ZW50LmN1cnJlbnRUYXJnZXQuX3Njcm9sbFR5cGU7XG4gICAgICAgIGlmIChzY3JvbGxBeGlzID09PSAnbm9uZScpIHtcblxuICAgICAgICAgIC8vIHRoaXMgZWxlbWVudCBpcyBhIHRvdWNoLWFjdGlvbjogbm9uZSwgc2hvdWxkIG5ldmVyIHNjcm9sbFxuICAgICAgICAgIHJldCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcm9sbEF4aXMgPT09ICdYWScpIHtcblxuICAgICAgICAgIC8vIHRoaXMgZWxlbWVudCBzaG91bGQgYWx3YXlzIHNjcm9sbFxuICAgICAgICAgIHJldCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHQgPSBpbkV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuXG4gICAgICAgICAgLy8gY2hlY2sgdGhlIGludGVuZGVkIHNjcm9sbCBheGlzLCBhbmQgb3RoZXIgYXhpc1xuICAgICAgICAgIHZhciBhID0gc2Nyb2xsQXhpcztcbiAgICAgICAgICB2YXIgb2EgPSBzY3JvbGxBeGlzID09PSAnWScgPyAnWCcgOiAnWSc7XG4gICAgICAgICAgdmFyIGRhID0gTWF0aC5hYnModFsnY2xpZW50JyArIGFdIC0gdGhpcy5maXJzdFhZW2FdKTtcbiAgICAgICAgICB2YXIgZG9hID0gTWF0aC5hYnModFsnY2xpZW50JyArIG9hXSAtIHRoaXMuZmlyc3RYWVtvYV0pO1xuXG4gICAgICAgICAgLy8gaWYgZGVsdGEgaW4gdGhlIHNjcm9sbCBheGlzID4gZGVsdGEgb3RoZXIgYXhpcywgc2Nyb2xsIGluc3RlYWQgb2ZcbiAgICAgICAgICAvLyBtYWtpbmcgZXZlbnRzXG4gICAgICAgICAgcmV0ID0gZGEgPj0gZG9hO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmlyc3RYWSA9IG51bGw7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9XG4gICAgfSxcbiAgICBmaW5kVG91Y2g6IGZ1bmN0aW9uKGluVEwsIGluSWQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gaW5UTC5sZW5ndGgsIHQ7IGkgPCBsICYmICh0ID0gaW5UTFtpXSk7IGkrKykge1xuICAgICAgICBpZiAodC5pZGVudGlmaWVyID09PSBpbklkKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gSW4gc29tZSBpbnN0YW5jZXMsIGEgdG91Y2hzdGFydCBjYW4gaGFwcGVuIHdpdGhvdXQgYSB0b3VjaGVuZC4gVGhpc1xuICAgIC8vIGxlYXZlcyB0aGUgcG9pbnRlcm1hcCBpbiBhIGJyb2tlbiBzdGF0ZS5cbiAgICAvLyBUaGVyZWZvcmUsIG9uIGV2ZXJ5IHRvdWNoc3RhcnQsIHdlIHJlbW92ZSB0aGUgdG91Y2hlcyB0aGF0IGRpZCBub3QgZmlyZSBhXG4gICAgLy8gdG91Y2hlbmQgZXZlbnQuXG4gICAgLy8gVG8ga2VlcCBzdGF0ZSBnbG9iYWxseSBjb25zaXN0ZW50LCB3ZSBmaXJlIGFcbiAgICAvLyBwb2ludGVyY2FuY2VsIGZvciB0aGlzIFwiYWJhbmRvbmVkXCIgdG91Y2hcbiAgICB2YWN1dW1Ub3VjaGVzOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgdGwgPSBpbkV2ZW50LnRvdWNoZXM7XG5cbiAgICAgIC8vIHBvaW50ZXJtYXAuc2l6ZSBzaG91bGQgYmUgPCB0bC5sZW5ndGggaGVyZSwgYXMgdGhlIHRvdWNoc3RhcnQgaGFzIG5vdFxuICAgICAgLy8gYmVlbiBwcm9jZXNzZWQgeWV0LlxuICAgICAgaWYgKHRvdWNoX19wb2ludGVybWFwLnNpemUgPj0gdGwubGVuZ3RoKSB7XG4gICAgICAgIHZhciBkID0gW107XG4gICAgICAgIHRvdWNoX19wb2ludGVybWFwLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkge1xuXG4gICAgICAgICAgLy8gTmV2ZXIgcmVtb3ZlIHBvaW50ZXJJZCA9PSAxLCB3aGljaCBpcyBtb3VzZS5cbiAgICAgICAgICAvLyBUb3VjaCBpZGVudGlmaWVycyBhcmUgMiBzbWFsbGVyIHRoYW4gdGhlaXIgcG9pbnRlcklkLCB3aGljaCBpcyB0aGVcbiAgICAgICAgICAvLyBpbmRleCBpbiBwb2ludGVybWFwLlxuICAgICAgICAgIGlmIChrZXkgIT09IDEgJiYgIXRoaXMuZmluZFRvdWNoKHRsLCBrZXkgLSAyKSkge1xuICAgICAgICAgICAgdmFyIHAgPSB2YWx1ZS5vdXQ7XG4gICAgICAgICAgICBkLnB1c2gocCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgZC5mb3JFYWNoKHRoaXMuY2FuY2VsT3V0LCB0aGlzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRvdWNoc3RhcnQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHRoaXMudmFjdXVtVG91Y2hlcyhpbkV2ZW50KTtcbiAgICAgIHRoaXMuc2V0UHJpbWFyeVRvdWNoKGluRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0pO1xuICAgICAgdGhpcy5kZWR1cFN5bnRoTW91c2UoaW5FdmVudCk7XG4gICAgICBpZiAoIXRoaXMuc2Nyb2xsaW5nKSB7XG4gICAgICAgIHRoaXMuY2xpY2tDb3VudCsrO1xuICAgICAgICB0aGlzLnByb2Nlc3NUb3VjaGVzKGluRXZlbnQsIHRoaXMub3ZlckRvd24pO1xuICAgICAgfVxuICAgIH0sXG4gICAgb3ZlckRvd246IGZ1bmN0aW9uKGluUG9pbnRlcikge1xuICAgICAgdG91Y2hfX3BvaW50ZXJtYXAuc2V0KGluUG9pbnRlci5wb2ludGVySWQsIHtcbiAgICAgICAgdGFyZ2V0OiBpblBvaW50ZXIudGFyZ2V0LFxuICAgICAgICBvdXQ6IGluUG9pbnRlcixcbiAgICAgICAgb3V0VGFyZ2V0OiBpblBvaW50ZXIudGFyZ2V0XG4gICAgICB9KTtcbiAgICAgIF9kaXNwYXRjaGVyLm92ZXIoaW5Qb2ludGVyKTtcbiAgICAgIF9kaXNwYXRjaGVyLmVudGVyKGluUG9pbnRlcik7XG4gICAgICBfZGlzcGF0Y2hlci5kb3duKGluUG9pbnRlcik7XG4gICAgfSxcbiAgICB0b3VjaG1vdmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5zY3JvbGxpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkU2Nyb2xsKGluRXZlbnQpKSB7XG4gICAgICAgICAgdGhpcy5zY3JvbGxpbmcgPSB0cnVlO1xuICAgICAgICAgIHRoaXMudG91Y2hjYW5jZWwoaW5FdmVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMucHJvY2Vzc1RvdWNoZXMoaW5FdmVudCwgdGhpcy5tb3ZlT3Zlck91dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdmVPdmVyT3V0OiBmdW5jdGlvbihpblBvaW50ZXIpIHtcbiAgICAgIHZhciBldmVudCA9IGluUG9pbnRlcjtcbiAgICAgIHZhciBwb2ludGVyID0gdG91Y2hfX3BvaW50ZXJtYXAuZ2V0KGV2ZW50LnBvaW50ZXJJZCk7XG5cbiAgICAgIC8vIGEgZmluZ2VyIGRyaWZ0ZWQgb2ZmIHRoZSBzY3JlZW4sIGlnbm9yZSBpdFxuICAgICAgaWYgKCFwb2ludGVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBvdXRFdmVudCA9IHBvaW50ZXIub3V0O1xuICAgICAgdmFyIG91dFRhcmdldCA9IHBvaW50ZXIub3V0VGFyZ2V0O1xuICAgICAgX2Rpc3BhdGNoZXIubW92ZShldmVudCk7XG4gICAgICBpZiAob3V0RXZlbnQgJiYgb3V0VGFyZ2V0ICE9PSBldmVudC50YXJnZXQpIHtcbiAgICAgICAgb3V0RXZlbnQucmVsYXRlZFRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgZXZlbnQucmVsYXRlZFRhcmdldCA9IG91dFRhcmdldDtcblxuICAgICAgICAvLyByZWNvdmVyIGZyb20gcmV0YXJnZXRpbmcgYnkgc2hhZG93XG4gICAgICAgIG91dEV2ZW50LnRhcmdldCA9IG91dFRhcmdldDtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCkge1xuICAgICAgICAgIF9kaXNwYXRjaGVyLmxlYXZlT3V0KG91dEV2ZW50KTtcbiAgICAgICAgICBfZGlzcGF0Y2hlci5lbnRlck92ZXIoZXZlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgLy8gY2xlYW4gdXAgY2FzZSB3aGVuIGZpbmdlciBsZWF2ZXMgdGhlIHNjcmVlblxuICAgICAgICAgIGV2ZW50LnRhcmdldCA9IG91dFRhcmdldDtcbiAgICAgICAgICBldmVudC5yZWxhdGVkVGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgICB0aGlzLmNhbmNlbE91dChldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHBvaW50ZXIub3V0ID0gZXZlbnQ7XG4gICAgICBwb2ludGVyLm91dFRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICB9LFxuICAgIHRvdWNoZW5kOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB0aGlzLmRlZHVwU3ludGhNb3VzZShpbkV2ZW50KTtcbiAgICAgIHRoaXMucHJvY2Vzc1RvdWNoZXMoaW5FdmVudCwgdGhpcy51cE91dCk7XG4gICAgfSxcbiAgICB1cE91dDogZnVuY3Rpb24oaW5Qb2ludGVyKSB7XG4gICAgICBpZiAoIXRoaXMuc2Nyb2xsaW5nKSB7XG4gICAgICAgIF9kaXNwYXRjaGVyLnVwKGluUG9pbnRlcik7XG4gICAgICAgIF9kaXNwYXRjaGVyLm91dChpblBvaW50ZXIpO1xuICAgICAgICBfZGlzcGF0Y2hlci5sZWF2ZShpblBvaW50ZXIpO1xuICAgICAgfVxuICAgICAgdGhpcy5jbGVhblVwUG9pbnRlcihpblBvaW50ZXIpO1xuICAgIH0sXG4gICAgdG91Y2hjYW5jZWw6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHRoaXMucHJvY2Vzc1RvdWNoZXMoaW5FdmVudCwgdGhpcy5jYW5jZWxPdXQpO1xuICAgIH0sXG4gICAgY2FuY2VsT3V0OiBmdW5jdGlvbihpblBvaW50ZXIpIHtcbiAgICAgIF9kaXNwYXRjaGVyLmNhbmNlbChpblBvaW50ZXIpO1xuICAgICAgX2Rpc3BhdGNoZXIub3V0KGluUG9pbnRlcik7XG4gICAgICBfZGlzcGF0Y2hlci5sZWF2ZShpblBvaW50ZXIpO1xuICAgICAgdGhpcy5jbGVhblVwUG9pbnRlcihpblBvaW50ZXIpO1xuICAgIH0sXG4gICAgY2xlYW5VcFBvaW50ZXI6IGZ1bmN0aW9uKGluUG9pbnRlcikge1xuICAgICAgdG91Y2hfX3BvaW50ZXJtYXAuZGVsZXRlKGluUG9pbnRlci5wb2ludGVySWQpO1xuICAgICAgdGhpcy5yZW1vdmVQcmltYXJ5UG9pbnRlcihpblBvaW50ZXIpO1xuICAgIH0sXG5cbiAgICAvLyBwcmV2ZW50IHN5bnRoIG1vdXNlIGV2ZW50cyBmcm9tIGNyZWF0aW5nIHBvaW50ZXIgZXZlbnRzXG4gICAgZGVkdXBTeW50aE1vdXNlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgbHRzID0gbW91c2UubGFzdFRvdWNoZXM7XG4gICAgICB2YXIgdCA9IGluRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG5cbiAgICAgIC8vIG9ubHkgdGhlIHByaW1hcnkgZmluZ2VyIHdpbGwgc3ludGggbW91c2UgZXZlbnRzXG4gICAgICBpZiAodGhpcy5pc1ByaW1hcnlUb3VjaCh0KSkge1xuXG4gICAgICAgIC8vIHJlbWVtYmVyIHgveSBvZiBsYXN0IHRvdWNoXG4gICAgICAgIHZhciBsdCA9IHsgeDogdC5jbGllbnRYLCB5OiB0LmNsaWVudFkgfTtcbiAgICAgICAgbHRzLnB1c2gobHQpO1xuICAgICAgICB2YXIgZm4gPSAoZnVuY3Rpb24obHRzLCBsdCkge1xuICAgICAgICAgIHZhciBpID0gbHRzLmluZGV4T2YobHQpO1xuICAgICAgICAgIGlmIChpID4gLTEpIHtcbiAgICAgICAgICAgIGx0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5iaW5kKG51bGwsIGx0cywgbHQpO1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCBERURVUF9USU1FT1VUKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgaWYgKCFIQVNfVE9VQ0hfQUNUSU9OX0RFTEFZKSB7XG4gICAgSU5TVEFMTEVSID0gbmV3IGluc3RhbGxlcih0b3VjaEV2ZW50cy5lbGVtZW50QWRkZWQsIHRvdWNoRXZlbnRzLmVsZW1lbnRSZW1vdmVkLFxuICAgICAgdG91Y2hFdmVudHMuZWxlbWVudENoYW5nZWQsIHRvdWNoRXZlbnRzKTtcbiAgfVxuXG4gIHZhciB0b3VjaCA9IHRvdWNoRXZlbnRzO1xuXG4gIHZhciBtc19fcG9pbnRlcm1hcCA9IF9kaXNwYXRjaGVyLnBvaW50ZXJtYXA7XG4gIHZhciBIQVNfQklUTUFQX1RZUEUgPSB3aW5kb3cuTVNQb2ludGVyRXZlbnQgJiZcbiAgICB0eXBlb2Ygd2luZG93Lk1TUG9pbnRlckV2ZW50Lk1TUE9JTlRFUl9UWVBFX01PVVNFID09PSAnbnVtYmVyJztcbiAgdmFyIG1zRXZlbnRzID0ge1xuICAgIGV2ZW50czogW1xuICAgICAgJ01TUG9pbnRlckRvd24nLFxuICAgICAgJ01TUG9pbnRlck1vdmUnLFxuICAgICAgJ01TUG9pbnRlclVwJyxcbiAgICAgICdNU1BvaW50ZXJPdXQnLFxuICAgICAgJ01TUG9pbnRlck92ZXInLFxuICAgICAgJ01TUG9pbnRlckNhbmNlbCcsXG4gICAgICAnTVNHb3RQb2ludGVyQ2FwdHVyZScsXG4gICAgICAnTVNMb3N0UG9pbnRlckNhcHR1cmUnXG4gICAgXSxcbiAgICByZWdpc3RlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBfZGlzcGF0Y2hlci5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgfSxcbiAgICB1bnJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIF9kaXNwYXRjaGVyLnVubGlzdGVuKHRhcmdldCwgdGhpcy5ldmVudHMpO1xuICAgIH0sXG4gICAgUE9JTlRFUl9UWVBFUzogW1xuICAgICAgJycsXG4gICAgICAndW5hdmFpbGFibGUnLFxuICAgICAgJ3RvdWNoJyxcbiAgICAgICdwZW4nLFxuICAgICAgJ21vdXNlJ1xuICAgIF0sXG4gICAgcHJlcGFyZUV2ZW50OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IGluRXZlbnQ7XG4gICAgICBpZiAoSEFTX0JJVE1BUF9UWVBFKSB7XG4gICAgICAgIGUgPSBfZGlzcGF0Y2hlci5jbG9uZUV2ZW50KGluRXZlbnQpO1xuICAgICAgICBlLnBvaW50ZXJUeXBlID0gdGhpcy5QT0lOVEVSX1RZUEVTW2luRXZlbnQucG9pbnRlclR5cGVdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGU7XG4gICAgfSxcbiAgICBjbGVhbnVwOiBmdW5jdGlvbihpZCkge1xuICAgICAgbXNfX3BvaW50ZXJtYXAuZGVsZXRlKGlkKTtcbiAgICB9LFxuICAgIE1TUG9pbnRlckRvd246IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIG1zX19wb2ludGVybWFwLnNldChpbkV2ZW50LnBvaW50ZXJJZCwgaW5FdmVudCk7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgX2Rpc3BhdGNoZXIuZG93bihlKTtcbiAgICB9LFxuICAgIE1TUG9pbnRlck1vdmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBfZGlzcGF0Y2hlci5tb3ZlKGUpO1xuICAgIH0sXG4gICAgTVNQb2ludGVyVXA6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBfZGlzcGF0Y2hlci51cChlKTtcbiAgICAgIHRoaXMuY2xlYW51cChpbkV2ZW50LnBvaW50ZXJJZCk7XG4gICAgfSxcbiAgICBNU1BvaW50ZXJPdXQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBfZGlzcGF0Y2hlci5sZWF2ZU91dChlKTtcbiAgICB9LFxuICAgIE1TUG9pbnRlck92ZXI6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBfZGlzcGF0Y2hlci5lbnRlck92ZXIoZSk7XG4gICAgfSxcbiAgICBNU1BvaW50ZXJDYW5jZWw6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBfZGlzcGF0Y2hlci5jYW5jZWwoZSk7XG4gICAgICB0aGlzLmNsZWFudXAoaW5FdmVudC5wb2ludGVySWQpO1xuICAgIH0sXG4gICAgTVNMb3N0UG9pbnRlckNhcHR1cmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gX2Rpc3BhdGNoZXIubWFrZUV2ZW50KCdsb3N0cG9pbnRlcmNhcHR1cmUnLCBpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSxcbiAgICBNU0dvdFBvaW50ZXJDYXB0dXJlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IF9kaXNwYXRjaGVyLm1ha2VFdmVudCgnZ290cG9pbnRlcmNhcHR1cmUnLCBpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBtcyA9IG1zRXZlbnRzO1xuXG4gIGZ1bmN0aW9uIHBsYXRmb3JtX2V2ZW50c19fYXBwbHlQb2x5ZmlsbCgpIHtcblxuICAgIC8vIG9ubHkgYWN0aXZhdGUgaWYgdGhpcyBwbGF0Zm9ybSBkb2VzIG5vdCBoYXZlIHBvaW50ZXIgZXZlbnRzXG4gICAgaWYgKCF3aW5kb3cuUG9pbnRlckV2ZW50KSB7XG4gICAgICB3aW5kb3cuUG9pbnRlckV2ZW50ID0gX1BvaW50ZXJFdmVudDtcblxuICAgICAgaWYgKHdpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCkge1xuICAgICAgICB2YXIgdHAgPSB3aW5kb3cubmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHM7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cubmF2aWdhdG9yLCAnbWF4VG91Y2hQb2ludHMnLCB7XG4gICAgICAgICAgdmFsdWU6IHRwLFxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIF9kaXNwYXRjaGVyLnJlZ2lzdGVyU291cmNlKCdtcycsIG1zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF9kaXNwYXRjaGVyLnJlZ2lzdGVyU291cmNlKCdtb3VzZScsIG1vdXNlKTtcbiAgICAgICAgaWYgKHdpbmRvdy5vbnRvdWNoc3RhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIF9kaXNwYXRjaGVyLnJlZ2lzdGVyU291cmNlKCd0b3VjaCcsIHRvdWNoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBfZGlzcGF0Y2hlci5yZWdpc3Rlcihkb2N1bWVudCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIG4gPSB3aW5kb3cubmF2aWdhdG9yO1xuICB2YXIgcywgcjtcbiAgZnVuY3Rpb24gYXNzZXJ0RG93bihpZCkge1xuICAgIGlmICghX2Rpc3BhdGNoZXIucG9pbnRlcm1hcC5oYXMoaWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWRQb2ludGVySWQnKTtcbiAgICB9XG4gIH1cbiAgaWYgKG4ubXNQb2ludGVyRW5hYmxlZCkge1xuICAgIHMgPSBmdW5jdGlvbihwb2ludGVySWQpIHtcbiAgICAgIGFzc2VydERvd24ocG9pbnRlcklkKTtcbiAgICAgIHRoaXMubXNTZXRQb2ludGVyQ2FwdHVyZShwb2ludGVySWQpO1xuICAgIH07XG4gICAgciA9IGZ1bmN0aW9uKHBvaW50ZXJJZCkge1xuICAgICAgYXNzZXJ0RG93bihwb2ludGVySWQpO1xuICAgICAgdGhpcy5tc1JlbGVhc2VQb2ludGVyQ2FwdHVyZShwb2ludGVySWQpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcyA9IGZ1bmN0aW9uIHNldFBvaW50ZXJDYXB0dXJlKHBvaW50ZXJJZCkge1xuICAgICAgYXNzZXJ0RG93bihwb2ludGVySWQpO1xuICAgICAgX2Rpc3BhdGNoZXIuc2V0Q2FwdHVyZShwb2ludGVySWQsIHRoaXMpO1xuICAgIH07XG4gICAgciA9IGZ1bmN0aW9uIHJlbGVhc2VQb2ludGVyQ2FwdHVyZShwb2ludGVySWQpIHtcbiAgICAgIGFzc2VydERvd24ocG9pbnRlcklkKTtcbiAgICAgIF9kaXNwYXRjaGVyLnJlbGVhc2VDYXB0dXJlKHBvaW50ZXJJZCwgdGhpcyk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9jYXB0dXJlX19hcHBseVBvbHlmaWxsKCkge1xuICAgIGlmICh3aW5kb3cuRWxlbWVudCAmJiAhRWxlbWVudC5wcm90b3R5cGUuc2V0UG9pbnRlckNhcHR1cmUpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEVsZW1lbnQucHJvdG90eXBlLCB7XG4gICAgICAgICdzZXRQb2ludGVyQ2FwdHVyZSc6IHtcbiAgICAgICAgICB2YWx1ZTogc1xuICAgICAgICB9LFxuICAgICAgICAncmVsZWFzZVBvaW50ZXJDYXB0dXJlJzoge1xuICAgICAgICAgIHZhbHVlOiByXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFwcGx5QXR0cmlidXRlU3R5bGVzKCk7XG4gIHBsYXRmb3JtX2V2ZW50c19fYXBwbHlQb2x5ZmlsbCgpO1xuICBfY2FwdHVyZV9fYXBwbHlQb2x5ZmlsbCgpO1xuXG4gIHZhciBwb2ludGVyZXZlbnRzID0ge1xuICAgIGRpc3BhdGNoZXI6IF9kaXNwYXRjaGVyLFxuICAgIEluc3RhbGxlcjogaW5zdGFsbGVyLFxuICAgIFBvaW50ZXJFdmVudDogX1BvaW50ZXJFdmVudCxcbiAgICBQb2ludGVyTWFwOiBfcG9pbnRlcm1hcCxcbiAgICB0YXJnZXRGaW5kaW5nOiB0YXJnZXRpbmdcbiAgfTtcblxuICByZXR1cm4gcG9pbnRlcmV2ZW50cztcblxufSkpOyJdfQ==
