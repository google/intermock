interface User {
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

export const expectedOptional1 = {
  User: {
    username:
        'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.',
    firstName: 'Mabel',
    lastName: 'Williamson'
  }
};


export const expectedOptional2 = {
  User: {
    username:
        'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.',
    firstName: 'Mabel',
    middleName: 'Mabel',
    lastName: 'Williamson'
  }
};
