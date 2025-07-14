import { Request, Response } from "express";
import { UserService } from "../services";

export class UserController {
  constructor(private userService: UserService) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, first_name, last_name, phone } = req.body;
      const user = await this.userService.register({
        email,
        first_name,
        last_name,
        phone,
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
}
