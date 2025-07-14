import request from "supertest";
import express from "express";

import { WalletController } from "../../../controllers/wallet.controller";

const app = express();
app.use(express.json());

describe("WalletController", () => {
  let walletService: any;
  let walletController: WalletController;

  beforeEach(() => {
    // Create a mock walletService
    walletService = {
      fundWallet: jest.fn(),
      transferFunds: jest.fn(),
      withdrawFunds: jest.fn(),
    };

    walletController = new WalletController(walletService);

    // Define routes manually in test
    app.post("/api/wallets/fund/:userId", (req, res) =>
      walletController.fundWallet(req, res)
    );

    app.post("/api/wallets/transfer/:userId", (req, res) =>
      walletController.transferFunds(req, res)
    );

    app.post("/api/wallets/withdraw/:userId", (req, res) =>
      walletController.withdrawFunds(req, res)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("fundWallet", () => {
    test("should return 200 when wallet is funded", async () => {
      const mockFund = jest.fn().mockResolvedValue({
        id: 1,
        user_id: 1,
        balance: 500,
      });
      walletService.fundWallet = mockFund;

      const response = await request(app)
        .post("/api/wallets/fund/1")
        .set("Authorization", "Bearer 1")
        .send({ amount: 500, description: "Initial deposit" })
        .expect(200);

      expect(response.body.balance).toBe(500);
      expect(mockFund).toHaveBeenCalledWith(1, 500, "Initial deposit");
    });

    test("should return 400 if amount is invalid", async () => {
      const mockFund = jest
        .fn()
        .mockRejectedValue(new Error("Amount must be greater than zero"));
      walletService.fundWallet = mockFund;

      const response = await request(app)
        .post("/api/wallets/fund/1")
        .set("Authorization", "Bearer 1")
        .send({ amount: -100, description: "Negative deposit" })
        .expect(400);

      expect(response.body.message).toContain("must be greater than zero");
    });
  });

  describe("transferFunds", () => {
    test("should return 200 and updated wallets", async () => {
      const mockTransfer = jest.fn().mockResolvedValue({
        fromWallet: { id: 1, balance: 300 },
        toWallet: { id: 2, balance: 700 },
      });
      walletService.transferFunds = mockTransfer;

      const response = await request(app)
        .post("/api/wallets/transfer/1")
        .set("Authorization", "Bearer 1")
        .send({
          amount: 200,
          description: "Send to User 2",
          to_user_id: 2,
        })
        .expect(200);

      expect(response.body.fromWallet.balance).toBe(300);
      expect(response.body.toWallet.balance).toBe(700);
      expect(mockTransfer).toHaveBeenCalledWith(1, 2, 200, "Send to User 2");
    });

    test("should return 400 if insufficient balance", async () => {
      const mockTransfer = jest
        .fn()
        .mockRejectedValue(new Error("Insufficient balance"));
      walletService.transferFunds = mockTransfer;

      const response = await request(app)
        .post("/api/wallets/transfer/1")
        .set("Authorization", "Bearer 1")
        .send({
          amount: 600,
          description: "Too much",
          to_user_id: 2,
        })
        .expect(400);

      expect(response.body.message).toContain("Insufficient balance");
    });
  });

  describe("withdrawFunds", () => {
    test("should return 200 after successful withdrawal", async () => {
      const mockWithdraw = jest.fn().mockResolvedValue({
        id: 1,
        balance: 300,
      });
      walletService.withdrawFunds = mockWithdraw;

      const response = await request(app)
        .post("/api/wallets/withdraw/1")
        .set("Authorization", "Bearer 1")
        .send({ amount: 200, description: "Cash out" })
        .expect(200);

      expect(response.body.balance).toBe(300);
      expect(mockWithdraw).toHaveBeenCalledWith(1, 200, "Cash out");
    });

    test("should return 400 if amount exceeds balance", async () => {
      const mockWithdraw = jest
        .fn()
        .mockRejectedValue(new Error("Insufficient balance"));
      walletService.withdrawFunds = mockWithdraw;

      const response = await request(app)
        .post("/api/wallets/withdraw/1")
        .set("Authorization", "Bearer 1")
        .send({ amount: 600, description: "Over-withdrawal" })
        .expect(400);

      expect(response.body.message).toContain("Insufficient balance");
    });
  });
});
