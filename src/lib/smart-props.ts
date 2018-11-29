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
export const smartProps: {[index: string]: string} = {
  firstName: 'name.firstName',
  middleName: 'name.firstName',
  lastName: 'name.lastName',
  nickName: 'name.findName',
  name: 'name.findName',
  informalName: 'name.findName',
  phone: 'phone.phoneNumber',
  email: 'internet.email',
  primaryEmail: 'internet.email',
  initials: 'address.countryCode',
  avatarUrl: 'internet.avatar',
  emailAddress: 'internet.email',
  username: 'internet.userName',
  startDate: 'date.past',
  createdOn: 'date.past',
  createdAt: 'date.past',
  companyName: 'company.companyName',
  date: 'date.past',
  endDate: 'date.future',
  id: 'random.uuid',
  oid: 'random.uuid',
};
