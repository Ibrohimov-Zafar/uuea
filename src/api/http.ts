import axios from "axios";

const API_ERROR_MESSAGES: Record<string, string> = {
  invalid_input: "Ma'lumotlar noto'g'ri. Username kamida 3 belgi, parol kamida 8 belgi.",
  already_exists: "Bu foydalanuvchi nomi yoki email allaqachon band",
  invalid_credentials: "Login yoki parol noto'g'ri",
  missing_token: "Sessiya topilmadi. Qayta kiring",
  invalid_token: "Sessiya muddati tugagan. Qayta kiring",
  stripe_not_configured:
    "Stripe sozlanmagan. .env faylida STRIPE_SECRET_KEY=sk_test_... qo'ying va API serverni qayta ishga tushiring.",
  plan_not_found: "A'zolik rejasi topilmadi",
};

export function toApiError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const code =
      typeof err.response?.data === "object" &&
      err.response?.data &&
      "error" in err.response.data
        ? String((err.response.data as { error: string }).error)
        : undefined;
    const message = (code && API_ERROR_MESSAGES[code]) || err.message || "Server xatosi";
    const e = new Error(message);
    if (code) (e as Error & { code?: string }).code = code;
    return e;
  }
  return err instanceof Error ? err : new Error("Tarmoq xatosi");
}

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() || "http://127.0.0.1:8787";

export const http = axios.create({
  baseURL: API_BASE_URL,
});

export function setAuthToken(token: string | null) {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common.Authorization;
  }
}

