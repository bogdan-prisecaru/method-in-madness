import {
  Component,
  ViewChild,
  ElementRef
} from '@angular/core';

import { GraphicLib, IGraphicComponentModel } from '@shared/resources/GraphicLib';
import ChordMock = require('@server/mock/chord.js');

import * as d3 from 'd3';

import './chord.css';

@Component({
  selector: 'chord',
  templateUrl: './chord.html'
})

export class ChordComponent {
  @ViewChild('svg') element: ElementRef; // get the root element of component

  public chordModel: IGraphicComponentModel = {
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
  };

  private mock = new ChordMock(10, 120);
  private nodes = this.mock.nodes;
  private segments = [];

  // main content
  private svg = null;

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
    this.segments = this.getOuterSegmentList(Array.from(new Set(this.nodes.map(node => node.tags[0])))); // main segments
    console.table(this.segments);
    this.setOuterBands(this.segments);
    this.setInnerBands(GraphicLib.getAggregatedByKey('segments', this.segments));
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
      .data(segments.filter(s => s.nodes.length !== 0), function(segment: any) { return segment.id; }) //.filter(s => s.nodes.length !== 0)
      .call(this.renderBandSegmentLabel, `${this.chordModel.dom.elements.chordInnerBandLabel}`);
  }

  /**
   * Sets nodes
   */
  setNodes(): void {
    let nodes = GraphicLib.getAggregatedByKey('nodes', this.segments);

    this.chordNodeGraphics
      .selectAll(`use.${this.chordModel.dom.elements.chordNodeGraphic}`)
      .data(nodes, function(node: any) { return node.id; })
      .call(this.renderNodeGraphic, `${this.chordModel.dom.elements.chordNodeGraphic}`);

    this.chordNodeLabels
      .selectAll(`text.${this.chordModel.dom.elements.chordNodeLabel}`)
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
  getOuterSegmentList(tags) {
    let outerSegmentList = tags.map((tag) => { // here we create an array with preliminary data
      let nodes = this.nodes.filter(node => node.tags.indexOf(tag) !== -1);

      return {
        id: tag,
        color: `#${((1 << 24) * Math.random() | 0).toString(16)}`,
        label: `(${nodes.length}) ${new Array(5).fill(null).map(() => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8)).join('-')}`,
        nodes: nodes,
        children: Array.from(new Set(nodes.map(node => node.tags[1]))), // need a way to make the index dynamic
      }
    });

    return outerSegmentList.map(this.getOuterSegment.bind(this));
  }

  /**
   * Resolves an outer band segment
   */
  getOuterSegment(segment, i, segments) {
    let outerSegment = Object.assign({}, segment, {
      innerRadius: this.chordModel.ui.radius + 60,
      outerRadius: this.chordModel.ui.radius + 30,
      startAngle: GraphicLib.getArcAngleByKey('nodes', segments, i),
      endAngle: GraphicLib.getArcAngleByKey('nodes', segments, i + 1)
    });

    outerSegment.nodes = this.getNodes(outerSegment);
    outerSegment.segments = this.getInnerSegmentList(outerSegment)

    return outerSegment;
  }

  /**
   * Resolves the inner band segments
   */
  getInnerSegmentList(parentSegment) {
    let innerSegmentList = parentSegment.children.map(tag => {
      let nodes = parentSegment.nodes.filter(node => node.tags.indexOf(tag) !== -1);

      return {
        id: `${tag}${parentSegment.id}`,
        color: `#${((1 << 24) * Math.random() | 0).toString(16)}`,
        label: `(${nodes.length}) ${new Array(5).fill(null).map(() => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8)).join('-')}`,
        nodes: nodes
      }
    });

    return innerSegmentList.map((innerSegment, i) => {
      return Object.assign(innerSegment, {
        innerRadius: this.chordModel.ui.radius,
        outerRadius: this.chordModel.ui.radius + 30,
        startAngle: this.getInnerSegmentAngle(parentSegment, i),
        endAngle: this.getInnerSegmentAngle(parentSegment, i + 1)
      });
    });
  }

  /**
   * Resolves an inner segment angle
   * @param parent - Parent segment
   * @param index- Index of current iteration
   */
  getInnerSegmentAngle(parent, index: number) {
    let scale = d3.scaleLinear().domain([0, parent.nodes.length]).range([0, parent.endAngle - parent.startAngle]);

    return parent['children'].reduce((acc, item, i) => {
      if (i >= index) { return acc; }

      return acc + scale(parent.nodes.filter(node => node.tags.indexOf(item) !== -1).length);
    }, parent.startAngle)
  }

  /**
   * Resolves nodes
   */
  getNodes(segment) {
    let scale = d3.scaleLinear().domain([0, segment.nodes.length]).range([segment.startAngle, segment.endAngle]);
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
   * Renders a band segment arc
   */
  renderBandSegmentArc(selection: d3.Selection<SVGElement, any, HTMLElement, {}>, tag: string) {
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
   * Renders a band segment label
   */
  renderBandSegmentLabel(selection: d3.Selection<SVGElement, any, HTMLElement, {}>, tag: string) {
    // Enter
    selection
      .enter()
      .append('text')
      .attr('class', tag)
      .attr('dy', (d) => GraphicLib.getArcMidpoint(d).dy)
      .attr('dx', (d) => GraphicLib.getArcMidpoint(d).dx)
      .append('textPath')
      .attr('xlink:href', (d) => `#${d.id}`)
      .text(function(d) { return d.label; })
      .text(function(d) {
        return GraphicLib.getTextFittedByArc(this, d);
      });

    // Update
    selection
      .attr('dy', (d) => GraphicLib.getArcMidpoint(d).dy)
      .attr('dx', (d) => GraphicLib.getArcMidpoint(d).dx)
      .select('textPath')
      .attr('xlink:href', (d) => `#${d.id}`)
      .text(function(d) { return d.label; })
      .text(function(d) {
        return GraphicLib.getTextFittedByArc(this, d);
      });

    // Exit
    selection.exit().remove();

    return selection;
  }

  /**
   * Renders a node graphic (image)
   * @returns a <use> selection
   */
  renderNodeGraphic(selection: d3.Selection<SVGElement, any, HTMLElement, {}>, tag: string) {
    // Enter
    selection
      .enter()
      .append('use')
      .attr('class', tag)
      .attr('transform', function(d) {
        return `translate(${d.x - (d.size / 2)},${d.y - (d.size / 2)})`;
      })
      .attr('xlink:href', function(d) {
        return `#${d.defsId}`;
      });

    // Update
    selection
      .attr('transform', function(d) {
        return `translate(${d.x - (d.size / 2)},${d.y - (d.size / 2)})`;
      })
      .attr('xlink:href', function(d) {
        return `#${d.defsId}`;
      });

    // Exit
    selection.exit().remove();

    return selection;
  }

  /**
   * Renders a node label
   * @returns a <text> selection
   */
  renderNodeLabel(selection: d3.Selection<SVGElement, any, HTMLElement, {}>, tag: string, { width, height, offset }) {
    // Enter
    selection
      .enter()
      .append('text')
      .attr('class', tag)
      .attr('text-anchor', function(d) {
        return d.angle > 180 ? 'end' : 'start';
      })
      .attr('transform', function(d) {
        return GraphicLib.getTextTransformByRadius(d.radius + offset / 2, d.angle);
      })
      .text(function(d) { return d.label; })
      .text(function(d) {
        return GraphicLib.getTextFittedByContainer(this, { width, height }, d.angle, d.radius + 60);
      });

    // Update
    selection
      .attr('text-anchor', function(d) {
        return d.angle > 180 ? 'end' : 'start';
      })
      .attr('transform', function(d) {
        return GraphicLib.getTextTransformByRadius(d.radius + offset / 2, d.angle);
      })
      .text(function(d) { return d.label; })
      .text(function(d) {
        return GraphicLib.getTextFittedByContainer(this, { width, height }, d.angle, d.radius + 60);
      });

    // Exit
    selection.exit().remove();

    return selection;
  }

  /**
   * Renders a connection between nodes
   * @returns a <path> selection
   */
  renderConnection(selection: d3.Selection<SVGElement, any, HTMLElement, {}>, tag: string) {
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
}
