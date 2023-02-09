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

import { faker } from "@faker-js/faker";

export const smartProps: { [index: string]: any } = {
  firstName: faker.name.firstName(),
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  middleName: faker.name.middleName(),
  middle_name: faker.name.middleName(),
  lastName: faker.name.lastName(),
  fullName: faker.name.fullName(),
  full_name: faker.name.fullName(),
  name: faker.random.word(),
  email: faker.internet.email(),
  primaryEmail: faker.internet.email(),
  initials: faker.name.prefix(),
  avatar: faker.image.avatar(),
  avatarUrl: faker.image.avatar(),
  image: faker.image.imageUrl(),
  imageUrl: faker.image.imageUrl(),
  userName: faker.internet.userName(),
  startDate: faker.date.past(),
  endDate: faker.date.future(),
  published_date: faker.date.past(),
  date: faker.date.recent(),
  dob: faker.date.birthdate(),
  birthdate: faker.date.birthdate(),
  productID: faker.random.alphaNumeric(5),
  product_id: faker.random.alphaNumeric(6),
  duration: faker.random.numeric(1),
  color: faker.color.human(),
  colour: faker.color.human(),
  images: faker.image.imageUrl(),
  video: "https://www.youtube.com/watch?v=cI4ryatVkKw",
  previous: faker.internet.url(),
  next: faker.internet.url(),
  id: faker.random.alphaNumeric(9),
};
