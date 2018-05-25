import faker from 'faker';
import readFile from 'fs-readfile-promise';
import ts from 'typescript';

interface Options {
  /** if not provided, then JSON output of generation is not written */
  outFile: string;
}

type FileTuple = [string, string];
type FileTuples = [FileTuple];

export class Intermock {
  constructor(private readonly files: string[]) {}

  private readFiles(): Promise<FileTuples> {
    const filePromises = this.files.map(file => readFile(file));
    return new Promise((resolve) => {
      Promise.all(filePromises).then(buffers => {
        const contents: any[] = [];
        buffers.forEach(
            (buffer, index) =>
                contents.push([this.files[index], buffer.toString()]));
        resolve(contents as FileTuples);
      });
    });
  }

  traverseInterfaceChild(node: ts.Node, output: any) {
    console.warn(node);
  }

  traverse(sourceFile: ts.SourceFile, output: any) {
    const processNode = (node: ts.Node) => {
      switch (node.kind) {
        case ts.SyntaxKind.InterfaceDeclaration:
          node.getChildren().forEach(
              child => this.traverseInterfaceChild(child, output));
          break;

        default:
          break;
      }

      ts.forEachChild(node, processNode);
    };

    processNode(sourceFile);
  }

  async generate() {
    const output: any = {};
    const fileContents = await this.readFiles();
    fileContents.forEach(
        (f: FileTuple) => this.traverse(
            ts.createSourceFile(f[0], f[1], ts.ScriptTarget.ES2015, true),
            output));
    return output;
  }
}
