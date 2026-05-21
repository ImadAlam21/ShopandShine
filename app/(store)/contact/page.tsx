import type { Metadata } from "next";
import { Instagram, Mail } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Have a question about our collections or interested in a bespoke piece? Our team is here to help.",
};

export default function ContactPage() {
  return (
    <div className="pt-32 pb-28 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <div>
          <h1 className="text-5xl sm:text-6xl font-serif mb-8">Contact Us</h1>
          <p className="text-ink/70 text-lg leading-relaxed mb-12">
            Have a question about our collections or interested in a bespoke
            piece? Our team is here to assist you.
          </p>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-rose-light rounded-full flex items-center justify-center text-rose shrink-0">
                <Instagram className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold uppercase text-xs tracking-widest mb-1">
                  Instagram
                </h4>
                <p className="text-ink/60">@shopandshine_jewellery</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-rose-light rounded-full flex items-center justify-center text-rose shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold uppercase text-xs tracking-widest mb-1">
                  Email
                </h4>
                <p className="text-ink/60">hello@shopandshine.com</p>
              </div>
            </div>
          </div>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
