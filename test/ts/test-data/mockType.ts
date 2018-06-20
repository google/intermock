interface FlatPerson {
  /** !mockType {name.firstName} */
  fn: string;

  /** !mockType {name.lastName} */
  ln: string;
}

export const expectedMockType = {
  fn: 'Mabel',
  ln: 'Williamson'
};
