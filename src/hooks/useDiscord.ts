import { useCallback, useEffect, useState } from "react";
import { getProfile, type Profile } from "../lib/discord";

// Re-fetch fresh presence every 5 minutes (matches cache TTL).
const REFRESH_MS = 5 * 60 * 1000;

interface State {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

// Owns the profile lifecycle: initial load, periodic refresh, manual retry.
export function useDiscord() {
  const [state, setState] = useState<State>({
    profile: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async (force = false) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const profile = await getProfile(force);
      setState({ profile, loading: false, error: null });
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : "Failed to load profile",
      }));
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  return { ...state, retry: () => load(true) };
}
