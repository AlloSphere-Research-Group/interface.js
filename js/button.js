let Widget = require( './widget.js' ),
    Utilities = require( './utilities.js' ),
    CanvasWidget = require( './canvasWidget.js' ),
    Button = Object.create( CanvasWidget ) 

Object.assign( Button, {

  defaults: {
    __value:0,
    value:0,
    background:'#333',
    fill:'#777',
    stroke:'#aaa',
    borderWidth:4,
    active: false,
    style:  'toggle'
  },
  
  create( props, container = window ) {
    let button = Object.create( this )
    
    CanvasWidget.init.call( button, container )

    Object.assign( button, Button.defaults, props )

    if( props.value ) button.__value = props.value
      
    button.addEvents()
    button.place()
    button.draw()

    if( button.style === 'contact' ) button.flash = button.flash.bind( button ) 

    return button
  },

  draw() {
    this.ctx.fillStyle   = this.__value === 1 ? this.fill : this.background
    this.ctx.strokeStyle = this.stroke
    this.ctx.lineWidth = this.borderWidth
    this.ctx.fillRect( 0,0, this.__width, this.__height )

    this.ctx.strokeRect( 0,0, this.__width, this.__height )
  },

  addEvents() {
    for( let key in this.events ) {
      this[ key ] = this.events[ key ].bind( this ) 
    }

    this.element.addEventListener( 'pointerdown',  this.pointerdown )
  },

  flash() {
    this.__value = 0
    this.draw()
  },

  events: {
    pointerdown( e ) {
      // only hold needs to listen for pointerup events; toggle and contact only care about pointerdown
      if( this.style === 'hold' ) {
        this.active = true
        this.pointerId = e.pointerId
        window.addEventListener( 'pointerup', this.pointerup ) 
      }

      if( this.style === 'toggle' ) {
        this.__value = this.__value === 1 ? 0 : 1
      }else if( this.style === 'contact' ) {
        this.__value = 1
        setTimeout( this.flash, 50 )
      }else if( this.style === 'hold' ) {
        this.__value = 1
      }
      
      this.calculateOutput()
      if( typeof this.onvaluechange === 'function' ) this.onvaluechange( this.value ) 

      this.draw()
    },

    pointerup( e ) {
      if( this.active && e.pointerId === this.pointerId && this.style === 'hold' ) {
        this.active = false
        
        window.removeEventListener( 'pointerup',   this.pointerup )

        this.__value = 0
        this.calculateOutput()

        if( typeof this.onvaluechange === 'function' ) this.onvaluechange( this.value ) 
        this.draw()
      }
    }
  }
})

module.exports = Button
