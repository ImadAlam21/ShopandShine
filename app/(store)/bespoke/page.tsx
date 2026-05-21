import type { Metadata } from "next";
import { BespokeForm } from "@/components/forms/BespokeForm";

export const metadata: Metadata = {
  title: "Bespoke Design",
  description:
    "Create a piece as unique as your story. Our craftsmen bring your vision to life.",
};

export default function BespokePage() {
  return (
    <div className="pt-32 pb-28 max-w-7xl mx-auto px-6 text-center">
      <div className="max-w-3xl mx-auto mb-14">
        <span className="uppercase tracking-[0.3em] text-xs font-bold text-rose mb-4 block">
          Custom Creations
        </span>
        <h1 className="text-5xl sm:text-6xl font-serif mb-8">
          Bespoke Design Service
        </h1>
        <p className="text-ink/70 text-lg leading-relaxed">
          Create a piece as unique as your story. Our master craftsmen work
          closely with you to bring your vision to life, using only the finest
          ethically sourced materials.
        </p>
      </div>
      <BespokeForm />
    </div>
  );
}
