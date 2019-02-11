import { bisector, extent } from 'd3-array'
import { axisLeft, axisBottom } from 'd3-axis'
import { formatLocale } from 'd3-format'
import { scaleLinear, scaleTime } from 'd3-scale'
import { select } from 'd3-selection'
import { timeYear } from 'd3-time'
import { timeFormatLocale } from 'd3-time-format'

import { debounce, defaultsDeep } from 'lodash'

import Tooltip from './tooltip'
import { formatDefaultLocale, timeFormatDefaultLocale } from './locales'

const configDefaults = {
  // we can define an aspectRatio to calculate height or define a fixed height
  aspectRatio: 2,
  height: null,
  lang: 'es',
  margin: {
    top: 0,
    right: 0,
    left: 0,
    bottom: 0
  },
  axis: {
    x: true,
    y: true
  },
  tooltip: true
}

export default class Chart {
  constructor(selector, config) {
    // Select chart container
    this.el = select(selector)
    // Launch error if no selector found
    if (this.el.size() === 0)
      throw new Error(`Can't find root element ${selector}`)
    // Set element class
    this.el.attr('class', this.chartClass())
    // Setup config object
    this.config = defaultsDeep(config, configDefaults)
    this.width = 0
    this.setChart()
    this.setFormatLocale()
  }

  setChart() {
    this.chart = this.el.append('svg')
    return this
  }

  setup(data) {
    this.setData(data)
    this.onResize()
    this.setScales()
    this.setAxis()
    this.setRenderer()
    if (this.config.tooltip) this.setTooltip()
    return this
  }

  setData(data) {
    this.data = data
  }

  // Set scales
  setScales() {
    // setup x scale
    this.scaleX = this.getScaleX()
      .domain(this.scaleXDomain())
      .range(this.scaleXRange())
    // setup y scale
    this.scaleY = this.getScaleY()
      .domain(this.scaleYDomain())
      .nice()
      .range(this.scaleYRange())
    // bisector for tooltip data & position
    this.bisector = bisector(this.x).left
    return this
  }

  // Set axis
  setAxis() {
    // Set x axis
    if (this.config.axis.x) {
      this.axisX = g =>
        g
          .attr('class', 'x axis')
          .attr(
            'transform',
            `translate(0,${this.height - this.config.margin.bottom})`
          )
          .call(this.axisRendererX())
          .call(g =>
            g
              .selectAll('.tick line')
              .attr(
                'y1',
                -this.height +
                  this.config.margin.top +
                  this.config.margin.bottom
              )
              .attr('y2', 0)
          )
    }
    // Set y axis
    if (this.config.axis.y) {
      this.axisY = g =>
        g
          .attr('class', 'y axis')
          .attr('transform', `translate(${this.config.margin.left},0)`)
          .call(this.axisRendererY())
          .call(g =>
            g
              .selectAll('.tick line')
              .attr('x1', 0)
              .attr(
                'x2',
                this.width - this.config.margin.left - this.config.margin.right
              )
          )
    }
    return this
  }

  // Set chart renderer (line, area...)
  setRenderer() {
    return this
  }

  setTooltip() {
    this.tooltip = new Tooltip(this)
  }

  // Render chart based on data
  render() {
    if (this.config.axis.x) {
      this.chart.append('g').call(this.axisX)
    }
    if (this.config.axis.y) {
      this.chart.append('g').call(this.axisY)
    }
    if (this.tooltip) this.tooltip.render()
    this.setResize()
    return this
  }

  // Clear chart
  clear() {
    if (this.config.axis.x || this.config.axis.y)
      this.chart.selectAll('g').remove()
  }

  // Set resize event listener
  setResize() {
    window.addEventListener('resize', debounce(() => this.onResize(), 150))
    return this
  }

  // Resize event handler
  onResize() {
    let currentWidth = this.el.node().offsetWidth
    if (currentWidth !== this.width) {
      this.width = currentWidth
      // force height if defined in config, otherwise use aspectRatio
      this.height = this.config.height
        ? this.config.height
        : Math.round(this.width / this.config.aspectRatio)
      this.resize()
    }
  }

  // Resize chart
  resize() {
    // Resize chart
    this.chart.attr('width', this.width).attr('height', this.height)
    // Resize scales range
    if (this.scaleX) this.scaleX.range(this.scaleXRange())
    if (this.scaleY) this.scaleY.range(this.scaleYRange())
    // Resize axis
    if (this.axisX) this.chart.select('.x.axis').call(this.axisX)
    if (this.axisY) this.chart.select('.y.axis').call(this.axisY)
    return this
  }

  // Set format locales
  setFormatLocale() {
    // Set formatDefaultLocale & timeFormatDefaultLocale based on config.lang
    this.formatLocale = formatLocale(formatDefaultLocale[this.config.lang])
    this.timeFormatLocale = timeFormatLocale(
      timeFormatDefaultLocale[this.config.lang]
    )
  }

  // setup format from formatLocale
  format(specifier) {
    return this.formatLocale.format(specifier)
  }

  // setup timeFormat from timeFormatLocale
  timeFormat(specifier) {
    return this.timeFormatLocale.format(specifier)
  }

  // Getters/Setters

  // Root element class
  chartClass() {
    return 'chart'
  }

  // Set data accesors
  x(d) {
    return d.date
  }
  y(d) {
    return d.value
  }

  // Setup axis renderers & formats
  axisRendererX() {
    return axisBottom(this.scaleX)
      .tickSizeOuter(0)
      .tickFormat(this.axisFormatX())
      .ticks(timeYear)
  }
  axisRendererY() {
    return axisLeft(this.scaleY)
      .tickFormat(this.axisFormatY())
      .ticks(this.height / 80)
  }
  axisFormatX() {
    return this.timeFormat('%Y')
  }
  axisFormatY() {
    return this.format(',d')
  }

  // tooltip formats
  tooltipFormatX() {
    return this.timeFormat(
      this.config.lang === 'es' ? '%d %B, %Y' : '%B %d, %Y'
    )
  }
  tooltipFormatY() {
    return this.format('$,d')
  }

  // Get scales
  getScaleX() {
    return scaleTime()
  }
  getScaleY() {
    return scaleLinear()
  }

  // Get scale domains
  scaleXDomain() {
    return [this.x(this.data[0]), this.x(this.data[this.data.length - 1])]
  }
  scaleYDomain() {
    return extent(this.data, this.y)
  }

  // Get scale ranges
  scaleXRange() {
    return [this.config.margin.left, this.width - this.config.margin.right]
  }
  scaleYRange() {
    return [this.height - this.config.margin.bottom, this.config.margin.top]
  }

  // Tooltip data for a mouse position
  getMouseData(x) {
    // get mouse position
    const mouseX = this.scaleX.invert(x)
    // calculate current data
    const i = this.bisector(this.data, mouseX, 1)
    const d0 = this.data[i - 1]
    const d1 = this.data[i]
    return d1 && mouseX - this.x(d0) > this.x(d1) - mouseX ? d1 : d0
  }

  // Tooltip position for a given data
  getDataPosition(data) {
    // get data position for current date
    const i = this.bisector(this.data, this.x(data))
    const d =
      i < this.data.length ? this.data[i] : this.data[this.data.length - 1]
    return {
      x: this.scaleX(this.x(d)),
      y: this.scaleY(this.y(d))
    }
  }

  // Mouse over chart highlight
  highlight() {
    return this
  }
}
