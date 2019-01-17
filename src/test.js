import * as d3 from 'd3'

export default class {

  constructor (selector) {
    // Select chart container
    this.el = d3.select(selector)
    this.el.append('svg')
  }
}