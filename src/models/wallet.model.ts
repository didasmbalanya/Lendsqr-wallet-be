import { Knex } from "knex";
import { Wallet } from "../interfaces/wallet.interface";

export class WalletModel {
  constructor(private db: Knex) {}

  async findByUserId(userId: number): Promise<Wallet | null> {
    const wallet = await this.db<Wallet>("wallets")
      .where({ user_id: userId })
      .first();
    return wallet ?? null;
  }

  async create(
    walletData: Omit<Wallet, "id">,
    trx?: Knex.Transaction
  ): Promise<Wallet> {
    const db = trx ? trx : this.db;

    const [id] = await db("wallets").insert(walletData).returning("id");
    const wallet = await db<Wallet>("wallets").where({ id }).first();
    if (!wallet) {
      throw new Error("Wallet not found after creation");
    }
    return wallet;
  }

  async updateBalance(
    walletId: number,
    balance: number,
    trx?: Knex.Transaction
  ): Promise<void> {
    const db = trx ? trx : this.db;
    await db("wallets")
      .where({ id: walletId })
      .update({ balance, updated_at: db.fn.now() });
  }
}
