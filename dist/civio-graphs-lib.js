(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
(factory((global['civio-graphs-lib'] = global['civio-graphs-lib'] || {}),global.d3));
}(this, (function (exports,d3) { 'use strict';

class Test {

  constructor (selector) {
    this.el = d3.select(selector);
    this.el.append('svg');
  }
}

exports.Test = Test;

Object.defineProperty(exports, '__esModule', { value: true });

})));
