import { scaleBand, scaleQuantize } from 'd3-scale'

import slugify from 'slugify'

import Chart from './chart'
import Tooltip from './tooltip'

export default class BarVerticalChart extends Chart {
  setTooltip() {
    this.tooltip = new Tooltip(this, {
      align: false
    })
  }
  // Set scales
  setScales() {
    super.setScales()
    this.scaleX.padding(this.scaleXPadding())
    // custom invert function for scaleBand
    // https://bl.ocks.org/shimizu/808e0f5cadb6a63f28bb00082dc8fe3f
    this.scaleXInvert = scaleQuantize()
      .domain(this.scaleX.range())
      .range(this.scaleX.domain())
    this.scaleX.invert = x => this.scaleXInvert(x)
    return this
  }

  // Render chart
  render() {
    super.render()
    this.renderBars()
    return this
  }

  // Render chart bars
  renderBars() {
    this.bars = this.chart
      .selectAll('rect')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('class', this.barClass.bind(this))
      .call(this.setBarDimensions.bind(this))
    return this
  }

  // Set bars dimensions
  setBarDimensions(el) {
    el.attr('x', d => this.scaleX(this.x(d)))
      .attr('y', d => this.scaleY(this.y(d)))
      .attr(
        'height',
        d => this.scaleY(this.scaleY.domain()[0]) - this.scaleY(this.y(d))
      )
      .attr('width', this.scaleX.bandwidth())
  }

  // Clear chart
  clear() {
    super.clear()
    // Remove paths
    this.chart.selectAll('rect').remove()
    return this
  }

  // Resize chart
  resize() {
    super.resize()
    // update scaleXInvert domain
    if (this.scaleXInvert) this.scaleXInvert.domain(this.scaleX.range())
    // Update line path
    if (this.bars) this.bars.call(this.setBarDimensions.bind(this))
    return this
  }

  // Root element class
  chartClass() {
    return 'chart chart-bar-vertical'
  }

  // Clear axis x format
  axisFormatX() {
    return null
  }

  // tooltip formats
  tooltipFormatX() {
    return d => d
  }

  // Get scales
  getScaleX() {
    return scaleBand()
  }

  // Get scale domains
  scaleXDomain() {
    return this.data.map(this.x)
  }

  // Get bar class
  barClass(d) {
    return `bar bar-${slugify(
      this.x(d)
        .toString()
        .toLowerCase()
    )}`
  }

  // Set scaleX padding
  scaleXPadding() {
    return 0.2
  }
}
