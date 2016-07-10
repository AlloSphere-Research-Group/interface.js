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
    this.ctx = this.canvas.getContext('2d')

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
    let width  = this.container.innerWidth  * this.width,
        height = this.container.innerHeight * this.height,
        x      = this.container.innerWidth  * this.x,
        y      = this.container.innerHeight * this.y

    if( !this.attached && this.container === window ) {
      document.querySelector('body').appendChild( this.canvas )
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
  },

  applyHandlers( shouldUseTouch=false ) {
    let handlers = shouldUseTouch ? Widget.handlers.touch : Widget.handlers.mouse
    
    // widgets have ijs defined handlers stored in the _events array,
    // and user-defined events stored with 'on' prefixes (e.g. onclick, onmousedown)

    for( let handlerName of handlers ) {
      this.canvas.addEventListener( handlerName, event => {
        if( handlerName !== 'mousemove' ) console.log( event )
        if( typeof this[ '__' + handlerName ] === 'function' ) this[ '__' + handlerName ]( event )
        if( typeof this[ 'on' + handlerName ]  === 'function'  ) this[ 'on' + handlerName ]( event )
      })
    }

  },

  handlers: {
    mouse: [
      'click',
      'mousedown',
      'mouseup',
      'mousemove'
    ],
    touch: []
  },
}

module.exports = Widget
