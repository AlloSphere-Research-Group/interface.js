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
  
  __mousedown( e ) { 
    this.active = true;
    window.addEventListener( 'mousemove', this.__mousemove )
    window.addEventListener( 'mouseup', this.__mouseup )
  },

  __mouseup( e )   { 
    window.removeEventListener( 'mousemove', this.__mousemove ); 
    window.removeEventListener( 'mouseup', this.__mouseup ); 
    this.active = false 
  },

  __mousemove( e ) {
    if( this.active ) {
      this.__value = this.style === 'horizontal' ? e.offsetX / this.__width : 1 - ( e.offsetY / this.__height )
      this.draw()
    }
  },

  create( props, container = window ) {
    let slider = Object.create( this )

    Object.assign( slider, Widget.defaults, Slider.defaults, props )
    
    slider.init() // inherited from widget, places canvas obj on screen

    slider.__mousemove = slider.__mousemove.bind( slider )
    slider.__mouseup = slider.__mouseup.bind( slider )
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
      this.ctx.fillRect( 0,this.__height - (this.__height * this.__value ), this.__width, this.__height )
  },
})

module.exports = Slider
