'use strict';

var Interface = {
  widgets: [],
  layoutManager: null,
  getMode: function getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse';
  },

  Filters: require('./filters.js')
};

module.exports = Interface;