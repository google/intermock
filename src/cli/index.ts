import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import {Intermock as IntermockTS} from 'lang/ts/intermock';
import * as _ from 'lodash';

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
        typeLabel: '[underline]{some_language}',
        description: 'Language of interfaces, defaults to TypeScript',
      },
      {
        name: 'files',
        typeLabel: '[underline]{web/apps/some-directory/interfaces1.ts}',
        description: 'Interface files to generate fake data from',
      },
      {
        name: 'outFile',
        typeLabel: '[underline]{./output.json}',
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
  if (_.isEmpty(options) || options.help) {
    return true;
  }

  return false;
}

function showWelcomeMessage() {
  const usage = commandLineUsage(instructions);
  console.log(usage);
}

function main() {
  const options = commandLineArgs(optionDefinitions);
  if (isWelcomeMessageNeeded(options)) {
    showWelcomeMessage();
    return;
  }

  //   const intermock =
  //       new IntermockTS({files: [`${__dirname}/../../examples/example.ts`]});

  //   intermock.generate();
}

main();
