import {mock as mockTS, Options} from './lang/ts/intermock';

export function mock(options: Options) {
  switch (options.language) {
    case 'typescript':
    default:
      return mockTS(options);
  }
}