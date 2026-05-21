"use client";

import { useState } from "react";

export function BespokeForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      budget: fd.get("budget"),
      occasion: fd.get("occasion"),
      details: fd.get("details"),
      company: fd.get("company"), // honeypot
    };
    try {
      const res = await fetch("/api/forms/bespoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="bg-blush p-12 rounded-[40px] text-center max-w-2xl mx-auto">
        <h3 className="text-2xl font-serif mb-3">Request received ✦</h3>
        <p className="text-ink/60">
          Thank you. Our design team will reach out to begin your bespoke
          journey.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="bg-blush p-8 sm:p-12 rounded-[40px] space-y-6 max-w-2xl mx-auto text-left"
    >
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-ink/40">
            Name
          </label>
          <input name="name" required className="field" />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-ink/40">
            Email
          </label>
          <input type="email" name="email" required className="field" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-ink/40">
            Phone
          </label>
          <input name="phone" className="field" />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-ink/40">
            Budget (optional)
          </label>
          <input name="budget" placeholder="e.g. ₹50,000+" className="field" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest font-bold text-ink/40">
          Occasion
        </label>
        <input
          name="occasion"
          placeholder="Wedding, anniversary, gift…"
          className="field"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest font-bold text-ink/40">
          Tell us about your dream piece
        </label>
        <textarea name="details" rows={4} required className="field" />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="rose-button w-full py-4"
      >
        {status === "loading" ? "Sending…" : "Book a Consultation"}
      </button>
      {status === "error" && (
        <p className="text-rose text-sm text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
