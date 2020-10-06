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
interface Dog {
  name: string;
  owner: string;
}

interface Cat {
  name: string;
  owns: string;
}

interface Person {
  name: string;
  age: number;
  bestFriend: Dog|Cat;
}

interface Pack {
  id: string;
  dogs: Dog[]|Cat[];
}

interface Account {
  id: string;
  lastDeposit: number|string;
}


interface Book {
  title: string;
  color: 'red'|'blue'|'yellow';
}

export interface LonelyHuman {
  name: string;
  bestFriend: Dog|null;
}

// TODO: test union with
// functions: currently I don't know how to make a Union for functions (if the
// first union option is a function, then the `|` character gets applied to the
// return type)

export const expectedUnion = {
  Person: {
    name: 'Natasha Jacobs',
    age: 86924,
    bestFriend: {
      name: 'Natasha Jacobs',
      owner:
          'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.'
    }
  },
  Pack: {
    id: 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
    dogs: [
      {
        name: 'Natasha Jacobs',
        owner:
            'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.'
      },
      {
        name: 'Natasha Jacobs',
        owner:
            'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.'
      },
      {
        name: 'Natasha Jacobs',
        owner:
            'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.'
      }
    ]
  },
  Account: {
    id: 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
    lastDeposit: 86924,
  },
  LonelyHuman: {
    name: 'Natasha Jacobs',
  },
  Book: {
    title:
        'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.',
    color: 'red'
  }
};
