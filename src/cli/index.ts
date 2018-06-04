// TODO: Make this an actual CLI

import {Intermock as IntermockTS} from 'lang/ts/intermock';


const intermock =
    new IntermockTS({files: [`${__dirname}/../../examples/example.ts`]});

// intermock.generate().then((output: string) => {
//   console.warn(output);
// });

intermock.generate();
