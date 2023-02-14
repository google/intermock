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
import {faker} from '@faker-js/faker';
import ts from 'typescript';

import {fake} from './fake';

export const supportedPrimitiveTypes: {[key: string]: boolean} = {
  [ts.SyntaxKind.NumberKeyword]: true,
  [ts.SyntaxKind.StringKeyword]: true,
  [ts.SyntaxKind.BooleanKeyword]: true,
  [ts.SyntaxKind.ObjectKeyword]: true,
  [ts.SyntaxKind.AnyKeyword]: true,
};

/* tslint:disable */
export const defaultTypeToMock: {
  [index: number]: (isFixedMode: boolean) => string | number | boolean | object;
} = {
  [ts.SyntaxKind.NumberKeyword]: (isFixedMode = false) => !isFixedMode ?
      parseInt(faker.random.numeric(), 10) :
      parseInt(fake('random.number', isFixedMode) as string, 10),
  [ts.SyntaxKind.StringKeyword]: (isFixedMode = false) =>
      !isFixedMode ? faker.lorem.sentence() : fake('lorem.text', isFixedMode),
  [ts.SyntaxKind.BooleanKeyword]: (isFixedMode = false) => !isFixedMode ?
      JSON.parse(faker.datatype.boolean() as unknown as string) :
      JSON.parse(fake('random.boolean', isFixedMode) as string),
  [ts.SyntaxKind.ObjectKeyword]: (isFixedMode = false) => {
    return {};
  },
  [ts.SyntaxKind.AnyKeyword]: (isFixedMode = false) => '',
};
/* tslint:enable */
