import { max } from 'd3-array'
import { quantize } from 'd3-interpolate'
import { scaleOrdinal } from 'd3-scale'
import { interpolateSpectral } from 'd3-scale-chromatic'
import { stack, stackOrderNone, stackOffsetNone } from 'd3-shape'

import slugify from 'slugify'

import BarVerticalChart from './barVerticalChart'

export default class StackedBarVerticalChart extends BarVerticalChart {
  // Set scales
  setScales() {
    super.setScales()
    // setup scale color
    this.scaleColor = this.getScaleColor()
      .unknown('#ccc')
      .domain(this.scaleColorDomain())
      .range(this.scaleColorRange())
    return this
  }

  setup(data, key) {
    this.data = this.getDataStack(data, key)
    this.setFormat()
    this.onResize()
    this.setScales()
    this.setAxis()
    this.setRenderer()
    return this
  }

  getDataStack(data, key) {
    const keys = Object.keys(data[0]).filter(d => d !== key)
    const dataStacked = stack()
      .keys(keys)
      .order(stackOrderNone)
      .offset(stackOffsetNone)(data)
    dataStacked.keys = keys
    dataStacked.values = data.map(d => d[key])
    return dataStacked
  }

  // Render chart bars
  renderBars() {
    this.bars = this.chart
      .append('g')
      .selectAll('g')
      .data(this.data)
      .join('g')
      .attr('fill', (d, i) => this.scaleColor(this.data.keys[i]))
      .attr('class', d => `bar-stack bar-${slugify(d.key.toLowerCase())}`)
      .selectAll('rect')
      .data(d => d)
      .join('rect')
      .attr('class', 'bar-stack-item')
      .call(this.setBarDimensions.bind(this))
    return this
  }

  // Set bars dimensions
  setBarDimensions(el) {
    el.attr('x', (d, i) => this.scaleX(this.data.values[i]))
      .attr('y', d => this.scaleY(d[1]))
      .attr('height', d => this.scaleY(d[0]) - this.scaleY(d[1]))
      .attr('width', this.scaleX.bandwidth())
  }

  // Get scale domains
  scaleXDomain() {
    return this.data.values
  }

  scaleYDomain() {
    return [0, max(this.data, d => max(d, e => max(e)))]
  }

  // Set scale color for keys
  getScaleColor() {
    return scaleOrdinal()
  }
  scaleColorDomain() {
    return this.data.keys
  }
  scaleColorRange() {
    return quantize(
      t => interpolateSpectral(t * 0.8 + 0.1),
      this.data.keys.length
    ).reverse()
  }
}
