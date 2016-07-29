import CanvasWidget from './canvasWidget'

/**
 * A MultiButton with three different styles: 'momentary' triggers a flash and instaneous output, 
 * 'hold' outputs the multiButtons maximum value until it is released, and 'toggle' alternates 
 * between outputting maximum and minimum values on press. 
 * 
 * @module MultiButton
 * @augments CanvasWidget
 */ 

let MultiButton = Object.create( CanvasWidget )

Object.assign( MultiButton, {

  /** @lends MultiButton.prototype */

  /**
   * A set of default property settings for all MultiButton instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof MultiButton
   * @static
   */  
  defaults: {
    rows:2,
    columns:2,
    lastButton:null,
    /**
     * The style property can be 'momentary', 'hold', or 'toggle'. This
     * determines the interaction of the MultiButton instance.
     * @memberof MultiButton
     * @instance
     * @type {String}
     */
    style:  'toggle'
  },

  /**
   * Create a new MultiButton instance.
   * @memberof MultiButton
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize a MultiButton instance with.
   * @static
   */
  create( props ) {
    let multiButton = Object.create( this )
    
    CanvasWidget.create.call( multiButton )

    Object.assign( multiButton, MultiButton.defaults, props )

    if( props.value ) {
      multiButton.__value = props.value
    }else{
      multiButton.__value = []
      multiButton.value = []
    }
    
    multiButton.active = {}

    multiButton.init()

    return multiButton
  },

  /**
   * Draw the MultiButton into its canvas context using the current .__value property and multiButton style.
   * @memberof MultiButton
   * @instance
   */
  draw() {
    this.ctx.fillStyle   = this.__value === 1 ? this.fill : this.background
    this.ctx.strokeStyle = this.stroke
    this.ctx.lineWidth = this.lineWidth

    let buttonWidth  = this.rect.width  / this.columns,  
        buttonHeight = this.rect.height / this.rows

    for( let row = 0; row < this.rows; row++ ) {
      let y = row * buttonHeight
      for( let column = 0; column < this.columns; column++ ) {
        let x = column * buttonWidth,
            buttonNum = row * this.columns + column

        this.ctx.fillStyle = this.__value[ buttonNum ] === 1 ? this.fill : this.background
        this.ctx.fillRect( x,y, buttonWidth, buttonHeight )
        this.ctx.strokeRect( x,y, buttonWidth, buttonHeight )
      }
    }
  },

  addEvents() {
    for( let key in this.events ) {
      this[ key ] = this.events[ key ].bind( this ) 
    }

    this.element.addEventListener( 'pointerdown',  this.pointerdown )
  },

  getButtonNumFromEvent( e ) {
    let rowSize = 1/this.rows,
        row =  Math.floor( ( e.clientY / this.rect.height ) / rowSize ),
        columnSize = 1/this.columns,
        column =  Math.floor( ( e.clientX / this.rect.width ) / columnSize ),
        buttonNum = row * this.columns + column

     return buttonNum
  },

  processButtonOn( buttonNum, e ) {
    if( this.style === 'toggle' ) {
      this.__value[ buttonNum ] = this.__value[ buttonNum ] === 1 ? 0 : 1
    }else if( this.style === 'momentary' ) {
      this.__value[ buttonNum ] = 1
      setTimeout( ()=> { 
        this.__value[ buttonNum ] = 0;
        //let idx = this.active.findIndex( v => v.buttonNum === buttonNum )
        //this.active.splice( idx, 1 )
        this.active[ e.pointerId ].splice( this.active[ e.pointerId ].indexOf( buttonNum ), 1 )
        this.draw() 
      }, 50 )
    }else if( this.style === 'hold' ) {
      this.__value[ buttonNum ] = 1
    }

    this.output()

    this.draw()
  },

  events: {
    pointerdown( e ) {
      // only hold needs to listen for pointerup events; toggle and momentary only care about pointerdown
      let buttonNum = this.getButtonNumFromEvent( e )

      this.active[ e.pointerId ] = [ buttonNum ]
      this.active[ e.pointerId ].lastButton = buttonNum

      window.addEventListener( 'pointermove', this.pointermove ) 
      window.addEventListener( 'pointerup', this.pointerup ) 

      this.processButtonOn( buttonNum, e )
    },

    pointermove( e ) {
      let buttonNum = this.getButtonNumFromEvent( e )
      
      let checkForPressed = this.active[ e.pointerId ].indexOf( buttonNum ),
          lastButton  = this.active[ e.pointerId ].lastButton
      
      if( checkForPressed === -1 && lastButton !== buttonNum ) {
        
        if( this.style === 'toggle' || this.style === 'hold' ) {
          if( this.style === 'hold' ) {
            this.__value[ lastButton ] = 0
          }
          this.active[ e.pointerId ] = [ buttonNum ]
        }else{
          this.active[ e.pointerId ].push( buttonNum )
        }
        this.active[ e.pointerId ].lastButton = buttonNum

        this.processButtonOn( buttonNum, e )
      }
    },

    pointerup( e ) {
      if( Object.keys( this.active ).length ) {
        window.removeEventListener( 'pointerup',   this.pointerup )
        window.removeEventListener( 'pointermove', this.pointermove )

        if( this.style !== 'toggle' ) {
          let buttonsForPointer = this.active[ e.pointerId ]

          if( buttonsForPointer !== undefined ) {
            for( let button of buttonsForPointer ) {
              this.__value[ button ] = 0
            }

            delete this.active[ e.pointerId ]

            this.output()

            this.draw()
          }
        }
      }
    }
  }
})

export default MultiButton
