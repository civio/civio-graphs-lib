import {select} from 'd3-selection'

export default class {

  constructor (selector) {
    // Select chart container
    this.el = select(selector)
    this.el.append('svg')
  }
}