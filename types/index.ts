export interface User {
  id: number;
  full_name: string;
  email: string;
  apartment_number: string;
  created_at: string;
}

export interface Item {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  status: "available" | "borrowed";
  created_at: string;
  owner_first_name: string;
  owner_apartment: string;
}

export interface LendingTransaction {
  id: number;
  item_id: number;
  borrower_id: number;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  notes: string | null;
  status: "active" | "returned" | "cancelled";
}

export interface ActiveBorrow {
  transaction_id: number;
  item_id: number;
  item_name: string;
  item_description: string | null;
  image_url: string | null;
  owner_first_name: string;
  owner_apartment: string;
  borrowed_at: string;
  due_date: string;
  notes: string | null;
  days_left: number;
}

export interface SessionUser {
  id: number;
  full_name: string;
  email: string;
  apartment_number: string;
  avatar_url?: string | null;
}
