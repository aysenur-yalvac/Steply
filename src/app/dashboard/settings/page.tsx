import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  async function updateProfile(formData: FormData) {
    "use server";

    const fullName = formData.get("fullName") as string;
    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user?.id);

    if (error) {
      console.error(error);
      return;
    }

    await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    revalidatePath("/dashboard/settings", "page");
    revalidatePath("/", "layout");
  }

  return (
    <SettingsClient
      email={user.email ?? ""}
      fullName={profile?.full_name || user.user_metadata?.full_name || ""}
      initialIsPublic={profile?.is_public ?? true}
      updateProfile={updateProfile}
      initialGithubUrl={profile?.github_url || ""}
      initialLinkedinUrl={profile?.linkedin_url || ""}
      initialTwitterUrl={profile?.twitter_url || ""}
      initialWebsiteUrl={profile?.website_url || ""}
    />
  );
}
