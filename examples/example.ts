interface FlatInterface {
  name: string;
  age: number;
}

interface FlatPerson {
  /** !mockType {name.firstName} */
  fn: string;

  /** !mockType {name.lastName} */
  ln: string;
}

interface Person {
  firstName: string;

  lastName: string;

  phone: number;

  nickname: string;

  employeeDetail: EmployeeDetail;
}

interface EmployeeDetail {
  /** !mockType {internet.email} */
  email: string;

  isFullTime: boolean;
}
