import { Router, Express } from "express";
import { Knex } from "knex";

import { UserController, WalletController } from "../controllers";
import {
  validateRegistration,
  validateFundWallet,
  validateTransfer,
  authenticate
} from "../middleware";
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
    (req, res, next) => authenticate(req, res, next, userModel),
    validateFundWallet,
   (req, res) => walletController.fundWallet(req, res)
  );
  router.post(
    "/wallets/transfer/:userId",
    (req, res, next) => authenticate(req, res, next, userModel),
    validateTransfer,
    (req, res) => walletController.transferFunds(req, res)
  );
  router.post(
    "/wallets/withdraw/:userId",
    (req, res, next) => authenticate(req, res, next, userModel),
    validateFundWallet,
    (req, res) => walletController.withdrawFunds(req, res)
  );

  app.use("/api", router);
}
