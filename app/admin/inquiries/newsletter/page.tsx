import { createAdminClient } from "@/lib/supabase/admin";

interface SubscriberRow {
  email: string;
  source: string | null;
  is_subscribed: boolean;
  created_at: string;
}

export default async function AdminNewsletterPage() {
  let subs: SubscriberRow[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("newsletter_subscribers")
      .select("email, source, is_subscribed, created_at")
      .order("created_at", { ascending: false })
      .limit(1000);
    subs = (data as SubscriberRow[]) ?? [];
  } catch {
    subs = [];
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif">Newsletter</h1>
        <span className="text-sm text-ink/50">{subs.length} subscribers</span>
      </div>

      {subs.length === 0 ? (
        <p className="text-ink/40">No subscribers yet.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-rose-light overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink/40 uppercase tracking-widest text-[10px] border-b border-rose-light">
                <th className="p-4">Email</th>
                <th className="p-4 hidden sm:table-cell">Source</th>
                <th className="p-4 hidden sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr
                  key={s.email}
                  className="border-b border-rose-light/60 last:border-0"
                >
                  <td className="p-4">{s.email}</td>
                  <td className="p-4 hidden sm:table-cell text-ink/60">
                    {s.source ?? "—"}
                  </td>
                  <td className="p-4 hidden sm:table-cell text-ink/60">
                    {new Date(s.created_at).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
