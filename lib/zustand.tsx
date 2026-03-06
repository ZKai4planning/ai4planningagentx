import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  userId?: string;
  user_id?: string;
  sub?: string;
  email?: string;
  userEmail?: string;
  preferred_username?: string;
  exp?: number;
  iat?: number;
}

interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;

  setToken: (token: string) => void;
  clearAuth: () => void;
}

const readStoredAuth = () => {
  if (typeof window === "undefined") return null;

  const raw =
    window.sessionStorage.getItem("currentAuth") ||
    window.localStorage.getItem("currentAuth");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as {
      token?: string | null;
      userId?: string | null;
      email?: string | null;
    };
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => {
  const stored = readStoredAuth();

  return {
    token: stored?.token ?? null,
    userId: stored?.userId ?? null,
    email: stored?.email ?? null,

  /* =========================
     SET TOKEN (IN-MEMORY ONLY)
  ========================= */
    setToken: (token: string) => {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const userId = decoded.userId ?? decoded.user_id ?? decoded.sub ?? null;
        const email =
          decoded.email ?? decoded.userEmail ?? decoded.preferred_username ?? null;

        set({
          token,
          userId,
          email,
        });

        if (typeof window !== "undefined") {
          const payload = JSON.stringify({ token, userId, email });
          window.localStorage.setItem("currentAuth", payload);
        }
      } catch (error) {
        console.error("Invalid JWT token");
        set({ token: null, userId: null, email: null });
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("currentAuth");
          window.sessionStorage.removeItem("currentAuth");
        }
      }
    },

  /* =========================
     LOGOUT / CLEAR
  ========================= */
    clearAuth: () => {
      set({ token: null, userId: null, email: null });
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("currentAuth");
        window.sessionStorage.removeItem("currentAuth");
      }
    },
  };
});
