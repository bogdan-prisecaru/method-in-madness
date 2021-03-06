import * as d3 from 'd3'; // maybe move this as dep ?

const D3_LOWER_QUADRANT_START: number = 90;
const D3_LOWER_QUADRANT_STOP: number = 270;

export interface IGraphicComponentModel {
  ui: {
    height: number;
    width: number;
    offset?: number;
    radius?: number;
  };
  dom: {
    container: string;
    svg: string;
    groups: { [key: string]: string };
    elements: { [key: string]: string }
  };
}

export interface IBasicArc {
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
}

/**
 * Utility class for d3 graphics
 * @author Prisecaru Bogdan
 */
export class GraphicLib {

  static convertToRadians(angle: number): number {
    return angle * Math.PI / 180;
  }

  static convertToDegress(angle: number): number {
    return angle * 180 / Math.PI;
  }

  static getCoordXbyRadial(angle: number, radial: number): number {
    return Math.sin(angle) * radial;
  }

  static getCoordYbyRadial(angle: number, radial: number): number {
    return Math.cos(angle) * radial * -1;
  }

  /**
   * Resolves the maximum item from a data set based on a key
   * It expects the key value to be a number
   * @param key - Object key by which to look for
   * @param data - Data to be iterated for max value
   */
  static getMaxByKey(key: string, data: any[]): number {
    return Math.max.apply(null, data.map(d => d[key]));
  }

  /**
   * Resolves a radius between a given width & height (with offset as optional)
   * @param ..args - Object with dimension data {width, height, offset}
   * @returns radius
   */
  static getRadiusByDimensions({ height = 0, width = 0, offset = 0 }): number {
    return Math.min(height / 2, width / 2) - offset;
  }

  /**
   * Resolves the length of the rendered text
   * @param - {SVGTextContentElement} element - text element context
   * @returns
   */
  static getRenderedTextLength(element: SVGTextContentElement): number {
    return Math.ceil(element.getComputedTextLength());
  }

  /**
   * Resolves a sliced text
   * @param text - string to be sliced
   * @param n - number of chars that have to be sliced from the end of text
   * @param appendix - what should we replace the last chars with
   * @returns
   */
  static getSlicedText(text: string, n: number, appendix: string = '...'): string {
    return text.slice(0, -1 * (n + 1)) + appendix;
  }

  /**
   * Resolves the transformation for node labels
   * If the node is in the left quadrants, then rotate clock wise and translate with -radius
   * because the text-anchor is set to end.
   * If the node is in the right quadrants, then rotate counter clock wise and translate with radius
   * because the text-anchor is set to start
   * @return The series of transformation
   */
  static getTransformByQuadrant({ angle, radius }): string {
    return `rotate(${angle + 90 * (angle > 180 ? 1 : -1)})translate(${radius * (angle > 180 ? -1 : 1)})`;
  }

  /**
   * Resolves a line path
   * @returns d3 line
   */
  static getLine(tension: number = 0.5): d3.Line<any> {
    return d3.line()
      .x(function(d: any) { return d.x; })
      .y(function(d: any) { return d.y; })
      .curve(d3.curveBundle.beta(tension));
  }

  /**
   * Resolves a pivot point for connections
   * This is usefull to create a loop between two points in a container
   * @param source - Start coords for connection
   * @param destination - End coords for connection
   * @param radius - Radius to calc coords by radial
   * @returns List of 3 sets of coords
   */
  static getLineCoords(source: any, destination: any, radius: number = 100) {
    if (JSON.stringify(source) === JSON.stringify(destination)) {
      let coords = GraphicLib.convertToRadians(source.angle);
      let c1 = coords + Math.PI * 1 / 2;
      let c2 = coords + Math.PI;
      let c3 = coords + Math.PI * 3 / 2;
      radius /= 2; // divide the radius used to transform radians to coordinates so the loop is smaller than the radius

      return [
        source,
        { x: GraphicLib.getCoordXbyRadial(c1, radius), y: GraphicLib.getCoordYbyRadial(c1, radius) },
        { x: GraphicLib.getCoordXbyRadial(c2, radius), y: GraphicLib.getCoordYbyRadial(c2, radius) },
        { x: GraphicLib.getCoordXbyRadial(c3, radius), y: GraphicLib.getCoordYbyRadial(c3, radius) },
        destination
      ];
    }

    return [source, { x: 0, y: 0 }, destination];
  }

  /**
   * Resolves a boolean to determine if an arc is in lower quadrants (III and IV)
   * d3 starts from the top, what we know to be PI(90) is actually 0 in D3
   * @returns a boolean indicating of it's the lower quadrants
   */
  static isArcInLowerQuadrants(startAngle: number, endAngle: number): boolean {
    return GraphicLib.convertToRadians(D3_LOWER_QUADRANT_START) < startAngle && GraphicLib.convertToRadians(D3_LOWER_QUADRANT_STOP) > endAngle;
  }

  /**
   * Resolves the length of an arc defined by start, end angles and radius
   * @param startAngle
   * @param endAngle
   * @param radius
   * @returns arc length
   */
  static getArcLength(startAngle: number, endAngle: number, radius: number): number {
    return Math.abs(endAngle - startAngle) * radius;
  }

  /**
   * Resolves an arc path
   * @returns d3 arc
   */
  static getArc(): d3.Arc<{}, IBasicArc> {
    return d3.arc()
      .innerRadius((d) => d.innerRadius)
      .outerRadius((d) => d.outerRadius)
      .startAngle((d) => d.startAngle)
      .endAngle((d) => d.endAngle);
  }

  // TODO: Bogdan ---

  /**
   * Resolves an outer segment angle
   * @param data - Band segment data
   * @param index - Index of current segment
   * @param key - Key based on which we prepare our scale
   * @returns
   */
  static getArcAngle(data: any[], index: number, key) {
    let scale = this.getLinearScaleByKey(key, data);

    return data.reduce((acc, item, i) => {
      if (i >= index) { return acc; }

      return Array.isArray(item[key]) ? acc + scale(item[key].length) : acc + scale(item[key]);
    }, 0);
  }

  /**
   * Resolves a child angle
   * @returns
   */
  static getChildArcAngle(parent: any, index: number) {
    let scale = d3.scaleLinear().domain([0, parent.nodes.length]).range([0, parent.endAngle - parent.startAngle]);

    return parent.children.reduce((acc, child: string, i) => {
      if (i >= index) { return acc; }

      return acc + scale(parent.nodes.filter(node => node.tags.indexOf(child) !== -1).length);
    }, parent.startAngle);
  }

  /**
   * Resolves the relative middle point of an arc
   * @param ...args - Destructured argument - Arc properties
   */
  static getArcMiddlePoint({ outerRadius, innerRadius, startAngle, endAngle }): { dx: number, dy: number } {
    let arcHeight: number = Math.abs(outerRadius - innerRadius);
    let middlePointRadius: number = innerRadius + arcHeight / 2;
    let arcLength: number = GraphicLib.getArcLength(startAngle, endAngle, middlePointRadius);

    let dx = arcLength / 2;
    let dy = arcHeight / 2; // (GraphicLib.isAngleInLowerQuadrants(startAngle, endAngle) ? -1 : 1);

    return { dx: dx, dy: dy };
  }

  /**
   * Resolves a concatenated list based on the provided key
   * This is useful if we have an array of objects and said objects have a key that is an Array
   * If we want to get all the values for that key, from all entries, we can use this
   * @param data
   * @param key
   */
  static getConcatListByKey<T>(key: string, data: T[] = []) {
    return data.reduce((acc, item: T) => {
      if (!key || !item.hasOwnProperty(key)) { return acc; }

      acc = acc.concat(item[key]);
      return acc;
    }, []);
  }

  /**
   * Resolves a linear scale between two angles
   * @returns d3 linear scale
   */
  static getLinearBetweenAngles(size: number, startAngle: number, endAngle: number) {
    // [----/----/----]  the reason we add size + 1 is because (i.e) 2 points means 3 segments
    return d3.scaleLinear().domain([0, size]).range([startAngle, endAngle]);
  }

  /**
   * Resolves a chord band segment scale by provided key // TODO : Rename / remake this
   * This method will resolve a scale by:
   * 1. item count if no key provided
   * 2. item value if key provided and value is non-array  i.e obj[key] = 144;
   * 3. item value length if key provided and value is array i.e obj[key] = [{a: b}, {c: d}]
   * @returns d3 chordBandInnerSegment scale
   */
  static getLinearScaleByKey<T>(key: string, data: T[] = [], range: number[] = [0, 2 * Math.PI]) {
    let total = data.reduce((acc, item: T) => {
      if (!key || !item.hasOwnProperty(key)) { return acc; }

      return Array.isArray(item[key]) ? acc + item[key].length : acc + item[key];
    }, 0);
    return d3.scaleLinear().domain([0, total]).range(range);
  }
}
