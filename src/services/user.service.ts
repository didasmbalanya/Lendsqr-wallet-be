import { UserModel } from "../models";
import { User } from "../interfaces/user.interface";
import { AdjutorService } from "./adjutor.service";

export class UserService {
  private adjutorService: AdjutorService;

  constructor(private userModel: UserModel, adjutorApiKey: string) {
    this.adjutorService = new AdjutorService(adjutorApiKey);
  }

  async register(userData: Omit<User, "id">): Promise<User> {
    const existingUser = await this.userModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const isBlacklisted = await this.adjutorService.isBlacklisted(
      userData.email
    );
    if (isBlacklisted) {
      throw new Error("User is blacklisted and cannot be registered");
    }

    return this.userModel.create(userData);
  }
}
