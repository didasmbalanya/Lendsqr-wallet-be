import axios from "axios";
import { Knex } from "knex";
import { UserModel } from "../../../models/user.model";
import { WalletModel } from "../../../models/wallet.model";
import { UserService } from "../../../services";

jest.mock("axios");

// Mock Knex Query Builder
class MockQueryBuilder {
  where() {
    return this;
  }

  first() {
    return Promise.resolve(null); // Simulate no user found
  }

  insert() {
    return this;
  }

  returning() {
    return Promise.resolve([{ id: 1 }]);
  }
}

// Mock Knex instance with transaction support
const mockKnexInstance = {
  from: () => new MockQueryBuilder(),
  select: () => new MockQueryBuilder(),
  table: () => new MockQueryBuilder(),
  schema: {
    hasTable: jest.fn().mockResolvedValue(true),
  },
  transaction: jest.fn((callback) => {
    return callback(mockKnexInstance);
  }),
} as unknown as Knex;

describe("UserService", () => {
  let db: Knex;
  let userModel: jest.Mocked<
    Pick<UserModel, "findByEmail" | "create" | "findByUserId">
  >;
  let walletModel: jest.Mocked<Pick<WalletModel, "create" | "findByUserId">>;
  let adjutorApiKey: string;
  let userService: UserService;

  beforeEach(() => {
    // Mock Knex instance
    db = mockKnexInstance;

    // Mock UserModel
    userModel = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findByUserId: jest.fn(),
    };

    // Mock WalletModel
    walletModel = {
      create: jest.fn(),
      findByUserId: jest.fn(),
    };

    // Mock Adjutor API key
    adjutorApiKey = "mock-adjutor-api-key";

    // Create UserService instance with all dependencies
    userService = new UserService(
      db,
      userModel as any,
      walletModel as any,
      adjutorApiKey
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should throw error if email is blacklisted", async () => {
    const mockBlacklistedResponse = { data: { blacklisted: true } };
    (axios.get as jest.Mock).mockResolvedValue(mockBlacklistedResponse);

    await expect(
      userService.register({
        email: "blacklisted@example.com",
        first_name: "Test",
        last_name: "User",
      })
    ).rejects.toThrow("User is blacklisted and cannot be registered");
  });

  test("should register user if not blacklisted", async () => {
    const mockNotBlacklistedResponse = { data: { blacklisted: false } };
    (axios.get as jest.Mock).mockResolvedValue(mockNotBlacklistedResponse);

    userModel.findByEmail.mockResolvedValue(null);
    userModel.create.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      first_name: "Test",
      last_name: "User",
    });

    const user = await userService.register({
      email: "user@example.com",
      first_name: "Test",
      last_name: "User",
    });

    expect(user.email).toBe("user@example.com");
  });

  test("should throw error if user already exists", async () => {
    userModel.findByEmail.mockResolvedValue({
      id: 1,
      email: "existing@example.com",
      first_name: "Existing",
      last_name: "User",
    });

    await expect(
      userService.register({
        email: "existing@example.com",
        first_name: "Existing",
        last_name: "User",
      })
    ).rejects.toThrow("User with this email already exists");
  });
});
