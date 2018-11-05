
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

import 'mocha';

import {expect} from 'chai';
import {stringify} from '../../src/lib/stringify';

describe('Stringify tests', () => {
  it('should stringify object with functions', () => {
    const obj = {
      foo: () => 'blah',
      bar: () => () => 42,
      baz: 3.14,
    };

    const result = stringify(obj).trim();
    const expectation =
        `{\n  "foo": () => \'blah\',\n  "bar": () => () => 42,\n  "baz": 3.14\n};`
            .trim();
    expect(result).to.eq(expectation);
  });
});