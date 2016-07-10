let ijs = require( './interface.js' )

let Widget = {

  defaults: {
    x:0,y:0,width:.25,height:.25,
    attached:false
  },

  init( container = window ) {
    let shouldUseTouch = ijs.getMode() === 'touch'
    
    this.container = container
    this.canvas = this.createCanvas()
    this.ctx = this.canvas.getContext( '2d' )
    //this.ctx.scale( window.devicePixelRatio, window.devicePixelRatio )

    this.applyHandlers( shouldUseTouch )
    this.place()
    
    return this
  },
  
  createCanvas() {
    let canvas = document.createElement( 'canvas' )
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

  applyHandlers( shouldUseTouch=false ) {
    let handlers = shouldUseTouch ? Widget.handlers.touch : Widget.handlers.mouse
    
    // widgets have ijs defined handlers stored in the _events array,
    // and user-defined events stored with 'on' prefixes (e.g. onclick, onmousedown)

    for( let handlerName of handlers ) {
      this.canvas.addEventListener( handlerName, event => {
        //if( handlerName !== 'mousemove' ) console.log( event )
        if( typeof this[ '__' + handlerName ] === 'function' ) this[ '__' + handlerName ]( event )
        if( typeof this[ 'on' + handlerName ]  === 'function'  ) this[ 'on' + handlerName ]( event )
      })
    }

  },

  handlers: {
    mouse: [
      'mousedown',
    ],
    touch: []
  },
}

module.exports = Widget