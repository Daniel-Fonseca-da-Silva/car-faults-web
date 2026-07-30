import { ProfileAccountInfoCard } from "@/components/profile/profile-account-info-card";
import { ProfileIdentityCard } from "@/components/profile/profile-identity-card";
import type { UserProfile } from "@/types/user";

interface ProfileSidebarProps {
  user: UserProfile;
  locale: string;
}

export function ProfileSidebar({ user, locale }: ProfileSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      <ProfileIdentityCard user={user} locale={locale} />
      <ProfileAccountInfoCard user={user} locale={locale} />
    </div>
  );
}
