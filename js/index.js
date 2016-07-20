// Everything we need to include goes here and is fed to browserify in the gulpfile.js

import Panel from './panel'
import Slider from './slider'
import Button from './button'
import DOMWidget from './domWidget'
import CanvasWidget from './canvasWidget'
import Menu from './menu'
import Communication from './communication'
import PEP from 'pepjs'

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

export {
  Panel, Slider, Button, DOMWidget, CanvasWidget, Menu, Communication, PEP
}

