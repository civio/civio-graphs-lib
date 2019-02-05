import { treemap } from 'd3-hierarchy'
import { scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'

import Chart from './chart'

export default class TreemapChart extends Chart {
  // Override chart as html div
  setChart() {
    this.chart = this.el.append('div')
    return this
  }

  // Override tooltip
  setTooltip() {}

  // Set scales
  setScales() {
    // treemap
    this.treemap = treemap()
      .size([this.width, this.height])
      .round(true)
    // .padding(1)
    // color scale
    this.scaleColor = this.getScaleColor()
    return this
  }

  // Override axis
  setAxis() {
    return this
  }

  // Render chart
  render() {
    this.setResize()
    this.renderNodes()
    return this
  }

  // Render treemap nodes
  renderNodes() {
    this.nodes = this.chart
      .selectAll('div')
      .data(this.treemap(this.data).leaves())
      .enter()
      .append('div')
      .attr('class', this.getNodeClass)
      .call(el => this.setNodeDimension(el))
      .call(el => this.setNodeTooltip(el))
    // Add node title
    this.nodes.append('span').html(this.getNodeTitle)
    // Add node background
    this.nodes.append('div').style('background', d => this.getNodeColor(d))
  }

  // Clear chart
  clear() {
    super.clear()
    // Remove treemap groups
    this.chart.selectAll('div').remove()
    return this
  }

  // Resize chart
  resize() {
    // Update line path
    if (this.treemap) {
      this.treemap.size([this.width, this.height])
      this.clear()
      this.renderNodes()
    }
    // Update chart height
    this.chart.style('height', `${this.height}px`)
    return this
  }

  // Set node
  setNodeDimension(el) {
    el.style('top', d => `${d.y0}px`)
      .style('left', d => `${(100 * d.x0) / this.width}%`)
      .style('width', d => `${(100 * (d.x1 - d.x0)) / this.width}%`)
      .style('height', d => `${d.y1 - d.y0}px`)
  }
  setNodeTooltip(el) {
    el.attr('data-toggle', 'tooltip')
      .attr('data-html', 'true')
      .attr('title', d => this.getNodeTooltipContent(d))
  }

  // Getters

  // Root element class
  chartClass() {
    return 'chart chart-treemap'
  }

  // Override data accesors
  x(d) {
    return d.data.name
  }
  y(d) {
    return d.data.value
  }
  // Set scale color
  getScaleColor() {
    return scaleOrdinal().range(schemeCategory10)
  }

  getNodeClass() {
    return 'treemap-node'
  }
  getNodeColor(d) {
    while (d.depth > 1) d = d.parent
    return this.scaleColor(this.x(d))
  }
  getNodeTitle(d) {
    return this.x(d)
  }
  getNodeTooltipContent(d) {
    return `<strong>${this.x(d)}</strong><br/>${this.tooltipFormatY()(
      this.y(d)
    )}`
  }

  // Set renderer curve
  tile(type) {
    this.treemap.tile(type)
    return this
  }
}
