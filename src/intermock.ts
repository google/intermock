import readFile from 'fs-readfile-promise';
import * as _ from 'lodash';
import ts from 'typescript';

import {fake} from './fake';
import {propertyMap} from './propertyMap';

interface Options {
  /** if not provided, then JSON output of generation is not written */
  outFile: string;
}

/** fileName: string, fileContent: string */
type FileTuple = [string, string];

type FileTuples = [FileTuple];

/**
 * TODO Remove _.get throughout this code, opt for TS compiler methods to get
 * properties on AST nodes
 */
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

  parseMockType(jsDocComment: string) {}

  mock(property: string, syntaxType: ts.SyntaxKind, mockType: string) {
    const defaultMockType = _.get(propertyMap, property);
    if (mockType) {
      return fake(mockType);
    } else if (defaultMockType) {
      return fake(defaultMockType);
    } else {
      // TODO for basic types like string, number, etc. that don't have a
      // default type

      return '';
    }
  }

  traverseInterfaceMembers(node: ts.Node, output: any) {
    switch (node.kind) {
      case ts.SyntaxKind.PropertySignature:
        //   console.warn(node);
        const jsDocs = _.get(node, 'jsDoc', []);
        const property = _.get(node, 'name.text', '');
        let mockType = '';

        if (jsDocs.length > 0) {
          // TODO handle case where we get multiple mock JSDocs or a JSDoc like
          // mockRange for an array. In essence, we are only dealing with
          // primitives now

          const jsDocComment = _.get(jsDocs[0], 'comment', '');
          if (jsDocComment.startsWith('!mockType')) {
            mockType = jsDocComment.match(/(?<=\{).+?(?=\})/g)[0];
          } else {
            throw new Error(
                'Cannot handle complex types yet, use mockType for primitive types for now');
          }
        }

        const mock = this.mock(property, node.kind, mockType);
        output[property] = mock;

        break;
      default:
        break;
    }
  }

  traverseInterface(node: ts.Node, output: any) {
    // TODO
    const path = _.get(node, 'name.text', '');
    _.set(output, path, {});

    // TODO get range from JSDoc
    // TODO given a range of interfaces to generate, add to array. If 1
    // then just return an object
    node.forEachChild(
        child => this.traverseInterfaceMembers(child, output[path]));
  }

  processFile(sourceFile: ts.SourceFile, output: any) {
    const processNode = (node: ts.Node) => {
      // TODO add case for generic `type`
      switch (node.kind) {
        case ts.SyntaxKind.InterfaceDeclaration:
          this.traverseInterface(node, output);
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
        (f: FileTuple) => this.processFile(
            ts.createSourceFile(f[0], f[1], ts.ScriptTarget.ES2015, true),
            output));

    console.warn('output: ', output);
    return output;
  }
}
