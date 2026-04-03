import { ProfilePage } from "@/components/app/profile-page";
import { getTeacherProfile } from "@/lib/services/mobile-app";

export default async function TeacherMePage() {
  const profile = await getTeacherProfile();
  const maskedPhone = profile.phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");

  return (
    <ProfilePage
      name={profile.name}
      phone={maskedPhone}
      roleLabel={profile.roleLabel}
      tabItems={[
        { key: "home", href: "/teacher/home" },
        { key: "attendance", href: "/teacher/attendance/demo" },
        { key: "profile", href: "/teacher/me" },
      ]}
    />
  );
}
