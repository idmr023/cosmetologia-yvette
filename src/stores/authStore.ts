import { create } from "zustand";

interface AuthState {
  role: "admin" | "colaborador" | "cliente" | null;
  setRole: (role: AuthState["role"]) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
  reset: () => set({ role: null }),
}));
