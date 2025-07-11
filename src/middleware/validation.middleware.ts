import { Request, Response, NextFunction } from "express";

export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, first_name, last_name } = req.body;

  if (!email || !first_name || !last_name) {
    return res.status(400).json({
      message: "Missing required fields: email, first_name, last_name",
    });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  next();
};

export const validateFundWallet = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { amount } = req.body;
  amount = Number(amount);
  if (isNaN(amount) || amount <= 0) {
    return res
      .status(400)
      .json({ message: "Amount must be a positive number" });
  }
  req.body.amount = amount;
  next();
};

export const validateTransfer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { amount, to_user_id } = req.body;

  amount = Number(amount);
  if (isNaN(amount) || amount <= 0) {
    return res
      .status(400)
      .json({ message: "Amount must be a positive number" });
  }
  req.body.amount = amount;

  if (!to_user_id) {
    return res.status(400).json({ message: "Target user ID is required" });
  }

  next();
};
