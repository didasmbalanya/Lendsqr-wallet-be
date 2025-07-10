import { Knex } from "knex";
import { UserModel } from "./user.model";
import { WalletModel } from "./wallet.model";
import { TransactionModel } from "./transaction.model";

export class ModelFactory {
  constructor(private db: Knex) {}

  getUserModel(): UserModel {
    return new UserModel(this.db);
  }

  getWalletModel(): WalletModel {
    return new WalletModel(this.db);
  }

  getTransactionModel(): TransactionModel {
    return new TransactionModel(this.db);
  }
}
