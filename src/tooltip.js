import {bisector} from 'd3-array'
import {event, select} from 'd3-selection'
import LineChart from './lineChart'

export default function () {
  let el,
      chart,
      point,
      bisectDate,
      currentData = 0

  function tooltip () {}

  tooltip.setup = function (_chart) {
    chart = _chart
    // get tooltip element from chart container
    el = chart.el.select('.tooltip')
    return tooltip
  }

  tooltip.render = function () {
    // Skip if there is no tooltip element 
    if (!el || el.empty()) return tooltip
    // Setup bisectDate for mouse move
    bisectDate = bisector(chart.x).left
    // Setup chart point
    point = chart.chart.append('circle')
      .attr('class', 'tooltip-point')
      .attr('display', 'none')
      .attr('r', 4)
    // Set mouse events
    chart.chart
      .on('mousemove', tooltip.onMouseMove)
      .on('mouseenter', tooltip.onMouseEnter)
      .on('mouseleave', tooltip.onMouseLeave)
    return tooltip
  }

  tooltip.setPosition = function (x, y) {
    const isRight = x > chart.width/2
    // set point position
    point
      .attr('transform', `translate(${x}, ${y})`)
    // set tooltip position
    el
      .style('left', isRight ? 'auto' : `${x}px`)
      .style('right',isRight ? `${chart.width - x}px` : 'auto')
      .style('top', `${y}px`)
      .classed('right', isRight)
    return tooltip
  }

  tooltip.setContent = function (x, y) {
    // Set label x value
    el.select('.label.x')
      .html(chart.config.format.x(x))
    // Set label y value
    el.select('.label.y')
      .html(chart.config.format.y(y))
  }

  tooltip.onMouseMove = function () {
    // get current data by mouse position
    const d = tooltip.getMouseData(event.layerX, event.layerY)
    if (currentData !== d) {
      currentData = d
      // set tooltip position
      tooltip.setPosition(tooltip.getPositionX(currentData), tooltip.getPositionY(currentData))
      // set tooltip label
      tooltip.setContent(chart.x(currentData), chart.y(currentData))
    }
    return tooltip
  }

  tooltip.onMouseEnter = function () {
    // show tooltip element & point
    el.style('opacity', 1)
    point.attr('display', null)
    return tooltip
  }

  tooltip.onMouseLeave = function () {
    // hide tooltip element & point
    el.style('opacity', 0)
    point.attr('display', 'none')
    return tooltip
  }

  tooltip.getPositionX = function (d) {
    return chart.scaleX(chart.x(d))
  }
  tooltip.getPositionY = function (d) {
    return chart.scaleY(chart.y(d))
  }

  tooltip.getMouseData = function (x, y) {
    // get mouse position
    const mouseX = chart.scaleX.invert(x)
    // calculate current data
    const i = bisectDate(chart.data, mouseX, 1)
    const d0 = chart.data[i - 1]
    const d1 = chart.data[i]
    return (d1 && mouseX - chart.x(d0) > chart.x(d1) - mouseX) ? d1 : d0
  }

  return tooltip
} 