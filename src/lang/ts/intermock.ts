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
import ts from 'typescript';

import {DEFAULT_ARRAY_RANGE, FIXED_ARRAY_COUNT} from '../../lib/constants';
import {defaultTypeToMock} from '../../lib/default-type-to-mock';
import {fake} from '../../lib/fake';
import {randomRange} from '../../lib/random-range';
import {smartProps} from '../../lib/smart-props';
import {stringify} from '../../lib/stringify';

/**
 * Intermock general options
 */
export interface Options {
  // Array of file tuples. (filename, data)
  files?: Array<[string, string]>;

  // TypeScript is currently the only supported language
  language?: SupportedLanguage;

  // Specific interfaces to write to output
  interfaces?: string[];

  // Used for testing mode,
  isFixedMode?: boolean;

  // One of object|json|string. Strings have their object's functions
  // stringified.
  output?: OutputType;

  // Should optional properties always be enabled
  isOptionalAlwaysEnabled?: boolean;
}

type OutputType = 'object'|'json'|'string';
type SupportedLanguage = 'typescript';

interface JSDoc {
  comment: string;
}

interface NodeWithDocs extends ts.PropertySignature {
  jsDoc: JSDoc[];
}

type TypeCacheRecord = {
  kind: ts.SyntaxKind,
  aliasedTo: ts.SyntaxKind
};

type Output = Record<string, {}>;
type Types = Record<string, {}>;

/**
 * Generate fake data using faker for primitive types: string|number|boolean.
 *
 * @param property Output property to write to
 * @param syntaxType Type of primitive, such as boolean|number|string
 * @param options Intermock options object
 * @param mockType Optional specification of what Faker type to use
 */
function generatePrimitive(
    property: string, syntaxType: ts.SyntaxKind, options: Options,
    mockType?: string) {
  const smartMockType = smartProps[property];
  const isFixedMode = options.isFixedMode ? options.isFixedMode : false;

  if (mockType) {
    return fake(mockType, options.isFixedMode);
  } else if (smartMockType) {
    return fake(smartMockType, options.isFixedMode);
  } else {
    return defaultTypeToMock[syntaxType](isFixedMode);
  }
}

/**
 * Determines if a property marked as optional will have fake data generated for
 * it. Invokes this using Math.random.
 *
 * @param questionToken
 * @param options Intermock general options object
 */
function isQuestionToken(
    questionToken: ts.Token<ts.SyntaxKind.QuestionToken>|undefined,
    options: Options) {
  if (questionToken) {
    if (options.isFixedMode && !options.isOptionalAlwaysEnabled) {
      return true;
    }

    else if (Math.random() < .5 && !options.isOptionalAlwaysEnabled) {
      return true;
    }
  }

  return false;
}

/**
 * Process an untyped interface property, defaults to generating a primitive.
 *
 * @param output The object outputted by Intermock after all types are mocked
 * @param property Output property to write to
 * @param kind TS data type of property type
 * @param mockType Specification of what Faker type to use
 * @param options Intermock general options object
 */
function processGenericPropertyType(
    output: Output, property: string, kind: ts.SyntaxKind, mockType: string,
    options: Options) {
  const mock = generatePrimitive(property, kind, options, mockType);
  output[property] = mock;
}

/**
 * Generate a function for a call signature of a property of an interface. Uses
 * the `new Function` constructor and stringifies any internal function
 * declarations/calls or returned complex types.
 *
 * @param node Node being processed
 * @param output The object outputted by Intermock after all types are mocked
 * @param property Output property to write to
 * @param sourceFile TypeScript AST object compiled from file data
 * @param options Intermock general options object
 * @param types Top-level types of interfaces/aliases etc.
 */
function processFunctionPropertyType(
    node: ts.PropertySignature, output: Output, property: string,
    sourceFile: ts.SourceFile, options: Options, types: Record<string, {}>) {
  // TODO process args from parameters of function
  const args = '';
  let body = '';

  const funcNode = node.type as ts.FunctionTypeNode;
  const returnType = funcNode.type;

  switch (returnType.kind) {
    case ts.SyntaxKind.TypeReference:
      const tempBody: Record<string, {}> = {};
      processPropertyTypeReference(
          node, tempBody, 'body',
          ((returnType as ts.TypeReferenceNode).typeName as ts.Identifier).text,
          returnType.kind, sourceFile, options, types);

      body = `return ${stringify(tempBody['body'])}`;
      break;
    default:
      body = `return ${
          JSON.stringify(generatePrimitive('', returnType.kind, options))}`;
      break;
  }

  const func = new Function(args, body);
  output[property] = func;
}

/**
 * Process an individual interface property.
 *
 * @param node Node being processed
 * @param output The object outputted by Intermock after all types are mocked
 * @param property Output property to write to
 * @param typeName Type name of property
 * @param kind TS data type of property type
 * @param sourceFile TypeScript AST object compiled from file data
 * @param options Intermock general options object
 * @param types Top-level types of interfaces/aliases etc.
 */
function processPropertyTypeReference(
    node: ts.PropertySignature, output: Output, property: string,
    typeName: string, kind: ts.SyntaxKind, sourceFile: ts.SourceFile,
    options: Options, types: Record<string, {}>) {
  let normalizedTypeName;

  if (typeName.startsWith('Array<')) {
    normalizedTypeName = typeName.replace('Array<', '').replace('>', '');
  } else {
    normalizedTypeName = typeName;
  }

  if (normalizedTypeName !== typeName) {
    processArrayPropertyType(
        node, output, property, normalizedTypeName, kind, sourceFile, options,
        types);
    return;
  }

  if (!types[normalizedTypeName]) {
    throw new Error(`Type '${
        normalizedTypeName}' is not specified in the provided files but is required for property: '${
        property}'. Please include it.`);
  }

  switch ((types[normalizedTypeName] as TypeCacheRecord).kind) {
    case ts.SyntaxKind.EnumDeclaration:
      setEnum(sourceFile, output, typeName, property);
      break;
    default:
      if ((types[normalizedTypeName] as TypeCacheRecord).kind !==
          (types[normalizedTypeName] as TypeCacheRecord).aliasedTo) {
        const alias = (types[normalizedTypeName] as TypeCacheRecord).aliasedTo;
        const isPrimitiveType = alias === ts.SyntaxKind.StringKeyword ||
            alias === ts.SyntaxKind.NumberKeyword ||
            alias === ts.SyntaxKind.BooleanKeyword;

        if (isPrimitiveType) {
          output[property] = generatePrimitive(property, alias, options, '');
        } else {
          // TODO
        }
      } else {
        output[property] = {};
        processFile(sourceFile, output[property], options, types, typeName);
        break;
      }
  }
}

/**
 * Process JSDocs to determine if a different Faker type should be used to mock
 * the data of the interface.
 *
 * @param node Node being processed
 * @param output The object outputted by Intermock after all types are mocked
 * @param property Output property to write to
 * @param jsDocs JSDocs to process
 * @param options Intermock general options object
 */
function processJsDocs(
    node: ts.PropertySignature, output: Output, property: string,
    jsDocs: JSDoc[], options: Options) {
  // TODO handle case where we get multiple mock JSDocs or a JSDoc like
  // mockRange for an array. In essence, we are only dealing with
  // primitives now

  // TODO Handle error case where a complex type has MockDocs

  let mockType = '';
  let jsDocComment = '';

  if (jsDocs.length > 0 && jsDocs[0].comment) {
    jsDocComment = jsDocs[0].comment;
  }

  if (jsDocComment.startsWith('!mockType')) {
    const match = jsDocComment.match(/(?<=\{).+?(?=\})/g);
    if (match) {
      mockType = match[0];
    }
  } else {
    // TODO
  }

  const mock = generatePrimitive(property, node.kind, options, mockType);
  output[property] = mock;
}

/**
 * Process an array definition.
 *
 * @param node Node being processed
 * @param output The object outputted by Intermock after all types are mocked
 * @param property Output property to write to
 * @param typeName Type name of property
 * @param kind TS data type of property type
 * @param sourceFile TypeScript AST object compiled from file data
 * @param options Intermock general options object
 * @param types Top-level types of interfaces/aliases etc.
 */
function processArrayPropertyType(
    node: ts.PropertySignature, output: Output, property: string,
    typeName: string, kind: ts.SyntaxKind, sourceFile: ts.SourceFile,
    options: Options, types: Record<string, {}>) {
  typeName = typeName.replace('[', '').replace(']', '');
  output[property] = [];

  if ((node.type as ts.ArrayTypeNode).elementType) {
    kind = (node.type as ts.ArrayTypeNode).elementType.kind;
  }

  const isPrimitiveType = kind === ts.SyntaxKind.StringKeyword ||
      kind === ts.SyntaxKind.BooleanKeyword ||
      kind === ts.SyntaxKind.NumberKeyword;

  const arrayRange = options.isFixedMode ?
      FIXED_ARRAY_COUNT :
      randomRange(DEFAULT_ARRAY_RANGE[0], DEFAULT_ARRAY_RANGE[1]);

  for (let i = 0; i < arrayRange; i++) {
    if (isPrimitiveType) {
      (output[property] as Array<{}>)[i] =
          generatePrimitive(property, kind, options, '');
    } else {
      (output[property] as Array<{}>).push({});
      processFile(
          sourceFile, (output[property] as Array<{}>)[i], options, types,
          typeName);
    }
  }
}

/**
 * Process each interface property.
 *
 * @param node Node being processed
 * @param output The object outputted by Intermock after all types are mocked
 * @param sourceFile TypeScript AST object compiled from file data
 * @param options Intermock general options object
 * @param types Top-level types of interfaces/aliases etc.
 */
function traverseInterfaceMembers(
    node: ts.Node, output: Output, sourceFile: ts.SourceFile, options: Options,
    types: Record<string, {}>) {
  if (node.kind !== ts.SyntaxKind.PropertySignature) {
    return;
  }

  const processPropertySignature = (node: ts.PropertySignature) => {
    let jsDocs: JSDoc[] = [];

    if ((node as NodeWithDocs).jsDoc) {
      jsDocs = (node as NodeWithDocs).jsDoc;
    }

    const property = node.name.getText();
    const questionToken = node.questionToken;

    let typeName = '';
    let kind;

    if (isQuestionToken(questionToken, options)) {
      return;
    }

    if (jsDocs.length > 0) {
      processJsDocs(node, output, property, jsDocs, options);
      return;
    }

    if (node.type) {
      kind = node.type.kind;
      typeName = node.type.getText();
    }

    switch (kind) {
      case ts.SyntaxKind.TypeReference:
        processPropertyTypeReference(
            node, output, property, typeName, kind as ts.SyntaxKind, sourceFile,
            options, types);
        break;
      case ts.SyntaxKind.ArrayType:
        processArrayPropertyType(
            node, output, property, typeName, kind as ts.SyntaxKind, sourceFile,
            options, types);
        break;
      case ts.SyntaxKind.FunctionType:
        processFunctionPropertyType(
            node, output, property, sourceFile, options, types);
        break;
      default:
        processGenericPropertyType(
            output, property, kind as ts.SyntaxKind, '', options);
        break;
    }
  };

  processPropertySignature(node as ts.PropertySignature);
}

/**
 * Process an enum and set it.
 *
 * @param sourceFile TypeScript AST object compiled from file data
 * @param output The object outputted by Intermock after all types are mocked
 * @param typeName Type name of property
 * @param property Output property to write to
 */
function setEnum(
    sourceFile: ts.SourceFile, output: Output, typeName: string,
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
                output[property] = Number(selectedMember.initializer.getText());
                break;
              case ts.SyntaxKind.StringLiteral:
                output[property] =
                    selectedMember.initializer.getText().replace(/\'/g, '');
                break;
              default:
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

function gatherExtensions(node: ts.Node) {}

/**
 * Traverse each declared interface in a node.
 *
 * @param node Node being processed
 * @param output The object outputted by Intermock after all types are mocked
 * @param sourceFile TypeScript AST object compiled from file data
 * @param options Intermock general options object
 * @param types Top-level types of interfaces/aliases etc.
 * @param propToTraverse Optional specific property to traverse through the
 *     interface
 * @param path Optional specific path to write to on the output object
 */
function traverseInterface(
    node: ts.Node, output: Output, sourceFile: ts.SourceFile, options: Options,
    types: Types, propToTraverse?: string, path?: string) {
  if (path) {
    output[path] = {};
    output = output[path];
  }

  if (!propToTraverse && !path) {
    const newPath = (node as ts.InterfaceDeclaration).name.text;
    output[newPath] = {};
    output = output[newPath];
  }

  const heritageClauses = (node as ts.InterfaceDeclaration).heritageClauses;
  const extensions: Output[] = [];
  if (heritageClauses && heritageClauses.length > 0) {
    heritageClauses.forEach((clause) => {
      const extensionTypes = clause.types;

      extensionTypes.forEach(extensionTypeNode => {
        const extensionType = extensionTypeNode.expression.getText();
        const extensionNode = (types[extensionType] as any).node;
        let extensionOutput: Output = {};
        traverseInterface(
            extensionNode, extensionOutput, sourceFile, options, types,
            propToTraverse, path);

        extensionOutput = extensionOutput[extensionType];
        extensions.push(extensionOutput);
      });
    });

    extensions.forEach(extension => {
      console.warn(JSON.stringify(extension));
      output = Object.assign(output, extension);
    });
  }



  // TODO get range from JSDoc
  // TODO given a range of interfaces to generate, add to array. If 1
  // then just return an object
  node.forEachChild(
      child =>
          traverseInterfaceMembers(child, output, sourceFile, options, types));
}

function isSpecificInterface(name: string, options: Options) {
  if (!options.interfaces) {
    return true;
  }

  if (options.interfaces.indexOf(name) === -1) {
    return false;
  }

  return true;
}

/**
 * Process an individual TS file given a TS AST object.
 *
 * @param sourceFile TypeScript AST object compiled from file data
 * @param output The object outputted by Intermock after all types are mocked
 * @param options Intermock general options object
 * @param types Top-level types of interfaces/aliases etc.
 * @param propToTraverse Optional specific property to traverse through the
 *     interface
 */
function processFile(
    sourceFile: ts.SourceFile, output: Output, options: Options, types: Types,
    propToTraverse?: string) {
  const processNode = (node: ts.Node) => {
    switch (node.kind) {
      case ts.SyntaxKind.InterfaceDeclaration:
        /**
         * TODO: Handle interfaces that extend others, via checking hertiage
         * clauses
         */
        const p = (node as ts.InterfaceDeclaration).name.text;
        if (!isSpecificInterface(p, options) && !propToTraverse) {
          return;
        }
        if (propToTraverse) {
          if (p === propToTraverse) {
            traverseInterface(
                node, output, sourceFile, options, types, propToTraverse);
          }
        } else {
          traverseInterface(node, output, sourceFile, options, types);
        }
        break;
      case ts.SyntaxKind.TypeAliasDeclaration:
        const type = (node as ts.TypeAliasDeclaration).type;
        const path = (node as ts.TypeAliasDeclaration).name.text;

        if (!isSpecificInterface(path, options)) {
          return;
        }

        if (propToTraverse) {
          if (path === propToTraverse) {
            traverseInterface(
                type, output, sourceFile, options, types, propToTraverse);
          }
        } else {
          traverseInterface(
              type, output, sourceFile, options, types, undefined, path);
        }
        break;

      default:
        break;
    }

    ts.forEachChild(node, processNode);
  };

  processNode(sourceFile);
}

/**
 * Gathers all interfaces and types references ahead of time so that when
 * interface properties reference them then we can know their type.
 *
 * @param sourceFile TypeScript AST object compiled from file data
 */
function gatherTypes(sourceFile: ts.SourceFile) {
  const types: Types = {};

  const processNode = (node: ts.Node) => {
    const name = (node as ts.DeclarationStatement).name;
    const text = name ? name.text : '';

    let aliasedTo;

    if ((node as ts.TypeAliasDeclaration).type) {
      aliasedTo = (node as ts.TypeAliasDeclaration).type.kind;
    } else {
      aliasedTo = node.kind;
    }

    types[text] = {kind: node.kind, aliasedTo, node};

    ts.forEachChild(node, processNode);
  };

  processNode(sourceFile);

  return types;
}

/**
 * Fromat output based on the specified output type in the options object.
 *
 * @param output The object outputted by Intermock after all types are mocked
 * @param options Intermock general options object
 */
function formatOutput(output: Output, options: Options): string|Output {
  switch (options.output) {
    case 'json':
      return JSON.stringify(output);
    case 'string':
      return stringify(output);
    default:
      return output;
  }
}

/**
 * Intermock API.
 *
 * Given an options object, with a files array property, Intermock parses the
 * AST and generates mock objects with fake data.
 *
 * This is the only part of the API exposed to a caller (including the CLI). All
 * data is passed through the `files` property on the options object.
 *
 * @param options Intermock general options object
 */
export function mock(options: Options) {
  const output: Output = {};
  const fileContents = options.files;
  let types: Types;

  if (!fileContents) {
    return {};
  }

  fileContents.forEach((f) => {
    types = gatherTypes(
        ts.createSourceFile(f[0], f[1], ts.ScriptTarget.ES2015, true));
  });

  fileContents.forEach((f) => {
    processFile(
        ts.createSourceFile(f[0], f[1], ts.ScriptTarget.ES2015, true), output,
        options, types);
  });

  return formatOutput(output, options);
}
