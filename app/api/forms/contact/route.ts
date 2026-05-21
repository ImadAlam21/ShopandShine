import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { contactSchema } from "@/lib/validators";
import { notifyOwner } from "@/lib/email";
import { escapeHtml } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { name, email, message, company } = parsed.data;

  // Honeypot: a filled hidden field means a bot. Pretend success, do nothing.
  if (company) return NextResponse.json({ ok: true });

  const supabase = createPublicClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, message });
  if (error) {
    console.error("contact insert:", error.message);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }

  await notifyOwner({
    subject: `New contact message from ${name}`,
    html: `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(
      email,
    )}) wrote:</p><blockquote>${escapeHtml(message)}</blockquote>`,
  });

  return NextResponse.json({ ok: true });
}
