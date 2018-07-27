import { browser } from 'protractor';
// import { SpecReporter } from 'jasmine-spec-reporter';
//
// const JasmineReporters = require('jasmine-reporters');

export class ReporterProvider {

  static initialize() {
    return browser.driver.getSession().then((session) => {
      let sessionId = session.getId();

      console.log(`*** Session ID: ${sessionId} ***`);

      return [
        // new SpecReporter(ReporterProvider.specReporterConfig),
        // new JasmineReporters.JUnitXmlReporter({
        //   ...ReporterProvider.junitReporterConfig,
        //   ...{
        //     filePrefix: 'xmlResults'
        //   }
        // })
      ].forEach(reporter => jasmine.getEnv().addReporter(reporter));

    });
  }

  /**
   * Resolves basic Spec Reporter config
   */
  static get specReporterConfig() {
    return {
      spec: {
        displayErrorMessages: true,
        displayStacktrace: true,
        displaySuccessful: true,
        displayFailed: true,
        displayDuration: true
      },
      summary: {
        displayErrorMessages: false,
        displayStacktrace: false,
        displaySuccessful: false,
        displayFailed: false,
        displayDuration: false
      },
      prefixes: {
        successful: '✓ ',
        failed: '✗ ',
        pending: '-'
      }
    };
  }

  /**
   * Resolves basic JUnit Reporter config
   */
  static get junitReporterConfig() {
    return {
      consolidateAll: true,
      savePath: './',
    }
  }
}
