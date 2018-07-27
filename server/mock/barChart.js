class BarChartMock {
  constructor() {
    this._rects = new Array(Math.floor(Math.random() * 20)).fill(null).map((d, i) => {
      return {
        id: new Array(2).fill(null).map(i => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8)).join('-'),
        label: new Array(5).fill(null).map(i => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8)).join('-'),
        count: Math.floor(Math.random() * 1000),
        color: `#${((1 << 24) * Math.random() | 0).toString(16)}`,
      }
    });
  }

  get rects() {
    return this._rects;
  }
}

module.exports = BarChartMock;
