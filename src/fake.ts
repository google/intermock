import faker from 'faker';
import {fixedData} from './lib/fixedData';

/**
 * Wrapper for Faker, or any mocking framework
 */
export function fake(mockType: string, isFixedMode = false) {
  if (isFixedMode) {
    return fixedData[mockType];
  }

  return faker.fake(`{{${mockType}}}`);
}
