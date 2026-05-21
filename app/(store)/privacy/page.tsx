import type { Metadata } from "next";
import { ServicePage } from "@/components/ui/ServicePage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How we protect your personal information and ensure a secure shopping experience.",
};

export default function Page() {
  return (
    <ServicePage
      title="Privacy Policy"
      description="We are committed to protecting your personal information and ensuring a secure shopping experience. We never sell your data."
    />
  );
}
