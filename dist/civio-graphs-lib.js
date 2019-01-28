// civio-graphs-lib v0.1.3 Copyright 2019 Raúl Díaz Poblete
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array'), require('d3-selection'), require('d3-axis'), require('d3-format'), require('d3-scale'), require('d3-time'), require('d3-time-format'), require('lodash'), require('d3-shape'), require('d3-hierarchy'), require('d3-scale-chromatic')) :
typeof define === 'function' && define.amd ? define(['exports', 'd3-array', 'd3-selection', 'd3-axis', 'd3-format', 'd3-scale', 'd3-time', 'd3-time-format', 'lodash', 'd3-shape', 'd3-hierarchy', 'd3-scale-chromatic'], factory) :
(factory((global['civio-graphs-lib'] = global['civio-graphs-lib'] || {}),global.d3Array,global.d3Selection,global.d3Axis,global.d3Format,global.d3Scale,global.d3Time,global.d3TimeFormat,global.lodash,global.d3Shape,global.d3Hierarchy,global.d3ScaleChromatic));
}(this, (function (exports,d3Array,d3Selection,d3Axis,d3Format,d3Scale,d3Time,d3TimeFormat,lodash,d3Shape,d3Hierarchy,d3ScaleChromatic) { 'use strict';

function tooltip () {
  let el,
      chart,
      point,
      bisectDate,
      currentData = 0;

  function tooltip () {}

  tooltip.setup = function (_chart) {
    chart = _chart;
    // get tooltip element from chart container
    el = chart.el.select('.tooltip');
    return tooltip
  };

  tooltip.render = function () {
    // Skip if there is no tooltip element 
    if (!el || el.empty()) return tooltip
    // Setup bisectDate for mouse move
    bisectDate = d3Array.bisector(chart.x).left;
    // Setup chart point
    point = chart.chart.append('circle')
      .attr('class', 'tooltip-point')
      .attr('display', 'none')
      .attr('r', 4);
    // Set mouse events
    chart.chart
      .on('mousemove', tooltip.onMouseMove)
      .on('mouseenter', tooltip.onMouseEnter)
      .on('mouseleave', tooltip.onMouseLeave);
    return tooltip
  };

  tooltip.show = function () {
    // show tooltip element & point
    el.style('opacity', 1);
    point.attr('display', null);
    return tooltip
  };

  tooltip.hide = function () {
    // hide tooltip element & point
    el.style('opacity', 0);
    point.attr('display', 'none');
    return tooltip
  };

  tooltip.setPosition = function (dataX) {
    const { x, y } = tooltip.getPosition(dataX);
    const isRight = x > chart.width/2;
    // set point position
    point
      .attr('transform', `translate(${x}, ${y})`);
    // set tooltip position
    el
      .style('left', isRight ? 'auto' : `${x}px`)
      .style('right',isRight ? `${chart.width - x}px` : 'auto')
      .style('top', `${y}px`)
      .classed('right', isRight);
    return tooltip
  };

  tooltip.setContent = function (x, y) {
    // Set label x value
    el.select('.label.x')
      .html(chart.tooltipFormatX()(x));
    // Set label y value
    el.select('.label.y')
      .html(chart.tooltipFormatY()(y));
  };

  tooltip.onMouseMove = function () {
    // get current data by mouse position
    const d = tooltip.getMouseData(d3Selection.event.layerX);
    if (currentData !== d) {
      currentData = d;
      // set tooltip position
      tooltip.setPosition(currentData);
      // set tooltip label
      tooltip.setContent(chart.x(currentData), chart.y(currentData));
    }
    return tooltip
  };

  tooltip.onMouseEnter = function () {
    // show tooltip element & point
    tooltip.show();
    return tooltip
  };

  tooltip.onMouseLeave = function () {
    // hide tooltip element & point
    tooltip.hide();
    return tooltip
  };

  tooltip.getPosition = function (data) {
    // get data position for current date
    const i = bisectDate(chart.data, chart.x(data));
    const d = (i < chart.data.length) ? chart.data[i] : chart.data[chart.data.length - 1];
    return {
      x: chart.scaleX(chart.x(d)),
      y: chart.scaleY(chart.y(d))
    }
  };

  tooltip.getMouseData = function (x) {
    // get mouse position
    const mouseX = chart.scaleX.invert(x);
    // calculate current data
    const i = bisectDate(chart.data, mouseX, 1);
    const d0 = chart.data[i - 1];
    const d1 = chart.data[i];
    return (d1 && mouseX - chart.x(d0) > chart.x(d1) - mouseX) ? d1 : d0
  };

  return tooltip
}

const configDefaults = {
  // we can define an aspectRatio to calculate height or define a fixed height
  aspectRatio: 16 / 9,
  height: null,
  lang: 'es',
  margin: {
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  axis: {
    x: true,
    y: true
  }
};

class Chart {

  constructor (selector, config) {
    // Select chart container
    this.el = d3Selection.select(selector);
    // Launch error if no selector found
    if (this.el.size() === 0) throw new Error(`Can't find root element width ${selector} selector`)
    // Setup config object
    this.config = lodash.defaultsDeep(config, configDefaults);
    this.width = 0;
    // Set chart & tooltip
    this.setChart();
    this.setTooltip();
  }

  setChart () {
    this.chart = this.el.append('svg');
    return this
  }

  setTooltip () {
    this.tooltip = tooltip()
      .setup(this);
  }

  // Set formats
  setFormat () {
    // Set formatDefaultLocale & timeFormatDefaultLocale based on config.lang
    d3Format.formatDefaultLocale({
      decimal: (this.config.lang === 'es') ? ',' : '.',
      thousands: (this.config.lang === 'es') ? '.' : ',',
      currency: this.currencyFormat()
    });
    if (this.config.lang === 'es') {
      d3TimeFormat.timeFormatDefaultLocale({
        dateTime: '%A, %e de %B de %Y, %X',
        date: '%d/%m/%Y',
        time: '%H:%M:%S',
        periods: ['AM', 'PM'],
        days: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
        shortDays: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
        months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
        shortMonths: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
      });
    }
  }

  // Set scales
  setScales () {
    // setup x scale
    this.scaleX = this.getScaleX()
      .domain(this.scaleXDomain())
      .range(this.scaleXRange());
    // setup y scale
    this.scaleY = this.getScaleY()
      .domain(this.scaleYDomain()).nice()
      .range(this.scaleYRange());
    return this
  }

  // Set axis
  setAxis () {
    // Set x axis
    if (this.config.axis.x) {
      this.axisX = g => g
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${this.height - this.config.margin.bottom})`)
        .call(this.axisRendererX())
        .call(g => g.selectAll('.tick line')
          .attr('y1', -this.height + this.config.margin.top + this.config.margin.bottom)
          .attr('y2', 0)
        );
    }
    // Set y axis
    if (this.config.axis.y) {
      this.axisY = g => g
        .attr('class', 'y axis')
        .attr('transform', `translate(${this.config.margin.left},0)`)
        .call(this.axisRendererY())
        .call(g => g.selectAll('.tick line')
          .attr('x1', 0)
          .attr('x2', this.width - this.config.margin.left - this.config.margin.right)
        );
    }
    return this
  }

  // Set chart renderer (line, area...)
  setRenderer () {
    return this
  }

  setup (data) {
    this.data = data;
    this.setFormat();
    this.onResize();
    this.setScales();
    this.setAxis();
    this.setRenderer();
    return this
  }

  // Render chart based on data
  render () {
    if (this.config.axis.x) {
      this.chart.append('g')
        .call(this.axisX);
    }
    if (this.config.axis.y) {
      this.chart.append('g')
        .call(this.axisY);
    }
    this.tooltip.render();
    this.setResize();
    return this
  }

  // Clear chart
  clear () {
    if (this.config.axis.x || this.config.axis.y) this.chart.selectAll('g').remove();
  }

  // Set resize event listener
  setResize () {
    window.addEventListener('resize', lodash.debounce(() => this.onResize(), 150));
    return this
  }

  // Resize event handler
  onResize () {
    let currentWidth = this.el.node().offsetWidth;
    if (currentWidth !== this.width) {
      this.width = currentWidth;
      // force height if defined in config, otherwise use aspectRatio
      this.height = (this.config.height) ? this.config.height : Math.round(this.width / this.config.aspectRatio);
      this.resize();
    }
  }

  // Resize chart
  resize () {
    // Resize chart
    this.chart
      .attr('width', this.width)
      .attr('height', this.height);
    // Resize scales range
    if (this.scaleX) this.scaleX.range(this.scaleXRange());
    if (this.scaleY) this.scaleY.range(this.scaleYRange());
    // Resize axis
    if (this.axisX) d3Selection.select('.x.axis').call(this.axisX);
    if (this.axisY) d3Selection.select('.y.axis').call(this.axisY);
    return this
  }

  // Getters

  // Set data accesors
  x (d) {
    return d.date
  }
  y (d) {
    return d.value
  }

  // Setup axis renderers & formats
  axisRendererX () {
    return d3Axis.axisBottom(this.scaleX)
      .tickSizeOuter(0)
      .tickFormat(this.axisFormatX())
      .ticks(d3Time.timeYear)
  }
  axisRendererY () {
    return d3Axis.axisLeft(this.scaleY)
      .tickFormat(this.axisFormatY())
      .ticks(this.height / 80)
  }
  axisFormatX () {
    return d3TimeFormat.timeFormat('%Y')
  }
  axisFormatY () {
    return d3Format.format('d')
  }

  // tooltip formats
  tooltipFormatX () {
    return d3TimeFormat.timeFormat((this.config.lang === 'es') ? '%d %B, %Y' : '%B %d, %Y')
  } 
  tooltipFormatY () {
    return d3Format.format('$,.1f')
  }
  currencyFormat () {
    return ['', '\u00a0€']
  }

  // Get scales
  getScaleX () {
    return d3Scale.scaleTime()
  }
  getScaleY () {
    return d3Scale.scaleLinear()
  }

  // Get scale domains
  scaleXDomain () {
    return [this.x(this.data[0]), this.x(this.data[this.data.length-1])]
  }
  scaleYDomain () {
    return d3Array.extent(this.data, this.y)
  }

  // Get scale ranges
  scaleXRange () {
    return [this.config.margin.left, this.width - this.config.margin.right]
  }
  scaleYRange () {
    return [this.height - this.config.margin.bottom, this.config.margin.top]
  }
}

class LineChart extends Chart{

  // Setup line renderer
  setRenderer() {
    this.lineRenderer = d3Shape.line()
      .defined(d => !isNaN(this.y(d)))
      .x(d => this.scaleX(this.x(d)))
      .y(d => this.scaleY(this.y(d)));
    return this
  }

  // Render chart
  render () {
    super.render();
    // Render chart line
    this.line = this.chart.append('path')
      .datum(this.data)
      .attr('class', 'line')
      .attr('d', this.lineRenderer);
    return this
  }

  // Clear chart
  clear () {
    super.clear();
    // Remove paths
    this.chart.selectAll('path').remove();
    return this
  }

  // Resize chart
  resize () {
    super.resize();
    // Update line path
    if (this.line) this.line.attr('d', this.lineRenderer);
    return this
  }

  // Set renderer curve
  curve (type) {
    this.lineRenderer.curve(type);
    return this
  }
}

class AreaChart extends LineChart{

  // Setup line & area
  setRenderer() {
    super.setRenderer();
    // setup area renderer
    this.areaRenderer = d3Shape.area()
      .x(d => this.scaleX(this.x(d)))
      .y0(this.getAreaRendererY0())
      .y1(d => this.scaleY(this.y(d)));
    return this
  }

  // Render chart
  render() {
    super.render();
    // Render chart area
    this.area = this.chart.append('path')
      .datum(this.data)
      .attr('class', 'area')
      .attr('d', this.areaRenderer);
    return this
  }

  // resize chart
  resize() {
    super.resize();
    // Resize area renderer  
    if (this.areaRenderer) this.areaRenderer.y0(this.getAreaRendererY0());
    // Uupdate area path
    if (this.area) this.area.attr('d', this.areaRenderer);
    return this
  }

  // Set renderer curve
  curve (type) {
    super.curve(type);
    this.areaRenderer.curve(type);
    return this
  }

  // get areaRenderer y0
  getAreaRendererY0 () {
    return this.height - this.config.margin.bottom
  }
}

class TreemapChart extends Chart {

  // Override chart as html div
  setChart () {
    this.chart = this.el.append('div');
    return this
  }

  // Override tooltip
  setTooltip () {}

  // Set scales
  setScales () {
    // treemap
    this.treemap = d3Hierarchy.treemap()
      .size([this.width, this.height])
      .round(true);
      // .padding(1)
    // color scale
    this.scaleColor = this.getScaleColor();
    return this
  }

  // Override axis
  setAxis () {
    return this
  }

  // Render chart
  render () {
    this.setResize();
    this.renderNodes();
    return this
  }

  // Render treemap nodes
  renderNodes () {
    this.nodes = this.chart.selectAll('div')
      .data(this.treemap(this.data).leaves())
      .enter().append('div')
      .attr('class', this.getNodeClass)
      .style('background', (d) => this.getNodeColor(d))
      .call(el => this.setNodeDimension(el))
      .call(el => this.setNodeTooltip(el))
      .append('span')
        .html(this.getNodeTitle);
  }

  // Clear chart
  clear () {
    super.clear();
    // Remove treemap groups
    this.chart.selectAll('div').remove();
    return this
  }

  // Resize chart
  resize () {
    // Update line path
    if (this.treemap) {
      this.treemap.size([this.width, this.height]);
      this.clear();
      this.renderNodes();
    }
    return this
  }

  // Set node
  setNodeDimension (el) {
    el.style('top', d => `${d.y0}px`)
      .style('left', d => `${100*d.x0/this.width}%`)
      .style('width', d => `${100*(d.x1-d.x0)/this.width}%`)
      .style('height', d => `${(d.y1-d.y0)}px`);
  }
  setNodeTooltip (el) {
    el.attr('data-toggle', 'tooltip')
      .attr('data-html', 'true')
      .attr('title', (d) => this.getNodeTooltipContent(d));
  }

  // Getters

  // Override data accesors
  x (d) {
    return d.data.name
  }
  y (d) {
    return d.data.value
  }
  // Set scale color
  getScaleColor () {
    return d3Scale.scaleOrdinal().range(d3ScaleChromatic.schemeCategory10)
  }
 
  getNodeClass () {
    return 'treemap-node'
  }
  getNodeColor (d) {
    while (d.depth > 1) d = d.parent;
    return this.scaleColor(this.x(d))
  }
  getNodeTitle (d) {
    return this.x(d)
  }
  getNodeTooltipContent (d) {
    return `<strong>${this.x(d)}</strong><br/>${this.tooltipFormatY()(this.y(d))}`
  }

  // Set renderer curve
  tile (type) {
    this.treemap.tile(type);
    return this
  }
}

exports.Chart = Chart;
exports.AreaChart = AreaChart;
exports.LineChart = LineChart;
exports.TreemapChart = TreemapChart;
exports.tooltip = tooltip;

Object.defineProperty(exports, '__esModule', { value: true });

})));
