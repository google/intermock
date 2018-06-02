import ts from 'typescript';
import {fake} from '../fake';
import {MapLike} from './types';

export const defaultTypeToMock:
    {[index: number]: () => string | number | boolean} = {
      [ts.SyntaxKind.NumberKeyword]: () => fake('random.number'),
      [ts.SyntaxKind.StringKeyword]: () => fake('lorem.text'),
      [ts.SyntaxKind.BooleanKeyword]: () => fake('random.boolean'),
    };
