'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PEP = exports.Communication = exports.Menu = exports.CanvasWidget = exports.DOMWidget = exports.Button = exports.Slider = exports.Panel = undefined;

var _panel = require('./panel');

var _panel2 = _interopRequireDefault(_panel);

var _slider = require('./slider');

var _slider2 = _interopRequireDefault(_slider);

var _button = require('./button');

var _button2 = _interopRequireDefault(_button);

var _domWidget = require('./domWidget');

var _domWidget2 = _interopRequireDefault(_domWidget);

var _canvasWidget = require('./canvasWidget');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

var _menu = require('./menu');

var _menu2 = _interopRequireDefault(_menu);

var _communication = require('./communication');

var _communication2 = _interopRequireDefault(_communication);

var _pepjs = require('pepjs');

var _pepjs2 = _interopRequireDefault(_pepjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//let lib = {
//  Panel: require( './panel.js' ),
//  Slider: require( './slider.js' ),
//  Button: require( './button.js' ),
//  DOMWidget: require( './domWidget.js' ),
//  CanvasWidget: require( './canvasWidget.js' ),
//  Menu: require( './menu.js' ),
//  Communication: require( './communication.js' ),
//  PEP: require( 'pepjs' )
//}

//module.exports = lib

// Everything we need to include goes here and is fed to browserify in the gulpfile.js

exports.Panel = _panel2.default;
exports.Slider = _slider2.default;
exports.Button = _button2.default;
exports.DOMWidget = _domWidget2.default;
exports.CanvasWidget = _canvasWidget2.default;
exports.Menu = _menu2.default;
exports.Communication = _communication2.default;
exports.PEP = _pepjs2.default;