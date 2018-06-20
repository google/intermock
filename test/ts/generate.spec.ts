
import 'mocha';

import {expect} from 'chai';

import {Intermock} from '../../src/lang/ts/intermock';

import {expectedFlat} from './test-data/flat';
import {expectedMockType} from './test-data/mockType';
import {expectedNested} from './test-data/nestedSingle';

describe('', () => {
  it('should generate mock for a flat interface, with just primitives', () => {
    const im = new Intermock(
        {files: [`${__dirname}/test-data/flat.ts`], isFixedMode: true});

    return im.generate().then((output: any) => {
      expect(output.FlatInterface).to.deep.equal(expectedFlat);
    });
  });

  it('should generate mock for a specified mock type', () => {
    const im = new Intermock(
        {files: [`${__dirname}/test-data/mockType.ts`], isFixedMode: true});

    return im.generate().then((output: any) => {
      expect(output.FlatPerson).to.deep.equal(expectedMockType);
    });
  });

  it('should generate mock for singly nested interfaces', () => {
    const im = new Intermock(
        {files: [`${__dirname}/test-data/nestedSingle.ts`], isFixedMode: true});

    return im.generate().then((output: any) => {
      expect(output.Person).to.deep.equal(expectedNested);
    });
  });
});
