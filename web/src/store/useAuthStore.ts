import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  userEmail: string | null;
  isAuthenticated: boolean;
  setUserEmail: (email: string) => void;
  clearUserEmail: () => void;
  isWindowOpen: boolean;
  openWindow: () => void;
  closeWindow: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userEmail: null,
      isAuthenticated: false,
      isWindowOpen: false,
      setUserEmail: (email) =>
        set({ userEmail: email.trim().toLowerCase(), isAuthenticated: true }),
      clearUserEmail: () => set({ userEmail: null, isAuthenticated: false }),
      openWindow: () => set({ isWindowOpen: true }),
      closeWindow: () => set({ isWindowOpen: false }),
    }),
    {
      name: "auth",
    },
  ),
);
