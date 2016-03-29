'use strict';

const got = require('got');
const cheerio = require('cheerio');
const table = require('columnify');
const chalk = require('chalk');
const wrap = require('wordwrap')(90);
const open = require('open');

const BASE_URL = 'https://developer.mozilla.org/en-US/docs/Web';
const SEARCH_URL = {
  js: `${BASE_URL}/JavaScript/Reference/Global_Objects`,
  css: `${BASE_URL}/CSS`
};

const format = (markup, url) => {
  const $ = cheerio.load(markup);
  const title = $('#wiki-document-head h1').text();
  const method = title.split('.').pop();
  const methodWithoutParens = method.replace(/\(\)/, '');
  const description = $('#wikiArticle > p')
    .first()
    .text()
    .replace(title, chalk.bold(title))
    .replace(method, chalk.bold(method));

  const usage = $('#Syntax')
    .next('pre')
    .text()
    .trim()
    .split(/\n/)
    .map((line, index) => {
      return `\t${index} | ${line}\n`;
    })
    .join('')
    .replace(new RegExp(methodWithoutParens, 'gim'), chalk.underline(methodWithoutParens));

  const api = [];

  console.log(`\n${chalk.bold(title)}\n`);
  console.log(wrap(description));
  console.log(`\n${usage}\n`);

  $('#wikiArticle dl dt').each((index, element) => {
    const $element = $(element);
    const term = $element.text();
    const definition = $element
      .next('dd')
      .text()
      .replace(new RegExp(term, 'gim'), chalk.bold(term));

    api.push({
      term: chalk.bold(term),
      definition
    });

    api.push({term: '', definition: ''});
  });

  console.log(table(api, {
    showHeaders: false,
    config: {
      term: {
        minWidth: 15
      },
      definition: {
        maxWidth: 65
      }
    }
  }));

  console.log(`${chalk.dim(url)}`);
};

const fetch = (keyword, language, shouldOpen) => {
  const parts = keyword.split('.');
  const url = `${SEARCH_URL[language]}/${parts[0]}/${parts[1] || ''}`;
  const options = {
    headers: {
      'user-agent': 'https://github.com/rafaelrinaldi/mdn'
    }
  };

  if (shouldOpen) {
    return open(url);
  }

  return got(url, options)
    .then(response => {
      format(response.body, url);
    })
    .catch(error => {
      if (error.statusCode === 404) {
        console.error(`"${keyword}" not found for language "${language}"`);
      } else {
        console.error(error.stack);
      }

      process.exit(1);
    });
};

module.exports = options => fetch(options.keyword, options.language, options.shouldOpen);
