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

type Scalars = {
  ID: string; String: string; Boolean: boolean; Int: number; Float: number;
};
type Name = string;
type Age = {
  birthday: string
};
export interface Person {
  name: Name;
  age: Age;
  /** @mockType {lorem.words} */
  id: Scalars['ID'];
  isActive: Scalars['Boolean'];
}

export const expectedMappedTypes = {
  Person: {
    id: 'consequuntur ab fugiat',
    isActive: true,
    name: 'Natasha Jacobs',
    age: {
      birthday:
          'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.'
    }
  }
};
