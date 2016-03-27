#!/usr/bin/env node

'use strict';

const mdn = require('./');
const minimist = require('minimist');
const version = require('./package.json').version;
const defaults = {
  boolean: [
    'help',
    'version'
  ],
  alias: {
    h: 'help',
    v: 'version',
    l: 'language'
  },
  default: {
    language: 'js'
  }
};
const options = minimist(process.argv.slice(2), defaults);
const help = `
Usage: mdn <KEYWORD>

  Man pages for web APIs using MDN

Example:
  $ mdn object.freeze
  $ mdn background-image --language=css

Options:
  -v --version          Display current software version
  -h --help             Display software help and usage details
  -l --language         Specify a language to search for the keyword (defaults to "js")
`;

const run = options => {
  if (options.help) {
    process.stderr.write(help);
    return;
  }

  if (options.version) {
    process.stderr.write(`mdn v${version}\n`);
    return;
  }

  const keyword = options._[0];
  const language = options.language || 'js';

  if (keyword !== undefined && keyword.length) {
    mdn({keyword, language});
  } else {
    process.stderr.write('You must provide a valid keyword\n');
    process.exit(1);
  }
};

run(options);
