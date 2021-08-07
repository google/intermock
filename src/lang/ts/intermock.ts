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
import {defaultTypeToMock, supportedPrimitiveTypes} from '../../lib/default-type-to-mock';
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

  // Function to resolve file imports
  importsResolver?: Function;
}

type SupportedLanguage = 'typescript';
export type OutputType = 'object'|'json'|'string';

interface NodeWithDocs extends ts.PropertySignature {
  jsDoc: ts.JSDoc[];
}

type TypeCacheRecord = {
  kind: ts.SyntaxKind,
  aliasedTo: ts.SyntaxKind,
  node: ts.Node,
};

export type Output = Record<string|number, {}>;
export type Types = Record<string, TypeCacheRecord>;

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

function getLiteralTypeValue(node: ts.LiteralTypeNode) {
  const {literal} = node;
  // Boolean Literal
  if (literal.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  } else if (literal.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
    // String Literal
  } else if (literal.kind === ts.SyntaxKind.StringLiteral) {
    return literal.text ? literal.text : '';
    // Numeric Literal
  } else {
    // The text IS a string, but the output value has to be a numeric value
    return Number((literal as ts.NumericLiteral).text);
  }
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
    node: ts.PropertySignature, output: Output, property: string,
    kind: ts.SyntaxKind, mockType: string, options: Options) {
  if (node && node.type && ts.isLiteralTypeNode(node.type)) {
    output[property] = getLiteralTypeValue(node.type as ts.LiteralTypeNode);
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
    node: ts.PropertySignature|ts.TypeNode, output: Output, property: string,
    sourceFile: ts.SourceFile, options: Options, types: Types) {
  // TODO process args from parameters of function
  const args = '';
  let body = '';

  const funcNode =
      (ts.isTypeNode(node) ? node : node.type) as ts.FunctionTypeNode;
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

function processIndexedAccessPropertyType(
    node: ts.IndexedAccessTypeNode, output: Output, property: string,
    options: Options, types: Types) {
  let kind;
  const objectType =
      ((node.objectType as ts.TypeReferenceNode).typeName as ts.Identifier)
          .escapedText;
  const indexType =
      ((node.indexType as ts.LiteralTypeNode).literal as ts.LiteralExpression)
          .text;

  const members: ts.NodeArray<ts.TypeElement> =
      ((types[objectType as string].node as ts.TypeAliasDeclaration).type as
       ts.TypeLiteralNode)
          .members;

  if (members) {
    const match = members.find(
        (member: ts.TypeElement) =>
            (member.name as ts.Identifier).escapedText === indexType);
    if (match) {
      const matchType = (match as ts.PropertySignature).type;
      if (matchType) {
        kind = matchType.kind;
      }
    }
  }

  const isPrimitiveType = kind === ts.SyntaxKind.StringKeyword ||
      kind === ts.SyntaxKind.NumberKeyword ||
      kind === ts.SyntaxKind.BooleanKeyword;

  if (isPrimitiveType && kind) {
    output[property] = generatePrimitive(indexType, kind, options);
  } else {
    // TODO
  }
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
    node: ts.PropertySignature|ts.TypeNode, output: Output, property: string,
    typeName: string, kind: ts.SyntaxKind, sourceFile: ts.SourceFile,
    options: Options, types: Types) {
  let normalizedTypeName: string;
  let isArray = false;

  if (typeName.startsWith('Array<') || typeName.startsWith('IterableArray<')) {
    normalizedTypeName =
        typeName.replace(/(Array|IterableArray)\</, '').replace('>', '');
    isArray = true;
  } else {
    normalizedTypeName = typeName;
  }

  const typeReference: ts.NodeWithTypeArguments|undefined =
      (node as ts.MappedTypeNode).type;
  if (!isArray && typeReference && typeReference.typeArguments &&
      typeReference.typeArguments.length) {
    console.log('generic');
    // Process Generic
    normalizedTypeName =
        ((typeReference as ts.TypeReferenceNode).typeName as ts.Identifier)
            .escapedText as string;
  }

  // TODO: Handle other generics
  if (normalizedTypeName !== typeName && isArray) {
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
    case ts.SyntaxKind.ImportSpecifier:
    case ts.SyntaxKind.ExportSpecifier:
      if (options.importsResolver) {
        options.importsResolver(
            sourceFile, output, types, normalizedTypeName, property, options);
      }
      break;
    default:
      const record = (types[normalizedTypeName] as TypeCacheRecord);
      if (record.kind !== record.aliasedTo) {
        const alias = record.aliasedTo;
        const isPrimitiveType = alias === ts.SyntaxKind.StringKeyword ||
            alias === ts.SyntaxKind.NumberKeyword ||
            alias === ts.SyntaxKind.BooleanKeyword;

        if (isPrimitiveType) {
          output[property] = generatePrimitive(property, alias, options, '');
        } else if (alias === ts.SyntaxKind.UnionType) {
          let parameters: string[] = [];

          if (record && record.node) {
            const typeParameters =
                (record.node as ts.TypeAliasDeclaration).typeParameters;
            if (typeParameters) {
              parameters = typeParameters.map(
                  (value: ts.TypeParameterDeclaration): string =>
                      value.name.escapedText as string);
            }

            const updatedArr =
                ((record.node as ts.TypeAliasDeclaration).type as
                 ts.UnionOrIntersectionTypeNode)
                    .types.map(t => {
                      const parameterIndex =
                          (t as ts.TypeReferenceNode).typeName ?
                          parameters.indexOf(
                              ((t as ts.TypeReferenceNode).typeName as
                               ts.Identifier)
                                  .escapedText as string) :
                          -1;
                      if (parameterIndex > -1) {
                        const propertyType: ts.NodeWithTypeArguments|undefined =
                            (node as ts.PropertySignature).type;
                        if (propertyType && propertyType.typeArguments) {
                          return propertyType.typeArguments[parameterIndex];
                        }
                      }
                      return t;
                    });
            ((record.node as ts.TypeAliasDeclaration).type as
             ts.UnionOrIntersectionTypeNode)
                .types = updatedArr as unknown as ts.NodeArray<ts.TypeNode>;
            processUnionPropertyType(
                record.node as ts.PropertySignature, output, property, typeName,
                record.kind, sourceFile, options, types);
          }
        } else if (alias === ts.SyntaxKind.TypeLiteral) {
          output[property] = {};
          processFile(sourceFile, output[property], options, types, typeName);
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
    jsDocs: ts.JSDoc[], options: Options) {
  // TODO handle case where we get multiple mock JSDocs or a JSDoc like
  // mockRange for an array. In essence, we are only dealing with
  // primitives now

  // TODO Handle error case where a complex type has MockDocs
  const [tag] = findSupportedJSDocTags(jsDocs);

  const tagValue = extractTagValue(tag);

  switch (tag.tagName.text) {
    case 'mockType':
      const mock = generatePrimitive(property, node.kind, options, tagValue);
      output[property] = mock;
      break;

    case 'mockRange':
      // TODO
      break;

    default:
      throw new Error(`Unexpected tagName: ${tag.tagName.text}`);
  }
}

function normalizeNamespaceTypeName(typeName: string) {
  return typeName.replace(/[a-zA-Z0-9]+\.([a-zA-Z0-9]+)/g, '$1');
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
    node: ts.PropertySignature|ts.TypeNode, output: Output, property: string,
    typeName: string, kind: ts.SyntaxKind, sourceFile: ts.SourceFile,
    options: Options, types: Types) {
  typeName = typeName.replace('[', '').replace(']', '');
  typeName = normalizeNamespaceTypeName(typeName);
  output[property] = resolveArrayType(
      node, property, typeName, kind, sourceFile, options, types);
}

function resolveArrayType(
    node: ts.PropertySignature|ts.TypeNode, property: string, typeName: string,
    kind: ts.SyntaxKind, sourceFile: ts.SourceFile, options: Options,
    types: Types) {
  typeName = typeName.replace('[', '').replace(']', '');
  const result = [];

  if (ts.isTypeNode(node)) {
    kind = node.kind;
  } else if ((node.type as ts.ArrayTypeNode).elementType) {
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
      result.push(generatePrimitive(property, kind, options, ''));
    } else {
      const cache = {};
      processFile(sourceFile, cache, options, types, typeName);
      result.push(cache);
    }
  }
  return result;
}

/**
 * Process an tuple definition.
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
function processTuplePropertyType(
    node: ts.TupleTypeNode, output: Output, property: string,
    sourceFile: ts.SourceFile, options: Options, types: Types) {
  output[property] =
      resolveTuplePropertyType(node, property, sourceFile, options, types);
}

function resolveTuplePropertyType(
    node: ts.TupleTypeNode, property: string, sourceFile: ts.SourceFile,
    options: Options, types: Types): Array<unknown> {
  const result = [];
  const {elementTypes} = node;

  for (let i = 0; i < elementTypes.length; i++) {
    const typeNode = elementTypes[i];
    switch (typeNode.kind) {
      case ts.SyntaxKind.RestType:
        const node = (typeNode as ts.RestTypeNode).type as ts.ArrayTypeNode;
        result.push(...resolveArrayType(
            node.elementType, property, node.getText(), node.elementType.kind,
            sourceFile, options, types));
        break;
      case ts.SyntaxKind.NumberKeyword:
      case ts.SyntaxKind.StringKeyword:
      case ts.SyntaxKind.BooleanKeyword:
        result.push(generatePrimitive(property, typeNode.kind, options, ''));
        break;
      case ts.SyntaxKind.LiteralType:
        result.push(getLiteralTypeValue(typeNode as ts.LiteralTypeNode));
        break;
      case ts.SyntaxKind.TupleType:
        result.push(resolveTuplePropertyType(
            typeNode as ts.TupleTypeNode, property, sourceFile, options,
            types));
        break;
      default:
        const data = {};
        processFile(
            sourceFile, data, options, types,
            ((typeNode as ts.TypeReferenceNode).typeName as ts.Identifier)
                .text);
        result.push(data);
        break;
    }
  }
  return result;
}

/**
 * Process a union property.
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
  const unionNodes = node && node.type ?
      (node.type as ts.UnionTypeNode).types as ts.NodeArray<ts.TypeNode>:
      [];
  const supportedType =
      unionNodes.find(type => supportedPrimitiveTypes[type.kind]);
  if (supportedType) {
    output[property] =
        generatePrimitive(property, supportedType.kind, options, '');
    return;
  } else {
    const typeReferenceNode =
        unionNodes.find(node => node.kind === ts.SyntaxKind.TypeReference) as
            ts.TypeReferenceNode |
        undefined;
    if (typeReferenceNode) {
      processPropertyTypeReference(
          typeReferenceNode, output, property,
          (typeReferenceNode.typeName as ts.Identifier).text,
          typeReferenceNode.kind, sourceFile, options, types);
      return;
    }
    const arrayNode =
        unionNodes.find(node => node.kind === ts.SyntaxKind.ArrayType) as
            ts.ArrayTypeNode |
        undefined;
    if (arrayNode) {
      processArrayPropertyType(
          arrayNode, output, property,
          `[${
              ((arrayNode.elementType as ts.TypeReferenceNode).typeName as
               ts.Identifier)
                  .text}]`,
          arrayNode.kind, sourceFile, options, types);
      return;
    }
    const functionNode = unionNodes.find(
        (node: ts.Node) => node.kind === ts.SyntaxKind.FunctionType);
    if (functionNode) {
      processFunctionPropertyType(
          functionNode, output, property, sourceFile, options, types);
      return;
    }
    const indexedAccessNode = unionNodes.find(
        (node: ts.Node) => node.kind === ts.SyntaxKind.IndexedAccessType);
    if (indexedAccessNode) {
      processIndexedAccessPropertyType(
          indexedAccessNode as ts.IndexedAccessTypeNode, output, property,
          options, types);
      return;
    }
    const literalNode = unionNodes.every(
        (node: ts.Node) => node.kind === ts.SyntaxKind.LiteralType);
    if (literalNode) {
      const literalIndex =
          options.isFixedMode ? 0 : randomRange(0, unionNodes.length - 1);
      output[property] =
          getLiteralTypeValue(unionNodes[literalIndex] as ts.LiteralTypeNode);
      return;
    }

    throw Error(`Unsupported Union option type ${property}: ${typeName}`);
  }
}

const SUPPORTED_JSDOC_TAGNAMES = ['mockType', 'mockRange'] as const;
type SupportedJsDocTagName = typeof SUPPORTED_JSDOC_TAGNAMES[number];


/**
 * Extract value from comment following JSDoc tag
 *
 * @param tag processed tag
 */
function extractTagValue(tag: ts.JSDocTag): string {
  let value = tag.comment || '';

  // Unwrap from braces
  if (value[0] === '{' && value[value.length - 1] === '}') {
    value = value.slice(1, -1);
  }

  return value;
}

interface SupportedJSDocTag extends ts.JSDocTag {
  tagName: ts.Identifier&{text: SupportedJsDocTagName};
}

function isSupportedJSDocTag(tag: ts.JSDocTag): tag is SupportedJSDocTag {
  return (SUPPORTED_JSDOC_TAGNAMES as readonly string[])
      .includes(tag.tagName.text);
}

/**
 * Find mockType and mockRange JSDoc tags in array
 *
 * @param jsDocs JSDoc comments
 */
function findSupportedJSDocTags(jsDocs: ts.JSDoc[]): SupportedJSDocTag[] {
  const supportedJsDocTags: SupportedJSDocTag[] = [];

  for (const doc of jsDocs) {
    for (const tag of (doc.tags || [])) {
      if (isSupportedJSDocTag(tag)) {
        supportedJsDocTags.push(tag);
      }
    }
  }

  return supportedJsDocTags;
}

function isAnyJsDocs(jsDocs: ts.JSDoc[]) {
  return findSupportedJSDocTags(jsDocs).length > 0;
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
    let jsDocs: ts.JSDoc[] = [];

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
                              .some(kind => kind === ts.SyntaxKind.NullKeyword);
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
      case ts.SyntaxKind.TupleType:
        processTuplePropertyType(
            node.type as ts.TupleTypeNode, output, property, sourceFile,
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
      case ts.SyntaxKind.IndexedAccessType:
        processIndexedAccessPropertyType(
            node.type as ts.IndexedAccessTypeNode, output, property, options,
            types);
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
  if (heritageClauses) {
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

  if (!fileContents) {
    return {};
  }

  const types = fileContents.reduce((sum, f) => {
    const type = gatherTypes(
        ts.createSourceFile(f[0], f[1], ts.ScriptTarget.ES2015, true));
    return {...sum, ...type};
  }, {} as Types);

  fileContents.forEach((f) => {
    processFile(
        ts.createSourceFile(f[0], f[1], ts.ScriptTarget.ES2015, true), output,
        options, types);
  });

  return formatOutput(output, options);
}
