import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { User, Settings as SettingsIcon, Save } from "lucide-react";
import { revalidatePath } from "next/cache";

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

    // Also update auth metadata for immediate UI consistency
    await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    revalidatePath("/dashboard/settings", "page");
    revalidatePath("/", "layout");
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
          <SettingsIcon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">You can manage your profile information here.</p>
        </div>
      </div>

      <div className="grid gap-8">
        <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Profile Information</h2>
          </div>

          <form action={updateProfile} className="space-y-6 max-w-md">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400">Email address cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={profile?.full_name || user.user_metadata?.full_name || ""}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                placeholder="Your Name and Surname"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Account Security</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Currently, password reset is handled manually via email.
          </p>
          <button 
            disabled
            className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold rounded-xl cursor-not-allowed"
          >
            Change Password (Soon)
          </button>
        </section>
      </div>
    </div>
  );
}
