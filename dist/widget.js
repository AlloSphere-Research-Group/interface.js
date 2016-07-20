'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utilities = require('./utilities');

var _utilities2 = _interopRequireDefault(_utilities);

var _filters = require('./filters');

var _filters2 = _interopRequireDefault(_filters);

var _communication = require('./communication.js');

var _communication2 = _interopRequireDefault(_communication);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Widget = {
  // store all instantiated widgets
  widgets: [],

  defaults: {
    min: 0, max: 1,
    scaleOutput: true, // apply scale filter by default for min / max ranges
    target: null
  },

  create: function create() {
    Object.assign(this, Widget.defaults);

    this.filters = [];

    // if min/max are not 0-1 and scaling is not disabled
    if (this.scaleOutput && (this.min !== 0 || this.max !== 1)) {
      this.filters.push(_filters2.default.Scale(0, 1, this.min, this.max));
    }

    Widget.widgets.push(this);

    return this;
  },
  init: function init() {
    if (this.target && this.target === 'osc' || this.target === 'midi') {
      _communication2.default.init();
    }
  },
  output: function output() {
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

    if (this.target !== null) this.transmit(this.value);

    return this.value;
  },
  transmit: function transmit() {
    if (this.target === 'osc') {
      _communication2.default.OSC.send(this.address, this.value);
    }
  }
};

exports.default = Widget;