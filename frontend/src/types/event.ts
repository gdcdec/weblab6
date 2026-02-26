export interface Event {
  id: number;
  title: string;
  description: string | null;
  category: 'education' | 'amusement' | 'work' | 'hobby' | 'other';
  date: string;
  createdBy: number;
  createdAt?: string;
  updatedAt?: string;
}
