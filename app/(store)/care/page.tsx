import type { Metadata } from "next";
import { ServicePage } from "@/components/ui/ServicePage";

export const metadata: Metadata = {
  title: "Care Guide",
  description:
    "Learn how to care for your precious metals and gemstones to maintain their brilliance.",
};

export default function Page() {
  return (
    <ServicePage
      title="Care Guide"
      description="Learn how to properly care for your precious metals and gemstones to maintain their brilliance for years to come."
    />
  );
}
