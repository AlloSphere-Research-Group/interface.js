let Interface = {
  widgets:[],
  layoutManager:null,
  getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse'
  }
}

module.exports = Interface
