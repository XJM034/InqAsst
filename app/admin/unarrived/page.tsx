import { AdminUnarrivedClient } from "@/components/app/admin-unarrived-client";
import { getAdminUnarrivedData } from "@/lib/services/mobile-app";

export default async function AdminUnarrivedPage() {
  const data = await getAdminUnarrivedData();

  return <AdminUnarrivedClient data={data} />;
}
