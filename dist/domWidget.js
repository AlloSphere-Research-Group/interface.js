'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _widget = require('./widget');

var _widget2 = _interopRequireDefault(_widget);

var _utilities = require('./utilities');

var _utilities2 = _interopRequireDefault(_utilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DOMWidget = Object.create(_widget2.default);

Object.assign(DOMWidget, {

  defaults: {
    x: 0, y: 0, width: .25, height: .25,
    attached: false
  },

  create: function create() {
    var shouldUseTouch = _utilities2.default.getMode() === 'touch';

    _widget2.default.create.call(this);

    Object.assign(this, DOMWidget.defaults);

    // ALL INSTANCES OF DOMWIDGET MUST IMPLEMENT CREATE ELEMENT
    if (typeof this.createElement === 'function') {
      this.element = this.createElement();
    } else {
      throw new Error('widget inheriting from DOMWidget does not implement createElement method; this is required.');
    }
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
  }
});

exports.default = DOMWidget;