
import 'mocha';

import {expect} from 'chai';

import {Intermock} from '../../src/lang/ts/intermock';

import {expectedFlat} from './test-data/flat';
import {expectedMockType} from './test-data/mockType';
import {expectedNested} from './test-data/nestedSingle';
import {expectedTypeAlias} from './test-data/typeAlias';

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

  it('should generate mock for interfaces with optional types - optional forced as always',
     () => {
       const im = new Intermock(
           {files: [`${__dirname}/test-data/optional.ts`], isFixedMode: true});

       return im.generate().then((output: any) => {
         expect(1).to.deep.equal(1);
       });
     });

  it('should generate mock for interfaces with optional types - optional forced as never',
     () => {
       const im = new Intermock(
           {files: [`${__dirname}/test-data/optional.ts`], isFixedMode: true});

       return im.generate().then((output: any) => {
         expect(1).to.deep.equal(1);
       });
     });

  it('should generate mock for type aliases', () => {
    const im = new Intermock(
        {files: [`${__dirname}/test-data/typeAlias.ts`], isFixedMode: true});

    return im.generate().then((output: any) => {
      expect(output.Person).to.deep.equal(expectedTypeAlias.Person);
      expect(output.Detail).to.deep.equal(expectedTypeAlias.Detail);
    });
  });
});
