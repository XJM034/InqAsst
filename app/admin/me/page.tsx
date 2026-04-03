import { ProfilePage } from "@/components/app/profile-page";
import { getAdminProfile } from "@/lib/services/mobile-app";

export default async function AdminMePage() {
  const profile = await getAdminProfile();

  return (
    <ProfilePage
      name={profile.name}
      phone={profile.phone}
      roleLabel={profile.roleLabel}
      tabItems={[
        { key: "home", href: "/admin/home" },
        { key: "attendance", href: "/admin/control" },
        { key: "profile", href: "/admin/me" },
      ]}
    />
  );
}
