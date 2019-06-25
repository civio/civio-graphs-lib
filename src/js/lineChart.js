import { line } from 'd3-shape'

import Chart from './chart'
import Tooltip from './tooltip'

export default class LineChart extends Chart {
  // Setup line renderer
  setRenderer() {
    this.lineRenderer = line()
      .defined(d => !isNaN(this.y(d)))
      .x(d => this.scaleX(this.x(d)))
      .y(d => this.scaleY(this.y(d)))
    return this
  }

  setTooltip() {
    if (this.config.tooltip) {
      this.tooltip = new Tooltip(this, {
        point: true
      })
    }
  }

  // Render chart
  render() {
    super.render()
    // Render chart line
    this.line = this.chart
      .append('path')
      .datum(this.data)
      .attr('class', 'line')
      .attr('d', this.lineRenderer)
    return this
  }

  // Clear chart
  clear() {
    super.clear()
    // Remove paths
    this.chart.selectAll('path').remove()
    return this
  }

  // Resize chart
  resize() {
    super.resize()
    // Update line path
    if (this.line) this.line.attr('d', this.lineRenderer)
    return this
  }

  // Root element class
  chartClass() {
    return 'chart chart-line'
  }

  // Set renderer curve
  curve(type) {
    this.lineRenderer.curve(type)
    return this
  }
}
