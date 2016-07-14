'use strict';

var Utilities = require('./utilities.js'),
    Filters = require('./filters.js');

var Widget = {

  defaults: {
    min: 0, max: 1,
    scaleOutput: true },

  init: function init() {
    Object.assign(this, Widget.defaults);

    this.filters = [];

    // if min/max are not 0-1 and scaling is not disabled
    if (this.scaleOutput && (this.min !== 0 || this.max !== 1)) {
      this.filters.push(Filters.Scale(0, 1, this.min, this.max));
    }

    return this;
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
  }
};

module.exports = Widget;