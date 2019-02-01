import { scaleBand } from 'd3-scale'

import Chart from './chart'

export default class BarVerticalChart extends Chart {
  // Set scales
  setScales() {
    super.setScales()
    this.scaleX.padding(this.scaleXPadding())
    return this
  }

  // Render chart
  render() {
    super.render()
    // Render chart bars
    this.bars = this.chart
      .selectAll('rect')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
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
    // Update line path
    if (this.bars) this.bars.call(this.setBarDimensions.bind(this))
    return this
  }

  // Clear axis x format
  axisFormatX() {
    return null
  }

  // Get scales
  getScaleX() {
    return scaleBand()
  }

  // Get scale domains
  scaleXDomain() {
    return this.data.map(this.x)
  }

  // Set scaleX padding
  scaleXPadding() {
    return 0.2
  }
}
