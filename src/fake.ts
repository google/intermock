import faker from 'faker';

/**
 * Wrapper for Faker, or any mocking framework
 */
export function fake(mockType: string) {
  return faker.fake(`{{${mockType}}}`);
}
