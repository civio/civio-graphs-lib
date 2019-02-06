import { event } from 'd3-selection'

import { defaults } from 'lodash'

const configDefaults = {
  point: false,
  align: 'auto', // auto | center | left | right
  valign: 'top', // top | bottom
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
    this.setupElement()
    // append labels to tooltip element
    this.setupLabels()
    return this
  }

  setupElement() {
    this.el = this.chart.el
      .append('div')
      .attr('class', this.config.background ? 'tooltip tooltip-bkg' : 'tooltip')
    return this
  }

  setupLabels() {
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

  setContent(data) {
    // Set x & y labels
    this.setLabel('x', this.chart.tooltipFormatX()(this.chart.x(data)))
    this.setLabel('y', this.chart.tooltipFormatY()(this.chart.y(data)))
    return this
  }

  setLabel(selector, data, show = null) {
    this.el.select(`.label.${selector}`).html(data)
    // show/hide label
    if (show !== null)
      this.el.select(`.label.${selector}`).style('opacity', show ? 1 : 0)
    return this
  }

  setPosition(dataX) {
    const { x, y } = this.chart.getDataPosition(dataX)
    // set point position
    if (this.point) this.point.attr('transform', `translate(${x}, ${y})`)
    // set x position
    this.setPositionX(
      x,
      this.config.align !== 'auto'
        ? this.config.align
        : x > this.chart.width / 2
        ? 'right'
        : 'left'
    )
    // set y position
    this.setPositionY(y, this.config.valign)
    return this
  }

  setPositionX(x, align) {
    if (align === 'left') {
      this.el
        .style('left', `${x}px`)
        .style('right', 'auto')
        .classed('right', false)
    } else if (align === 'right') {
      this.el
        .style('right', `${this.chart.width - x}px`)
        .style('left', 'auto')
        .classed('right', true)
    } else if (align === 'center') {
      this.el
        .style(
          'left',
          `${x - this.el.node().getBoundingClientRect().width / 2}px`
        )
        .classed('center', true)
    }
  }

  setPositionY(y, align) {
    if (align === 'top') {
      this.el.style('top', `${y}px`)
    } else if (align === 'bottom') {
      this.el.style('bottom', `${this.chart.height - y}px`)
    }
  }

  onMouseMove() {
    // get current data by mouse position
    const d = this.chart.getMouseData(event.layerX)
    if (this.currentData !== d) {
      this.currentData = d
      // set tooltip content
      this.setContent(this.currentData)
      // set tooltip position
      this.setPosition(this.currentData)
      // highlight current item in chart
      this.chart.highlight(this.currentData)
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
    // clear highlighted item in chart
    this.chart.highlight(null)
    // clear current data
    this.currentData = null
    return this
  }
}
