import { User } from '../interfaces/user.interface';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: Partial<User>;
    }
  }
}