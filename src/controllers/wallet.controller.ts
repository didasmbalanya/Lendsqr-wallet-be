import { Request, Response } from "express";
import { WalletService } from "../services";

export class WalletController {
  constructor(private walletService: WalletService) {}

  async fundWallet(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { amount, description } = req.body;

      const wallet = await this.walletService.fundWallet(
        parseInt(userId),
        amount,
        description
      );

      res.json(wallet);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async transferFunds(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { amount, description, to_user_id } = req.body;

      const { fromWallet, toWallet } = await this.walletService.transferFunds(
        parseInt(userId),
        to_user_id,
        amount,
        description
      );

      res.json({ fromWallet, toWallet });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async withdrawFunds(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { amount, description } = req.body;

      const wallet = await this.walletService.withdrawFunds(
        parseInt(userId),
        amount,
        description
      );

      res.json(wallet);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
}
