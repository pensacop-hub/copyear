import { Suspense } from "react";
import { cookies } from "next/headers";
import { AdminLogin } from "@/components/admin/admin-login";
import { UnifiedAdminCms } from "@/components/admin/unified-admin-cms";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { getCopPersonnel } from "@/lib/cop-personnel";
import { getCopCalendarEvents } from "@/lib/cop-calendar";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (isValidAdminSession(session)) {
    const [personnel, events] = await Promise.all([
      getCopPersonnel(),
      getCopCalendarEvents(),
    ]);

    return <UnifiedAdminCms personnel={personnel} events={events} />;
  }

  return (
    <Suspense>
      <AdminLogin />
    </Suspense>
  );
}
