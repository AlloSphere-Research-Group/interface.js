'use strict';

// Everything we need to include goes here and is fed to browserify in the gulpfile.js
var lib = {
  Panel: require('./panel.js'),
  Slider: require('./slider.js'),
  Button: require('./button.js'),
  PEP: require('pepjs')
};

module.exports = lib;