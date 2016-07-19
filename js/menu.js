let Widget = require( './widget.js' ),
    Utilities = require( './utilities.js' ),
    DOMWidget = require( './domWidget.js' ),
    Menu = Object.create( DOMWidget ) 

Object.assign( Menu, {

  defaults: {
    __value:0,
    value:0,
    background:'#333',
    fill:'#777',
    stroke:'#aaa',
    borderWidth:4,
    options:[],
    onvaluechange:null
  },
  
  create( props ) {
    let menu = Object.create( this )
    
    DOMWidget.init.call( menu )

    Object.assign( menu, Menu.defaults, props )

    menu.createOptions()

    menu.element.addEventListener( 'change', ( e )=> {
      menu.value = e.target.value
      if( menu.onvaluechange !== null ) {
        menu.onvaluechange( menu.value  )
      }
    })

    return menu
  },

  createElement() {
    let select = document.createElement( 'select' )

    return select
  },

  createOptions() {
    for( let option of this.options ) {
      let optionEl = document.createElement( 'option' )
      optionEl.setAttribute( 'value', option )
      optionEl.innerText = option
      this.element.appendChild( optionEl )
    }
  },

  __addToPanel( panel ) {
    this.container = panel

    if( typeof this.addEvents === 'function' ) this.addEvents()

    // called if widget uses DOMWidget as prototype; .place inherited from DOMWidget
    this.place() 
  }

})

module.exports = Menu
