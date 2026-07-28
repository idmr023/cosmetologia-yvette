import { create } from "zustand";

interface AuthState {
  role: "admin" | "colaborador" | "cliente" | null;
  accessToken: string | null;
  refreshToken: string | null;
  setRole: (role: AuthState["role"]) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  accessToken: null,
  refreshToken: null,
  setRole: (role) => set({ role }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setRefreshToken: (refreshToken) => set({ refreshToken }),
  reset: () => set({ role: null, accessToken: null, refreshToken: null }),
}));
