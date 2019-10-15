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

interface IterableArray<T> {}

interface Order {
  id: string;

  /** @mockType {lorem.words} */
  name: string;
}

interface User {
  orders: Order[];
  /* tslint:disable */
  moreOrders: Array<Order>;
  finalOrders: IterableArray<Order>;
  /* tslint:enable */
  bestFriends: string[];
}

export const expectedArray1 = {
  'Order': {
    'id': 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
    'name': 'consequuntur ab fugiat'
  },
  'User': {
    'orders': [
      {
        'id': 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
        'name': 'consequuntur ab fugiat'
      },
      {
        'id': 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
        'name': 'consequuntur ab fugiat'
      },
      {
        'id': 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
        'name': 'consequuntur ab fugiat'
      }
    ],
    'moreOrders': [
      {
        'id': 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
        'name': 'consequuntur ab fugiat'
      },
      {
        'id': 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
        'name': 'consequuntur ab fugiat'
      },
      {
        'id': 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
        'name': 'consequuntur ab fugiat'
      }
    ],
    'finalOrders': [
      {
        'id': 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
        'name': 'consequuntur ab fugiat'
      },
      {
        'id': 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
        'name': 'consequuntur ab fugiat'
      },
      {
        'id': 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
        'name': 'consequuntur ab fugiat'
      }
    ],
    'bestFriends': [
      'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.',
      'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.',
      'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.'
    ]

  }
};
