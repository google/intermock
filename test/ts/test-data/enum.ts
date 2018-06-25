enum Awesomeness {
  COOL,
  LAME
}

enum GreatNumbers {
  e = 2.71,
  pi = 3.14,
  golden = 1.61
}

interface Person {
  name: string;
  status: Awesomeness;
  favoriteNumber: GreatNumbers;
}

export const expectedEnum = {
  Person: {
    name:
        'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.',
    status: 1,
    favoriteNumber: 3.14
  }
};
