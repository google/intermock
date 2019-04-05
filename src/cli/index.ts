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

import {mock as IntermockTS} from '../lang/ts/intermock';
import {readFiles} from '../lib/read-files';

const optionDefinitions = [
  {
    name: 'files',
    alias: 'f',
    type: String,
    multiple: true,
    defaultOption: true
  },
  {name: 'interfaces', alias: 'i', type: String, multiple: true},
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
    header: 'Options',
    optionList: [
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
        name: 'help',
        description: 'Print this usage guide.',
      }
    ],
  },
];

interface Options {
  files: string[];
  help: boolean;
  language: string;
  interfaces: string[];
  fixed: boolean;
}

function isWelcomeMessageNeeded(options: Options) {
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
  const options: Options = commandLineArgs(optionDefinitions) as Options;

  if (isWelcomeMessageNeeded(options)) {
    showWelcomeMessage();
    return;
  }

  const isFixedMode = options.fixed;
  const interfaces = options.interfaces;

  return readFiles(options.files).then((files) => {
    try {
      const output = IntermockTS({
        files,
        interfaces,
        isFixedMode,
      });

      console.dir(output, {depth: null, colors: true});
    } catch (err) {
      console.log(err.message);
    }
  });
}

main();
