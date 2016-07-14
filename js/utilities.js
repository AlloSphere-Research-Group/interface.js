let Utilities = {

  getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse'
  },

  createCanvas() {
    let element = document.createElement( 'canvas' )
    element.setAttribute( 'touch-action', 'none' )
    element.style.position = 'absolute'
    element.style.display  = 'block'
    
    return element
  },
}

module.exports = Utilities
