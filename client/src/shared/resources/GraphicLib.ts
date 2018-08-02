import * as d3 from 'd3';

const D3_LOWER_QUADRANT_START: number = 90;
const D3_LOWER_QUADRANT_STOP: number = 270;

// +-----------> X-axis
// |
// |
// |
// V Y-axis

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

  /**
   * #### // NOTE: General Computation Methods
   */

  static convertToRadians(angle: number): number {
    return angle * Math.PI / 180;
  }

  static convertToDegrees(angle: number): number {
    return angle * 180 / Math.PI;
  }

  static getCoordXbyRadial(angle: number, radial: number): number {
    return Math.sin(angle) * radial;
  }

  static getCoordYbyRadial(angle: number, radial: number): number {
    return Math.cos(angle) * radial * -1;
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
   * Resolves an accumulator based on provided key in data set
   * This is useful if we have an array of objects and said objects have a key that is an Array
   * If we want to get all the values for that key, from all entries, we can use this
   * @param key - Object key by which we base our concat
   * @param data - Data to be provided and used for concatenation
   * @param isConcatResult - Boolean to indicate we want to concat (arrays) the key values
   */
  static getAggregatedByKey(key: string, data: any[] = [], isConcatResult: boolean = true) {
    return data.reduce((acc, item) => {
      if (!key || !item.hasOwnProperty(key)) { return acc; }
      acc = isConcatResult ? acc.concat(item[key]) : acc + (Array.isArray(item[key]) ? item[key].length : item[key]);

      return acc;
    }, isConcatResult ? [] : Array.isArray(data[0][key] ? 0 : 0));
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
   * #### // NOTE: Arc Specific Methods
   */

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

  /**
   * Resolves a boolean to determine if an arc is in lower quadrants (III and IV)
   * d3 starts from the top, what we know to be PI(90) is actually 0 in D3
   * @returns a boolean indicating of it's the lower quadrants
   */
  static isArcInLowerQuadrants(startAngle: number, endAngle: number): boolean {
    return GraphicLib.convertToRadians(D3_LOWER_QUADRANT_START) < startAngle && GraphicLib.convertToRadians(D3_LOWER_QUADRANT_STOP) > endAngle;
  }

  /**
   * Resolves the length of the arc based on formula
   * Arc length	=	2	π	R	 (C / 360)
 	 * @param angle - Central angle of the arc in degrees (C)
   * @param radius - Radius of the arc (R)
   */
  static getArcLength(angle: number, radius: number): number {
    return 2 * Math.PI * radius * (angle / 360);
  }

  /**
   * Resolves the relative middle point of an arc
   * @param arc - The arc of which we must determine the mid point
   */
  static getArcMidpoint(arc: IBasicArc): { dx: number, dy: number } {
    let arcHeight = Math.abs(arc.outerRadius - arc.innerRadius);
    let arcAngle = GraphicLib.convertToDegrees(arc.endAngle - arc.startAngle);
    let midRadius = arcHeight / 2 + arc.innerRadius;
    let arcLength = GraphicLib.getArcLength(arcAngle, midRadius);

    return { dx: arcLength / 2, dy: arcHeight / 2 };
  }

  /**
   * Resolves an arc angle based on provided key in a data set
   * @param key - Key based on which we prepare our scale
   * @param data - Data set provided
   * @param index - Current index in data set
   */
  static getArcAngleByKey(key: string, data: any[], index: number) {
    let scale = d3.scaleLinear().domain([0, GraphicLib.getAggregatedByKey(key, data, false)]).range([0, 2 * Math.PI])

    return data.reduce((acc, item, i) => {
      if (i >= index) { return acc; }

      return Array.isArray(item[key]) ? acc + scale(item[key].length) : acc + scale(item[key]);
    }, 0);
  }

  /**
   * #### // NOTE: Line Specific Methods
   */

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
    if (JSON.stringify(source) === JSON.stringify(destination)) { // might need to make this better
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
   * #### // NOTE: Text Specific Methods
   */

  /**
   * Resolves the length of the rendered text
   * @param element - Text element context
   * @returns The length of the text of the element
   */
  static getTextLength(element: SVGTextContentElement): number {
    return Math.ceil(element.getComputedTextLength());
  }

  /**
   * Resolves the transformation for node labels
   * If the node is in the left quadrants, then rotate clock wise and translate with -radius
   * because the text-anchor is set to end.
   * If the node is in the right quadrants, then rotate counter clock wise and translate with radius
   * because the text-anchor is set to start
   * @return The series of transformation
   */
  static getTextTransformByRadius(radius: number, angle: number): string {
    return `
      rotate(${angle + 90 * (angle > 180 ? 1 : -1)})
      translate(${radius * (angle > 180 ? -1 : 1)})
    `;
  }

  /**
   * Resolves an overflown text
   * @param element - Text element
   * @param limit - Size limit
   * @param offset - Padding of text
   */
  static getTextByLimit(element, limit: number, offset: number = 40): string {
    let textLength = GraphicLib.getTextLength(element);
    let textContent = element.textContent;
    let d3element = d3.select(element);

    while ((textLength + offset) > limit && textContent.length > 0) {
      textContent = textContent.slice(0, -1);
      d3element.text(textContent);
      textLength = GraphicLib.getTextLength(d3element.node());
    }

    return textContent + '...';
  }

  /**
   * Resolves a fitted text by provided arc
   * @param element - Text element
   * @param arc - Arc into which we will fit the text
   */
  static getTextFittedByArc(element, arc: IBasicArc) {
    let arcHeight = Math.abs(arc.outerRadius - arc.innerRadius);
    let arcAngle = GraphicLib.convertToDegrees(arc.endAngle - arc.startAngle);
    let midRadius = arcHeight / 2 + arc.innerRadius;
    let arcLength = GraphicLib.getArcLength(arcAngle, midRadius);

    return GraphicLib.getTextByLimit(element, arcLength);
  }

  /**
   * Resolves a text in a container by making sure it fits
   */
  static getTextFittedByContainer(element, container, angle: number, radius: number) {
    // let textEndpointX = Math.abs(GraphicLib.getCoordXbyRadial(angle, radius + GraphicLib.getTextLength(element)));
    // let textEndpointY = Math.abs(GraphicLib.getCoordYbyRadial(angle, radius + GraphicLib.getTextLength(element)));
    // let entireLength = Math.sqrt(Math.pow(textEndpointX, 2) + Math.pow(textEndpointY, 2));
    // let adjacentSideLength = Math.ceil(Math.max(textEndpointX - container.width / 2, textEndpointY - container.height / 2));
    // let adjacentAngle = angle % (Math.PI / 2);
    // console.log('e', entireLength, 'r', radius);
    // let textLimit = entireLength - radius - 60;
    // return GraphicLib.getTextByLimit(element, textLimit);
    let d3element = d3.select(element);
    let textLength = GraphicLib.getTextLength(element);
    let textContent = element.textContent;
    let textEndpointX = Math.abs(GraphicLib.getCoordXbyRadial(angle, radius + textLength));
    let textEndpointY = Math.abs(GraphicLib.getCoordYbyRadial(angle, radius + textLength));
    let containerLimitX = container.width / 2;
    let containerLimitY = container.height / 2;
    // console.log('cX', textEndpointX, containerLimitX);
    // console.log('cY', textEndpointY, containerLimitY);
    while ((textEndpointX + 50) > containerLimitX && (textEndpointY + 50) > containerLimitY) {
      // console.log('s', textContent);
      textContent = textContent.slice(0, -1);
      d3element.text(textContent);
      textLength = GraphicLib.getTextLength(d3element.node());
      textEndpointX = Math.abs(GraphicLib.getCoordXbyRadial(angle, radius + textLength));
      textEndpointY = Math.abs(GraphicLib.getCoordYbyRadial(angle, radius + textLength));

    }

    return textContent + '...';

    // if (adjacentAngle >= Math.PI / 4) { adjacentAngle = Math.PI / 2 - adjacentAngle; }
    //
    // let textLimit = entireLength - radius - (adjacentSideLength / (Math.cos(GraphicLib.convertToDegrees(adjacentAngle))));
    // // let adjacentAngle = angle % (Math.PI / 2);
    // // let textLimit = entireLength - radius - ((adjacentAngle >= Math.PI / 4) ? (adjacentSideLength / Math.sin(adjacentAngle)) : (adjacentSideLength / Math.cos(adjacentAngle)));
    //   // let overflowLength = overflowDiff / (Math.cos(adjacentAngle) || 1);
    // return GraphicLib.getTextByLimit(element, textLimit);

    // let entireLength = Math.sqrt(Math.pow(Math.abs(textEndpointX), 2) + Math.pow(Math.abs(textEndpointY), 2));
    // let adjacentSideLength = Math.ceil(Math.max(textEndpointX - container.width / 2, textEndpointY - container.height / 2));
    // let adjacentAngle = angle % (Math.PI / 2);
    // // console.log(angle);
    // if (adjacentAngle >= Math.PI / 4) { adjacentAngle = Math.PI / 2 - adjacentAngle; }
    // let overflowLength = entireLength - radius - (adjacentSideLength / Math.cos(adjacentAngle));
    //
    // return GraphicLib.getTextByLimit(element, overflowLength);
  }
}
