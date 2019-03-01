import BarHorizontalChart from './barHorizontalChart'

export default class StackedBarHorizontalChart extends BarHorizontalChart {
  setup(data, key) {
    this.key = key
    super.setup(data)
    return this
  }

  // Root element class
  chartClass() {
    return 'chart chart-stacked-bar-horizontal'
  }
}
