import CanvasWidget from './canvasWidget.js'

/**
 * A horizontal or vertical fader. 
 * @module Slider
 * @augments CanvasWidget
 */ 

let Joystick = Object.create( CanvasWidget ) 

Object.assign( Joystick, {
  /** @lends Slider.prototype */

  /**
   * A set of default property settings for all Slider instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Slider
   * @static
   */  
  defaults: {
    __value:.5, // always 0-1, not for end-users
    value:.5,   // end-user value that may be filtered
    active: false,
  },

  /**
   * Create a new Slider instance.
   * @memberof Slider
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize Slider with.
   * @static
   */
  create( props ) {
    let joystick = Object.create( this )
    
    // apply Widget defaults, then overwrite (if applicable) with Slider defaults
    CanvasWidget.create.call( joystick )

    // ...and then finally override with user defaults
    Object.assign( joystick, Joystick.defaults, props )

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if( props.value ) joystick.__value = props.value
    
    // inherits from Widget
    joystick.init()

    return joystick
  },

  /**
   * Draw the Slider onto its canvas context using the current .__value property.
   * @memberof Slider
   * @instance
   */
  draw() {
    // draw background
    this.ctx.fillStyle   = this.background
    this.ctx.strokeStyle = this.stroke
    this.ctx.lineWidth = this.lineWidth
    this.ctx.fillRect( 0,0, this.rect.width, this.rect.height )

    // draw fill (slider value representation)
    this.ctx.fillStyle = this.fill

    this.ctx.beginPath();
    this.ctx.moveTo(this.rect.width*0.5,this.rect.height*.5);
    this.ctx.lineTo(this.rect.width *this.__value, this.rect.height * this.__value);
    this.ctx.stroke();
    this.ctx.fillRect( this.rect.width * this.__value -12, this.rect.height * this.__value -12, 24, 24 )

    this.ctx.strokeRect( 0,0, this.rect.width, this.rect.height )
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
        this.__value = .5
        this.output()
        this.draw()
      }
    },

    pointermove( e ) {
      if( this.active && e.pointerId === this.pointerId ) {
        this.processPointerPosition( e )
      }
    },
  },
  
  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the Slider's position, and triggers output.
   * @instance
   * @memberof Slider
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition( e ) {

    this.__value = ( e.clientX - this.rect.left ) / this.rect.width
//    this.__value[1] = 1 - ( e.clientY - this.rect.top  ) / this.rect.height 
    

    // clamp __value, which is only used internally
    if( this.__value > 1 ) this.__value = 1
    if( this.__value < 0 ) this.__value = 0

    let shouldDraw = this.output()
    
    if( shouldDraw ) this.draw()
  },

})

module.exports = Joystick
