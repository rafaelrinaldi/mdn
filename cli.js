#!/usr/bin/env node

'use strict';

const mdn = require('./');
const minimist = require('minimist');
const version = require('./package.json').version;
const defaults = {
  boolean: [
    'help',
    'version',
    'open'
  ],
  alias: {
    h: 'help',
    v: 'version',
    l: 'language',
    o: 'open',
    i: 'idiom'
  },
  default: {
    language: 'js',
    idiom: 'en-US'
  }
};
const options = minimist(process.argv.slice(2), defaults);
const help = `
Usage: mdn <KEYWORD>

  Man pages for web APIs using MDN

Example:
  $ mdn object.freeze
  $ mdn background-image --language=css
  $ mdn background --language=css --idiom=pt-BR

Options:
  -v  --version         Display current software version
  -h  --help            Display software help and usage details
  -l  --language        Specify a language to search for the keyword (defaults to "js")
  -o  --open            Open MDN page in web browser
  -i  --idiom           Specify a idiom (defaults to "en-US")
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
  const shouldOpen = options.open || false;
  const idiom = options.idiom || 'en-US';

  if (keyword !== undefined && keyword.length) {
    mdn({keyword, language, shouldOpen, idiom});
  } else {
    process.stderr.write('You must provide a valid keyword\n');
    process.exit(1);
  }
};

run(options);
