"use client";

/**
 * ReportIssue — a small "Report an issue" affordance for a unit (lesson/lab)
 * page. Collapsed it is just a faint link in the page footer; clicking it opens
 * a modal with a compact form (category + description + optional email) that
 * POSTs to /api/report-issue. Combines the NotifySignup form pattern with the
 * ZoomableFigure modal mechanics, so unit pages stay statically rendered.
 */
import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import posthog from "posthog-js";
import { CloseIcon } from "@/components/ui";
import { REPORT_CATEGORIES } from "@/lib/reports/categories";
import { getBrowserClient } from "@/lib/supabase/client";

type Status = "idle" | "submitting" | "success" | "error";

export function ReportIssue({
  unitId,
  unitTitle,
  unitType,
}: {
  unitId: string;
  unitTitle: string;
  unitType: "lesson" | "lab";
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [category, setCategory] = useState<string>(REPORT_CATEGORIES[0].value);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState(""); // bot trap; real users never fill it
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => setMounted(true), []);

  // Escape to close + lock body scroll while open (mirrors ZoomableFigure).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Best-effort: prefill the email if the reader is signed in. No-op when auth
  // is not configured or there is no session.
  useEffect(() => {
    if (!open || email) return;
    let active = true;
    (async () => {
      try {
        const supabase = getBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (active && user?.email) setEmail(user.email);
      } catch {
        // auth not configured — leave the field empty
      }
    })();
    return () => {
      active = false;
    };
  }, [open, email]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/report-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          unitTitle,
          unitType,
          category,
          description,
          email,
          website: honeypot,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong — please try again.");
        return;
      }
      setStatus("success");
      posthog.capture("lesson_issue_reported", { unitId, category });
    } catch {
      setStatus("error");
      setMessage("Network error — please try again.");
    }
  }

  function close() {
    setOpen(false);
    // After a successful send, reset so the next open starts clean.
    if (status === "success") {
      setStatus("idle");
      setDescription("");
      setMessage("");
    }
  }

  const invalid = status === "error";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-1.5 font-mono text-xs text-paper-faint transition-colors hover:text-blade"
      >
        <FlagGlyph />
        Report an issue
      </button>

      {open && mounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Report an issue"
              onClick={close}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm sm:p-8"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[88vh] w-full max-w-lg overflow-auto rounded-2xl border border-ink-line bg-ink-inset p-6 shadow-panel sm:p-8"
              >
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-line bg-ink-raised text-paper-muted transition-colors hover:border-blade/50 hover:text-blade"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>

                {status === "success" ? (
                  <div className="py-3">
                    <h2 className="font-display text-xl font-bold text-paper">
                      Thanks for the report
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-paper-muted">
                      We will take a look at this {unitType}. If you left an
                      email, we may follow up.
                    </p>
                    <button
                      type="button"
                      onClick={close}
                      className="mt-5 inline-flex items-center justify-center rounded-xl border border-blade/40 bg-blade/15 px-5 py-2.5 font-medium text-blade transition-all hover:border-blade/70 hover:bg-blade/20"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} noValidate>
                    <h2 className="font-display text-xl font-bold text-paper">
                      Report an issue
                    </h2>
                    <p className="mt-1 pr-8 text-sm text-paper-muted">
                      Spotted a problem with{" "}
                      <span className="text-paper">{unitTitle}</span>? Let us
                      know below.
                    </p>

                    {/* Honeypot: off-screen, hidden from users and assistive
                        tech; bots that autofill it are dropped server-side. */}
                    <div
                      aria-hidden="true"
                      className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden"
                    >
                      <label htmlFor="ri-website">Leave this field empty</label>
                      <input
                        id="ri-website"
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                      />
                    </div>

                    <div className="mt-5 space-y-4">
                      <div>
                        <label
                          htmlFor="ri-category"
                          className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-paper-faint"
                        >
                          Type of issue
                        </label>
                        <select
                          id="ri-category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-xl border border-ink-line bg-ink-inset px-4 py-3 text-sm text-paper focus:border-blade/60 focus:outline-none"
                        >
                          {REPORT_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="ri-description"
                          className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-paper-faint"
                        >
                          Describe the issue
                        </label>
                        <textarea
                          id="ri-description"
                          required
                          rows={4}
                          value={description}
                          onChange={(e) => {
                            setDescription(e.target.value);
                            if (status === "error") setStatus("idle");
                          }}
                          placeholder="Describe the typo, inaccuracy, or what did not work…"
                          aria-invalid={invalid}
                          className="w-full resize-y rounded-xl border border-ink-line bg-ink-inset px-4 py-3 text-sm text-paper placeholder:text-paper-faint focus:border-blade/60 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="ri-email"
                          className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-paper-faint"
                        >
                          Email (optional, for follow-up)
                        </label>
                        <input
                          id="ri-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full rounded-xl border border-ink-line bg-ink-inset px-4 py-3 font-mono text-sm text-paper placeholder:text-paper-faint focus:border-blade/60 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <p
                        aria-live="polite"
                        className={`min-h-[1.25rem] text-xs ${invalid ? "text-sakura" : "text-paper-faint"}`}
                      >
                        {message}
                      </p>
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        aria-busy={status === "submitting"}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-blade/40 bg-blade/15 px-5 py-2.5 font-medium text-blade transition-all hover:border-blade/70 hover:bg-blade/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {status === "submitting" ? "Sending…" : "Send report"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function FlagGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        d="M4 2v12"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M4 2.6h7l-1.6 2.4L11 7.4H4z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
