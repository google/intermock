interface Person {
  name: string;
  detail: Detail;
}

type Detail = {
  phone: number;
};

export const expectedTypeAlias = {
  Person: {
    name:
        'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.',
    detail: {phone: 86924}
  },
  Detail: {phone: 86924}
};
