import faker from 'faker';
import readFile from 'fs-readfile-promise';
import ts from 'typescript';

interface Options {
  /** if not provided, then JSON output of generation is not written */
  outFile: string;
}

export class Intermock {
  constructor(private readonly files: string[]) {}

  readFiles() {
    const filePromises = this.files.map(file => readFile(file));
    return new Promise((resolve) => {
      Promise.all(filePromises).then(buffers => {
        const contents: string[] = [];
        buffers.forEach(buffer => contents.push(buffer.toString()));
        resolve(contents);
      });
    });
  }

  delint(sourceFile: ts.SourceFile) {
    delintNode(sourceFile);

    function delintNode(node: ts.Node) {
      switch (node.kind) {
        case ts.SyntaxKind.ForStatement:
        case ts.SyntaxKind.ForInStatement:
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.DoStatement:
          if ((node as ts.IterationStatement).statement.kind !==
              ts.SyntaxKind.Block) {
            report(
                node,
                'A looping statement\'s contents should be wrapped in a block body.');
          }
          break;

        default:
          break;
      }

      ts.forEachChild(node, delintNode);
    }

    function report(node: ts.Node, message: string) {
      const {line, character} =
          sourceFile.getLineAndCharacterOfPosition(node.getStart());
      console.log(
          `${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`);
    }
  }

  async generate() {
    const output: any = {};
    const fileContents = await this.readFiles();
    console.warn(fileContents);
    return output;
  }
}
