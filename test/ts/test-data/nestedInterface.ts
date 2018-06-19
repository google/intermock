interface Person {
  firstName: string;

  lastName: string;

  phone: number;

  nickname: string;

  employeeDetail: EmployeeDetail;
}

interface EmployeeDetail {
  /** !mockType {internet.email} */
  email: string;

  isFullTime: boolean;
}

export const nestedInterface = {
  firstName: 'Mabel',
  lastName: 'Williamson',
  phone: 86924,
  nickname:
      'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.',
  employeeDetail: {email: 'Myron_Olson39@hotmail.com', isFullTime: true}
};
