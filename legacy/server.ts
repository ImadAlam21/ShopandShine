import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import cors from "cors";
import helmet from "helmet";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Middleware
  if (process.env.NODE_ENV === "production") {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "script-src": ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
          "frame-src": ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
          "img-src": ["'self'", "data:", "https://picsum.photos", "https://*.supabase.co"],
          "connect-src": ["'self'", "https://*.supabase.co", "https://api.razorpay.com", "wss://*.firebaseio.com", "https://*.googleapis.com"],
        },
      },
    }));
  }
  app.use(cors());
  app.use(express.json());

  // Supabase Client
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Supabase credentials missing in server environment. Check your environment variables.");
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Razorpay Instance
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret) {
    console.warn("⚠️ Razorpay credentials missing in server environment. Payments will fail.");
  }

  const razorpay = new Razorpay({
    key_id: razorpayKeyId || "rzp_test_placeholder",
    key_secret: razorpayKeySecret || "placeholder_secret",
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running securely" });
  });

  // Create Razorpay Order
  const orderSchema = z.object({
    amount: z.number().positive(),
    currency: z.string().default("INR"),
  });

  app.post("/api/payment/order", async (req, res) => {
    try {
      const { amount, currency } = orderSchema.parse(req.body);
      
      const options = {
        amount: amount * 100, // amount in the smallest currency unit
        currency,
        receipt: `receipt_${Date.now()}`,
      };

      const response = await razorpay.orders.create(options);
      res.json(response);
    } catch (error: any) {
      console.error("Razorpay Order Error:", error);
      res.status(500).json({ error: error.message || "Failed to create payment order" });
    }
  });

  // Fetch Products from Supabase
  app.get("/api/products", async (req, res) => {
    try {
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase URL or Key is missing");
      }

      const { data, error } = await supabase
        .from("products")
        .select("*");
      
      if (error) {
        console.error("Supabase Query Error:", JSON.stringify(error, null, 2));
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("Supabase table 'products' is empty or missing. Returning mock data.");
        throw new Error("Empty table");
      }

      console.log(`Successfully fetched ${data.length} products from Supabase.`);
      res.json(data);
    } catch (error: any) {
      console.error("Supabase API Error:", error.message || error);
      // Fallback to mock data if Supabase is not configured or table missing
      res.json([
        { id: 1, name: "Diamond Solitaire Ring", price: 45000, image: "https://picsum.photos/seed/ring/400/400", category: "Rings" },
        { id: 2, name: "Gold Chain Necklace", price: 28000, image: "https://picsum.photos/seed/necklace/400/400", category: "Necklaces" },
        { id: 3, name: "Pearl Earrings", price: 15000, image: "https://picsum.photos/seed/earrings/400/400", category: "Earrings" },
      ]);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
