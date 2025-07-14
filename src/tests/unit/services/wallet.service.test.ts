import { Knex } from "knex";
import { WalletService } from "../../../services";

// Mock Knex Query Builder
class MockQueryBuilder {
  where() {
    return this;
  }

  first() {
    return Promise.resolve(null);
  }

  increment(amount: string) {
    return this;
  }

  decrement(amount: string) {
    return this;
  }

  insert(data: any) {
    return this;
  }

  returning() {
    return Promise.resolve([{ id: 1 }]);
  }
}

// Mock Knex instance
const db = {
  from: () => new MockQueryBuilder(),
  select: () => new MockQueryBuilder(),
  table: () => new MockQueryBuilder(),
  schema: {
    hasTable: jest.fn().mockResolvedValue(true),
  },
  transaction: (cb: any) => cb(db),
} as unknown as Knex;

describe("WalletService", () => {
  let walletModel: any;
  let transactionModel: any;
  let walletService: WalletService;

  beforeEach(() => {
    // Mock wallet model
    walletModel = {
      findByUserId: jest.fn(),
      updateBalance: jest.fn(),
    };

    // Mock transaction model
    transactionModel = {
      create: jest.fn(),
    };

    // Create WalletService with mocks
    walletService = new WalletService(db, walletModel, transactionModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("fundWallet", () => {
    test("should fund wallet successfully", async () => {
      const userId = 1;
      const amount = 500;
      const description = "Initial deposit";

      // Simulate original wallet state
      const mockWallet = { id: 1, user_id: 1, balance: 0 };

      walletModel.findByUserId.mockResolvedValue(mockWallet);

      // Mock updateBalance to modify the mockWallet
      walletModel.updateBalance.mockImplementationOnce(
        (walletId: number, newBalance: number) => {
          mockWallet.balance = newBalance;
        }
      );

      const result = await walletService.fundWallet(
        userId,
        amount,
        description
      );

      expect(walletModel.findByUserId).toHaveBeenCalledWith(userId);
      expect(walletModel.updateBalance).toHaveBeenCalledWith(
        1,
        500,
        expect.any(Object)
      );
      expect(transactionModel.create).toHaveBeenCalled();

      expect(result.balance).toBe(500);
    });

    test("should throw error if amount is invalid", async () => {
      await expect(
        walletService.fundWallet(1, -100, "Negative deposit")
      ).rejects.toThrow("Amount must be greater than zero");
    });

    test("should throw error if user has no wallet", async () => {
      walletModel.findByUserId.mockResolvedValue(null);

      await expect(
        walletService.fundWallet(1, 500, "Initial deposit")
      ).rejects.toThrow("Wallet not found");
    });
  });

  describe("transferFunds", () => {
    test("should transfer funds successfully", async () => {
      const fromUserId = 1;
      const toUserId = 2;
      const amount = 200;
      const description = "Send to user 2";

      // Simulate initial wallet balances
      const mockFromWallet = { id: 1, user_id: 1, balance: 500 };
      const mockToWallet = { id: 2, user_id: 2, balance: 300 };

      // Mock findByUserId to return updated values after updateBalance()
      walletModel.findByUserId.mockImplementation((userId: number) => {
        if (userId === fromUserId) return { ...mockFromWallet };
        if (userId === toUserId) return { ...mockToWallet };
        return null;
      });

      // Mock updateBalance to mutate the local wallet objects
      walletModel.updateBalance = jest
        .fn()
        .mockImplementation((walletId, newBalance) => {
          if (walletId === 1) mockFromWallet.balance = newBalance;
          if (walletId === 2) mockToWallet.balance = newBalance;
        });

      // Mock transactionModel.create
      transactionModel.create = jest.fn();

      // Run the transfer
      const result = await walletService.transferFunds(
        fromUserId,
        toUserId,
        amount,
        description
      );

      // Assert balances have been updated correctly
      expect(mockFromWallet.balance).toBe(300);
      expect(mockToWallet.balance).toBe(500);

      // Assert returned values are correct
      expect(result.fromWallet.balance).toBe(300);
      expect(result.toWallet.balance).toBe(500);

      // Assert model calls
      expect(walletModel.updateBalance).toHaveBeenCalledWith(
        1,
        300,
        expect.any(Object)
      );
      expect(walletModel.updateBalance).toHaveBeenCalledWith(
        2,
        500,
        expect.any(Object)
      );
      expect(transactionModel.create).toHaveBeenCalledTimes(2);
    });

    test("should throw error if sender has insufficient balance", async () => {
      walletModel.findByUserId
        .mockImplementationOnce(() => ({ id: 1, balance: 100 }))
        .mockImplementationOnce(() => ({ id: 2, balance: 200 }));

      await expect(
        walletService.transferFunds(1, 2, 200, "Transfer to User 2")
      ).rejects.toThrow("Insufficient balance");
    });

    test("should rollback transaction if transfer fails", async () => {
      const fromUserId = 1;
      const toUserId = 2;
      const amount = 200;
      const description = "Send to user 2";

      walletModel.findByUserId
        .mockImplementationOnce(() => ({ id: 1, balance: 500 }))
        .mockImplementationOnce(() => ({ id: 2, balance: 200 }));

      // Force a failure in the middle of the transaction
      walletModel.updateBalance = jest.fn().mockImplementationOnce(() => {
        throw new Error("DB error");
      });

      await expect(
        walletService.transferFunds(fromUserId, toUserId, amount, description)
      ).rejects.toThrow("DB error");

      // Ensure balance not updated
      expect(walletModel.updateBalance).toHaveBeenCalledTimes(1);
    });
  });

  describe("withdrawFunds", () => {
    test("should withdraw funds successfully", async () => {
      const userId = 1;
      const amount = 200;
      const description = "Cash withdrawal";

      // Simulate wallet state
      const mockWallet = { id: 1, user_id: 1, balance: 500 };

      // Mock findByUserId to return the current balance
      walletModel.findByUserId.mockResolvedValue(mockWallet);

      // Mock updateBalance to mutate the wallet object
      walletModel.updateBalance = jest
        .fn()
        .mockImplementation((walletId, newBalance) => {
          mockWallet.balance = newBalance;
        });

      // Run the test
      const result = await walletService.withdrawFunds(
        userId,
        amount,
        description
      );

      // Assert balance was updated
      expect(mockWallet.balance).toBe(300);
      expect(result.balance).toBe(300);

      // Assert model calls
      expect(walletModel.updateBalance).toHaveBeenCalledWith(
        1,
        300,
        expect.any(Object)
      );
      expect(transactionModel.create).toHaveBeenCalled();
    });

    test("should throw error if withdrawal amount exceeds balance", async () => {
      walletModel.findByUserId.mockResolvedValue({ id: 1, balance: 100 });

      await expect(
        walletService.withdrawFunds(1, 200, "Over-withdrawal")
      ).rejects.toThrow("Insufficient balance");
    });

    test("should throw error if user has no wallet", async () => {
      walletModel.findByUserId.mockResolvedValue(null);

      await expect(
        walletService.withdrawFunds(1, 100, "Cash withdrawal")
      ).rejects.toThrow("Wallet not found");
    });
  });
});
