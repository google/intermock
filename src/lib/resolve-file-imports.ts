import {existsSync, readFileSync} from 'fs';
import {resolve} from 'path';
import ts from 'typescript';

import {mock, Options, Output, Types} from '../lang/ts/intermock';

/**
 * Process an importSpecifier or exportSpecifier and set it.
 *
 * @param sourceFile TypeScript AST object compiled from file data
 * @param output The object outputted by Intermock after all types are mocked
 * @param types Top-level types of interfaces/aliases etc.
 * @param typeName Type name of property
 * @param property Output property to write to
 * @param options Intermock general options object
 */
export function setImportExportSpecifier(
    sourceFile: ts.SourceFile, output: Output, types: Types, typeName: string,
    property: string, options: Options) {
  const memo = new Map<string, Map<string, string>>();

  /**
   *
   * @param interfaceName selected interfaceName
   * @param curFile start file
   * @param path detect loop
   * @example
   * ```ts
   * findInterfaceRoot('Bar')
   * // return
   * '/usr/local/a.ts'
   * ```
   */
  const findInterfaceRoot =
      (interfaceName: string, curFile: string, path: string[] = []): string => {
        if (path.includes(curFile)) {
          throw new Error(`${interfaceName}: cicular importing detected`);
        }

        const dependencyMap = getDependencyMap(curFile);
        if (dependencyMap.has(interfaceName)) {
          const moduleFrom = dependencyMap.get(interfaceName)!;
          const nextFile = resolveModuleFrom(curFile, moduleFrom);
          return findInterfaceRoot(
              interfaceName, nextFile, path.concat([curFile]));
        } else {
          return curFile;
        }
      };

  /**
   * @param path absolute path
   * @returns import relations of this file
   */
  const getDependencyMap = (path: string): Map<string, string> => {
    if (memo.has(path)) {
      return memo.get(path)!;
    } else {
      const dependencyMap = new Map<string, string>();

      const fileContent = readFileSync(path, 'utf8').toString().trim();
      const importMatch = /import ([\s\S]+?) from ['"]([\s\S]+?)['"]/gm;

      Array.from(fileContent.matchAll(importMatch)).map((item) => {
        const imports = item[1].replace(/[{}\s]/gm, '').split(',');
        const moduleFrom = item[2];
        imports.forEach((imp) => dependencyMap.set(imp, moduleFrom));
      });

      memo.set(path, dependencyMap);
      return dependencyMap;
    }
  };

  /**
   * @param curFile
   * @param moduleFrom only support relative import for now
   * @returns absolute path of this moduleFrom
   */
  const resolveModuleFrom = (curFile: string, moduleFrom: string): string => {
    const tryFile = (mdf: string) => resolve(curFile, '..', mdf);
    const tryFiles = [
      tryFile(moduleFrom),
      tryFile(moduleFrom + '.ts'),
      tryFile(moduleFrom + '.tsx'),
      tryFile(moduleFrom + 'index.ts'),
      tryFile(moduleFrom + 'index.tsx'),
    ];

    for (const f of tryFiles) {
      if (existsSync(f)) {
        return f;
      }
    }

    throw new Error(`not supported import ${moduleFrom} in ${curFile}`);
  };

  const interfaceRoot = findInterfaceRoot(typeName, options.files![0][0]);

  output[property] =
      (mock({
         ...options,
         interfaces: [typeName],
         files: [[interfaceRoot, readFileSync(interfaceRoot, 'utf-8')]],
         output: 'object',
       }) as Output)[typeName];
}
