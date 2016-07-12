let Panel = {
  defaults: {
    fullscreen:false
  },

  create( props = null ) {
    let panel = Object.create( this )
    
    // default: full window interface
    if( props === null ) {
        
      Object.assign( panel, Panel.defaults, {
        x:0,
        y:0,
        width:1,
        height:1,
        __x: 0,
        __y: 0,
        __width: null,
        __height:null,
        fullscreen: true,
        children: []
      })
      
      panel.div = Panel.__createHTMLElement()
      panel.layout()

      let body = document.querySelector( 'body' )
      body.appendChild( panel.div )
    }

    return panel
  },
  
  __createHTMLElement() {
    let div = document.createElement( 'div' )
    div.style.position = 'absolute'
    div.style.display  = 'block'
    
    return div
  },

  layout() {
    if( this.fullscreen ) {
      this.__width  = window.innerWidth
      this.__height = window.innerHeight
      this.__x      = this.x * this.__width
      this.__y      = this.y * this.__height

      this.div.style.width  = this.__width + 'px'
      this.div.style.height = this.__height + 'px'
      this.div.style.left   = this.__x + 'px'
      this.div.style.top    = this.__y + 'px'
    }
  },

  getWidth()  { return this.__width },
  getHeight() { return this.__height },

  add( widget ) {
    // check to make sure widget has not been already added
    if( this.children.indexOf( widget ) === -1 ) {
      this.div.appendChild( widget.canvas )
      this.children.push( widget )
    }else{
      throw Error( 'Widget is already added to panel.' )
    }
  },
}


module.exports = Panel 
