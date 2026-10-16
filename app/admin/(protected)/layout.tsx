import { headers } from "next/headers";
import { redirect } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import { getCurrentAdmin } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function getTodayInNigeria() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();

  const admin = await getCurrentAdmin(
    requestHeaders.get("cookie")
  );

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <AdminShell
      admin={{
        fullName: admin.fullName,
        role: admin.role,
      }}
      today={getTodayInNigeria()}
    >
      {children}
    </AdminShell>
  );
}
