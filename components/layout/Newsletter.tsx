"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/forms/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      setStatus(res.ok ? "done" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-24 bg-ink text-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h3 className="text-4xl font-serif mb-6">Join the Inner Circle</h3>
        <p className="text-white/60 mb-10">
          Subscribe for new collections, exclusive events, and bespoke offers.
        </p>
        {status === "done" ? (
          <p className="text-rose-soft text-lg">
            Thank you — you&apos;re on the list. ✦
          </p>
        ) : (
          <form
            onSubmit={submit}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 max-w-md bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-rose-soft transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rose-button whitespace-nowrap"
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="text-rose-soft mt-4 text-sm">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </section>
  );
}
