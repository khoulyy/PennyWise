import { Timestamp } from 'firebase/firestore';


export interface Expense {
  amount: number;
  category: string;
  date: Date | string | Timestamp;
  description: string;
  uId: string;
}
