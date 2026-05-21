import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaymentSchema } from "@/lib/validators";
import { sendEmail, notifyOwner } from "@/lib/email";
import { formatPaise } from "@/lib/format";
import { STORE_NAME } from "@/lib/constants";

export const runtime = "nodejs";

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    parsed.data;

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Payments not configured" },
      { status: 503 },
    );
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, order_number, status, email, total_paise")
    .eq("razorpay_order_id", razorpay_order_id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // SECURITY: verify the HMAC signature before trusting the payment.
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (!safeEqual(expected, razorpay_signature)) {
    await admin.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 400 },
    );
  }

  // Idempotent: only fulfil once.
  if (order.status !== "paid") {
    await admin
      .from("orders")
      .update({
        status: "paid",
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq("id", order.id);

    await admin.rpc("fulfill_order_stock", { p_order_id: order.id });

    const total = formatPaise(order.total_paise);
    await sendEmail({
      to: order.email,
      subject: `Your ${STORE_NAME} order ${order.order_number} is confirmed`,
      html: `<h2>Thank you for your order!</h2>
        <p>Order <strong>${order.order_number}</strong> has been confirmed.</p>
        <p>Total paid: <strong>${total}</strong></p>
        <p>We'll be in touch with shipping details soon. ✦</p>`,
    });
    await notifyOwner({
      subject: `New paid order ${order.order_number} (${total})`,
      html: `<p>Order <strong>${order.order_number}</strong> was paid.</p>
        <p>Customer: ${order.email}</p><p>Total: ${total}</p>`,
    });
  }

  return NextResponse.json({ ok: true, orderNumber: order.order_number });
}
