import { area } from 'd3-shape'

import LineChart from './lineChart'

export default class AreaChart extends LineChart {
  // Setup line & area
  setRenderer() {
    super.setRenderer()
    // setup area renderer
    this.areaRenderer = area()
      .x(d => this.scaleX(this.x(d)))
      .y0(this.getAreaRendererY0())
      .y1(d => this.scaleY(this.y(d)))
    return this
  }

  // Render chart
  render() {
    super.render()
    // Render chart area
    this.area = this.chart
      .append('path')
      .datum(this.data)
      .attr('class', 'area')
      .attr('d', this.areaRenderer)
    return this
  }

  // resize chart
  resize() {
    super.resize()
    // Resize area renderer
    if (this.areaRenderer) this.areaRenderer.y0(this.getAreaRendererY0())
    // Uupdate area path
    if (this.area) this.area.attr('d', this.areaRenderer)
    return this
  }

  // Root element class
  chartClass() {
    return 'chart chart-area'
  }

  // Set renderer curve
  curve(type) {
    super.curve(type)
    this.areaRenderer.curve(type)
    return this
  }

  // get areaRenderer y0
  getAreaRendererY0() {
    return this.height - this.config.margin.bottom
  }
}
