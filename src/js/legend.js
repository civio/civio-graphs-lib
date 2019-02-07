import { select } from 'd3-selection'

import slugify from 'slugify'

export default class Legend {
  constructor(selector) {
    // Select legend container
    this.el = select(selector)
      .append('div')
      .attr('class', 'legend')
  }

  setup(data, colors) {
    // append labels to legend element
    // get a copy of keys array to reverse it
    data.forEach(key => {
      this.el
        .append('div')
        .attr('class', `legend-label ${slugify(key.toLowerCase())}`)
        .html(`<span style="background: ${colors(key)}"></span> ${key}`)
    })
    return this
  }
}
