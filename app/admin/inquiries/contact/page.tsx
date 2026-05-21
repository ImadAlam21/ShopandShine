import { createAdminClient } from "@/lib/supabase/admin";
import { ContactReadToggle } from "@/components/admin/AdminInline";

interface ContactRow {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default async function AdminContactPage() {
  let messages: ContactRow[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("contact_messages")
      .select("id, name, email, message, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    messages = (data as ContactRow[]) ?? [];
  } catch {
    messages = [];
  }

  return (
    <div>
      <h1 className="text-3xl font-serif mb-8">Messages</h1>
      {messages.length === 0 ? (
        <p className="text-ink/40">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-rose-light p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-medium">{m.name}</p>
                  <a
                    href={`mailto:${m.email}`}
                    className="text-sm text-rose hover:underline"
                  >
                    {m.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-ink/40">
                    {new Date(m.created_at).toLocaleDateString("en-IN")}
                  </span>
                  <ContactReadToggle id={m.id} read={m.is_read} />
                </div>
              </div>
              <p className="text-sm text-ink/70 whitespace-pre-wrap">
                {m.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
