#!/usr/bin/env node

'use strict';

const mdn = require('./');
const minimist = require('minimist');
const version = require('./package.json').version;
const defaults = {
  boolean: [
    'help',
    'version',
    'open',
    'css'
  ],
  alias: {
    h: 'help',
    v: 'version',
    l: 'language',
    c: 'css',
    o: 'open',
    lc: 'locale'
  },
  default: {
    language: 'js',
    locale: 'en-US',
    open: false,
    css: false
  }
};

const options = minimist(process.argv.slice(2), defaults);
const help = `
Usage: mdn <KEYWORD>

  Man pages for web APIs using MDN

Example:
  $ mdn object.freeze
  $ mdn background-image --language=css
  $ mdn background --language=css --locale=pt-BR

Options:
  -v   --version         Display current software version
  -h   --help            Display software help and usage details
  -l   --language        Specify a language to search for the keyword (defaults to "js")
  -c   --css             Specify css as the language
  -o   --open            Open MDN page in web browser
  -lc  --locale          Specify a locale (defaults to "en-US")
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
  const language = (options.css) ? 'css' : options.language;
  const shouldOpen = options.open;
  const locale = options.locale;

  if (keyword !== undefined && keyword.length) {
    mdn({
      keyword,
      language,
      shouldOpen,
      locale
    });
  } else {
    process.stderr.write('You must provide a valid keyword\n');
    process.exit(1);
  }
};

run(options);
