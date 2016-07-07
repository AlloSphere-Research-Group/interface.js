(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.interface = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// Everything we need to include goes here and is fed to browserify in the gulpfile.js
var lib = {
  Interface: require('./interface.js'),
  Panel: require('./panel.js'),
  Slider: require('./slider.js')
};

module.exports = lib;

},{"./interface.js":2,"./panel.js":3,"./slider.js":4}],2:[function(require,module,exports){
"use strict";

var Interface = {
  widgets: [],
  layoutManager: null
};

module.exports = Interface;

},{}],3:[function(require,module,exports){
'use strict';

var gui = require('./interface.js');

module.exports = {
  panel: 'hooray'
};

},{"./interface.js":2}],4:[function(require,module,exports){
'use strict';

var gui = require('./interface.js');

module.exports = {
  slider: 'hooray'
};

},{"./interface.js":2}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL2ludGVyZmFjZS5qcyIsImpzL3BhbmVsLmpzIiwianMvc2xpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FDQ0EsSUFBSSxNQUFNO0FBQ1IsYUFBVyxRQUFTLGdCQUFULENBREg7QUFFUixTQUFPLFFBQVMsWUFBVCxDQUZDO0FBR1IsVUFBUSxRQUFTLGFBQVQ7QUFIQSxDQUFWOztBQU1BLE9BQU8sT0FBUCxHQUFpQixHQUFqQjs7Ozs7QUNQQSxJQUFJLFlBQVk7QUFDZCxXQUFRLEVBRE07QUFFZCxpQkFBYztBQUZBLENBQWhCOztBQUtBLE9BQU8sT0FBUCxHQUFpQixTQUFqQjs7Ozs7QUNMQSxJQUFJLE1BQU0sUUFBUyxnQkFBVCxDQUFWOztBQUVBLE9BQU8sT0FBUCxHQUFpQjtBQUNmLFNBQU07QUFEUyxDQUFqQjs7Ozs7QUNGQSxJQUFJLE1BQU8sUUFBUyxnQkFBVCxDQUFYOztBQUVBLE9BQU8sT0FBUCxHQUFpQjtBQUNmLFVBQU87QUFEUSxDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBFdmVyeXRoaW5nIHdlIG5lZWQgdG8gaW5jbHVkZSBnb2VzIGhlcmUgYW5kIGlzIGZlZCB0byBicm93c2VyaWZ5IGluIHRoZSBndWxwZmlsZS5qc1xubGV0IGxpYiA9IHtcbiAgSW50ZXJmYWNlOiByZXF1aXJlKCAnLi9pbnRlcmZhY2UuanMnICksXG4gIFBhbmVsOiByZXF1aXJlKCAnLi9wYW5lbC5qcycgKSxcbiAgU2xpZGVyOiByZXF1aXJlKCAnLi9zbGlkZXIuanMnIClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaWJcbiIsImxldCBJbnRlcmZhY2UgPSB7XG4gIHdpZGdldHM6W10sXG4gIGxheW91dE1hbmFnZXI6bnVsbFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyZmFjZVxuIiwibGV0IGd1aSA9IHJlcXVpcmUoICcuL2ludGVyZmFjZS5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcGFuZWw6J2hvb3JheSdcbn1cbiIsImxldCBndWkgID0gcmVxdWlyZSggJy4vaW50ZXJmYWNlLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzbGlkZXI6J2hvb3JheSdcbn1cbiJdfQ==
