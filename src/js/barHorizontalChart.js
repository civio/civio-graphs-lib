import slugify from 'slugify'

import { max } from 'd3-array'
import { select } from 'd3-selection'

import Chart from './chart'

export default class BarHorizontalChart extends Chart {
  // Override chart as html div
  setChart() {
    this.chart = this.el.append('div')
    return this
  }

  // Override tooltip
  setTooltip() {}

  // Override axis
  setAxis() {
    return this
  }

  // Render chart
  render() {
    super.render()
    this.renderBars()
    this.resize() // we need to check bar values alignment
    return this
  }

  // Render chart bars
  renderBars() {
    this.barGroups = this.chart
      .selectAll('div')
      .data(this.data)
      .enter()
      .append('div')
      .attr('class', 'bar-group')
    this.barLabels = this.barGroups
      .append('div')
      .attr('class', 'bar-label')
      .html(d => this.tooltipFormatX()(this.x(d)))
    this.barContainers = this.barGroups
      .append('div')
      .attr('class', this.barClass.bind(this))
    this.barContainers
      .append('div')
      .attr('class', 'bar')
      .style('width', d => `${this.scaleY(this.y(d))}%`)
    this.barContainers
      .append('div')
      .attr('class', 'bar-value')
      .html(d => this.tooltipFormatY()(this.y(d)))
    this.setBarLabelsWidth()
    return this
  }

  setBarLabelsWidth() {
    const labelsWidth = this.barLabels
      .nodes()
      .map(el => select(el).node().offsetWidth)
    const labelsMaxWidth = max(labelsWidth)
    this.barLabels.style('width', `${labelsMaxWidth}px`)
  }

  // Get bar class
  barClass(d) {
    return `bar-container bar-${slugify(
      this.x(d)
        .toString()
        .toLowerCase()
    )}`
  }

  setBarValuePosition(el) {
    const container = select(el)
    const barValue = container.select('.bar-value')
    const value = this.scaleY(this.y(container.datum()))
    const barWidth = container.select('.bar').node().offsetWidth
    const barValueWidth = barValue.node().offsetWidth
    if (barWidth > barValueWidth) {
      barValue.style('right', `${100 - value}%`).style('left', 'auto')
    } else {
      barValue.style('left', `${value}%`).style('right', 'auto')
    }
  }

  // Resize chart
  resize() {
    if (this.barContainers)
      this.barContainers.nodes().forEach(this.setBarValuePosition.bind(this))
    return this
  }

  // Root element class
  chartClass() {
    return 'chart chart-bar-horizontal'
  }

  // tooltip formats
  tooltipFormatX() {
    return d => d
  }

  // Use scaleY as 0-100 percentage value
  scaleYRange() {
    return [0, 100]
  }
}
