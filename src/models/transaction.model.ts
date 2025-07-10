import { Knex } from "knex";
import { Transaction } from "../interfaces/transaction.interface";

export class TransactionModel {
  constructor(private db: Knex) {}

  async create(
    data: Partial<Transaction>,
    trx?: Knex.Transaction
  ): Promise<Transaction> {
    const db = trx ? trx : this.db;
    const [id] = await this.db("transactions").insert(data).returning("id");
    const transaction = await this.db<Transaction>("transactions")
      .where({ id })
      .first();
    if (!transaction) {
      throw new Error("New transaction not found");
    }
    return transaction;
  }

  async getTransactionsByWalletId(walletId: number): Promise<Transaction[]> {
    return this.db<Transaction>("transactions").where(function () {
      this.where({ from_wallet_id: walletId }).orWhere({
        to_wallet_id: walletId,
      });
    });
  }
}
