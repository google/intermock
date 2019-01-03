/**
 * Copyright 2019 Google Inc. All Rights Reserved.
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

import readFile from 'fs-readfile-promise';

export type FileTuple = [string, string];
export type FileTuples = FileTuple[];

export function readFiles(files: string[]): Promise<FileTuples> {
  const filePromises = files.map(file => readFile(file));
  return new Promise((resolve) => {
    Promise.all(filePromises).then(buffers => {
      const contents: string[][] = [];
      buffers.forEach(
          (buffer, index) => contents.push([files[index], buffer.toString()]));
      resolve(contents as FileTuples);
    });
  });
}