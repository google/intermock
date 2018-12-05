import './styles/app.scss';

async function foo() {
  const [intermock, monaco] = await Promise.all([
    import(/* webpackChunkName: "intermock" */ '../../src/index'),
    import(/* webpackChunkName: "monaco-editor" */ 'monaco-editor'),
  ]);

  console.warn(monaco);
  console.warn(intermock);

  const editorContainer = document.getElementById('editor-container');
  if (editorContainer) {
    monaco.editor.create(editorContainer, {
      value: 'function hello() {\n\talert(\'Hello world!\');\n}',
      language: 'typescript',
    });
  }
}
console.warn('running foo');
foo();
console.warn('after foo');
