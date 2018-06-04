import ts from 'typescript';
import {fake} from './fake';
import {MapLike} from './types';

export const defaultTypeToMock:
    {[index: number]: (isFixedMode: boolean) => string | number | boolean} = {
      [ts.SyntaxKind.NumberKeyword]: (isFixedMode = false) =>
          fake('random.number', isFixedMode),
      [ts.SyntaxKind.StringKeyword]: (isFixedMode = false) =>
          fake('lorem.text', isFixedMode),
      [ts.SyntaxKind.BooleanKeyword]: (isFixedMode = false) =>
          fake('random.boolean', isFixedMode),
    };
