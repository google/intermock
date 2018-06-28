/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

// enum Awesomeness {
//   COOL,
//   LAME
// }

// enum GreatNumbers {
//   e = 2.71,
//   pi = 3.14,
//   golden = 1.61
// }

// interface Person {
//   name: string;
//   status: Awesomeness;
//   favoriteNumber: GreatNumbers;
// }

// interface Order {
//   id: string;

//   /** !mockType {lorem.words} */
//   name: string;
// }

// interface User {
//   orders: Order[];
// }


// interface User {
//   name: string;
// }

// interface Person {
//   age: number;
// }

// interface Order {
//   id: string;
// }


// interface Order {
//   id: string;

//   /** !mockType {lorem.words} */
//   name: string;
// }

// interface User {
//   orders: Order[];
//   bestFriends: string[];
// }

// interface Person {
//   name: string;
//   detail: Detail;
//   indirection: Roundabout;
// }

// type Detail = {
//   phone: number;
// };

// type Roundabout = string;

interface Order {
  id: string;

  /** !mockType {lorem.words} */
  name: string;
}

interface User {
  orders: Order[];
  moreOrders: Array<Order>;
  bestFriends: string[];
}
