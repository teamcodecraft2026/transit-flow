import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const TOKEN_KEY = "pt.session";

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  /** Opens the auth modal. `onSuccess` runs once verification succeeds. */
  requireAuth: (onSuccess?: () => void) => void;
  openAuth: (mode?: "login" | "signup") => void;
  closeAuth: () => void;
  completeAuth: (token: string) => void;
  logout: () => void;
  modalOpen: boolean;
  modalMode: "login" | "signup";
  setModalMode: (m: "login" | "signup") => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "signup">("login");
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => {
    setToken(window.localStorage.getItem(TOKEN_KEY));
  }, []);

  const openAuth = useCallback((mode: "login" | "signup" = "login") => {
    setModalMode(mode);
    setModalOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setModalOpen(false);
    pending.current = null;
  }, []);

  const requireAuth = useCallback(
    (onSuccess?: () => void) => {
      if (token) {
        onSuccess?.();
        return;
      }
      pending.current = onSuccess ?? null;
      openAuth("login");
    },
    [token, openAuth],
  );

  const completeAuth = useCallback((next: string) => {
    window.localStorage.setItem(TOKEN_KEY, next);
    setToken(next);
    setModalOpen(false);
    const run = pending.current;
    pending.current = null;
    run?.();
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    // TODO: wire to POST /auth/logout
  }, []);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      requireAuth,
      openAuth,
      closeAuth,
      completeAuth,
      logout,
      modalOpen,
      modalMode,
      setModalMode,
    }),
    [token, requireAuth, openAuth, closeAuth, completeAuth, logout, modalOpen, modalMode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
