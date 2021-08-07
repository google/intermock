import {Bar} from './export';

interface Foo {
  fooProp1: string;
  fooProp2: number;
  fooProp3: Bar;
}

const expectedImportExportSpecifier = {
  Foo: {
    fooProp1:
        'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.',
    fooProp2: 86924,
    fooProp3: {
      barProp1:
          'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.',
      barProp2: 86924,
      barProp3: true,
    },
  },
};

export {expectedImportExportSpecifier};
