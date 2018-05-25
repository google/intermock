// TODO: Make this an actual CLI

import {Intermock} from './intermock';


const intermock = new Intermock(['~/code/intermock/src/example.ts']);

// intermock.generate().then((output: string) => {
//   console.warn(output);
// });

intermock.generate();
