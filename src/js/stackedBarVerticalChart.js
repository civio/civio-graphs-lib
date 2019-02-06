import { max } from 'd3-array'
import { quantize } from 'd3-interpolate'
import { scaleOrdinal } from 'd3-scale'
import { interpolateSpectral } from 'd3-scale-chromatic'
import { stack, stackOrderNone, stackOffsetNone } from 'd3-shape'

import slugify from 'slugify'

import BarVerticalChart from './barVerticalChart'
import TooltipStacked from './tooltipStacked'

export default class StackedBarVerticalChart extends BarVerticalChart {
  setup(data, key) {
    this.key = key
    super.setup(data)
    return this
  }

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

  setTooltip() {
    this.tooltip = new TooltipStacked(this, {
      align: 'center',
      valign: 'bottom'
      //background: true
    })
  }

  setData(data) {
    const keys = Object.keys(data[0]).filter(d => d !== this.key)
    this.data = stack()
      .keys(keys)
      .order(stackOrderNone)
      .offset(stackOffsetNone)(data)
    this.data.keys = keys
    this.data.values = data.map(d => d[this.key])
  }

  // Render chart bars
  renderBars() {
    // add stacked bars
    this.bars = this.chart
      .selectAll('.bar-stack')
      .data(this.data)
      .enter()
      .append('g')
      .attr('fill', (d, i) => this.scaleColor(this.data.keys[i]))
      .attr('class', this.barClass.bind(this))
    // add stacked bars items
    this.bars
      .selectAll('.bar-stack-item')
      .data(d => d)
      .enter()
      .append('rect')
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

  // Root element class
  chartClass() {
    return 'chart chart-stacked-bar-vertical'
  }

  // Get scale domains
  scaleXDomain() {
    return this.data.values
  }

  scaleYDomain() {
    return [0, max(this.data, d => max(d, e => max(e)))]
  }

  // Tooltip data for a mouse position
  getMouseData(x) {
    // get mouse position
    const mouseX = this.scaleX.invert(x)
    // get x index from data values
    const i = this.data.values.indexOf(mouseX)
    // get data for current index
    return this.data[0][i].data
  }

  // Tooltip position for a given data
  getDataPosition(data) {
    // get current data x value
    const x = data[this.key]
    // get x position for current data
    const obj = {
      x: this.scaleX(x) + this.scaleX.bandwidth() / 2,
      y: {}
    }
    // get x data index
    const index = this.data.values.indexOf(x)
    // get y position for each key
    this.data.keys.forEach((key, i) => {
      if (data[key]) {
        const y = this.data[i][index]
        obj.y[slugify(key.toLowerCase())] = this.scaleY((y[0] + y[1]) / 2)
      }
    })
    return obj
  }

  // Get bar class
  barClass(d) {
    return `bar-stack bar-${slugify(d.key.toLowerCase())}`
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
