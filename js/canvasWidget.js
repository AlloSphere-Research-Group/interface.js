import DOMWidget from './DOMWidget'
import Utilities from './utilities'
import WidgetLabel from './widgetLabel'

let CanvasWidget = Object.create( DOMWidget )

Object.assign( CanvasWidget, {

  defaults: {},

  create() {
    let shouldUseTouch = Utilities.getMode() === 'touch'
    
    DOMWidget.create.call( this )

    Object.assign( this, CanvasWidget.defaults )

    this.ctx = this.element.getContext( '2d' )

    this.applyHandlers( shouldUseTouch )
  },

  createElement() {
    let element = document.createElement( 'canvas' )
    element.setAttribute( 'touch-action', 'none' )
    element.style.position = 'absolute'
    element.style.display  = 'block'
    
    return element
  },

  applyHandlers( shouldUseTouch=false ) {
    let handlers = shouldUseTouch ? CanvasWidget.handlers.touch : CanvasWidget.handlers.mouse
    
    // widgets have ijs defined handlers stored in the _events array,
    // and user-defined events stored with 'on' prefixes (e.g. onclick, onmousedown)
    for( let handlerName of handlers ) {
      this.element.addEventListener( handlerName, event => {
        if( typeof this[ 'on' + handlerName ]  === 'function'  ) this[ 'on' + handlerName ]( event )
      })
    }

  },

  handlers: {
    mouse: [
      'mouseup',
      'mousemove',
      'mousedown',
    ],
    touch: []
  },

  addLabel() {
    let props = Object.assign( { ctx: this.ctx }, this.label ),
        label = WidgetLabel.create( props )

    this._label = label
    this._draw = this.draw
    this.draw = function() {
      this._draw()
      this._label.draw()
    }
  },

  __addToPanel( panel ) {
    this.container = panel

    if( typeof this.addEvents === 'function' ) this.addEvents()

    // called if widget uses DOMWidget as prototype; .place inherited from DOMWidget
    this.place() 

    if( this.label ) this.addLabel()

    this.draw()     

  }
})

export default CanvasWidget
