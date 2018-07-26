import {
  Component,
  ViewChild,
  ElementRef
} from '@angular/core';

import * as d3 from 'd3';

import './chord.css';
import { GraphicLib } from '@shared/resources/GraphicLib';
const ChordMock = require('@server/mock/chord.js');

@Component({
  selector: 'chord',
  templateUrl: './chord.html'
})

export class ChordComponent {
  @ViewChild('svg') element: ElementRef; // get the root element of component

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
        chordOuterBandArcs: 'chord-outer-band-arcs',
        chordOuterBandLabels: 'chord-outer-band-labels',
        chordInnerBandArcs: 'chord-inner-band-arcs',
        chordInnerBandLabels: 'chord-inner-band-labels',
        chordNodeGraphics: 'chord-node-graphics',
        chordNodeLabels: 'chord-node-labels',
        chordConnections: 'chord-connections',
      },
      elements: {
        chordOuterBandArc: 'chord-outer-band-arc',
        chordOuterBandLabel: 'chord-outer-band-label',
        chordInnerBandArc: 'chord-inner-band-arc',
        chordInnerBandLabel: 'chord-inner-band-label',
        chordNodeGraphic: 'chord-node-graphic',
        chordNodeLabel: 'chord-node-label',
        chordConnection: 'chord-connection',
      }
    }
  }

  private mock = new ChordMock(10, 120);
  private nodes = this.mock.nodes;
  private segments = [];

  // main content
  // private container = d3.select(this.element);
  private svg = null;
  // private svg = this.container.select(`.${this.chordModel.dom.svg}`);

  // grouping content
  private chordOuterBandArcs = null;
  private chordOuterBandLabels = null;
  private chordInnerBandArcs = null;
  private chordInnerBandLabels = null;
  private chordNodeGraphics = null;
  private chordNodeLabels = null;
  private chordConnections = null;

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
    this.chordModel.ui.height = parseInt(this.svg.style('height'), 10);
    this.chordModel.ui.width = parseInt(this.svg.style('width'), 10);
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
    this.setBands();
    this.setNodes();
    this.setConnections();
  }

  /**
   * Sets bands
   */
  setBands(): void {
    this.segments = this.getOuterSegments(Array.from(new Set(this.nodes.map(node => node.tags[0])))); // main segments

    this.setOuterBands(this.segments);
    this.setInnerBands(GraphicLib.getConcatListByKey('segments', this.segments));
  }

  /**
   * Sets outer bands
   */
  setOuterBands(segments): void {
    this.chordOuterBandArcs
      .selectAll(`path.${this.chordModel.dom.elements.chordOuterBandArc}`)
      .data(segments, function(segment: any) { return segment.id; })
      .call(this.renderBandSegmentArc, `${this.chordModel.dom.elements.chordOuterBandArc}`);

    this.chordOuterBandLabels
      .selectAll(`text.${this.chordModel.dom.elements.chordOuterBandLabel}`)
      .data(segments, function(segment: any) { return segment.id; })
      .call(this.renderBandSegmentLabel, `${this.chordModel.dom.elements.chordOuterBandLabel}`);
  }

  /**
   * Sets inner bands
   */
  setInnerBands(segments): void {
    this.chordInnerBandArcs
      .selectAll(`path.${this.chordModel.dom.elements.chordInnerBandArc}`)
      .data(segments, function(segment: any) { return segment.id; })
      .call(this.renderBandSegmentArc, `${this.chordModel.dom.elements.chordInnerBandArc}`);

    this.chordInnerBandLabels
      .selectAll(`text.${this.chordModel.dom.elements.chordInnerBandLabel}`)
      .data(segments.filter(s => s.nodes.length !== 0), function(segment: any) { return segment.id; })
      .call(this.renderBandSegmentLabel, `${this.chordModel.dom.elements.chordInnerBandLabel}`);
  }

  /**
   * Sets nodes
   */
  setNodes(): void {
    let nodes = GraphicLib.getConcatListByKey('nodes', this.segments);

    this.chordNodeGraphics
      .selectAll(`use.${this.chordModel.dom.elements.chordNodeGraphic}`)
      .data(nodes, function(node: any) { return node.id; })
      .call(this.renderNodeGraphic, `${this.chordModel.dom.elements.chordNodeGraphic}`);

    this.chordNodeLabels
      .selectAll(`use.${this.chordModel.dom.elements.chordNodeLabel}`)
      .data(nodes, function(node: any) { return node.id; })
      .call(this.renderNodeLabel, `${this.chordModel.dom.elements.chordNodeLabel}`, this.chordModel.ui);
  }

  /**
   * Sets connections
   */
  setConnections(): void {
    this.chordConnections
      .selectAll(`path.${this.chordModel.dom.elements.chordConnection}`)
      .data(this.getConnections(this.nodes))
      .call(this.renderConnection, `${this.chordModel.dom.elements.chordConnection}`);
  }

  /**
   * Resolves the outer band segments
   */
  getOuterSegments(tags) {
    let outerSegments = tags.map((tag) => { // here we create an array with preliminary data
      let nodes = this.nodes.filter(node => node.tags.indexOf(tag) !== -1);

      return {
        id: tag,
        color: `#${((1 << 24) * Math.random() | 0).toString(16)}`,
        label: `(${nodes.length}) ${new Array(5).fill(null).map(() => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8)).join('-')}`,
        nodes: nodes,
        children: Array.from(new Set(nodes.map(node => node.tags[1]))) // need a way to make the index dynamic
      }
    });

    return outerSegments.map(this.getOuterSegment.bind(this));
  }

  /**
   * Resolves an outer band segment
   */
  getOuterSegment(segment, i, segments) {
    let outerSegment = Object.assign({}, segment, {
      innerRadius: this.chordModel.ui.radius + 60,
      outerRadius: this.chordModel.ui.radius + 30,
      startAngle: GraphicLib.getArcAngle(segments, i, 'nodes'),
      endAngle: GraphicLib.getArcAngle(segments, i + 1, 'nodes')
    });

    outerSegment.nodes = this.getNodes(outerSegment);
    outerSegment.segments = this.getInnerSegments(outerSegment);

    return outerSegment;
  }

  /**
   * Resolves the inner band segments
   */
  getInnerSegments(parentSegment) {
    let innerSegments = parentSegment.children.map(tag => {
      let nodes = parentSegment.nodes.filter(node => node.tags.indexOf(tag) !== -1);

      return {
        id: `${tag}${parentSegment.id}`,
        color: `#${((1 << 24) * Math.random() | 0).toString(16)}`,
        label: `(${nodes.length}) ${new Array(5).fill(null).map(() => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8)).join('-')}`,
        nodes: nodes
      }
    });

    return innerSegments.map((innerSegment, i) => {
      return Object.assign(innerSegment, {
        innerRadius: this.chordModel.ui.radius,
        outerRadius: this.chordModel.ui.radius + 30,
        startAngle: GraphicLib.getChildArcAngle(parentSegment, i),
        endAngle: GraphicLib.getChildArcAngle(parentSegment, i + 1)
      });
    });
  }

  /**
   * Resolves nodes
   */
  getNodes(segment) {
    let scale = GraphicLib.getLinearBetweenAngles(segment.nodes.length, segment.startAngle, segment.endAngle);
    let radius = this.chordModel.ui.radius;

    return segment.nodes.map((node, i) => {
      let theta = scale(i + 0.5);

      return Object.assign(node, {
        angle: theta * 180 / Math.PI,
        radius: radius,
        x: Math.sin(theta) * radius,
        y: Math.cos(theta) * radius * -1,
        size: 12
      });
    });
  }

  /**
   * Resolves connections
   */
  getConnections(nodes) {
    return new Array(Math.floor(Math.random() * 100) + 1).fill(null).map(() => {
      return {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8),
        source: nodes[Math.floor(Math.random() * nodes.length)],
        destination: nodes[Math.floor(Math.random() * nodes.length)],
      }
    });
  }

  /**
   * Render a segment arc
   */
  renderBandSegmentArc(selection, tag: string) {
    // Enter
    selection
      .enter()
      .append('path')
      .attr('class', tag)
      .attr('id', function(d) { return d.id; })
      .attr('d', GraphicLib.getArc())
      .style('fill', function(d) { return d.color; });

    // Update
    selection
      .attr('d', GraphicLib.getArc())
      .style('fill', function(d) { return d.color; });

    // Exit
    selection.exit().remove();

    return selection;
  }

  /**
   * Render a segment label
   */
  renderBandSegmentLabel(selection, tag: string) {
    // Enter
    selection
      .enter()
      .append('text')
      .attr('class', tag)
      .attr('dy', (d) => GraphicLib.getArcMiddlePoint(d).dy)
      .attr('dx', (d) => GraphicLib.getArcMiddlePoint(d).dx)
      .append('textPath')
      .attr('xlink:href', (d) => `#${d.id}`)
      .text(function(d) {
        return ChordComponent.getAdjustedSegmentLabel(d);
      });

    // Update
    selection
      .attr('dy', (d) => GraphicLib.getArcMiddlePoint(d).dy)
      .attr('dx', (d) => GraphicLib.getArcMiddlePoint(d).dx)
      .select('textPath')
      .attr('xlink:href', (d) => `#${d.id}`)
      .text(function(d) {
        return ChordComponent.getAdjustedSegmentLabel(d);
      });

    // Exit
    selection.exit().remove();

    return selection;
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
      .text(function(d) { return d.label; })
      .text(function(d) {
        let elementLength = GraphicLib.getRenderedTextLength(this);
        return ChordComponent.getAdjustedNodeLabel(d.label, elementLength, GraphicLib.convertToRadians(d.angle), d.radius + offset, { width, height });
      });

    // Update
    selection
      .attr('text-anchor', function(d) { return d.angle > 180 ? 'end' : 'start'; })
      .attr('transform', function(d) {
        return GraphicLib.getTransformByQuadrant({ angle: d.angle, radius: d.radius + offset / 2 });
      })
      .text(function(d) { return d.label; })
      .text(function(d) {
        let elementLength = GraphicLib.getRenderedTextLength(this);
        return ChordComponent.getAdjustedNodeLabel(d.label, elementLength, GraphicLib.convertToRadians(d.angle), d.radius + offset, { width, height });
      });

    // Exit
    selection.exit().remove();

    return selection;
  }

  /**
   * Resolves a connection between nodes
   * @param selection - D3 selection
   * @returns a <text> selection
   */
  renderConnection(selection, tag: string) {
    // Enter
    selection
      .enter()
      .append('path')
      .attr('class', tag)
      .attr('d', function(d) {
        let line = GraphicLib.getLine();
        return line(GraphicLib.getLineCoords(d.source, d.destination));
      });

    // Update
    selection
      .attr('d', function(d) {
        let line = GraphicLib.getLine();
        return line(GraphicLib.getLineCoords(d.source, d.destination));
      })
      .each(function(d) {
        d3.select(this).attr(d.attrs);
      });

    // Exit
    selection.exit().remove();

    return selection;
  }

  /**
   * Resolves a segment label, if it's bigger than arc length, the text is sliced
   * @param segment - chord segment
   * @param {number} renderedLabelLength - the length of the already rendered text - median length is 8
   */
  static getAdjustedSegmentLabel(segment, renderedCharLength: number = 8): string {
    let label = `${segment.label}`;
    let arcLength = GraphicLib.getArcLength(segment.startAngle, segment.endAngle, segment.innerRadius);
    let visibleCharLimit = Math.floor(arcLength / renderedCharLength);

    if (visibleCharLimit > label.length) { return label; }

    return GraphicLib.getSlicedText(label, label.length - visibleCharLimit);
  }

  /**
   * Resolves a node label, if it's outside container, the text is sliced
   * @param label
   * @param elementLength
   * @param angle - Node angle
   * @param radius - Radius from circle center to start of label
   * @param ...args - Destructured argument - Container Sizes
   */
  static getAdjustedNodeLabel(label, elementLength, angle: number, radius: number, { width, height }): string {
    let charLength = Math.floor(elementLength / `${label}`.length);
    let labelRadius = radius + elementLength + 2 * charLength; //radius from center circle to end of text // 2 * charLength is an error margin
    let endpointX = Math.abs(GraphicLib.getCoordXbyRadial(angle, labelRadius)); // determine coords of the end of the text - endpoint
    let endpointY = Math.abs(GraphicLib.getCoordYbyRadial(angle, labelRadius));
    // get the max length of the sides determinated by the parallels to 0x, 0y and endpoint
    // the text length parralel to 0x or 0y that overflows
    let overflowDiff = Math.ceil(Math.max(endpointX - width / 2, endpointY - height / 2));

    if (overflowDiff < 0) { return `${label}`; } // if the diffs between endpoint and container limits < 0, the text does NOT overflow

    // the text length that overflows is represented by the hypotenuse of the formed right angled triangle
    // adjacentAngle is determinated based on node's angle
    let adjacentAngle = angle % (Math.PI / 2);
    // if adjacentAngle < 45deg then it is equal to angle because they are interior angles determinated by 2 parralel lines
    // if adjacentAngle >= 45deg then the interior angle is computed by substracting node's angle from 90 deg
    if (adjacentAngle >= Math.PI / 4) { adjacentAngle = Math.PI / 2 - adjacentAngle; }
    let overflowLength = overflowDiff / (Math.cos(adjacentAngle) || 1);

    return GraphicLib.getSlicedText(`${label}`, Math.abs(Math.ceil(overflowLength / charLength)))
  }
}
