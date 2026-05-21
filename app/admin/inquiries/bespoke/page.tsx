import { createAdminClient } from "@/lib/supabase/admin";
import { BespokeStatusSelect } from "@/components/admin/AdminInline";

interface BespokeRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  budget: string | null;
  occasion: string | null;
  details: string;
  status: string;
  created_at: string;
}

export default async function AdminBespokePage() {
  let inquiries: BespokeRow[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("bespoke_inquiries")
      .select(
        "id, name, email, phone, budget, occasion, details, status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    inquiries = (data as BespokeRow[]) ?? [];
  } catch {
    inquiries = [];
  }

  return (
    <div>
      <h1 className="text-3xl font-serif mb-8">Bespoke Inquiries</h1>
      {inquiries.length === 0 ? (
        <p className="text-ink/40">No inquiries yet.</p>
      ) : (
        <div className="space-y-4">
          {inquiries.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-rose-light p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-medium">{b.name}</p>
                  <a
                    href={`mailto:${b.email}`}
                    className="text-sm text-rose hover:underline"
                  >
                    {b.email}
                  </a>
                  {b.phone && (
                    <p className="text-sm text-ink/60">{b.phone}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-ink/40">
                    {new Date(b.created_at).toLocaleDateString("en-IN")}
                  </span>
                  <BespokeStatusSelect id={b.id} status={b.status} />
                </div>
              </div>
              <p className="text-xs text-ink/50 mb-2">
                Budget: {b.budget || "—"} · Occasion: {b.occasion || "—"}
              </p>
              <p className="text-sm text-ink/70 whitespace-pre-wrap">
                {b.details}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
