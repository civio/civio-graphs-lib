import {area} from 'd3-shape'

import LineChart from './lineChart'

export default class AreaChart extends LineChart{

  // Setup line & area
  setRenderer() {
    super.setRenderer()
    // setup area renderer
    this.areaRenderer = area()
      .x(d => this.scaleX(this.x(d)))
      .y0(this.scaleY(0))
      .y1(d => this.scaleY(this.y(d)))
    return this
  }

  // Render chart
  render() {
    super.render()
    // Render chart area
    this.area = this.chart.append('path')
      .datum(this.data)
      .attr('class', 'area')
      .attr('d', this.areaRenderer)
    return this
  }

  // resize chart
  resize() {
    super.resize()
    // Uupdate area path
    if (this.area) this.area.attr('d', this.areaRenderer)
    return this
  }

  // Set renderer curve
  curve (type) {
    super.curve(type)
    this.areaRenderer.curve(type)
    return this
  }
}