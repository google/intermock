import {fake} from '../fake';
import {generators} from './generators';

export function generateFixedData() {
  const fixedData: any = {};
  generators.forEach(generator => fixedData[generator] = fake(generator));
  return fixedData;
}
