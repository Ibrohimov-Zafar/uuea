import { http } from "./http";
import type { Profile } from "@/types/types";

export type ApiUser = {
  id: string;
  username: string;
  email: string | null;
  role: "user" | "admin" | "super_admin" | "business_owner";
};

export async function apiLogin(identifier: string, password: string) {
  const res = await http.post("/auth/login", { identifier, password });
  return res.data as { token: string; user: ApiUser; profile: Profile };
}

export async function apiSignup(input: { username: string; password: string; fullName?: string; email?: string }) {
  const res = await http.post("/auth/signup", input);
  return res.data as { token: string; user: ApiUser; profile: Profile };
}

export async function apiMe() {
  const res = await http.get("/me");
  return res.data as { user: ApiUser; profile: Profile };
}

