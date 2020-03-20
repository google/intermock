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
import './styles/app.scss';
import {mock} from '../../src/lang/ts/intermock';

async function setup() {
  const [intermock, monaco] = await Promise.all([
    import(/* webpackChunkName: "intermock" */ '../../src/index') as any,
    import(/* webpackChunkName: "monaco-editor" */ 'monaco-editor') as any,
  ]);

  const initialEditorContent = `interface Admin extends User {
   adminRecord: AdminRecord;
}

interface Student extends User {
   schoolRecord: SchoolRecord;
}

interface User {
   firstName: string;
   lastName: string;
   username: string;
   emailAddress: string;
}

interface AdminRecord {
   studentsPassedEachYear: number[];
}

interface SchoolRecord {
   startDate: string;
   endDate: string;
   isActive: boolean;
   grades: number[];
}
`;

  const initialInterfacesToMock = ['Admin', 'Student'];

  const editorContainer = document.getElementById('editor-container');
  const mockCodeBlock = document.getElementById('mock-code');
  const createMockBtn = document.getElementById('create-mock-btn');
  const loadingIcon = document.getElementById('loading-icon');
  const interfacesToMock = document.getElementById('interfaces');
  const controls = document.getElementById('controls');


  const editor = monaco.editor.create(editorContainer!, {
    value: initialEditorContent,
    language: 'typescript',
  });

  if (loadingIcon) {
    loadingIcon.remove();
  }

  if (controls) {
    controls.style.display = 'block';
  }

  if (interfacesToMock) {
    (interfacesToMock as HTMLInputElement).value =
        initialInterfacesToMock.join(',');
    interfacesToMock.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) {
        if (editor && mockCodeBlock && interfacesToMock) {
          createMock(
              intermock, interfacesToMock, mockCodeBlock, editor.getValue());
        }
      }
    });
  }

  if (mockCodeBlock) {
    const mocked = intermock.mock({
      language: 'typescript',
      files: [['docs', initialEditorContent]],
      output: 'string',
      interfaces: initialInterfacesToMock,
    });

    mockCodeBlock.textContent = mocked as string;
  }

  if (createMockBtn) {
    createMockBtn.addEventListener('click', () => {
      if (editor && mockCodeBlock && interfacesToMock) {
        createMock(
            intermock, interfacesToMock, mockCodeBlock, editor.getValue());
      }
    });
  }
}

function createMock(
    intermock: any, interfacesToMock: HTMLElement, mockCodeBlock: HTMLElement,
    text: string) {
  const interfaces = (interfacesToMock as HTMLInputElement).value.split(',');

  try {
    const mocked = intermock.mock({
      language: 'typescript',
      files: [['docs', text]],
      output: 'string',
      interfaces
    });
    mockCodeBlock.textContent = mocked as string;
  } catch (err) {
    mockCodeBlock.textContent = err.message;
  }
}


setup();
