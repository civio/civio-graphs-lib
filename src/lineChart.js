import {select} from 'd3-selection'
import {line} from 'd3-shape'
import Chart from './chart'

export default class LineChart extends Chart{

  constructor (selector, config) {
    console.log('LineChart')
    super(selector, config)
  }

  // Set scales
  setScales () {
    super.setScales()
    return this
  }

  // Setup line renderer
  setRenderer() {
    this.lineRenderer = line()
      .defined(d => !isNaN(this.y(d)))
      .x(d => this.scaleX(this.x(d)))
      .y(d => this.scaleY(this.y(d)))
  }

  // Render chart
  render () {
    super.render()

    // Render chart line
    this.line = this.chart.append('path')
      .datum(this.data)
      .attr('class', 'line')
      .attr('d', this.lineRenderer)

    return this
  }

  // Resize chart
  resize () {
    super.resize()

    // Update line path
    if (this.line) this.line.attr('d', this.lineRenderer)

    return this
  }
}
