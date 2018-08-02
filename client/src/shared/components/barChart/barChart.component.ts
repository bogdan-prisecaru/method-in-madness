import {
  Component,
  ViewChild,
  ElementRef
} from '@angular/core';

import { GraphicLib, IGraphicComponentModel } from '@shared/resources/GraphicLib';
import BarChartMock = require('@server/mock/barChart.js');

import * as d3 from 'd3';

import './barChart.css';

const BAR_CHART_OFFSET: number = 20;
const BAR_CHART_ITEM_WIDTH: number = 100;
const BAR_CHART_ITEM_GUTTER: number = 10;

interface IRectItem {
  color: string;
  count?: number;
  id: string;
  label: string;
  height: number;
  width: number;
  y: number;
  x: number;
}

@Component({
  selector: 'barChart',
  templateUrl: './barChart.html'
})

export class BarChartComponent {
  @ViewChild('svg') element: ElementRef; // get the root element of component

  public barChartModel: IGraphicComponentModel = {
    ui: {
      height: null,
      width: null,
      offset: null
    },
    dom: {
      container: 'chord',
      svg: 'chord-svg',
      groups: {
        barChartRectGraphics: 'bar-chart-rect-graphics',
        barChartRectLabels: 'bar-chart-rect-labels',
      },
      elements: {
        barChartRectGraphic: 'bar-chart-rect-graphic',
        barChartRectLabel: 'bar-chart-rect-label',
      }
    }
  }

  private mock = new BarChartMock();
  private rects = this.mock.rects;

  // main content
  private svg = null;

  // grouping content
  private barChartRectGraphics = null;
  private barChartRectLabels = null;

  ngOnInit(): void {
    this.setConfig();
    this.setContent();
    this.render();
  }

  /**
   * Sets the UI config
   */
  setConfig(): void {
    this.svg = d3.select(this.element.nativeElement);
    this.barChartModel.ui.height = parseInt(this.svg.style('height'), 10);
    this.barChartModel.ui.width = parseInt(this.svg.style('width'), 10);
    this.barChartModel.ui.offset = BAR_CHART_OFFSET;
  }

  /**
   * Sets the DOM content
   */
  setContent(): void {
    Object.keys(this.barChartModel.dom.groups).forEach(key => {
      this[key] = this.svg
        .select(`g.${this.barChartModel.dom.groups[key]}`)
        .attr('transform', () => `translate(${0}, ${this.barChartModel.ui.height})`);
    });
  }

  /**
   * Render function
   */
  render(): void {
    this.svg.attr('width', this.barChartModel.ui.width).attr('height', this.barChartModel.ui.height);
    this.setRects();
  }

  /**
   * Sets the rects
   */
  setRects(): void {
    let data = this.getRects(this.rects);

    this.setRectGraphics(data);
    this.setRectLabels(data);
  }

  /**
   * Sets the rect graphics
   * @param data - Provided data set
   */
  setRectGraphics(data): void {
    this.barChartRectGraphics
      .selectAll(`rect.${this.barChartModel.dom.elements.barChartRectGraphic}`)
      .data(data, function(data: any) { return data.id; })
      .call(this.renderRectGraphic, `${this.barChartModel.dom.elements.barChartRectGraphic}`);
  }

  /**
   * Sets the rect labels
   * @param data - Provided data set
   */
  setRectLabels(data): void {
    this.barChartRectLabels
      .selectAll(`text.${this.barChartModel.dom.elements.barChartRectLabel}`)
      .data(data, function(data: any) { return data.id; })
      .call(this.renderRectLabel, `${this.barChartModel.dom.elements.barChartRectLabel}`);
  }

  /**
   * Resolves the rect data
   */
  getRects(rects) {
    let maxCount = GraphicLib.getMaxByKey('count', rects);
    let scale = d3.scaleLinear().domain([0, maxCount]).range([0, this.barChartModel.ui.height - this.barChartModel.ui.offset]);

    return rects.map(rect => {
      return Object.assign(rect, {
        height: Math.floor(scale(rect.count)),
        width: BAR_CHART_ITEM_WIDTH
      });
    });
  }

  /**
   * Render the rect graphic
   */
  renderRectGraphic(selection: d3.Selection<SVGElement, IRectItem, HTMLElement, {}>, tag: string) {
    // Enter
    selection
      .enter()
      .append('rect')
      .attr('class', tag)
      .attr('height', function(d) { return d.height; })
      .attr('width', function(d) { return d.width; })
      .attr('x', function(d, i) { return (d.width + BAR_CHART_ITEM_GUTTER) * i; })
      .attr('y', function(d) { return d.height * -1; })
      .style('fill', function(d) { return d.color; });

    // Update
    selection
      .attr('height', function(d) { return d.height; })
      .attr('width', function(d) { return d.width; })
      .attr('x', function(d, i) { return (d.width + BAR_CHART_ITEM_GUTTER) * i; })
      .attr('y', function(d) { return d.height * -1; })
      .style('fill', function(d) { return d.color; });

    // Exit
    selection.exit().remove();

    return selection;
  }

  /**
   * Render the rect label
   */
  renderRectLabel(selection: d3.Selection<SVGElement, IRectItem, HTMLElement, {}>, tag: string) {
    // Enter
    selection
      .enter()
      .append('text')
      .attr('class', tag)
      .attr('x', function(d, i) { return (d.width + BAR_CHART_ITEM_GUTTER) * i; })
      .attr('y', function(d) { return (d.height + 10) * -1; })
      .text(function(d) { return d.label });

    // Update
    selection
      .attr('x', function(d, i) { return (d.width + BAR_CHART_ITEM_GUTTER) * i; })
      .attr('y', function(d) { return (d.height + 10) * -1; })
      .text(function(d) { return d.label });

    // Exit
    selection.exit().remove();

    return selection;
  }
}
