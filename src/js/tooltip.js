import { event } from 'd3-selection'

import { defaults } from 'lodash'

const configDefaults = {
  // we can define an aspectRatio to calculate height or define a fixed height
  point: false,
  align: true,
  background: false
}

export default class Tooltip {
  constructor(_chart, config) {
    this.chart = _chart
    // get tooltip element from chart container
    this.el = this.chart.el.select('.tooltip')
    if (this.el.empty()) return null
    // Setup config object
    this.config = defaults(config, configDefaults)
  }

  render() {
    if (!this.el.empty()) {
      // Setup chart point
      if (this.config.point) {
        this.point = this.chart.chart
          .append('circle')
          .attr('class', 'tooltip-point')
          .attr('display', 'none')
          .attr('r', 4)
      }
      // Set mouse events
      this.chart.chart
        .on('mousemove', this.onMouseMove.bind(this))
        .on('mouseenter', this.onMouseEnter.bind(this))
        .on('mouseleave', this.onMouseLeave.bind(this))
    }
    return this
  }

  show() {
    // show tooltip element & point
    this.el.style('opacity', 1)
    if (this.point) this.point.attr('display', null)
    return this
  }

  hide() {
    // hide tooltip element & point
    this.el.style('opacity', 0)
    if (this.point) this.point.attr('display', 'none')
    return this
  }

  setPosition(dataX) {
    const { x, y } = this.chart.getDataPosition(dataX)
    // set point position
    if (this.point) this.point.attr('transform', `translate(${x}, ${y})`)
    // set tooltip position
    this.el.style('top', `${y}px`)
    if (this.config.align) {
      const isRight = x > this.chart.width / 2
      this.el
        .style('left', isRight ? 'auto' : `${x}px`)
        .style('right', isRight ? `${this.chart.width - x}px` : 'auto')
        .classed('right', isRight)
    } else {
      this.el.style('left', `${x}px`)
    }
    return this
  }

  setContent(data) {
    // Set label x value
    this.el
      .select('.label.x')
      .html(this.chart.tooltipFormatX()(this.chart.x(data)))
    // Set label y value
    this.el
      .select('.label.y')
      .html(this.chart.tooltipFormatY()(this.chart.y(data)))
  }

  onMouseMove() {
    // get current data by mouse position
    const d = this.chart.getMouseData(event.layerX)
    if (this.currentData !== d) {
      this.currentData = d
      // set tooltip position
      this.setPosition(this.currentData)
      // set tooltip content
      this.setContent(this.currentData)
    }
    return this
  }

  onMouseEnter() {
    // show tooltip element & point
    this.show()
    return this
  }

  onMouseLeave() {
    // hide tooltip element & point
    this.hide()
    return this
  }
}
