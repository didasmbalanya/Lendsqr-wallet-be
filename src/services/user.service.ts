import axios from "axios";

import { UserModel } from "../models";
import { User } from "../interfaces/user.interface";

export class UserService {
  constructor(private userModel: UserModel) {}

  /**
   * Register a new user after checking Adjutor Karma blacklist
   */
  async register(userData: Omit<User, "id">): Promise<User> {
    const existingUser = await this.userModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Check Adjutor Karma Blacklist
    const apiKey = process.env.ADJUTOR_API_KEY;
    if (!apiKey) {
      throw new Error("Adjutor API key not configured");
    }

    try {
      const response = await axios.get(
        `https://adjutor.lendsqr.com/v1/karma/ ${userData.email}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (response.data && response.data.blacklisted) {
        throw new Error("User is blacklisted and cannot be registered");
      }
    } catch (error) {
      console.warn(
        "Error checking Adjutor blacklist:",
        error instanceof Error ? error.message : error
      );
    }

    return this.userModel.create(userData);
  }
}
