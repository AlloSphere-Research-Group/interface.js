'use strict';

var Interface = {
  widgets: [],
  layoutManager: null,
  getMode: function getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse';
  }
};

module.exports = Interface;