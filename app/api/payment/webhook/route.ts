import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Razorpay webhook — the source of truth for payment status (covers users who
 * close the tab before client-side verify runs). Must read the RAW body and be
 * idempotent. Configure in Razorpay Dashboard → Webhooks with the same secret.
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers.get("x-razorpay-signature");
  const raw = await req.text();

  if (!secret || !signature) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (!safeEqual(expected, signature)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const entity = event.payload?.payment?.entity;
  const rzpOrderId = entity?.order_id;
  const admin = createAdminClient();

  if (event.event === "payment.captured" && rzpOrderId) {
    const { data: order } = await admin
      .from("orders")
      .select("id, status")
      .eq("razorpay_order_id", rzpOrderId)
      .maybeSingle();
    if (order && order.status !== "paid") {
      await admin
        .from("orders")
        .update({ status: "paid", razorpay_payment_id: entity?.id ?? null })
        .eq("id", order.id);
      await admin.rpc("fulfill_order_stock", { p_order_id: order.id });
    }
  } else if (event.event === "payment.failed" && rzpOrderId) {
    await admin
      .from("orders")
      .update({ status: "failed" })
      .eq("razorpay_order_id", rzpOrderId)
      .neq("status", "paid");
  }

  return NextResponse.json({ ok: true });
}
