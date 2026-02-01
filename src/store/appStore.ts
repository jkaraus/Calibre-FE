import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppState {
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Theme state
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Global notifications
  notification: string | null;
  setNotification: (message: string | null) => void;

  // Search terms persistence
  booksSearchTerm: string;
  setBooksSearchTerm: (term: string) => void;
  authorsSearchTerm: string;
  setAuthorsSearchTerm: (term: string) => void;

  // Scroll position preservation
  booksScrollPosition: number;
  setBooksScrollPosition: (position: number) => void;
  authorsScrollPosition: number;
  setAuthorsScrollPosition: (position: number) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state
      isLoading: false,
      isDarkMode: false,
      notification: null,
      booksSearchTerm: "",
      authorsSearchTerm: "",
      booksScrollPosition: 0,
      authorsScrollPosition: 0,

      // Actions
      setIsLoading: (loading: boolean) =>
        set(() => ({ isLoading: loading }), false, "setIsLoading"),

      toggleTheme: () =>
        set(
          (state) => ({ isDarkMode: !state.isDarkMode }),
          false,
          "toggleTheme",
        ),

      setNotification: (message: string | null) =>
        set(() => ({ notification: message }), false, "setNotification"),

      setBooksSearchTerm: (term: string) =>
        set(() => ({ booksSearchTerm: term }), false, "setBooksSearchTerm"),

      setAuthorsSearchTerm: (term: string) =>
        set(() => ({ authorsSearchTerm: term }), false, "setAuthorsSearchTerm"),

      setBooksScrollPosition: (position: number) =>
        set(
          () => ({ booksScrollPosition: position }),
          false,
          "setBooksScrollPosition",
        ),

      setAuthorsScrollPosition: (position: number) =>
        set(
          () => ({ authorsScrollPosition: position }),
          false,
          "setAuthorsScrollPosition",
        ),
    }),
    {
      name: "app-store",
    },
  ),
);
