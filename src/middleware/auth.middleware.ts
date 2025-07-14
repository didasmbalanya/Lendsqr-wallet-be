import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userModel: UserModel
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Missing or invalid authorization token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const userId = parseInt(token);

    if (isNaN(userId)) {
      throw new Error("Invalid token format");
    }

    const user = await userModel.findByUserId(userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid Auth" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};
