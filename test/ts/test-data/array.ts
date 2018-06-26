interface Order {
  id: string;
  name: string;
}

interface User {
  orders: Order[];
}
