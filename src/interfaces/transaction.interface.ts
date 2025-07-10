export type TransactionType = "debit" | "credit";

export interface Transaction {
  id?: number;
  type: TransactionType;
  amount: number;
  description: string;
  reference?: string;
  from_wallet_id?: number;
  to_wallet_id?: number;
  created_at?: Date;
  updated_at?: Date;
}
