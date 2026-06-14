"use client";

/**
 * NotifySignup — email capture for "notify me of new lessons/labs".
 * A small client island that POSTs to /api/subscribe and reflects status.
 * Layout-neutral (pass `className` for sizing) so it can sit in a hero
 * section, a card, or the footer.
 */
import { useState, type FormEvent } from "react";
import posthog from "posthog-js";
import { ArrowIcon } from "@/components/ui";

type Status = "idle" | "submitting" | "success" | "exists" | "error";

export function NotifySignup({
  source = "site",
  className = "",
}: {
  source?: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState(""); // bot trap; real users never fill it
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const done = status === "success" || status === "exists";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, website: honeypot }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        alreadySubscribed?: boolean;
      };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong — please try again.");
        return;
      }
      if (data.alreadySubscribed) {
        setStatus("exists");
        setMessage("You're already on the list — talk soon.");
      } else {
        setStatus("success");
        setMessage("You're in. We'll ping you when new labs drop.");
        posthog.capture("newsletter_subscribed", { source });
      }
    } catch {
      setStatus("error");
      setMessage("Network error — please try again.");
    }
  }

  if (done) {
    return (
      <div
        role="status"
        className={`flex items-center gap-3 rounded-xl border border-blade/40 bg-blade/10 px-4 py-3.5 ${className}`}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blade/20 font-mono text-sm text-blade">
          ✓
        </span>
        <p className="text-sm text-paper">{message}</p>
      </div>
    );
  }

  const invalid = status === "error";

  return (
    <form onSubmit={onSubmit} className={className} noValidate>
      {/* Honeypot: off-screen, hidden from users and assistive tech; bots that
          autofill it get silently dropped server-side. */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="nn-website">Leave this field empty</label>
        <input
          id="nn-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="notify-email" className="sr-only">
          Email address
        </label>
        <input
          id="notify-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="you@example.com"
          aria-invalid={invalid}
          aria-describedby="notify-status"
          className="min-w-0 flex-1 rounded-xl border border-ink-line bg-ink-inset px-4 py-3 font-mono text-sm text-paper placeholder:text-paper-faint focus:border-blade/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          aria-busy={status === "submitting"}
          className="group inline-flex items-center justify-center gap-2 rounded-xl border border-blade/40 bg-blade/15 px-5 py-3 font-medium text-blade transition-all hover:border-blade/70 hover:bg-blade/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Notify me"}
          <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      <p
        id="notify-status"
        aria-live="polite"
        className={`mt-2 min-h-[1.25rem] text-xs ${invalid ? "text-sakura" : "text-paper-faint"}`}
      >
        {message || "No spam. Just new lessons and labs."}
      </p>
    </form>
  );
}
