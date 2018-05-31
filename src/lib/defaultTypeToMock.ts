import ts from 'typescript';
import {fake} from '../fake';

export const defaultTypeToMock: {[index: number]: () => string} = {
  [ts.SyntaxKind.NumberKeyword]: () => fake('{{random.number}}'),
  [ts.SyntaxKind.StringKeyword]: () => fake('{{lorem.text}}'),
  [ts.SyntaxKind.BooleanKeyword]: () => fake('{{random.boolean}}'),
};
