let Utilities = require( './utilities.js' ),
    Filters = require( './filters.js' )

let Widget = {

  defaults: {
    min:0, max:1,
    scaleOutput:true, // apply scale filter by default for min / max ranges
  },

  init() {
    Object.assign( this, Widget.defaults )

    this.filters = []

    // if min/max are not 0-1 and scaling is not disabled
    if( this.scaleOutput && (this.min !== 0 || this.max !== 1 )) {      
      this.filters.push( 
        Filters.Scale( 0,1,this.min,this.max ) 
      )
    }
    
    return this
  },
  
  calculateOutput() {
    let value = this.__value

    for( let filter of this.filters ) value = filter( value )

    this.value = value
    
    return this.value
  },


}

module.exports = Widget
