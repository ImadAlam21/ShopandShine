import { z } from "zod";

const optionalText = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

export const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  company: z.string().optional(), // honeypot
});

export const newsletterSchema = z.object({
  email: z.string().email(),
  source: optionalText(60),
  company: z.string().optional(), // honeypot
});

export const bespokeSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: optionalText(40),
  budget: optionalText(80),
  occasion: optionalText(120),
  details: z.string().min(1).max(5000),
  company: z.string().optional(), // honeypot
});

// Checkout / payment
export const cartLineSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(50),
});

export const createOrderSchema = z.object({
  items: z.array(cartLineSchema).min(1).max(50),
  email: z.string().email(),
  phone: optionalText(40),
  shippingName: z.string().min(1).max(120),
  shippingAddress: z.object({
    line1: z.string().min(1).max(200),
    line2: optionalText(200),
    city: z.string().min(1).max(80),
    state: z.string().min(1).max(80),
    pincode: z.string().min(1).max(20),
    country: z.string().min(1).max(80),
  }),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
