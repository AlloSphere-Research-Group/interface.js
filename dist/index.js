'use strict';

// Everything we need to include goes here and is fed to browserify in the gulpfile.js
var lib = {
  Interface: require('./interface.js'),
  Panel: require('./panel.js'),
  Slider: require('./slider.js')
};

module.exports = lib;