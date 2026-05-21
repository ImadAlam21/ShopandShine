import { ShieldCheck, Truck, RotateCcw } from "lucide-react";

export function ServicePage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="pt-32 pb-28 max-w-4xl mx-auto px-6 text-center">
      <h1 className="text-5xl sm:text-6xl font-serif mb-8">{title}</h1>
      <p className="text-ink/70 text-lg sm:text-xl leading-relaxed mb-14">
        {description}
      </p>

      {children}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
        <Feature
          icon={<ShieldCheck className="w-9 h-9 text-rose mx-auto mb-5" />}
          title="Guaranteed"
          text="Quality you can trust"
        />
        <Feature
          icon={<Truck className="w-9 h-9 text-rose mx-auto mb-5" />}
          title="Secure"
          text="Insured nationwide shipping"
        />
        <Feature
          icon={<RotateCcw className="w-9 h-9 text-rose mx-auto mb-5" />}
          title="Flexible"
          text="Easy 30-day returns"
        />
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="p-8 bg-blush rounded-[32px]">
      {icon}
      <h4 className="font-bold uppercase text-xs tracking-widest mb-2">{title}</h4>
      <p className="text-ink/50 text-sm">{text}</p>
    </div>
  );
}
