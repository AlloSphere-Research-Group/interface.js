let gui    = require( './interface.js' ),
    Widget = require( './widget.js' ),
    Slider = Object.create( Widget ) 

// value changes can be processed by filters
// flexible targeting(?) system
// theming?
// unit tests

Object.assign( Slider, {
  defaults: {
    __value:.5, // always 0-1, not for end-users
    value:.5,   // end-user value that may be filtered
    background:'black',
    fill:'grey',
    active: false,
    style:'horizontal'
  },
  
  create( props, container = window ) {
    let slider = Object.create( this )

    Object.assign( slider, Widget.defaults, Slider.defaults, props )

    // inherited from widget, places canvas obj on screen
    slider.init( container )
    slider.draw()
    
    // bind event handlers to slider instance
    slider.__mousemove = slider.__mousemove.bind( slider )
    slider.__mouseup   = slider.__mouseup.bind( slider )

    return slider
  },

  draw() {
    // draw background
    this.ctx.fillStyle = this.background
    this.ctx.fillRect( 0,0,this.__width,  this.__height )

    // draw fill (slider value representation)
    this.ctx.fillStyle = this.fill

    if( this.style === 'horizontal' )
      this.ctx.fillRect( 0,0, this.__width * this.__value, this.__height )
    else
      this.ctx.fillRect( 0, this.__height * this.__value, this.__width, this.__height )
  },

  __mousedown( e ) { 
    this.active = true;
    window.addEventListener( 'mousemove', this.__mousemove )
    window.addEventListener( 'mouseup',   this.__mouseup )
  },

  __mouseup( e )   {
    this.active = false  
    window.removeEventListener( 'mousemove', this.__mousemove ) 
    window.removeEventListener( 'mouseup',   this.__mouseup ) 
  },

  __mousemove( e ) {
    if( this.active ) {
      let prevValue = this.__value

      if( this.style === 'horizontal' ) {
        this.__value = ( e.clientX - this.rect.left ) / this.__width
      }else{
        this.__value = ( e.clientY - this.rect.top  ) / this.__height  
      }
      
      if( this.__value > 1 ) this.__value = 1
      if( this.__value < 0 ) this.__value = 0

      if( prevValue !== this.__value ) this.draw()
    }
  },
})

module.exports = Slider
