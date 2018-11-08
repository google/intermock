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

interface Person {
  firstName: string;
  lastName: string;
  phone: number;
  nickname: string;
  employeeDetail: EmployeeDetail;
  getName: () => string;
}

interface EmployeeDetail {
  email: string;
  isFullTime: boolean;
}

export const expectedJson = `
{"Person":{"firstName":"Mabel","lastName":"Williamson","phone":"845.046.3789","nickname":"Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.","employeeDetail":{"email":"Myron_Olson39@hotmail.com","isFullTime":true}},"EmployeeDetail":{"email":"Myron_Olson39@hotmail.com","isFullTime":true}}
`;