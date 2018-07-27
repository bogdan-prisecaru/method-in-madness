import path = require('path');

const suiteRootPath: string = path.join(process.cwd(), 'compiledJs', 'tests');

export class SuiteProvider {
  static get sanity(): string[] {
    return []
  }
}
