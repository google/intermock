interface Order {
  id: string;

  /** !mockType {lorem.words} */
  name: string;
}

interface User {
  orders: Order[];
}

export const expectedArray1 = {
  'Order': {
    'id': 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
    'name': 'consequuntur ab fugiat'
  },
  'User': {
    'orders': [
      {
        'id': 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
        'name': 'consequuntur ab fugiat'
      },
      {
        'id': 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
        'name': 'consequuntur ab fugiat'
      },
      {
        'id': 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
        'name': 'consequuntur ab fugiat'
      }
    ]
  }
};
