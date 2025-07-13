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

    const currentBalance = parseFloat(wallet.balance.toString());

    const updatedBalance = currentBalance + amount;

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
        (error as Error).message
      );
      throw new Error("Failed to fund wallet. Please try again.");
    }
  }

  /**
   * Transfer funds between two wallets
   */
  async transferFunds(
    fromUserId: number,
    toUserId: number,
    amount: number,
    description?: string
  ): Promise<{ fromWallet: Wallet; toWallet: Wallet }> {
    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    const [fromWallet, toWallet] = await Promise.all([
      this.walletModel.findByUserId(fromUserId),
      this.walletModel.findByUserId(toUserId),
    ]);

    if (!fromWallet || !toWallet) {
      throw new Error("One or both wallets not found");
    }

    if (fromWallet.balance < amount) {
      throw new Error("Insufficient balance");
    }

    const newFromBalance = fromWallet.balance - amount;
    const newToBalance = toWallet.balance + amount;

    await this.db.transaction(async (trx) => {
      await this.walletModel.updateBalance(fromWallet.id, newFromBalance, trx);
      await this.walletModel.updateBalance(toWallet.id, newToBalance, trx);

      await this.transactionModel.create(
        {
          type: "debit",
          amount,
          description,
          from_wallet_id: fromWallet.id,
          to_wallet_id: toWallet.id,
        },
        trx
      );

      await this.transactionModel.create(
        {
          type: "credit",
          amount,
          description,
          from_wallet_id: fromWallet.id,
          to_wallet_id: toWallet.id,
        },
        trx
      );
    });

    const updatedFromWallet = await this.walletModel.findByUserId(fromUserId);
    const updatedToWallet = await this.walletModel.findByUserId(toUserId);

    if (!updatedFromWallet || !updatedToWallet) {
      throw new Error("One or both wallets not found after transfer");
    }

    return {
      fromWallet: updatedFromWallet,
      toWallet: updatedToWallet,
    };
  }

  /**
   * Withdraw funds from a wallet
   */
  async withdrawFunds(
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

    if (wallet.balance < amount) {
      throw new Error("Insufficient balance");
    }

    const updatedBalance = wallet.balance - amount;

    await this.db.transaction(async (trx) => {
      await this.walletModel.updateBalance(wallet.id, updatedBalance, trx);

      await this.transactionModel.create(
        {
          type: "debit",
          amount,
          description,
          from_wallet_id: wallet.id,
        },
        trx
      );
    });

    const updatedWallet = await this.walletModel.findByUserId(userId);
    if (!updatedWallet) {
      throw new Error("Wallet not found after withdrawal");
    }
    return updatedWallet;
  }
}
