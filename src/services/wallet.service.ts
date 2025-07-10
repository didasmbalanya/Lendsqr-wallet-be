import { Knex } from "knex";
import { WalletModel, TransactionModel } from "../models";
import { Wallet } from "../interfaces";

export class WalletService {
  constructor(
    private db: Knex,
    private walletModel: WalletModel,
    private transactionModel: TransactionModel
  ) {}

  /**
   * Add funds to a wallet
   */
  async fundWallet(
    userId: number,
    amount: number,
    description: string
  ): Promise<Wallet> {
    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    const wallet = await this.walletModel.findByUserId(userId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const updatedBalance = wallet.balance + amount;

    try {
      await this.db.transaction(async (trx) => {
        await this.walletModel.updateBalance(wallet.id, updatedBalance, trx);

        await this.transactionModel.create(
          {
            type: "credit",
            amount,
            description,
            to_wallet_id: wallet.id,
          },
          trx
        );
      });
      const updatedWallet = await this.walletModel.findByUserId(userId);
      if (!updatedWallet) {
        throw new Error("Wallet not found after update");
      }
      return updatedWallet;
    } catch (error) {
      console.error(
        `Error funding wallet for user ${userId}:`,
        error instanceof Error ? error.message : error
      );
      throw new Error("Failed to fund wallet. Please try again.");
    }
  }
}
