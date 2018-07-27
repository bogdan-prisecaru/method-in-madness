class ChordMock {
  constructor(tagsLength, nodesLength) {
    this._primaryTags = new Array(tagsLength).fill(null).map((d, i) => {
      return `${i}${Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6)}`;
    });

    this._secondaryTags = new Array(tagsLength * Math.floor(Math.random() * 3)).fill(null).map((d, i) => {
      return `${Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6)}${i}`;
    });

    this._nodes = new Array(Math.floor(nodesLength)).fill(null).map((node, i) => {
      return {
        id: new Array(2).fill(null).map(i => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8)).join('-'),
        tags: [
          this._primaryTags[Math.floor(Math.random() * this._primaryTags.length)],
          this._secondaryTags[Math.floor(Math.random() * this._secondaryTags.length)]
        ],
        defsId: ['chord-def-node-private', 'chord-def-node-shared', 'chord-def-node-external'][Math.floor(Math.random() * 3)],
        label: new Array(5).fill(null).map(i => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8)).join('-'),
      }
    });
  }

  get nodes() {
    return this._nodes;
  }
}

module.exports = ChordMock;
