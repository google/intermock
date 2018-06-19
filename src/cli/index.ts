import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import * as _ from 'lodash';

import {Intermock as IntermockTS} from '../lang/ts/intermock';

const optionDefinitions = [
  {
    name: 'files',
    alias: 'f',
    type: String,
    multiple: true,
    defaultOption: true
  },
  {name: 'outFile', alias: 'o', type: String},
  {name: 'lang', alias: 'l', type: String},
  {name: 'help', alias: 'h', type: Boolean},
];

const instructions = [
  {
    content: 'Intermock',
    raw: true,
  },
  {
    header: '',
    content: 'Generates fake data from TypeScript interfaces via Faker',
  },
  {
    header: 'Supported languages',
    content: 'typescript',
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'lang',
        typeLabel: 'example: typescript',
        description: 'Language of interfaces, defaults to TypeScript',
      },
      {
        name: 'files',
        typeLabel: 'example: web/apps/some-directory/interfaces1.ts',
        description: 'Interface files to generate fake data from',
      },
      {
        name: 'outFile',
        typeLabel: 'example: ./output.json',
        description:
            'File to output interfaces to, defaults to printing to console',
      },
      {
        name: 'help',
        description: 'Print this usage guide.',
      },
    ],
  },
];

function isWelcomeMessageNeeded(options: any) {
  if (_.isEmpty(options) || !options.files || options.help) {
    return true;
  }

  return false;
}

function showWelcomeMessage() {
  const usage = commandLineUsage(instructions);
  console.log(usage);
}

function main() {
  const options: any = commandLineArgs(optionDefinitions);
  console.warn(options);
  if (isWelcomeMessageNeeded(options)) {
    showWelcomeMessage();
    return;
  }

  const lang = options.language ? options.language : 'typescript';

  if (lang === 'typescript') {
    const intermock = new IntermockTS({files: options.files});

    intermock.generate();

  } else {
    throw new Error(`${lang} is not currently supported`);
  }
}

main();
