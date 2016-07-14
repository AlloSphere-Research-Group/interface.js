let Utilities = require( './utilities.js' ),
    Widget    = require( './widget.js' ),
    DOMWidget = Object.create( Widget )

Object.assign( DOMWidget, {

  defaults: {
    x:0,y:0,width:.25,height:.25,
    attached:false,
  },

  init( container = window ) {
    let shouldUseTouch = Utilities.getMode() === 'touch'
    
    Widget.init.call( this )

    Object.assign( this, DOMWidget.defaults )

    this.container = container

    // ALL INSTANCES OF DOMWIDGET MUST IMPLEMENT CREATE ELEMENT
    if( typeof this.createElement === 'function' ) {
      this.element = this.createElement()
    }else{
      throw new Error( 'widget inheriting from DOMWidget does not implement createElement method; this is required.' )
    }
  },

  // use CSS to position element element of widget
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

    this.element.width  = width
    this.element.style.width = width + 'px'
    this.element.height = height
    this.element.style.height = height + 'px'
    this.element.style.left = x
    this.element.style.top  = y

    this.rect = this.element.getBoundingClientRect() 
  },


})

module.exports = DOMWidget
