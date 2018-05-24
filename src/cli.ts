import {Intermock} from './intermock';

function greet(foo: string) {
  console.log(foo);
}

greet('Hello world');
const intermock = new Intermock();
