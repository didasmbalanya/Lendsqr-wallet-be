import request from "supertest";
import axios from "axios";

import { app } from "../../../app";

jest.mock("axios");
jest.mock("../../../services/user.service", () => {
  return {
    UserService: jest.fn().mockImplementation(() => {
      return {
        register: jest.fn().mockImplementation((userData) => {
          if (!userData.email || !userData.first_name || !userData.last_name) {
            throw new Error("Missing required fields");
          }

          // Simulate successful registration
          return Promise.resolve({
            id: 1,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
          });
        }),
      };
    }),
  };
});

describe("UserController", () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { blacklisted: false },
    });
  });
  test("POST /api/users - should register user successfully", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
      })
      .expect(201);

    expect(response.body.email).toBe("test@example.com");
  });

  test("POST /api/users - missing fields returns 400", async () => {
    const response = await request(app).post("/api/users").send({}).expect(400);

    expect(response.body.message).toContain("Missing required fields");
  });
});
