import type { Metadata } from "next";
import { ServicePage } from "@/components/ui/ServicePage";

export const metadata: Metadata = {
  title: "Repair & Care",
  description:
    "Expert repair and maintenance services to keep your jewellery shining for generations.",
};

export default function Page() {
  return (
    <ServicePage
      title="Repair & Care"
      description="Our craftsmen provide expert repair, resizing, polishing and maintenance services to keep your jewellery shining for generations."
    />
  );
}
