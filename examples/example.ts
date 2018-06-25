// interface FlatInterface {
//   name: string;
//   age: number;
// }

// interface FlatPerson {
//   /** !mockType {name.firstName} */
//   fn: string;

//   /** !mockType {name.lastName} */
//   ln: string;
// }

// interface Person {
//   firstName: string;

//   lastName: string;

//   phone: number;

//   nickname: string;

//   employeeDetail: EmployeeDetail;
// }

// interface EmployeeDetail {
//   /** !mockType {internet.email} */
//   email: string;

//   isFullTime: boolean;
// }

// interface User {
//   username: string;
//   firstName: string;
//   middleName?: string;
//   lastName: string;
// }


// interface Person {
//   name: string;
//   detail: Detail;
// }

// type Detail = {
//   phone: number;
// };

enum Awesomeness {
  COOL,
  LAME
}

enum GreatNumbers {
  e = 2.71,
  pi = 3.14,
  golden = 1.61
}

interface Person {
  name: string;
  status: Awesomeness;
  favoriteNumber: GreatNumbers;
}
