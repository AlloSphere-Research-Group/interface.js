let Utilities = require( './utilities.js' ),
    Filters = require( './filters.js' )

let Widget = {

  defaults: {
    x:0,y:0,width:.25,height:.25,
    attached:false,
    min:0, max:1,
    scaleOutput:true, // apply scale filter by default for min / max ranges
  },

  init( container = window ) {
    let shouldUseTouch = Utilities.getMode() === 'touch'
    
    this.container = container
    this.canvas = this.createCanvas()
    this.ctx = this.canvas.getContext( '2d' )

    this.applyHandlers( shouldUseTouch )

    if( container !== null ) { // do not place accelerometer, gyro etc.
      this.place()
      this.draw()
    }
    
    this.filters = []

    // if min/max are not 0-1 and scaling is not disabled
    if( this.scaleOutput && (this.min !== 0 || this.max !== 1 )) {      
      this.filters.push( 
        Filters.Scale( 0,1,this.min,this.max ) 
      )
    }
    
    return this
  },
  
  createCanvas() {
    let canvas = document.createElement( 'canvas' )
    canvas.setAttribute( 'touch-action', 'none' )
    canvas.style.position = 'absolute'
    canvas.style.display  = 'block'
    
    return canvas
  },

  // use CSS to position canvas element of widget
  place() {
    let containerWidth = this.container.getWidth(),
        containerHeight= this.container.getHeight(),
        width  = containerWidth  * this.width,
        height = containerHeight * this.height,
        x      = containerWidth  * this.x,
        y      = containerHeight * this.y

    if( !this.attached ) {
      this.container.add( this )
      this.attached = true
    }

    this.__width = width;
    this.__height = height;

    this.canvas.width  = width
    this.canvas.style.width = width + 'px'
    this.canvas.height = height
    this.canvas.style.height = height + 'px'
    this.canvas.style.left = x
    this.canvas.style.top  = y

    this.rect = this.canvas.getBoundingClientRect() 
  },

  calculateOutput() {
    let value = this.__value

    for( let filter of this.filters ) value = filter( value )

    this.value = value
    
    return this.value
  },

  applyHandlers( shouldUseTouch=false ) {
    let handlers = shouldUseTouch ? Widget.handlers.touch : Widget.handlers.mouse
    
    // widgets have ijs defined handlers stored in the _events array,
    // and user-defined events stored with 'on' prefixes (e.g. onclick, onmousedown)

    for( let handlerName of handlers ) {
      this.canvas.addEventListener( handlerName, event => {
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
}

module.exports = Widget
