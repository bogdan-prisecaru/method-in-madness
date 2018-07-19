import {
  Component,
  ViewChild,
  ElementRef
} from '@angular/core';

import * as d3 from 'd3';

import { GraphicLib } from '@shared/resources/GraphicLib';

@Component({
  selector: 'chord',
  templateUrl: '.chord.html'
})

export class ChordComponent {
  @ViewChild('section') element: ElementRef; // get the root element of component

  public chordModel = {
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
        chordOuterBandSegments: 'chord-outer-band-segments',
        chordOuterBandLabels: 'chord-outer-band-labels',
        chordInnerBandSegments: 'chord-inner-band-segments',
        chordInnerBandLabels: 'chord-inner-band-labels',
        chordNodeGraphics: 'chord-node-graphics',
        chordNodeLabels: 'chord-node-labels',
        chordArcs: 'chord-arcs',
      },
      elements: {
        chordOuterBandSegment: 'chord-outer-band-segment',
        chordOuterBandLabel: 'chord-outer-band-label',
        chordInnerBandSegment: 'chord-inner-band-segment',
        chordInnerBandLabel: 'chord-inner-band-label',
        chordNodeGraphic: 'chord-node-graphic',
        chordNodeLabel: 'chord-node-label',
        chordArc: 'chord-arc',
      }
    }
  }

  // main content
  private container = d3.select(this.element[0]);
  private svg = this.container.select(`.${this.chordModel.dom.svg}`);

  // grouping content
  private chordOuterBandSegments = null;
  private chordOuterBandLabels = null;
  private chordInnerBandSegments = null;
  private chordInnerBandLabels = null;
  private chordNodeGraphics = null;
  private chordNodeLabels = null;
  private chordArcs = null;

  $onInit(): void {
    this.setConfig();
    this.setContent();
    this.render();
  }

  /**
   * Sets the UI config
   */
  setConfig(): void {
    this.chordModel.ui.height = parseInt(this.container.style('height'), 10);
    this.chordModel.ui.width = parseInt(this.container.style('width'), 10);
    this.chordModel.ui.offset = 120;
    this.chordModel.ui.radius = GraphicLib.getRadiusByDimensions(this.chordModel.ui);
  }

  /**
   * Sets the DOM content
   */
  setContent(): void {
    Object.keys(this.chordModel.dom.groups).forEach(key => {
      this[key] = this.svg
        .select(`g.${this.chordModel.dom.groups[key]}`)
        .attr('transform', () => `translate(${this.chordModel.ui.width / 2}, ${this.chordModel.ui.height / 2})`);
    });
  }

  /**
   * Render function
   */
  render(): void {
    this.svg.attr('width', this.chordModel.ui.width).attr('height', this.chordModel.ui.height);
  }

  /**
   * Sets bands
   */
  setBands(): void {

  }

  /**
   * Sets nodes
   */
  setNodes(): void {
    this.chordNodeGraphics
      .selectAll(`use.${this.chordModel.dom.elements.chordNodeGraphic}`)
      .data([])
      .call(this.renderNodeGraphic, `${this.chordModel.dom.elements.chordNodeGraphic}`);

    this.chordNodeLabels
      .selectAll(`use.${this.chordModel.dom.elements.chordNodeLabel}`)
      .data([])
      .call(this.renderNodeLabel, `${this.chordModel.dom.elements.chordNodeLabel}`, this.chordModel.ui);
  }

  /**
   * Sets arcs
   */
  setArcs(): void {

  }

  /**
   * Resolves a node graphic(image) selection
   * @param selection - D3 selection
   * @returns a <use> selection
   */
  renderNodeGraphic(selection, tag: string) {
    // Enter
    selection
      .enter()
      .append('use')
      .attr('class', tag)
      .attr('transform', (d) => `translate(${d.x - (d.size / 2)},${d.y - (d.size / 2)})`)
      .attr('xlink:href', (d) => `#${d.defsId}`);

    // Update
    selection
      .attr('transform', (d) => `translate(${d.x - (d.size / 2)},${d.y - (d.size / 2)})`)
      .attr('xlink:href', (d) => `#${d.defsId}`);

    // Exit
    selection.exit().remove();

    return selection;
  }

  /**
   * Resolves a node label selection
   * @param selection - D3 selection
   * @returns a <text> selection
   */
  renderNodeLabel(selection, tag, { width, height, offset }) {
    // Enter
    selection
      .enter()
      .append('text')
      .attr('class', tag)
      .attr('text-anchor', function(d) { return d.angle > 180 ? 'end' : 'start'; })
      .attr('transform', function(d) {
        return GraphicLib.getTransformByQuadrant({ angle: d.angle, radius: d.radius + offset / 2 });
      })
      .text(function(d) { return d.label; });

    // Update
    selection
      .attr('text-anchor', function(d) { return d.angle > 180 ? 'end' : 'start'; })
      .attr('transform', function(d) {
        return GraphicLib.getTransformByQuadrant({ angle: d.angle, radius: d.radius + offset });
      })
      .text(function(d) { return d.label; });

    // Exit
    selection.exit().remove();

    return selection;
  }
}
