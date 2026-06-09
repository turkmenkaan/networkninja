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
  }

  resetAll() {
    this.mutate(() => ({ units: {} }));
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
