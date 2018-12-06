import './styles/app.scss';
import {mock} from '../../src/lang/ts/intermock';

async function setup() {
  const [intermock, monaco] = await Promise.all([
    import(/* webpackChunkName: "intermock" */ '../../src/index'),
    import(/* webpackChunkName: "monaco-editor" */ 'monaco-editor'),
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
  }

  if (mockCodeBlock) {
    const mocked: any = intermock.mock({
      language: 'typescript',
      files: [['docs', initialEditorContent]],
      output: 'string',
      interfaces: initialInterfacesToMock,
    });

    mockCodeBlock.textContent = mocked;
  }

  if (createMockBtn) {
    createMockBtn.addEventListener('click', () => {
      if (editor && mockCodeBlock && interfacesToMock) {
        const interfaces =
            (interfacesToMock as HTMLInputElement).value.split(',');
        const mocked: any = intermock.mock({
          language: 'typescript',
          files: [['docs', initialEditorContent]],
          output: 'string',
          interfaces
        });

        mockCodeBlock.textContent = mocked;
      }
    });
  }
}


setup();
