import Component from '@ember/component';
import { get, getWithDefault } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { min, max } from 'd3-array';
import { hierarchy, pack as d3Pack } from 'd3-hierarchy';
import { scaleQuantize } from 'd3-scale';
import { select } from 'd3-selection';
import 'd3-transition';

/**
 * This implementation is based on
 * https://github.com/kauffecup/react-bubble-chart.
 */
export default Component.extend({
  // Element customizations
  classNames: ['bubble-chart'],

  // Properties passed in
  data: null,
  fixedDomain: null,
  colorScheme: null,
  createTooltip: null,
  showTimeout: 1000,
  hideTimeout: 100,

  // Local properties
  mouseInsideTooltip: false,
  mouseInsideBubble: false,

  /**
   * LIFECYCLE HOOK : This function watch updated on received props.
   */
  didReceiveAttrs() {
    this._super(...arguments);

    // Recreate elemens.
    this.createElements();
  },

  /**
   * LIFECYCLE HOOK : Called when the component gets mounted
   * into DOM.
   */
  didInsertElement() {
    this._super(...arguments);

    this.createElements();
  },

  /**
   * This function going to create all base elements for chart
   * which include the chart "canvas" area (svg), legend and
   * tooltip elements.
   */
  createElements() {
    // Remove all child nodes.
    let content = this.$('.bubble-chart-content');

    if (!content) {
      return;
    }

    // Clear content
    content.empty();

    // Get DOM element.
    let [el] = content;

    // First we create the main svg for the chart and
    // set some attributes for the svg.
    this.svg = select(el).append('svg')
      .attr('class', 'bubble-chart-svg')
      .style('overflow', 'visible');

    this.html = select(el).append('div')
      .attr('class', 'bubble-chart-html')
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .style('right', 0)
      .style('margin-left', 'auto')
      .style('margin-right', 'auto');

    this.tooltip = this.html.append('div')
      .on('mouseenter', () => {
        this.mouseInsideTooltip = true;
      })
      .on('mouseleave', () => {
        this.mouseInsideTooltip = false;

        if (!this.mouseInsideBubble) {
          this.hideTooltip();
        }
      })
      .attr('class', 'bubble-chart-tooltip');

    this.updateChart();
  },

  /**
   * This function going to adjust the size of the chart based on
   * the size of the container element.
   */
  adjustSize() {
    let [el] = this.$('.bubble-chart-content');

    // Get size and top position from the main element.
    this.offsetWidth = el.offsetWidth;
    this.offsetHeight = el.offsetHeight;
    this.size = Math.min(el.offsetWidth, el.offsetHeight);

    this.svg.attr('width', this.size)
      .attr('height', this.size)
      .style('position', 'relative');
  },

  /**
   * Create and configure the tooltip
   */
  configureTooltip() {
    this.tooltip.style('display', 'none');
  },

  showTooltipTask: task(function* () {
    yield timeout(get(this, 'showTimeout'));

    if (!this.mouseInsideBubble) {
      return;
    }

    let d = this.nextActiveData;

    let renderTooltip = get(this, 'renderTooltip');
    let tooltipHtmlPromise;

    if (!renderTooltip) {
      return;
    }

    if (this.removeTooltipTaskInstance) {
      this.removeTooltipTaskInstance.cancel();
      this.removeTooltipTaskInstance = null;
    }

    // Set a loading screen.
    let loaderHtml = '<div style="text-align: center"><div class="spinner-loader"><div></div><div></div><div></div><div></div></div></div>';
    let renderTooltipLoader = get(this, 'renderTooltipLoader');

    if (renderTooltipLoader) {
      loaderHtml = this.renderTooltipLoader(d);
    }

    this.tooltip.style('display', 'block').html(loaderHtml);

    let renderTooltipResult = renderTooltip(d.data);

    if (renderTooltipResult) {
      tooltipHtmlPromise = Promise.resolve(renderTooltipResult);

      this.showingTooltipData = d.data;

      // Bubble with and height
      let tooltipAlignment = getWithDefault(this, 'tooltipAlignment', 'topLeft');
      let tooltipOffsetX = getWithDefault(this, 'tooltipOffsetX', 0);
      let tooltipOffsetY = getWithDefault(this, 'tooltipOffsetY', 0);

      let defaultOffset = d.r ? d.r * 0.4 : 0;

      if (tooltipAlignment === 'topLeft') {
        let top = d.y + defaultOffset + tooltipOffsetY;
        let left = d.x + defaultOffset + tooltipOffsetX;

        this.tooltip
          .style('left', `${left}px`)
          .style('top', `${top}px`);
      } else {
        let bottom = -((this.offsetHeight || 0) - d.y) + defaultOffset + tooltipOffsetY;
        let right = (this.offsetWidth || 0) - d.x + defaultOffset + tooltipOffsetX;

        this.tooltip
          .style('bottom', `${bottom}px`)
          .style('right', `${right}px`);
      }

      // Wait for html to be resolved
      tooltipHtmlPromise.then((tooltipHtml) => {
        this.tooltip.html(tooltipHtml);
      });
    }
  }).drop(),

  removeTooltipTask: task(function* () {
    yield timeout(get(this, 'hideTimeout'));

    if (!this.mouseInsideTooltip) {
      this.hideTooltip();
    }
  }).drop(),

  showTooltip(d) {
    this.mouseInsideBubble = true;

    if (this.showTooltipTaskInstance) {
      this.showTooltipTaskInstance.cancel();
    }

    this.nextActiveData = d;
    this.showTooltipTaskInstance = get(this, 'showTooltipTask').perform();
  },

  hideTooltip() {
    this.tooltip.style('display', 'none')
      .style('width', '')
      .style('top', '')
      .style('left', '');
  },

  /**
   * This function updates the elements within the chart (bubbles,
   * legend, tooltips, etc).
   */
  updateChart() {
    this.adjustSize();
    this.configureTooltip();

    // Chart attributes
    let data = get(this, 'data');
    let fixedDomain = get(this, 'fixedDomain');
    let duration = get(this, 'duration') || 500;
    let delay = get(this, 'delay') || 0;
    let totalValue = 0;

    // Evaluate total
    for (let i = 0; i < data.length; i++) {
      totalValue += data[i].value;
    }

    // Colors range
    let fillColorsRage = get(this, 'colorScheme').map((s) => (
      typeof s === 'string' ? s : s.color
    ));
    let textColorsRange = get(this, 'colorScheme').map((s) => (
      typeof s === 'string' ? '#000000' : (s.textColor || '#000000')
    ));

    // Quantized colors
    let fillColors = scaleQuantize()
      .domain([
        fixedDomain ? fixedDomain.min : min(data, (d) => d.colorValue),
        fixedDomain ? fixedDomain.max : max(data, (d) => d.colorValue)
      ])
      .range(fillColorsRage);

    let textColors = scaleQuantize()
      .domain([
        fixedDomain ? fixedDomain.min : min(data, (d) => d.colorValue),
        fixedDomain ? fixedDomain.max : max(data, (d) => d.colorValue)
      ])
      .range(textColorsRange);

    // Build the root node to start building our bubbles in a
    // hierarchical organization.
    let root = hierarchy({
      children: data
    }).sum(function(d) {
      let { value } = d;
      let ratio = value / totalValue;

      if (ratio < 0.07) {
        value = totalValue * 0.07;
      }

      return value;
    });

    // Creates a bubble package container for all other bubbles.
    // This way d3 manages the arrangements of all bubbles for us.
    let pack = d3Pack()
      .size([this.size, this.size])
      .padding(3);

    let nodesData = pack(root).leaves();

    let circles = this.svg.selectAll('circle')
      .data(nodesData);

    let labels = this.html.selectAll('.bubble-label')
      .data(nodesData);

    let labelClass = 'bubble-label';

    if (get(this, 'renderTooltip')) {
      labelClass += ' hoverable';
    }

    circles
      .enter()
      .append('circle')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .attr('r', 0)
      .style('fill', (d) => fillColors(d.data.colorValue))
      .transition()
      .duration(duration)
      .delay(delay)
      .attr('r', (d) => isNaN(d.r) ? 0 : d.r);

    labels
      .enter()
      .append('div')
      .attr('class', labelClass)
      .html((d) => {
        if (typeof d.data.bubbleLabel === 'function') {
          return d.data.bubbleLabel(d.r);
        } else if (typeof d.data.bubbleLabel === 'string') {
          return d.data.bubbleLabel;
        }

        return d.data.label;
      })
      .on('mouseenter', this.showTooltip.bind(this))
      .on('mouseleave', () => {
        this.mouseInsideBubble = false;

        // Give some time so user can move the mouse to inside tooltip.
        this.removeTooltipTaskInstance = get(this, 'removeTooltipTask').perform();
      })
      .style('color', (d) => textColors(d.data.colorValue))
      .style('position', 'absolute')
      .style('height', (d) => `${2 * d.r}px`)
      .style('width', (d) => `${2 * d.r}px`)
      .style('left', (d) =>  `${d.x - d.r}px`)
      .style('top', (d) =>  `${d.y - d.r}px`)
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('justify-content', 'center')
      .style('opacity', 0)
      .transition()
      .duration(duration)
      .delay(delay)
      .style('opacity', 1);
  }
});
