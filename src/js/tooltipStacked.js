import slugify from 'slugify'

import Tooltip from './tooltip'

export default class TooltipStacked extends Tooltip {
  setup() {
    // append tooltip element to chart container
    this.el = this.chart.el.append('div').attr('class', 'tooltip')
    // append labels to tooltip element
    this.el.append('div').attr('class', 'label x')
    this.chart.data.keys.forEach(key => {
      this.el.append('div').attr('class', `label ${slugify(key.toLowerCase())}`)
    })
    return this
  }

  setContent(data) {
    // Set key label
    this.setLabel('x', this.chart.tooltipFormatX()(data[this.chart.key]))
    // Set other keys labels
    this.chart.data.keys.forEach(key => {
      this.setLabel(
        slugify(key.toLowerCase()),
        key + '<br/>' + this.chart.tooltipFormatY()(data[key])
      )
    })
  }
}
