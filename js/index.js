// Everything we need to include goes here and is fed to browserify in the gulpfile.js
let lib = {
  Panel: require( './panel.js' ),
  Slider: require( './slider.js' ),
  Button: require( './button.js' ),
  DOMWidget: require( './domWidget.js' ),
  CanvasWidget: require( './canvasWidget.js' ),
  Menu: require( './menu.js' ),
  PEP: require( 'pepjs' )
}

module.exports = lib
