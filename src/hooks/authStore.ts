// src/store/authStore.ts
import { create } from "zustand";

interface User {
  _id: string;
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
  password: string;
  employeeId: string;
  type: string;
  mecCoordinator: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface AuthStore {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => set({ token, user }),
  setUser: (user) => set((state) => ({ ...state, user })),
  clearAuth: () => set({ token: null, user: null }),
}));
