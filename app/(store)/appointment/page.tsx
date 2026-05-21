import type { Metadata } from "next";
import { ServicePage } from "@/components/ui/ServicePage";

export const metadata: Metadata = {
  title: "Virtual Appointment",
  description:
    "Book a one-on-one virtual consultation with our jewellery experts from the comfort of your home.",
};

export default function Page() {
  return (
    <ServicePage
      title="Virtual Appointment"
      description="Schedule a one-on-one virtual consultation with our jewellery experts from the comfort of your home. Reach out via the contact page to book a slot."
    />
  );
}
