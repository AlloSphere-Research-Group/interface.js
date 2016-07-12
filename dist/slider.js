'use strict';

var Widget = require('./widget.js'),
    Slider = Object.create(Widget);

// flexible targeting(?) system
// theming?
// unit tests

Object.assign(Slider, {

  // defaults are assigned to each widget, but can be overridden by
  // user-defined properties passed to constructor
  defaults: {
    __value: .5, // always 0-1, not for end-users
    value: .5, // end-user value that may be filtered
    background: 'black',
    fill: 'grey',
    active: false,
    style: 'horizontal'
  },

  create: function create(props) {
    var container = arguments.length <= 1 || arguments[1] === undefined ? window : arguments[1];

    var slider = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with Slider defaults
    // and then finally override with user defaults
    Object.assign(slider, Widget.defaults, Slider.defaults, props);

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) slider.__value = props.value;

    // inherited from widget, places canvas obj on screen
    slider.init(container);

    // register event handlers
    slider.addEvents();

    return slider;
  },
  addEvents: function addEvents() {
    // only listen for mousedown intially; mousemove and mouseup are registered
    // on mousedown
    this.canvas.addEventListener('mousedown', this.__mousedown.bind(this));

    // bind event handlers to slider instance
    this.__mousemove = this.__mousemove.bind(this);
    this.__mouseup = this.__mouseup.bind(this);
  },
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.background;
    this.ctx.fillRect(0, 0, this.__width, this.__height);

    // draw fill (slider value representation)
    this.ctx.fillStyle = this.fill;

    if (this.style === 'horizontal') this.ctx.fillRect(0, 0, this.__width * this.__value, this.__height);else this.ctx.fillRect(0, this.__height - this.__value * this.__height, this.__width, this.__height * this.__value);
  },
  __mousedown: function __mousedown(e) {
    this.active = true;
    window.addEventListener('mousemove', this.__mousemove);
    window.addEventListener('mouseup', this.__mouseup);
  },
  __mouseup: function __mouseup(e) {
    this.active = false;
    window.removeEventListener('mousemove', this.__mousemove);
    window.removeEventListener('mouseup', this.__mouseup);
  },
  __mousemove: function __mousemove(e) {
    if (this.active) {
      var prevValue = this.value;

      if (this.style === 'horizontal') {
        this.__value = (e.clientX - this.rect.left) / this.__width;
      } else {
        this.__value = 1 - (e.clientY - this.rect.top) / this.__height;
      }

      if (this.__value > 1) this.__value = 1;
      if (this.__value < 0) this.__value = 0;

      this.calculateOutput();

      if (prevValue !== this.value) {
        if (typeof this.onvaluechange === 'function') {
          this.onvaluechange(this.value, prevValue);
          this.draw();
        }
      }
    }
  }
});

module.exports = Slider;