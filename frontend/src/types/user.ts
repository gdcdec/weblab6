export interface User {
  id: number;
  firstName: string;
  lastName: string;
  patronymic: string;
  gender: 'male' | 'female';
  dateOfBirth: string; // ISO date string (YYYY-MM-DD)
  email: string;
  createdAt: string;
}
