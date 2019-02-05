import { event } from 'd3-selection'

import { defaults } from 'lodash'

const configDefaults = {
  point: false,
  align: true,
  background: false
}

export default class Tooltip {
  constructor(_chart, config) {
    this.chart = _chart
    // Setup config object
    this.config = defaults(config, configDefaults)
    // Setup tooltip markup
    this.setup()
  }

  setup() {
    // append tooltip element to chart container
    this.el = this.chart.el.append('div').attr('class', 'tooltip')
    // append labels to tooltip element
    this.el.append('div').attr('class', 'label x')
    this.el.append('div').attr('class', 'label y')
    return this
  }

  render() {
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
    // Set x & y labels
    this.setLabel('x', this.chart.tooltipFormatX()(this.chart.x(data)))
    this.setLabel('y', this.chart.tooltipFormatY()(this.chart.y(data)))
    return this
  }

  setLabel(selector, data) {
    this.el.select(`.label.${selector}`).html(data)
    return this
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
