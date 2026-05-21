"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: `${fd.get("firstName") ?? ""} ${fd.get("lastName") ?? ""}`.trim(),
      email: fd.get("email"),
      message: fd.get("message"),
      company: fd.get("company"), // honeypot
    };
    try {
      const res = await fetch("/api/forms/contact", {
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
      <div className="bg-blush p-12 rounded-[40px] text-center">
        <h3 className="text-2xl font-serif mb-3">Message sent ✦</h3>
        <p className="text-ink/60">
          Thank you for reaching out. We&apos;ll be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-blush p-8 sm:p-12 rounded-[40px] space-y-6">
      {/* Honeypot: hidden from users, catches bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-ink/40">
            First Name
          </label>
          <input name="firstName" required className="field" />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-ink/40">
            Last Name
          </label>
          <input name="lastName" className="field" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest font-bold text-ink/40">
          Email Address
        </label>
        <input type="email" name="email" required className="field" />
      </div>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest font-bold text-ink/40">
          Message
        </label>
        <textarea name="message" rows={4} required className="field" />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="rose-button w-full py-4"
      >
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
      {status === "error" && (
        <p className="text-rose text-sm text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
