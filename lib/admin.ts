import "server-only";
import { redirect } from "next/navigation";
import { getProfile, type Profile } from "@/lib/auth";

/**
 * Enforces admin access. Use at the top of every admin Server Action and the
 * admin layout — never rely on middleware alone for authorization.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/");
  }
  return profile;
}
