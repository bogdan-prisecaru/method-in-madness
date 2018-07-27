import { browser, Config, protractor } from 'protractor';

const ENV_NAME: string = process.env.ENV_NAME || 'single';
const ENV_CONFIG: any = process.env.ENV_CONFIG || {};

/**
 * Protractor Providers
 */
import { DataProvider } from './protractor/data';
import { ReporterProvider } from './protractor/reporter';
import { SuiteProvider } from './protractor/suite';

const SUITES = ['sanity'];

export const config: Config = Object.assign({
  directConnect: true,

  seleniumAddress: 'https://seleniumbox.cisco.com/wd/hub',

  allScriptsTimeout: 500000,

  framework: 'jasmine2',

  suites: SUITES.reduce((acc, item) => {
    return Object.assign(acc, { [item]: SuiteProvider[item] });
  }, {}),

  params: {},

  beforeLaunch: () => { },

  onPrepare: () => { },

  onComplete: () => { },

  onCleanUp: () => { },

  afterLaunch: () => { },

}, require(`./env/${ENV_NAME}`)(ENV_CONFIG));
