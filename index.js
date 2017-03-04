'use strict';

const got = require('got');
const cheerio = require('cheerio');
const table = require('columnify');
const chalk = require('chalk');
const wrap = require('wordwrap')(90);
const open = require('open');

const SEARCH_URL = {
  js: 'JavaScript/Reference/Global_Objects',
  css: 'CSS'
};

const getBaseUrl = locale => `https://developer.mozilla.org/${locale}/docs/Web`;

const format = (markup, url) => {
  const $ = cheerio.load(markup);
  const title = $('#wiki-document-head h1').text();
  const method = title.split('.').pop();
  const methodWithoutParens = method.replace(/\(\)/, '');
  const description = $('#wikiArticle > p')
    .filter((index, element) => $(element).text().length !== 0)
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

  console.log(`\n${chalk.bold(title)}`);
  console.log(`\n${wrap(description)}\n`);

  if (/[a-z]/.test(usage)) {
    console.log(`${usage}\n`);
  }

  $('#wikiArticle').children('dl').children('dt')
    .has('code')
    .each((index, element) => {
      const $element = $(element);
      const term = $element.text();
      const $definition = $element.next('dd');

      if ($definition.has('dl').length === 0) {
        api.push({
          term: chalk.bold(term),
          definition: $definition.text().replace(new RegExp(term, 'gim'), chalk.bold(term))
        });

        api.push({
          term: '',
          definition: ''
        });
      } else {
        api.push({
          term: chalk.bold(term),
          definition: $definition.text().substr(0, $definition.text().search('\n'))
        });

        $definition.children('dl').children('dt').each((subIndex, subElement) => {
          const $subElement = $(subElement);
          const subTerm = $subElement.text();
          const subDefinition = $subElement
            .next('dd')
            .text()
            .replace(new RegExp(subTerm, 'gim'), chalk.underline(subTerm));

          api.push({
            term: `..${chalk.underline(subTerm)}`,
            definition: `..${subDefinition}`
          });
        });

        api.push({
          term: '',
          definition: ''
        });
      }
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

const fetch = (keyword, language, shouldOpen, locale) => {
  const baseUrl = getBaseUrl(locale);
  const parts = keyword.replace(/prototype\./, '').split('.');
  const url = `${baseUrl}/${SEARCH_URL[language]}/${parts[0]}/${parts[1] || ''}`;
  const options = {
    headers: {
      'user-agent': 'https://github.com/rafaelrinaldi/mdn'
    }
  };

  if (shouldOpen) {
    return new Promise(resolve => {
      resolve(open(url));
    });
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

module.exports = options => fetch(
  options.keyword,
  options.language,
  options.shouldOpen,
  options.locale
);
