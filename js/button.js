import CanvasWidget from './canvasWidget'

/**
 * A Button with three different styles: 'momentary' triggers a flash and instaneous output, 
 * 'hold' outputs the buttons maximum value until it is released, and 'toggle' alternates 
 * between outputting maximum and minimum values on press. 
 * 
 * @module Button
 * @augments CanvasWidget
 */ 

let Button = Object.create( CanvasWidget )

Object.assign( Button, {

  /** @lends Button.prototype */

  /**
   * A set of default property settings for all Button instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Button
   * @static
   */  
  defaults: {
    __value:0,
    value:0,
    active: false,

    /**
     * The style property can be 'momentary', 'hold', or 'toggle'. This
     * determines the interaction of the Button instance.
     * @memberof Button
     * @instance
     * @type {String}
     */
    style:  'toggle'
  },

  /**
   * Create a new Button instance.
   * @memberof Button
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize a Button instance with.
   * @static
   */
  create( props ) {
    let button = Object.create( this )
    
    CanvasWidget.create.call( button )

    Object.assign( button, Button.defaults, props )

    if( props.value ) button.__value = props.value

    return button
  },

  /**
   * Draw the Button into its canvas context using the current .__value property and button style.
   * @memberof Button
   * @instance
   */
  draw() {
    this.ctx.fillStyle   = this.__value === 1 ? this.fill : this.background
    this.ctx.strokeStyle = this.stroke
    this.ctx.lineWidth = this.lineWidth
    this.ctx.fillRect( 0,0, this.rect.width, this.rect.height )

    this.ctx.strokeRect( 0,0, this.rect.width, this.rect.height )
  },

  addEvents() {
    for( let key in this.events ) {
      this[ key ] = this.events[ key ].bind( this ) 
    }

    this.element.addEventListener( 'pointerdown',  this.pointerdown )
  },

  events: {
    pointerdown( e ) {
      // only hold needs to listen for pointerup events; toggle and momentary only care about pointerdown
      if( this.style === 'hold' ) {
        this.active = true
        this.pointerId = e.pointerId
        window.addEventListener( 'pointerup', this.pointerup ) 
      }

      if( this.style === 'toggle' ) {
        this.__value = this.__value === 1 ? 0 : 1
      }else if( this.style === 'momentary' ) {
        this.__value = 1
        setTimeout( ()=> { this.__value = 0; this.draw() }, 50 )
      }else if( this.style === 'hold' ) {
        this.__value = 1
      }
      
      this.output()

      this.draw()
    },

    pointerup( e ) {
      if( this.active && e.pointerId === this.pointerId && this.style === 'hold' ) {
        this.active = false
        
        window.removeEventListener( 'pointerup',   this.pointerup )

        this.__value = 0
        this.output()

        this.draw()
      }
    }
  }
})

export default Button
