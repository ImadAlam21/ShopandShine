import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getRazorpay } from "@/lib/razorpay";
import { createOrderSchema } from "@/lib/validators";
import { toPaise } from "@/lib/format";
import { CURRENCY } from "@/lib/constants";

// The Razorpay SDK needs the Node runtime (not Edge).
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }
  const { items, email, phone, shippingName, shippingAddress } = parsed.data;

  let admin, razorpay;
  try {
    admin = createAdminClient();
    razorpay = getRazorpay();
  } catch {
    return NextResponse.json(
      { error: "Payments are not configured yet." },
      { status: 503 },
    );
  }

  // Optional logged-in user — attach order to their profile.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // SECURITY: recompute prices/stock from the DB. Never trust client amounts.
  const ids = items.map((i) => i.productId);
  const { data: products, error: prodErr } = await admin
    .from("products")
    .select("id, name, price, stock, is_active")
    .in("id", ids);

  if (prodErr || !products) {
    return NextResponse.json(
      { error: "Could not load products" },
      { status: 500 },
    );
  }

  const lineItems: {
    product_id: string;
    product_name: string;
    unit_price_paise: number;
    quantity: number;
    line_total_paise: number;
  }[] = [];
  let subtotalPaise = 0;

  for (const item of items) {
    const p = products.find((x) => x.id === item.productId);
    if (!p || !p.is_active) {
      return NextResponse.json(
        { error: "A product in your cart is unavailable." },
        { status: 400 },
      );
    }
    if (p.stock < item.quantity) {
      return NextResponse.json(
        { error: `Only ${p.stock} of "${p.name}" left in stock.` },
        { status: 400 },
      );
    }
    const unit = toPaise(Number(p.price));
    const line = unit * item.quantity;
    subtotalPaise += line;
    lineItems.push({
      product_id: p.id,
      product_name: p.name,
      unit_price_paise: unit,
      quantity: item.quantity,
      line_total_paise: line,
    });
  }

  const shippingPaise = 0; // Free shipping for launch.
  const totalPaise = subtotalPaise + shippingPaise;

  const rzpOrder = await razorpay.orders.create({
    amount: totalPaise,
    currency: CURRENCY,
    receipt: `rcpt_${Date.now()}`,
  });

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      profile_id: user?.id ?? null,
      email,
      phone: phone || null,
      shipping_name: shippingName,
      shipping_address: shippingAddress,
      subtotal_paise: subtotalPaise,
      shipping_paise: shippingPaise,
      total_paise: totalPaise,
      currency: CURRENCY,
      status: "pending",
      razorpay_order_id: rzpOrder.id,
    })
    .select("id, order_number")
    .single();

  if (orderErr || !order) {
    console.error("order insert:", orderErr?.message);
    return NextResponse.json(
      { error: "Could not create order" },
      { status: 500 },
    );
  }

  const { error: itemsErr } = await admin
    .from("order_items")
    .insert(lineItems.map((li) => ({ ...li, order_id: order.id })));
  if (itemsErr) {
    console.error("order_items insert:", itemsErr.message);
  }

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.order_number,
    razorpayOrderId: rzpOrder.id,
    amountPaise: totalPaise,
    currency: CURRENCY,
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    prefill: { name: shippingName, email, contact: phone || "" },
  });
}
