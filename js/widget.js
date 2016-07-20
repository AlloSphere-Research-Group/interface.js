import Utilities from './utilities'
import Filters from './filters'
import Communication from './communication.js' 

let Widget = {
  // store all instantiated widgets
  widgets: [],

  defaults: {
    min:0, max:1,
    scaleOutput:true, // apply scale filter by default for min / max ranges
    target:null
  },

  create() {
    Object.assign( this, Widget.defaults )

    this.filters = []

    // if min/max are not 0-1 and scaling is not disabled
    if( this.scaleOutput && (this.min !== 0 || this.max !== 1 )) {      
      this.filters.push( 
        Filters.Scale( 0,1,this.min,this.max ) 
      )
    }
    
    Widget.widgets.push( this )

    return this
  },

  init() {
    if( this.target && this.target === 'osc' || this.target === 'midi' ) {
      Communication.init()
    }
  },
  
  output() {
    let value = this.__value

    for( let filter of this.filters ) value = filter( value )

    this.value = value
    
    if( this.target !== null ) this.transmit( this.value )
  
    return this.value
  },

  transmit() {
    if( this.target === 'osc' ) {
      Communication.OSC.send( this.address, this.value )
    }
  }
}

export default Widget
