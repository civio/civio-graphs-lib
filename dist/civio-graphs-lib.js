// civio-graphs-lib v0.1.3 Copyright 2019 Raúl Díaz Poblete
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array'), require('d3-selection'), require('lodash'), require('d3-axis'), require('d3-format'), require('d3-scale'), require('d3-time'), require('d3-time-format'), require('d3-shape'), require('slugify'), require('d3-interpolate'), require('d3-scale-chromatic'), require('d3-hierarchy')) :
typeof define === 'function' && define.amd ? define(['exports', 'd3-array', 'd3-selection', 'lodash', 'd3-axis', 'd3-format', 'd3-scale', 'd3-time', 'd3-time-format', 'd3-shape', 'slugify', 'd3-interpolate', 'd3-scale-chromatic', 'd3-hierarchy'], factory) :
(factory((global['civio-graphs-lib'] = global['civio-graphs-lib'] || {}),global.d3Array,global.d3Selection,global.lodash,global.d3Axis,global.d3Format,global.d3Scale,global.d3Time,global.d3TimeFormat,global.d3Shape,global.slugify,global.d3Interpolate,global.d3ScaleChromatic,global.d3Hierarchy));
}(this, (function (exports,d3Array,d3Selection,lodash,d3Axis,d3Format,d3Scale,d3Time,d3TimeFormat,d3Shape,slugify,d3Interpolate,d3ScaleChromatic,d3Hierarchy) { 'use strict';

slugify = slugify && slugify.hasOwnProperty('default') ? slugify['default'] : slugify;

const configDefaults = {
  // we can define an aspectRatio to calculate height or define a fixed height
  point: false,
  align: true,
  background: false
};

class Tooltip {
  constructor(_chart, config) {
    this.chart = _chart;
    // get tooltip element from chart container
    this.el = this.chart.el.select('.tooltip');
    // Setup config object
    this.config = lodash.defaults(config, configDefaults);
    return this
  }

  render() {
    // Skip if there is no tooltip element
    if (!this.el || this.el.empty()) return this
    // Setup bisectDate for mouse move
    this.bisectDate = d3Array.bisector(this.chart.x).left;
    // Setup chart point
    if (this.config.point) {
      this.point = this.chart.chart
        .append('circle')
        .attr('class', 'tooltip-point')
        .attr('display', 'none')
        .attr('r', 4);
    }
    // Set mouse events
    this.chart.chart
      .on('mousemove', this.onMouseMove.bind(this))
      .on('mouseenter', this.onMouseEnter.bind(this))
      .on('mouseleave', this.onMouseLeave.bind(this));
    return this
  }

  show() {
    // show tooltip element & point
    this.el.style('opacity', 1);
    if (this.point) this.point.attr('display', null);
    return this
  }

  hide() {
    // hide tooltip element & point
    this.el.style('opacity', 0);
    if (this.point) this.point.attr('display', 'none');
    return this
  }

  setPosition(dataX) {
    const { x, y } = this.getPosition(dataX);
    // set point position
    if (this.point) this.point.attr('transform', `translate(${x}, ${y})`);
    // set tooltip position
    this.el.style('top', `${y}px`);
    if (this.config.align) {
      const isRight = x > this.chart.width / 2;
      this.el
        .style('left', isRight ? 'auto' : `${x}px`)
        .style('right', isRight ? `${this.chart.width - x}px` : 'auto')
        .classed('right', isRight);
    } else {
      this.el.style('left', `${x}px`);
    }
    return this
  }

  setContent(x, y) {
    // Set label x value
    this.el.select('.label.x').html(this.chart.tooltipFormatX()(x));
    // Set label y value
    this.el.select('.label.y').html(this.chart.tooltipFormatY()(y));
  }

  onMouseMove() {
    // get current data by mouse position
    const d = this.getMouseData(d3Selection.event.layerX);
    if (this.currentData !== d) {
      this.currentData = d;
      // set tooltip position
      this.setPosition(this.currentData);
      // set tooltip label
      this.setContent(
        this.chart.x(this.currentData),
        this.chart.y(this.currentData)
      );
    }
    return this
  }

  onMouseEnter() {
    // show tooltip element & point
    this.show();
    return this
  }

  onMouseLeave() {
    // hide tooltip element & point
    this.hide();
    return this
  }

  getPosition(data) {
    // get data position for current date
    const i = this.bisectDate(this.chart.data, this.chart.x(data));
    const d =
      i < this.chart.data.length
        ? this.chart.data[i]
        : this.chart.data[this.chart.data.length - 1];
    return {
      x: this.chart.scaleX(this.chart.x(d)),
      y: this.chart.scaleY(this.chart.y(d))
    }
  }

  getMouseData(x) {
    // get mouse position
    const mouseX = this.chart.scaleX.invert(x);
    // calculate current data
    const i = this.bisectDate(this.chart.data, mouseX, 1);
    const d0 = this.chart.data[i - 1];
    const d1 = this.chart.data[i];
    return d1 && mouseX - this.chart.x(d0) > this.chart.x(d1) - mouseX ? d1 : d0
  }
}

const configDefaults$1 = {
  // we can define an aspectRatio to calculate height or define a fixed height
  aspectRatio: 2,
  height: null,
  lang: 'es',
  margin: {
    top: 0,
    right: 0,
    left: 0,
    bottom: 0
  },
  axis: {
    x: true,
    y: true
  }
};

class Chart {
  constructor(selector, config) {
    // Select chart container
    this.el = d3Selection.select(selector);
    // Launch error if no selector found
    if (this.el.size() === 0)
      throw new Error(`Can't find root element ${selector}`)
    // Set element class
    this.el.attr('class', this.chartClass());
    // Setup config object
    this.config = lodash.defaultsDeep(config, configDefaults$1);
    this.width = 0;
    // Set chart & tooltip
    this.setChart();
    this.setTooltip();
  }

  setChart() {
    this.chart = this.el.append('svg');
    return this
  }

  setTooltip() {
    this.tooltip = new Tooltip(this);
  }

  // Set formats
  setFormat() {
    // Set formatDefaultLocale & timeFormatDefaultLocale based on config.lang
    d3Format.formatDefaultLocale({
      decimal: this.config.lang === 'es' ? ',' : '.',
      thousands: this.config.lang === 'es' ? '.' : ',',
      grouping: [3],
      currency: this.currencyFormat()
    });
    if (this.config.lang === 'es') {
      d3TimeFormat.timeFormatDefaultLocale({
        dateTime: '%A, %e de %B de %Y, %X',
        date: '%d/%m/%Y',
        time: '%H:%M:%S',
        periods: ['AM', 'PM'],
        days: [
          'domingo',
          'lunes',
          'martes',
          'miércoles',
          'jueves',
          'viernes',
          'sábado'
        ],
        shortDays: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
        months: [
          'enero',
          'febrero',
          'marzo',
          'abril',
          'mayo',
          'junio',
          'julio',
          'agosto',
          'septiembre',
          'octubre',
          'noviembre',
          'diciembre'
        ],
        shortMonths: [
          'ene',
          'feb',
          'mar',
          'abr',
          'may',
          'jun',
          'jul',
          'ago',
          'sep',
          'oct',
          'nov',
          'dic'
        ]
      });
    }
  }

  // Set scales
  setScales() {
    // setup x scale
    this.scaleX = this.getScaleX()
      .domain(this.scaleXDomain())
      .range(this.scaleXRange());
    // setup y scale
    this.scaleY = this.getScaleY()
      .domain(this.scaleYDomain())
      .nice()
      .range(this.scaleYRange());
    return this
  }

  // Set axis
  setAxis() {
    // Set x axis
    if (this.config.axis.x) {
      this.axisX = g =>
        g
          .attr('class', 'x axis')
          .attr(
            'transform',
            `translate(0,${this.height - this.config.margin.bottom})`
          )
          .call(this.axisRendererX())
          .call(g =>
            g
              .selectAll('.tick line')
              .attr(
                'y1',
                -this.height +
                  this.config.margin.top +
                  this.config.margin.bottom
              )
              .attr('y2', 0)
          );
    }
    // Set y axis
    if (this.config.axis.y) {
      this.axisY = g =>
        g
          .attr('class', 'y axis')
          .attr('transform', `translate(${this.config.margin.left},0)`)
          .call(this.axisRendererY())
          .call(g =>
            g
              .selectAll('.tick line')
              .attr('x1', 0)
              .attr(
                'x2',
                this.width - this.config.margin.left - this.config.margin.right
              )
          );
    }
    return this
  }

  // Set chart renderer (line, area...)
  setRenderer() {
    return this
  }

  setup(data) {
    this.data = data;
    this.setFormat();
    this.onResize();
    this.setScales();
    this.setAxis();
    this.setRenderer();
    return this
  }

  // Render chart based on data
  render() {
    if (this.config.axis.x) {
      this.chart.append('g').call(this.axisX);
    }
    if (this.config.axis.y) {
      this.chart.append('g').call(this.axisY);
    }
    this.tooltip.render();
    this.setResize();
    return this
  }

  // Clear chart
  clear() {
    if (this.config.axis.x || this.config.axis.y)
      this.chart.selectAll('g').remove();
  }

  // Set resize event listener
  setResize() {
    window.addEventListener('resize', lodash.debounce(() => this.onResize(), 150));
    return this
  }

  // Resize event handler
  onResize() {
    let currentWidth = this.el.node().offsetWidth;
    if (currentWidth !== this.width) {
      this.width = currentWidth;
      // force height if defined in config, otherwise use aspectRatio
      this.height = this.config.height
        ? this.config.height
        : Math.round(this.width / this.config.aspectRatio);
      this.resize();
    }
  }

  // Resize chart
  resize() {
    // Resize chart
    this.chart.attr('width', this.width).attr('height', this.height);
    // Resize scales range
    if (this.scaleX) this.scaleX.range(this.scaleXRange());
    if (this.scaleY) this.scaleY.range(this.scaleYRange());
    // Resize axis
    if (this.axisX) d3Selection.select('.x.axis').call(this.axisX);
    if (this.axisY) d3Selection.select('.y.axis').call(this.axisY);
    return this
  }

  // Getters/Setters

  // Root element class
  chartClass() {
    return 'chart'
  }

  // Set data accesors
  x(d) {
    return d.date
  }
  y(d) {
    return d.value
  }

  // Setup axis renderers & formats
  axisRendererX() {
    return d3Axis.axisBottom(this.scaleX)
      .tickSizeOuter(0)
      .tickFormat(this.axisFormatX())
      .ticks(d3Time.timeYear)
  }
  axisRendererY() {
    return d3Axis.axisLeft(this.scaleY)
      .tickFormat(this.axisFormatY())
      .ticks(this.height / 80)
  }
  axisFormatX() {
    return d3TimeFormat.timeFormat('%Y')
  }
  axisFormatY() {
    return d3Format.format('d')
  }

  // tooltip formats
  tooltipFormatX() {
    return d3TimeFormat.timeFormat(this.config.lang === 'es' ? '%d %B, %Y' : '%B %d, %Y')
  }
  tooltipFormatY() {
    return d3Format.format('$,.1f')
  }
  currencyFormat() {
    return ['', '\u00a0€']
  }

  // Get scales
  getScaleX() {
    return d3Scale.scaleTime()
  }
  getScaleY() {
    return d3Scale.scaleLinear()
  }

  // Get scale domains
  scaleXDomain() {
    return [this.x(this.data[0]), this.x(this.data[this.data.length - 1])]
  }
  scaleYDomain() {
    return d3Array.extent(this.data, this.y)
  }

  // Get scale ranges
  scaleXRange() {
    return [this.config.margin.left, this.width - this.config.margin.right]
  }
  scaleYRange() {
    return [this.height - this.config.margin.bottom, this.config.margin.top]
  }
}

class LineChart extends Chart {
  setTooltip() {
    this.tooltip = new Tooltip(this, {
      point: true
    });
  }

  // Setup line renderer
  setRenderer() {
    this.lineRenderer = d3Shape.line()
      .defined(d => !isNaN(this.y(d)))
      .x(d => this.scaleX(this.x(d)))
      .y(d => this.scaleY(this.y(d)));
    return this
  }

  // Render chart
  render() {
    super.render();
    // Render chart line
    this.line = this.chart
      .append('path')
      .datum(this.data)
      .attr('class', 'line')
      .attr('d', this.lineRenderer);
    return this
  }

  // Clear chart
  clear() {
    super.clear();
    // Remove paths
    this.chart.selectAll('path').remove();
    return this
  }

  // Resize chart
  resize() {
    super.resize();
    // Update line path
    if (this.line) this.line.attr('d', this.lineRenderer);
    return this
  }

  // Root element class
  chartClass() {
    return 'chart chart-line'
  }

  // Set renderer curve
  curve(type) {
    this.lineRenderer.curve(type);
    return this
  }
}

class AreaChart extends LineChart {
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
    this.area = this.chart
      .append('path')
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

  // Root element class
  chartClass() {
    return 'chart chart-area'
  }

  // Set renderer curve
  curve(type) {
    super.curve(type);
    this.areaRenderer.curve(type);
    return this
  }

  // get areaRenderer y0
  getAreaRendererY0() {
    return this.height - this.config.margin.bottom
  }
}

class BarVerticalChart extends Chart {
  setTooltip() {
    this.tooltip = new Tooltip(this, {
      align: false
    });
  }
  // Set scales
  setScales() {
    super.setScales();
    this.scaleX.padding(this.scaleXPadding());
    // custom invert function for scaleBand
    // https://bl.ocks.org/shimizu/808e0f5cadb6a63f28bb00082dc8fe3f
    this.scaleXInvert = d3Scale.scaleQuantize()
      .domain(this.scaleX.range())
      .range(this.scaleX.domain());
    this.scaleX.invert = x => this.scaleXInvert(x);
    return this
  }

  // Render chart
  render() {
    super.render();
    this.renderBars();
    return this
  }

  // Render chart bars
  renderBars() {
    this.bars = this.chart
      .selectAll('rect')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('class', this.barClass.bind(this))
      .call(this.setBarDimensions.bind(this));
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
      .attr('width', this.scaleX.bandwidth());
  }

  // Clear chart
  clear() {
    super.clear();
    // Remove paths
    this.chart.selectAll('rect').remove();
    return this
  }

  // Resize chart
  resize() {
    super.resize();
    // update scaleXInvert domain
    if (this.scaleXInvert) this.scaleXInvert.domain(this.scaleX.range());
    // Update line path
    if (this.bars) this.bars.call(this.setBarDimensions.bind(this));
    return this
  }

  // Root element class
  chartClass() {
    return 'chart chart-bar-vertical'
  }

  // Clear axis x format
  axisFormatX() {
    return null
  }

  // tooltip formats
  tooltipFormatX() {
    return d => d
  }

  // Get scales
  getScaleX() {
    return d3Scale.scaleBand()
  }

  // Get scale domains
  scaleXDomain() {
    return this.data.map(this.x)
  }

  // Get bar class
  barClass(d) {
    return `bar bar-${slugify(
      this.x(d)
        .toString()
        .toLowerCase()
    )}`
  }

  // Set scaleX padding
  scaleXPadding() {
    return 0.2
  }
}

class StackedBarVerticalChart extends BarVerticalChart {
  // Set scales
  setScales() {
    super.setScales();
    // setup scale color
    this.scaleColor = this.getScaleColor()
      .unknown('#ccc')
      .domain(this.scaleColorDomain())
      .range(this.scaleColorRange());
    return this
  }

  setup(data, key) {
    this.data = this.getDataStack(data, key);
    this.setFormat();
    this.onResize();
    this.setScales();
    this.setAxis();
    this.setRenderer();
    return this
  }

  getDataStack(data, key) {
    const keys = Object.keys(data[0]).filter(d => d !== key);
    const dataStacked = d3Shape.stack()
      .keys(keys)
      .order(d3Shape.stackOrderNone)
      .offset(d3Shape.stackOffsetNone)(data);
    dataStacked.keys = keys;
    dataStacked.values = data.map(d => d[key]);
    return dataStacked
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
      .selectAll('.bar-stack-item')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('class', 'bar-stack-item')
      .call(this.setBarDimensions.bind(this));
    return this
  }

  // Set bars dimensions
  setBarDimensions(el) {
    el.attr('x', (d, i) => this.scaleX(this.data.values[i]))
      .attr('y', d => this.scaleY(d[1]))
      .attr('height', d => this.scaleY(d[0]) - this.scaleY(d[1]))
      .attr('width', this.scaleX.bandwidth());
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
    return [0, d3Array.max(this.data, d => d3Array.max(d, e => d3Array.max(e)))]
  }

  // Get bar class
  barClass(d) {
    return `bar-stack bar-${slugify(d.key.toLowerCase())}`
  }

  // Set scale color for keys
  getScaleColor() {
    return d3Scale.scaleOrdinal()
  }
  scaleColorDomain() {
    return this.data.keys
  }
  scaleColorRange() {
    return d3Interpolate.quantize(
      t => d3ScaleChromatic.interpolateSpectral(t * 0.8 + 0.1),
      this.data.keys.length
    ).reverse()
  }
}

class TreemapChart extends Chart {
  // Override chart as html div
  setChart() {
    this.chart = this.el.append('div');
    return this
  }

  // Override tooltip
  setTooltip() {}

  // Set scales
  setScales() {
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
  setAxis() {
    return this
  }

  // Render chart
  render() {
    this.setResize();
    this.renderNodes();
    return this
  }

  // Render treemap nodes
  renderNodes() {
    this.nodes = this.chart
      .selectAll('div')
      .data(this.treemap(this.data).leaves())
      .enter()
      .append('div')
      .attr('class', this.getNodeClass)
      .call(el => this.setNodeDimension(el))
      .call(el => this.setNodeTooltip(el));
    // Add node title
    this.nodes.append('span').html(this.getNodeTitle);
    // Add node background
    this.nodes.append('div').style('background', d => this.getNodeColor(d));
  }

  // Clear chart
  clear() {
    super.clear();
    // Remove treemap groups
    this.chart.selectAll('div').remove();
    return this
  }

  // Resize chart
  resize() {
    // Update line path
    if (this.treemap) {
      this.treemap.size([this.width, this.height]);
      this.clear();
      this.renderNodes();
    }
    // Update chart height
    this.chart.style('height', `${this.height}px`);
    return this
  }

  // Set node
  setNodeDimension(el) {
    el.style('top', d => `${d.y0}px`)
      .style('left', d => `${(100 * d.x0) / this.width}%`)
      .style('width', d => `${(100 * (d.x1 - d.x0)) / this.width}%`)
      .style('height', d => `${d.y1 - d.y0}px`);
  }
  setNodeTooltip(el) {
    el.attr('data-toggle', 'tooltip')
      .attr('data-html', 'true')
      .attr('title', d => this.getNodeTooltipContent(d));
  }

  // Getters

  // Root element class
  chartClass() {
    return 'chart chart-treemap'
  }

  // Override data accesors
  x(d) {
    return d.data.name
  }
  y(d) {
    return d.data.value
  }
  // Set scale color
  getScaleColor() {
    return d3Scale.scaleOrdinal().range(d3ScaleChromatic.schemeCategory10)
  }

  getNodeClass() {
    return 'treemap-node'
  }
  getNodeColor(d) {
    while (d.depth > 1) d = d.parent;
    return this.scaleColor(this.x(d))
  }
  getNodeTitle(d) {
    return this.x(d)
  }
  getNodeTooltipContent(d) {
    return `<strong>${this.x(d)}</strong><br/>${this.tooltipFormatY()(
      this.y(d)
    )}`
  }

  // Set renderer curve
  tile(type) {
    this.treemap.tile(type);
    return this
  }
}

exports.Chart = Chart;
exports.AreaChart = AreaChart;
exports.BarVerticalChart = BarVerticalChart;
exports.LineChart = LineChart;
exports.StackedBarVerticalChart = StackedBarVerticalChart;
exports.TreemapChart = TreemapChart;
exports.Tooltip = Tooltip;

Object.defineProperty(exports, '__esModule', { value: true });

})));
