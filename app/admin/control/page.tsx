import { AdminControlClient } from "@/components/app/admin-control-client";
import { getAdminControlData } from "@/lib/services/mobile-app";

export default async function AdminControlPage() {
  const data = await getAdminControlData();

  return <AdminControlClient data={data} />;
}
