/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import {convertCompilerOptionsFromJson} from 'typescript';

import {Intermock as IntermockTS} from '../lang/ts/intermock';

const optionDefinitions = [
  {
    name: 'files',
    alias: 'f',
    type: String,
    multiple: true,
    defaultOption: true
  },
  {name: 'interfaces', alias: 'i', type: String, multiple: true},
  {name: 'outFile', alias: 'o', type: String},
  {name: 'lang', alias: 'l', type: String},
  {name: 'help', alias: 'h', type: Boolean},
  {name: 'fixed', alias: 'x', type: Boolean},
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
        name: 'interfaces',
        typeLabel: 'example: --interfaces "Person" "User"',
        description: 'Optional list of interfaces to mock',
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
  if (!options || !options.files || options.help) {
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

  if (isWelcomeMessageNeeded(options)) {
    showWelcomeMessage();
    return;
  }

  const lang = options.language ? options.language : 'typescript';
  const isFixedMode = options.fixed;

  if (lang === 'typescript') {
    const intermock = new IntermockTS(
        {files: options.files, interfaces: options.interfaces, isFixedMode});

    intermock.generate().then((output: any) => {
      console.log(JSON.stringify(output));
    });

  } else {
    throw new Error(`${lang} is not currently supported`);
  }
}

main();
