import { getCachedUser, getCachedProfile } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";
import { getBlockedUsersAction } from "@/lib/actions";
import { normalizeNotificationPreferences } from "@/lib/notifications";

export default async function SettingsPage() {
  const user = await getCachedUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const [profile, blockedUsers] = await Promise.all([
    getCachedProfile(),
    getBlockedUsersAction(),
  ]);

  const initialNotificationPreferences = normalizeNotificationPreferences(
    (profile as any)?.notification_preferences
  );

  return (
    <SettingsClient
      userId={user.id}
      email={user.email ?? ""}
      initialFullName={profile?.full_name || user.user_metadata?.full_name || ""}
      initialBio={profile?.bio || ""}
      initialCompany={profile?.company || ""}
      initialCountry={profile?.country || ""}
      initialLocation={profile?.location || ""}
      initialAvatarUrl={profile?.avatar_url || ""}
      initialIsPublic={profile?.is_public ?? true}
      initialGithubUrl={profile?.github_url || ""}
      initialLinkedinUrl={profile?.linkedin_url || ""}
      initialTwitterUrl={profile?.twitter_url || ""}
      initialWebsiteUrl={profile?.website_url || ""}
      initialUniversity={
        profile?.institution ||
        (profile as any)?.university ||
        user.user_metadata?.institution ||
        user.user_metadata?.university ||
        ""
      }
      initialDepartment={
        (profile as any)?.department ||
        user.user_metadata?.department ||
        ""
      }
      initialRole={(profile?.role as string) || "student"}
      initialGrade={(profile as any)?.grade || ""}
      initialSchoolNumber={(profile as any)?.school_number || ""}
      initialSchoolEmail={(profile as any)?.school_email || ""}
      initialPhoneNumber={profile?.phone_number || ""}
      initialBlockedUsers={blockedUsers}
      initialNotificationPreferences={initialNotificationPreferences}
    />
  );
}
