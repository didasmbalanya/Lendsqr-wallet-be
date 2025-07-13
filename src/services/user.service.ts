import { Knex } from "knex";

import { UserModel, WalletModel } from "../models";
import { User } from "../interfaces/user.interface";
import { AdjutorService } from "./";

export class UserService {
  private adjutorService: AdjutorService;

  constructor(
    private db: Knex,
    private userModel: UserModel,
    private walletModel: WalletModel,
    adjutorApiKey: string
  ) {
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

    let createdUser: User | undefined = undefined;

    // Wrap both user and wallet creation in a transaction
    try {
      await this.db.transaction(async (trx) => {
        createdUser = await this.userModel.create(userData, trx);

        await this.walletModel.create(
          {
            user_id: createdUser.id,
            balance: 0,
          },
          trx
        );
      });
    } catch (error) {
      throw new Error(`Failed to register user: ${(error as Error).message}`);
    }

    if (!createdUser) {
      throw new Error("User could not be created");
    }

    return createdUser;
  }
}
