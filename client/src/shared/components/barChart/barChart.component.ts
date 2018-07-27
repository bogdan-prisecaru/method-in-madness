import {
  Component,
  ViewChild,
  ElementRef
} from '@angular/core';

import { GraphicLib, IGraphicComponentModel } from '@shared/resources/GraphicLib';
import * as d3 from 'd3';

import './barChart.css';

const BarChartMock = require('@server/mock/barChart.js');

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
      radius: null,
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
    this.barChartModel.ui.offset = 120;
    this.barChartModel.ui.radius = GraphicLib.getRadiusByDimensions(this.barChartModel.ui);
  }

  /**
   * Sets the DOM content
   */
  setContent(): void {
    Object.keys(this.barChartModel.dom.groups).forEach(key => {
      this[key] = this.svg
        .select(`g.${this.barChartModel.dom.groups[key]}`)
        // .attr('transform', () => `translate(${this.barChartModel.ui.width / 2 }, ${this.barChartModel.ui.height / 2})`);
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
  setRects() {
    let data = this.getRects(this.rects);
    console.log(data);
    this.setRectGraphics(data);
    this.setRectLabels(data);
  }

  /**
   * Sets the rect graphics
   */
  setRectGraphics(data) {
    this.barChartRectGraphics
      .selectAll(`rect.${this.barChartModel.dom.elements.barChartRectGraphic}`)
      .data(data, function(data: any) { return data.id; })
      .call(this.renderRectGraphic, `${this.barChartModel.dom.elements.barChartRectGraphic}`);
  }

  /**
   * Sets the rect labels
   */
  setRectLabels(data) {
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
    let scale = d3.scaleLinear().domain([0, maxCount]).range([0, this.barChartModel.ui.height]);

    return rects.map(rect => {
      return Object.assign(rect, {
        height: scale(rect.count)
      });
    });
  }

  /**
   * Render the rect graphic
   */
  renderRectGraphic(selection, tag: string) {
    // Enter
    selection
      .enter()
      .append('rect')
      .attr('class', tag)
      // .attr('transform', function(d, i) {
      //   return `translate(${100 * i}, 0)`;
      // })
      .attr('x', function(d, i){ return 100 * i; })
      .attr('y', function(d, i){ return 200; })
      .attr('width', '100px')
      .attr('height', function(d) { return d.height; })
      .style('fill', function(d) { return d.color; });

    // Exit
    selection.exit().remove();

    return selection;
  }

  /**
   * Render the rect label
   */
  renderRectLabel(selection, tag: string) {
    // Enter
    selection
      .enter()
      .append('text')
      .attr('class', tag);

    // Exit
    selection.exit().remove();

    return selection;
  }
}
