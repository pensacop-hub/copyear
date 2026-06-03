import { Suspense } from "react";
import { cookies } from "next/headers";
import { AdminLogin } from "@/components/admin/admin-login";
import { UnifiedAdminCms } from "@/components/admin/unified-admin-cms";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { getCopAreaHeads, getCopPersonnel } from "@/lib/cop-personnel";
import { getCopCalendarEvents } from "@/lib/cop-calendar";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (isValidAdminSession(session)) {
    const [personnel, areaHeads, events] = await Promise.all([
      getCopPersonnel(),
      getCopAreaHeads(),
      getCopCalendarEvents(),
    ]);

    return <UnifiedAdminCms personnel={personnel} areaHeads={areaHeads} events={events} />;
  }

  return (
    <Suspense>
      <AdminLogin />
    </Suspense>
  );
}
