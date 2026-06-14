/**
 * Progress persistence abstraction.
 *
 * Tier 1 stores progress in the browser's localStorage. The PUBLIC API in this
 * file is deliberately backend-agnostic so that when the Postgres `users` /
 * `progress` schema from docs/PLAN.md lands (Tier 2), only the implementation
 * here changes — no UI/component edits required.
 *
 * Future swap (TODO Tier 2):
 *   - Replace the localStorage read/write with fetch() calls to a
 *     /api/progress route backed by Postgres, keyed on the authenticated user.
 *   - `ProgressState` maps 1:1 to rows: (user_id, unit_id, complete) and
 *     (user_id, unit_id, objective_id, checked).
 *   - The subscribe() contract (snapshot + change notifications) stays the same,
 *     so React components keep using the same `useProgress` hook unchanged.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export interface UnitProgress {
  /** Whether the learner marked the whole unit complete. */
  complete: boolean;
  /** Per-objective checkbox state (lab self-verify), keyed by objective id. */
  objectives: Record<string, boolean>;
}

export interface ProgressState {
  /** Keyed by unit id. */
  units: Record<string, UnitProgress>;
}

const STORAGE_KEY = "networkninja.progress.v1";

const EMPTY: ProgressState = { units: {} };

type Listener = () => void;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function read(): ProgressState {
  if (!isBrowser()) return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as ProgressState;
    if (!parsed || typeof parsed !== "object" || !parsed.units) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

function write(state: ProgressState) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / privacy mode — fail soft */
  }
}

/**
 * A tiny external store implementing the shape expected by
 * React.useSyncExternalStore. Single source of truth for all progress UI.
 */
class ProgressStore {
  private state: ProgressState = EMPTY;
  private listeners = new Set<Listener>();
  private hydrated = false;
  // Auth/sync layer (signed-in users only). localStorage stays the always-on
  // cache, so anonymous behavior is completely unchanged.
  private supabase: SupabaseClient | null = null;
  private userId: string | null = null;
  private syncing = false;

  /** Lazily hydrate from localStorage on first client access. */
  private ensureHydrated() {
    if (this.hydrated || !isBrowser()) return;
    this.state = read();
    this.hydrated = true;
  }

  getSnapshot = (): ProgressState => {
    this.ensureHydrated();
    return this.state;
  };

  /** Stable server snapshot (no progress during SSR). */
  getServerSnapshot = (): ProgressState => EMPTY;

  subscribe = (listener: Listener): (() => void) => {
    this.ensureHydrated();
    this.listeners.add(listener);
    // Sync across tabs.
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        this.state = read();
        this.emit();
      }
    };
    if (isBrowser()) window.addEventListener("storage", onStorage);
    return () => {
      this.listeners.delete(listener);
      if (isBrowser()) window.removeEventListener("storage", onStorage);
    };
  };

  private emit() {
    for (const l of this.listeners) l();
  }

  private mutate(fn: (draft: ProgressState) => ProgressState) {
    this.ensureHydrated();
    this.state = fn(this.state);
    write(this.state);
    this.emit();
  }

  private unit(state: ProgressState, unitId: string): UnitProgress {
    return state.units[unitId] ?? { complete: false, objectives: {} };
  }

  setUnitComplete(unitId: string, complete: boolean) {
    this.mutate((s) => {
      const u = this.unit(s, unitId);
      return {
        units: { ...s.units, [unitId]: { ...u, complete } },
      };
    });
    this.pushUnit(unitId);
  }

  toggleObjective(unitId: string, objectiveId: string, checked: boolean) {
    this.mutate((s) => {
      const u = this.unit(s, unitId);
      return {
        units: {
          ...s.units,
          [unitId]: {
            ...u,
            objectives: { ...u.objectives, [objectiveId]: checked },
          },
        },
      };
    });
    this.pushUnit(unitId);
  }

  resetAll() {
    this.mutate(() => ({ units: {} }));
    this.deleteRemote();
  }

  // ---- Supabase sync (signed-in users only) -------------------------------
  // These are called by SessionBridge, not by UI components, so the public
  // mutation API above stays unchanged.

  setSupabase(client: SupabaseClient | null) {
    this.supabase = client;
  }

  /** Wire the current auth user; a sign-in triggers a one-time merge-sync. */
  setUser(userId: string | null) {
    const changed = this.userId !== userId;
    this.userId = userId;
    if (userId && this.supabase && changed) {
      void this.syncOnSignIn(userId);
    }
  }

  /**
   * On sign-in: fetch the user's remote rows, OR-merge with local (monotonic,
   * "complete wins"), publish the merged state, then push it back so any
   * local-only progress is preserved server-side. Fail-soft: on any error,
   * local stays authoritative.
   */
  private async syncOnSignIn(userId: string) {
    if (!this.supabase || this.syncing) return;
    this.syncing = true;
    try {
      this.ensureHydrated();
      const local = this.state;

      const { data, error } = await this.supabase
        .from("progress")
        .select("unit_id, complete, objectives")
        .eq("user_id", userId);
      if (error) return;

      const remote: ProgressState = { units: {} };
      for (const row of data ?? []) {
        remote.units[row.unit_id as string] = {
          complete: !!row.complete,
          objectives: (row.objectives as Record<string, boolean>) ?? {},
        };
      }

      const merged = mergeProgress(local, remote);
      this.state = merged;
      write(merged);
      this.emit();

      const rows = Object.entries(merged.units).map(([unit_id, u]) => ({
        user_id: userId,
        unit_id,
        complete: u.complete,
        objectives: u.objectives,
        updated_at: new Date().toISOString(),
      }));
      if (rows.length) {
        await this.supabase
          .from("progress")
          .upsert(rows, { onConflict: "user_id,unit_id" });
      }
    } catch {
      /* network/transient — local progress is unaffected */
    } finally {
      this.syncing = false;
    }
  }

  /** Fire-and-forget upsert of one unit's row on mutation while signed in. */
  private pushUnit(unitId: string) {
    if (!this.supabase || !this.userId) return;
    const u = this.unit(this.state, unitId);
    void this.supabase
      .from("progress")
      .upsert(
        {
          user_id: this.userId,
          unit_id: unitId,
          complete: u.complete,
          objectives: u.objectives,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,unit_id" },
      )
      .then(
        () => {},
        () => {},
      );
  }

  /** Remove the signed-in user's remote rows (called by resetAll). */
  private deleteRemote() {
    if (!this.supabase || !this.userId) return;
    void this.supabase
      .from("progress")
      .delete()
      .eq("user_id", this.userId)
      .then(
        () => {},
        () => {},
      );
  }
}

export const progressStore = new ProgressStore();

/** Convenience selectors (pure; operate on a snapshot). */
export function isUnitComplete(state: ProgressState, unitId: string): boolean {
  return state.units[unitId]?.complete ?? false;
}

export function objectiveChecked(
  state: ProgressState,
  unitId: string,
  objectiveId: string,
): boolean {
  return state.units[unitId]?.objectives?.[objectiveId] ?? false;
}

/** How many of the given unit ids are complete. */
export function countComplete(state: ProgressState, unitIds: string[]): number {
  return unitIds.reduce(
    (n, id) => (state.units[id]?.complete ? n + 1 : n),
    0,
  );
}

/**
 * OR-merge two progress states. Monotonic: a unit is complete if it is complete
 * in either, and each objective is OR'd. Used to reconcile local and remote on
 * sign-in so progress only ever moves forward across devices.
 */
function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const units: Record<string, UnitProgress> = {};
  const ids = new Set([...Object.keys(a.units), ...Object.keys(b.units)]);
  for (const id of ids) {
    const ua = a.units[id];
    const ub = b.units[id];
    const objectives: Record<string, boolean> = { ...(ua?.objectives ?? {}) };
    for (const [k, v] of Object.entries(ub?.objectives ?? {})) {
      objectives[k] = Boolean(objectives[k]) || v;
    }
    units[id] = { complete: !!(ua?.complete || ub?.complete), objectives };
  }
  return { units };
}
