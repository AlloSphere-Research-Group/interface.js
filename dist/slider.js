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
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.background;
    this.ctx.fillRect(0, 0, this.__width, this.__height);

    // draw fill (slider value representation)
    this.ctx.fillStyle = this.fill;

    if (this.style === 'horizontal') this.ctx.fillRect(0, 0, this.__width * this.__value, this.__height);else this.ctx.fillRect(0, this.__height - this.__value * this.__height, this.__width, this.__height * this.__value);
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.canvas.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      this.active = true;
      this.pointerId = e.pointerId;

      this.processPointerPosition(e); // change slider value on click / touchdown

      window.addEventListener('pointermove', this.pointermove); // only listen for up and move events after pointerdown
      window.addEventListener('pointerup', this.pointerup);
    },
    pointerup: function pointerup(e) {
      this.active = false;
      window.removeEventListener('pointermove', this.pointermove);
      window.removeEventListener('pointerup', this.pointerup);
    },
    pointermove: function pointermove(e) {
      if (this.active && e.pointerId === this.pointerId) this.processPointerPosition(e);
    }
  },

  processPointerPosition: function processPointerPosition(e) {
    var prevValue = this.value;

    if (this.style === 'horizontal') {
      this.__value = (e.clientX - this.rect.left) / this.__width;
    } else {
      this.__value = 1 - (e.clientY - this.rect.top) / this.__height;
    }

    // clamp __value, which is only used internally
    if (this.__value > 1) this.__value = 1;
    if (this.__value < 0) this.__value = 0;

    this.calculateOutput();

    if (prevValue !== this.value) {
      this.draw();

      // (potentially) user-defined event for value changes     
      if (typeof this.onvaluechange === 'function') {
        this.onvaluechange(this.value, prevValue);
      }
    }
  }
});

module.exports = Slider;