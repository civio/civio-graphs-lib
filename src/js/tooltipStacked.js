import { keys } from 'd3-collection'

import slugify from 'slugify'

import Tooltip from './tooltip'

export default class TooltipStacked extends Tooltip {
  setupLabels() {
    // get a copy of keys array to reverse it
    let keys = this.chart.data.keys.slice(0)
    keys.reverse().forEach(key => {
      this.el.append('div').attr('class', `label ${slugify(key.toLowerCase())}`)
    })
    return this
  }

  setContent(data) {
    // Set key label
    this.setLabel('x', this.chart.tooltipFormatX()(data[this.chart.key]))
    // Set other keys labels
    this.chart.data.keys.forEach(key => {
      this.setLabel(
        slugify(key.toLowerCase()),
        this.chart.tooltipFormatY()(data[key]),
        data[key] > 0 // show/hide label based on value
      )
    })
  }

  setPosition(dataX) {
    const { x, y } = this.chart.getDataPosition(dataX)
    // set x position
    this.setPositionX(
      x,
      this.config.align !== 'auto'
        ? this.config.align
        : x > this.chart.width / 2
        ? 'right'
        : 'left'
    )
    // set y position for each key label
    keys(y).forEach(key => {
      this.el
        .select(`.label.${key}`)
        .style('bottom', `${this.chart.height - y[key]}px`)
    })
    return this
  }
}
