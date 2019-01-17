import * as d3 from 'd3'

export default class Test {

  constructor (selector) {
    this.el = d3.select(selector)
    this.el.append('svg')
  }
}