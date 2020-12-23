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


declare namespace enums {
  enum Awesomeness { COOL, LAME }
  enum GreatNumbers { e = 2.71, pi = 3.14, golden = 1.61 }
}

declare namespace international {
  export interface Language {
    /** @mockType {lorem.words} */
    name: string;
  }
}

enum GreatMusicians {
  mozart = 'Mozart',
  beethoven = 'Beethoven'
}

enum GreatNovels {
  MOBY_DICK,
  GRAPES_OF_WRATH,
  SLAUGHTERHOUSE_FIVE
}

interface Person {
  name: string;
  status: enums.Awesomeness;
  favoriteNumber: enums.GreatNumbers;
  favoriteMusicians: GreatMusicians;
  favoriteNovel: GreatNovels;
  /* tslint:disable */
  knownLanguages: Array<international.Language>;
  /* tslint:enable */
  desiredLanguages: international.Language[];
}

export const expectedNamespaced = {
  Person: {
    name: 'Natasha Jacobs',
    status: 1,
    favoriteNumber: 3.14,
    favoriteMusicians: 'Beethoven',
    favoriteNovel: 1,
    knownLanguages: [
      {
        "name": "consequuntur ab fugiat"
      },
      {
        "name": "consequuntur ab fugiat"
      },
      {
        "name": "consequuntur ab fugiat"
      }
    ],
    desiredLanguages: [
      {
        "name": "consequuntur ab fugiat"
      },
      {
        "name": "consequuntur ab fugiat"
      },
      {
        "name": "consequuntur ab fugiat"
      }
    ]
  }
};
