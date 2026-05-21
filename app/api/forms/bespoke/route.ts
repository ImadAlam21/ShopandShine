import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { bespokeSchema } from "@/lib/validators";
import { notifyOwner } from "@/lib/email";
import { escapeHtml } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bespokeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { name, email, phone, budget, occasion, details, company } =
    parsed.data;

  if (company) return NextResponse.json({ ok: true }); // honeypot

  const supabase = createPublicClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { error } = await supabase.from("bespoke_inquiries").insert({
    name,
    email,
    phone: phone || null,
    budget: budget || null,
    occasion: occasion || null,
    details,
  });
  if (error) {
    console.error("bespoke insert:", error.message);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }

  await notifyOwner({
    subject: `New bespoke inquiry from ${name}`,
    html: `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}${
      phone ? `, ${escapeHtml(phone)}` : ""
    })</p>
      <p>Budget: ${escapeHtml(budget || "—")}<br/>Occasion: ${escapeHtml(
        occasion || "—",
      )}</p>
      <blockquote>${escapeHtml(details)}</blockquote>`,
  });

  return NextResponse.json({ ok: true });
}
