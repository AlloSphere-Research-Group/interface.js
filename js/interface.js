let Interface = {
  widgets:[],
  layoutManager:null,
  getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse'
  },
  Filters: require('./filters.js')
}

module.exports = Interface
