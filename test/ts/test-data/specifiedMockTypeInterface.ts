interface FlatPerson {
  /** !mockType {name.firstName} */
  fn: string;

  /** !mockType {name.lastName} */
  ln: string;
}

export const specifiedMockTypeInterface = {
  fn: 'Mabel',
  ln: 'Williamson'
};
