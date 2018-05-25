/**
 * @mockRange {1-5}
 */
interface Person {
  /** @mockType {name.firstName} */
  firstName: string;

  /** @mockType {name.lastName} */
  lastName: string;
}

/**
 * @mockRange {1-100}
 */
type Persons = Person[];
