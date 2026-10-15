"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { fetchCurrentUser } from "@/lib/auth/fetch-current-user";
import type { UserProfile } from "@/types/user";

export interface CurrentUserState {
  user: UserProfile | null;
  /** True until the first check finishes; the user is unknown meanwhile. */
  isLoading: boolean;
  /** Updates every consumer at once, e.g. to null right after logout. */
  setUser: (user: UserProfile | null) => void;
}

/**
 * Exported for tests. Outside a provider, consumers see a signed-out visitor.
 */
export const CurrentUserContext = createContext<CurrentUserState>({
  user: null,
  isLoading: false,
  setUser: () => {},
});

/**
 * Loads the signed-in user in the browser. Public pages are rendered once
 * and shared by every visitor (and crawler) through the CDN, so they can't
 * contain anything user-specific; the header menu and the vehicle actions
 * read the user from here instead.
 */
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchCurrentUser().then((currentUser) => {
      if (cancelled) return;
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CurrentUserContext value={{ user, isLoading, setUser }}>
      {children}
    </CurrentUserContext>
  );
}

export function useCurrentUser(): CurrentUserState {
  return useContext(CurrentUserContext);
}
