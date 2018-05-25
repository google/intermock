// TODO: Make this an actual CLI

import {Intermock} from './intermock';


const intermock = new Intermock([`${__dirname}/../../examples/example.ts`]);

// intermock.generate().then((output: string) => {
//   console.warn(output);
// });

intermock.generate();
