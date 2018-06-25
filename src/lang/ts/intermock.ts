import readFile from 'fs-readfile-promise';
import * as _ from 'lodash';
import ts from 'typescript';

import {defaultTypeToMock} from '../../lib/default-type-to-mock';
import {fake} from '../../lib/fake';
import {smartProps} from '../../lib/smart-props';
import {FileTuple, FileTuples} from '../../lib/types';

export interface Options {
  files: string[];
  isFixedMode?: boolean;
  isOptionalAlwaysEnabled?: boolean;
}

/**
 * TODO Remove _.get throughout this code, opt for TS compiler methods to get
 * properties on AST nodes
 */
export class Intermock {
  types: any = {};

  constructor(private readonly options: Options) {}

  private readFiles(): Promise<FileTuples> {
    const filePromises = this.options.files.map(file => readFile(file));
    return new Promise((resolve) => {
      Promise.all(filePromises).then(buffers => {
        const contents: any[] = [];
        buffers.forEach(
            (buffer, index) =>
                contents.push([this.options.files[index], buffer.toString()]));
        resolve(contents as FileTuples);
      });
    });
  }

  parseMockType(jsDocComment: string) {}

  mock(property: string, syntaxType: ts.SyntaxKind, mockType: string) {
    const smartMockType = _.get(smartProps, property);
    const isFixedMode =
        this.options.isFixedMode ? this.options.isFixedMode : false;

    if (mockType) {
      return fake(mockType, this.options.isFixedMode);
    } else if (smartMockType) {
      return fake(smartMockType, this.options.isFixedMode);
    } else {
      return defaultTypeToMock[syntaxType](isFixedMode);
    }
  }

  traverseInterfaceMembers(
      node: ts.Node, output: any, sourceFile: ts.SourceFile) {
    if (node.kind !== ts.SyntaxKind.PropertySignature) {
      return;
    }
    const jsDocs = _.get(node, 'jsDoc', []);
    const property = _.get(node, 'name.text', '');
    const isQuestionToken = _.get(node, 'questionToken');

    if (isQuestionToken) {
      if (this.options.isFixedMode && !this.options.isOptionalAlwaysEnabled) {
        return;
      }

      else if (Math.random() < .5 && !this.options.isOptionalAlwaysEnabled) {
        return;
      }
    }


    let mockType = '';

    if (jsDocs.length > 0) {
      // TODO handle case where we get multiple mock JSDocs or a JSDoc like
      // mockRange for an array. In essence, we are only dealing with
      // primitives now

      // TODO Handle error case where a complex type has MockDocs

      const jsDocComment = _.get(jsDocs[0], 'comment', '');
      if (jsDocComment.startsWith('!mockType')) {
        mockType = jsDocComment.match(/(?<=\{).+?(?=\})/g)[0];
      } else {
        // TODO
      }

      const mock = this.mock(property, node.kind, mockType);
      output[property] = mock;
    } else {
      // TODO handle arrays, and other complex types
      if (_.get(node, 'type.kind') === ts.SyntaxKind.TypeReference) {
        const typeName = _.get(node, 'type.typeName.text');
        if (this.types[typeName] === ts.SyntaxKind.EnumDeclaration) {
          this.setEnum(sourceFile, node, output, typeName, property);
        } else {
          output[property] = {};
          this.processFile(sourceFile, output[property], typeName);
        }
      } else {
        const type = _.get(node, 'type.kind');
        const mock = this.mock(property, type, mockType);
        output[property] = mock;
      }
    }
  }

  setEnum(
      sourceFile: ts.SourceFile, node: ts.Node, output: any, typeName: string,
      property: string) {
    const processNode = (node: ts.Node) => {
      switch (node.kind) {
        case ts.SyntaxKind.EnumDeclaration:
          if ((node as ts.EnumDeclaration).name.text === typeName) {
            const members = (node as ts.EnumDeclaration).members;
            const selectedMemberIdx = Math.floor(members.length / 2);
            const selectedMember = members[selectedMemberIdx];

            // TODO handle bitwise initializers
            if (selectedMember.initializer) {
              switch (selectedMember.initializer.kind) {
                case ts.SyntaxKind.NumericLiteral:
                  output[property] =
                      Number(selectedMember.initializer.getText());
                  break;
              }
            } else {
              output[property] = selectedMemberIdx;
            }
          }
          break;
        default:

          break;
      }

      ts.forEachChild(node, processNode);
    };

    processNode(sourceFile);
  }

  traverseInterface(
      node: ts.Node, output: any, sourceFile: ts.SourceFile,
      propToTraverse?: string, path?: string) {
    // TODO handle arrays, enums, etc.

    if (path) {
      output[path] = {};
      output = output[path];
    }

    if (!propToTraverse && !path) {
      const newPath = (node as ts.InterfaceDeclaration).name.text;
      output[newPath] = {};
      output = output[newPath];
    }

    // TODO get range from JSDoc
    // TODO given a range of interfaces to generate, add to array. If 1
    // then just return an object
    node.forEachChild(
        child => this.traverseInterfaceMembers(child, output, sourceFile));
  }

  processFile(sourceFile: ts.SourceFile, output: any, propToTraverse?: string) {
    const processNode = (node: ts.Node) => {
      switch (node.kind) {
        case ts.SyntaxKind.InterfaceDeclaration:
          /**
           * TODO: Handle interfaces that extend others, via checking hertiage
           * clauses
           */
          if (propToTraverse) {
            const path = (node as ts.InterfaceDeclaration).name.text;
            if (path === propToTraverse) {
              this.traverseInterface(node, output, sourceFile, propToTraverse);
            }
          } else {
            this.traverseInterface(node, output, sourceFile);
          }
          break;
        case ts.SyntaxKind.TypeAliasDeclaration:
          const type = (node as ts.TypeAliasDeclaration).type;
          const path = (node as ts.TypeAliasDeclaration).name.text;

          if (propToTraverse) {
            if (path === propToTraverse) {
              this.traverseInterface(type, output, sourceFile, propToTraverse);
            }
          } else {
            this.traverseInterface(type, output, sourceFile, undefined, path);
          }
          break;

        default:
          break;
      }

      ts.forEachChild(node, processNode);
    };

    processNode(sourceFile);
  }

  gatherTypes(sourceFile: ts.SourceFile) {
    const processNode = (node: ts.Node) => {
      const name = (node as ts.DeclarationStatement).name;
      const text = name ? name.text : '';

      this.types[text] = node.kind;

      ts.forEachChild(node, processNode);
    };

    processNode(sourceFile);
  }
  async generate() {
    const output: any = {};
    const fileContents = await this.readFiles();
    fileContents.forEach((f: FileTuple) => {
      this.gatherTypes(
          ts.createSourceFile(f[0], f[1], ts.ScriptTarget.ES2015, true));
    });

    fileContents.forEach((f: FileTuple) => {
      this.processFile(
          ts.createSourceFile(f[0], f[1], ts.ScriptTarget.ES2015, true),
          output);
    });

    return output;
  }
}
