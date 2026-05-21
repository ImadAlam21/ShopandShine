import type { Metadata } from "next";
import { ServicePage } from "@/components/ui/ServicePage";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description:
    "Secure, insured shipping across India and a hassle-free 30-day return policy.",
};

export default function Page() {
  return (
    <ServicePage
      title="Shipping & Returns"
      description="We offer secure, insured shipping across India and a hassle-free 30-day return policy on all our pieces."
    />
  );
}
