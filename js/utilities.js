let Utilities = {

  getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse'
  },


}

module.exports = Utilities
