import {area} from 'd3-shape'
import LineChart from './lineChart'

export default class AreaChart extends LineChart{

  constructor(selector, config) {
    console.log('AreChart')
    super(selector, config)
  }

  // setup line & area
  setRenderer() {
    super.setRenderer()

    // setup area renderer
    this.area = area()
      .x(d => this.scaleX(this.x(d)))
      .y0(this.height - this.config.margin.bottom)
      .y1(d => this.scaleY(this.y(d)))
  }

  // render chart
  render() {
    super.render()

    // render chart area
    this.chart.append('path')
      .datum(this.data)
      .attr('class', 'area')
      .attr('d', this.area)
  }

  // resize chart
  resize() {
    super.resize()
    
    // resize area renderer
    if (this.area) this.area.y0(this.height - this.config.margin.bottom)

    // re-render area path
    this.chart.select('.area')
      .attr('d', this.area)
  }
}