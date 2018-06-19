
import 'mocha';

import {expect} from 'chai';
import {Intermock} from '../../src/lang/ts/intermock';
import {flatInterface} from './test-data/flatInterface';
import {nestedInterface} from './test-data/nestedInterface';
import {specifiedMockTypeInterface} from './test-data/specifiedMockTypeInterface';

describe('', () => {
  it('should generate mock for a flat interface, with just primitives', () => {
    const im = new Intermock({
      files: [`${__dirname}/test-data/flatInterface.ts`],
      isFixedMode: true
    });

    return im.generate().then((output: any) => {
      expect(output.FlatInterface).to.deep.equal(flatInterface);
    });
  });

  it('should generate mock for a specified mock type', () => {
    const im = new Intermock({
      files: [`${__dirname}/test-data/specifiedMockTypeInterface.ts`],
      isFixedMode: true
    });

    return im.generate().then((output: any) => {
      expect(output.FlatPerson).to.deep.equal(specifiedMockTypeInterface);
    });
  });

  it('should generate mock for singly nested interfaces', () => {
    const im = new Intermock({
      files: [`${__dirname}/test-data/nestedInterface.ts`],
      isFixedMode: true
    });

    return im.generate().then((output: any) => {
      expect(output.Person).to.deep.equal(nestedInterface);
    });
  });
});
