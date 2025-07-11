import { Router, Express } from "express";
import { Knex } from "knex";

import { UserController, WalletController } from "../controllers";
import {
  validateRegistration,
  validateFundWallet,
  validateTransfer,
} from "../middleware/validation.middleware";
import { ModelFactory } from "../models";
import { UserService, WalletService } from "../services";

// Import services or factories as needed
export function setupRoutes(
  app: Express,
  modelFactory: ModelFactory,
  db: Knex
) {
  const userModel = modelFactory.getUserModel();
  const walletModel = modelFactory.getWalletModel();
  const transactionModel = modelFactory.getTransactionModel();

  const userService = new UserService(userModel);
  const walletService = new WalletService(db, walletModel, transactionModel);

  const userController = new UserController(userService);
  const walletController = new WalletController(walletService);

  const router = Router();

  // User routes
  router.post(
    "/users",
    validateRegistration,
    (req, res) => userController.register(req, res)
  );

  // Wallet routes
  router.post(
    "/wallets/fund/:userId",
    validateFundWallet,
   (req, res) => walletController.fundWallet(req, res)
  );
  router.post(
    "/wallets/transfer/:userId",
    validateTransfer,
    (req, res) => walletController.transferFunds(req, res)
  );
  router.post(
    "/wallets/withdraw/:userId",
    validateFundWallet,
    (req, res) => walletController.withdrawFunds(req, res)
  );

  app.use("/api", router);
}
