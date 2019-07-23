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
import {defaultTypeToMock, SupportedTypes} from '../../lib/default-type-to-mock';
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
  aliasedTo: ts.SyntaxKind,
  node: ts.Node,
};

type Output = Record<string, {}>;
type Types = Record<string, TypeCacheRecord>;

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
    if (!defaultTypeToMock[syntaxType]) {
      throw Error(`Unsupported Primitive type ${syntaxType}`);
    }
    return defaultTypeToMock[syntaxType](isFixedMode);
  }
}

/**
 * Determines if a property marked as optional will have fake data generated
 * for it. Invokes this using Math.random.
 *
 * @param questionToken
 * @param options Intermock general options object
 */
function isQuestionToken(
    questionToken: ts.Token<ts.SyntaxKind.QuestionToken>|undefined,
    isUnionWithNull: boolean, options: Options) {
  if (questionToken || isUnionWithNull) {
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
    node: ts.Node, output: Output, property: string, kind: ts.SyntaxKind,
    mockType: string, options: Options) {
  // @ts-ignore
  if (node && node.type && node.type.kind === ts.SyntaxKind.LiteralType) {
    if ((node as any).type.literal.kind === ts.SyntaxKind.TrueKeyword) {
      output[property] = true;
    } else if ((node as any).type.literal.kind === ts.SyntaxKind.FalseKeyword) {
      output[property] = false;
    } else if (
        (node as any).type.literal.kind === ts.SyntaxKind.StringLiteral) {
      output[property] = (node as any).type.literal.text;
    } else {
      output[property] = parseInt((node as any).type.literal.text, 10);
    }
    return;
  }
  const mock = generatePrimitive(property, kind, options, mockType);
  output[property] = mock;
}

/**
 * Generate a function for a call signature of a property of an interface.
 * Uses the `new Function` constructor and stringifies any internal function
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
    sourceFile: ts.SourceFile, options: Options, types: Types) {
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
    options: Options, types: Types) {
  let normalizedTypeName;

  if (typeName.startsWith('Array<') || typeName.startsWith('IterableArray<')) {
    normalizedTypeName =
        typeName.replace(/(Array|IterableArray)\</, '').replace('>', '');
  } else {
    normalizedTypeName = typeName;
  }

  // TODO: Handle other generics
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
      setEnum(sourceFile, output, types, normalizedTypeName, property);
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
 * Process JSDocs to determine if a different Faker type should be used to
 * mock the data of the interface.
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
    // Safari and older versions of Node cannot handle this lookahead regex
    // Try catch to handle, discard error for now
    try {
      const match = jsDocComment.match(/\{([^)]+)\}/);
      if (match) {
        mockType = match[1];
      }
    } catch (err) {
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
    options: Options, types: Types) {
  typeName = typeName.replace('[', '').replace(']', '');
  output[property] = [];

  if (node.type && (node.type as ts.ArrayTypeNode).elementType) {
    kind = (node.type as ts.ArrayTypeNode).elementType.kind;
  } else if ((node as unknown as ts.ArrayTypeNode).elementType) {
    kind = (node as unknown as ts.ArrayTypeNode).elementType.kind;
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
function processUnionPropertyType(
    node: ts.PropertySignature, output: Output, property: string,
    typeName: string, kind: ts.SyntaxKind, sourceFile: ts.SourceFile,
    options: Options, types: Types) {
  // @ts-ignore
  const unionNodes = node ?
      node.type.types.map((type: ts.Node) => type) as ts.SyntaxKind[] :
      [];
  // @ts-ignore
  const supportedType = unionNodes.find(
      (type: ts.Node) => Object.values(SupportedTypes).includes(type.kind))
  if (supportedType) {
    output[property] =
        generatePrimitive(property, supportedType.kind, options, '');
    return;
  }
  else {
    // @ts-ignore
    const typeReferenceNode = unionNodes.find(
        (node: ts.Node) => node.kind === ts.SyntaxKind.TypeReference);
    if (typeReferenceNode) {
      processPropertyTypeReference(
          typeReferenceNode, output, property, typeReferenceNode.typeName.text,
          typeReferenceNode.kind, sourceFile, options, types);
      return;
    }
    // @ts-ignore
    const arrayNode = unionNodes.find(
        (node: ts.Node) => node.kind === ts.SyntaxKind.ArrayType);
    if (arrayNode) {
      processArrayPropertyType(
          arrayNode, output, property,
          `[${arrayNode.elementType.typeName.text}]`, arrayNode.kind,
          sourceFile, options, types);
      return;
    }
    // @ts-ignore
    const functionNode = unionNodes.find(
        (node: ts.Node) => node.kind === ts.SyntaxKind.FunctionType);
    if (functionNode) {
      processFunctionPropertyType(
          functionNode, output, property, sourceFile, options, types);
      return;
    }

    throw Error(`Unsupported Union option type ${(node as any).property}: ${
        node && (node as any).typename}`);
  }
}

function isAnyJsDocs(jsDocs: JSDoc[]) {
  if (jsDocs.length > 0 && jsDocs[0].comment &&
      jsDocs[0].comment.includes('!mockType')) {
    return true;
  }

  return false;
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
    types: Types) {
  if (node.kind !== ts.SyntaxKind.PropertySignature) {
    return;
  }

  const processPropertySignature = (node: ts.PropertySignature) => {
    let jsDocs: JSDoc[] = [];

    if ((node as NodeWithDocs).jsDoc) {
      jsDocs = (node as NodeWithDocs).jsDoc;
    }

    let isUnionWithNull = false;

    const property = node.name.getText();
    const questionToken = node.questionToken;
    const isUnion = node.type && node.type.kind === ts.SyntaxKind.UnionType;

    if (isUnion) {
      isUnionWithNull = !!(node.type as ts.UnionTypeNode)
                              .types.map(type => type.kind)
                              .some(kind => kind === ts.SyntaxKind.NullKeyword)
    }

    let typeName = '';
    let kind;

    if (isQuestionToken(questionToken, isUnionWithNull, options)) {
      return;
    }

    if (isAnyJsDocs(jsDocs)) {
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
      case ts.SyntaxKind.UnionType:
        processUnionPropertyType(
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
            node, output, property, kind as ts.SyntaxKind, '', options);
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
    sourceFile: ts.SourceFile, output: Output, types: Types, typeName: string,
    property: string) {
  const node: unknown = types[typeName].node;
  if (!node) {
    return;
  }

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

        if (!types[extensionType]) {
          throw new Error(`Type '${
              extensionType}' is not specified in the provided files but is required for interface extension of: '${
              (node as ts.InterfaceDeclaration)
                  .name.text}'. Please include it.`);
        }

        const extensionNode = types[extensionType].node;
        let extensionOutput: Output = {};
        traverseInterface(
            extensionNode, extensionOutput, sourceFile, options, types,
            propToTraverse, path);

        extensionOutput = extensionOutput[extensionType];
        extensions.push(extensionOutput);
      });
    });

    extensions.forEach(extension => {
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
function gatherTypes(sourceFile: ts.SourceFile|ts.ModuleBlock) {
  const types: Types = {};
  let modulePrefix = '';

  const processNode = (node: ts.Node|ts.ModuleBlock) => {
    const name = (node as ts.DeclarationStatement).name;
    const text = name ? name.text : '';

    // Process declared namespaces and modules
    if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
      modulePrefix = text;
      if ((node as ts.ModuleDeclaration).body) {
        processNode((node as ts.ModuleDeclaration).body!);
      }

      return;
    }

    let aliasedTo;

    if ((node as ts.TypeAliasDeclaration).type) {
      aliasedTo = (node as ts.TypeAliasDeclaration).type.kind;
    } else {
      aliasedTo = node.kind;
    }

    if (modulePrefix) {
      types[`${modulePrefix}.${text}`] = {kind: node.kind, aliasedTo, node};
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
 * This is the only part of the API exposed to a caller (including the CLI).
 * All data is passed through the `files` property on the options object.
 *
 * @param options Intermock general options object
 */
export function mock(options: Options) {
  const output: Output = {};
  const fileContents = options.files;
  let types: Types = {};

  if (!fileContents) {
    return {};
  }

  fileContents.forEach((f) => {
    types = Object.assign(
        {}, types,
        gatherTypes(
            ts.createSourceFile(f[0], f[1], ts.ScriptTarget.ES2015, true)));
  });

  fileContents.forEach((f) => {
    processFile(
        ts.createSourceFile(f[0], f[1], ts.ScriptTarget.ES2015, true), output,
        options, types);
  });

  return formatOutput(output, options);
}
