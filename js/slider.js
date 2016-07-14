let Widget = require( './widget.js' ),
    Utilities = require( './utilities.js' ),
    CanvasWidget = require( './canvasWidget.js' ),
    Slider = Object.create( CanvasWidget ) 

Object.assign( Slider, {

  // defaults are assigned to each widget, but can be overridden by
  // user-defined properties passed to constructor
  defaults: {
    __value:.5, // always 0-1, not for end-users
    value:.5,   // end-user value that may be filtered
    background:'#003',
    fill:'#007',
    stroke:'#00f',
    borderWidth:8,
    active: false,
    style:  'horizontal'
  },
  
  create( props, container = window ) {
    let slider = Object.create( this )
    
    CanvasWidget.init.call( slider, container )
    // apply Widget defaults, then overwrite (if applicable) with Slider defaults
    // and then finally override with user defaults

    console.log( "props", props ) 
    Object.assign( slider, Slider.defaults, props )
    console.log( 'slider', slider.x, slider.y, slider.width, slider.height ) 

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if( props.value ) slider.__value = props.value
      
    // register event handlers
    slider.addEvents()
    slider.place() // inherited from DOMWidget
    slider.draw()    

    return slider
  },

  draw() {
    // draw background
    this.ctx.fillStyle   = this.background
    this.ctx.strokeStyle = this.stroke
    this.ctx.lineWidth = this.borderWidth
    this.ctx.fillRect( 0,0, this.__width, this.__height )

    // draw fill (slider value representation)
    this.ctx.fillStyle = this.fill

    if( this.style === 'horizontal' )
      this.ctx.fillRect( 0, 0, this.__width * this.__value, this.__height )
    else
      this.ctx.fillRect( 0, this.__height - this.__value * this.__height, this.__width, this.__height * this.__value )

    this.ctx.strokeRect( 0,0, this.__width, this.__height )
  },

  addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for( let key in this.events ) {
      this[ key ] = this.events[ key ].bind( this ) 
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener( 'pointerdown',  this.pointerdown )
  },

  events: {
    pointerdown( e ) {
      this.active = true
      this.pointerId = e.pointerId

      this.processPointerPosition( e ) // change slider value on click / touchdown

      window.addEventListener( 'pointermove', this.pointermove ) // only listen for up and move events after pointerdown 
      window.addEventListener( 'pointerup',   this.pointerup ) 
    },

    pointerup( e ) {
      if( this.active && e.pointerId === this.pointerId ) {
        this.active = false
        window.removeEventListener( 'pointermove', this.pointermove ) 
        window.removeEventListener( 'pointerup',   this.pointerup ) 
      }
    },

    pointermove( e ) {
      if( this.active && e.pointerId === this.pointerId ) this.processPointerPosition( e )
    },
  },

  processPointerPosition( e ) {
    let prevValue = this.value

    if( this.style === 'horizontal' ) {
      this.__value = ( e.clientX - this.rect.left ) / this.__width
    }else{
      this.__value = 1 - ( e.clientY - this.rect.top  ) / this.__height  
    }

    // clamp __value, which is only used internally
    if( this.__value > 1 ) this.__value = 1
    if( this.__value < 0 ) this.__value = 0

    this.calculateOutput()

    if( prevValue !== this.value ){
      this.draw()

      // (potentially) user-defined event for value changes      
      if( typeof this.onvaluechange === 'function' ) {
        this.onvaluechange( this.value, prevValue )
      }
    }
  },

})

module.exports = Slider
