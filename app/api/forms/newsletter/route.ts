import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { newsletterSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const { email, source, company } = parsed.data;

  if (company) return NextResponse.json({ ok: true }); // honeypot

  const supabase = createPublicClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      { email, source: source || null, is_subscribed: true },
      { onConflict: "email" },
    );
  if (error) {
    console.error("newsletter upsert:", error.message);
    return NextResponse.json({ error: "Could not subscribe" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
