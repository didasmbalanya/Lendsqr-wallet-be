export interface User {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at?: Date;
  updated_at?: Date;
}
