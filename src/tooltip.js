import { bisector } from 'd3-array'
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
    // Setup config object
    this.config = defaults(config, configDefaults)
    return this
  }

  render() {
    // Skip if there is no tooltip element
    if (!this.el || this.el.empty()) return this
    // Setup bisectDate for mouse move
    this.bisectDate = bisector(this.chart.x).left
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
    const { x, y } = this.getPosition(dataX)
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

  setContent(x, y) {
    // Set label x value
    this.el.select('.label.x').html(this.chart.tooltipFormatX()(x))
    // Set label y value
    this.el.select('.label.y').html(this.chart.tooltipFormatY()(y))
  }

  onMouseMove() {
    // get current data by mouse position
    const d = this.getMouseData(event.layerX)
    if (this.currentData !== d) {
      this.currentData = d
      // set tooltip position
      this.setPosition(this.currentData)
      // set tooltip label
      this.setContent(
        this.chart.x(this.currentData),
        this.chart.y(this.currentData)
      )
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

  getPosition(data) {
    // get data position for current date
    const i = this.bisectDate(this.chart.data, this.chart.x(data))
    const d =
      i < this.chart.data.length
        ? this.chart.data[i]
        : this.chart.data[this.chart.data.length - 1]
    return {
      x: this.chart.scaleX(this.chart.x(d)),
      y: this.chart.scaleY(this.chart.y(d))
    }
  }

  getMouseData(x) {
    // get mouse position
    const mouseX = this.chart.scaleX.invert(x)
    // calculate current data
    const i = this.bisectDate(this.chart.data, mouseX, 1)
    const d0 = this.chart.data[i - 1]
    const d1 = this.chart.data[i]
    return d1 && mouseX - this.chart.x(d0) > this.chart.x(d1) - mouseX ? d1 : d0
  }
}
