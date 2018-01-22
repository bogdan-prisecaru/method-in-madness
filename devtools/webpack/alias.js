const path = require('path');

class Alias {
  static get path() {
    return {
      client: path.join(process.cwd(), 'client/src/'),
      server:  path.join(process.cwd(), 'server/'),
      dist: path.join(process.cwd(), 'public/'),
    };
  }

  static get bootstrap() {
    return { // mare sure to sync this with tsconfig.json paths
      '@bootstrap': path.join(Alias.path.client, 'bootstrap'),
    }
  }

  static get module() {
    return { // mare sure to sync this with tsconfig.json paths
      '@module': path.join(Alias.path.client, 'module'),
    }
  }

  static get webc() {
    return { // mare sure to sync this with tsconfig.json paths
      '@webc': path.join(Alias.path.client, 'webc'),
    }
  }

  static get ui() {
    return {
      '@ui': path.join(Alias.path.client, 'ui'),
    }
  }
}

module.exports = Alias;
