import { Knex } from "knex";
import { User } from "../interfaces";

export class UserModel {
  constructor(private db: Knex) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db<User>("users").where({ email }).first();
    return user || null;
  }

  async create(
    userData: Omit<User, "id">,
    trx?: Knex.Transaction
  ): Promise<User> {
    const db = trx ? trx : this.db;
    const [id] = await db("users").insert(userData).returning("id");
    const user = await db<User>("users").where({ id }).first();

    if (!user) {
      throw new Error("User not found after creation");
    }
    return user;
  }

  async findByUserId(id: number): Promise<User | null> {
    const user = await this.db<User>("users").where({ id }).first();
    return user || null;
  }
}
