"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Mail,
  Gem,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/inquiries/contact", label: "Messages", icon: Mail },
  { href: "/admin/inquiries/bespoke", label: "Bespoke", icon: Gem },
  { href: "/admin/inquiries/newsletter", label: "Newsletter", icon: Send },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex lg:flex-col gap-1 px-3 overflow-x-auto lg:overflow-visible">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-rose text-white"
                : "text-ink/60 hover:bg-rose-light hover:text-rose",
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
