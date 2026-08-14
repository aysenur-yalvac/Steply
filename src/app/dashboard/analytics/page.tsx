import { Suspense } from 'react';
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getLeaderboardAction, getUserActivitiesAction } from "@/lib/actions";
import LeaderboardClient from "./LeaderboardClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Analytics | Steply",
};

async function AnalyticsPageContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("university, country, total_score, badges")
    .eq("id", user.id)
    .single();

  const [global50, turkey50, uni50, activities] = await Promise.all([
    getLeaderboardAction("global"),
    getLeaderboardAction("turkey"),
    profile?.university
      ? getLeaderboardAction("university", profile.university)
      : Promise.resolve([]),
    getUserActivitiesAction(user.id),
  ]);

  const currentUserRank = global50.findIndex(e => e.id === user.id) + 1;

  return (
    <LeaderboardClient
      global50={global50}
      turkey50={turkey50}
      uni50={uni50}
      currentUserId={user.id}
      userUniversity={profile?.university ?? null}
      currentUserRank={currentUserRank}
      currentUserScore={profile?.total_score ?? 0}
      activities={activities}
    />
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="flex-1 p-8 flex items-center justify-center animate-pulse"><div className="w-8 h-8 rounded-full border-4 border-violet-600 border-t-transparent animate-spin"></div></div>}>
      <AnalyticsPageContent  />
    </Suspense>
  );
}
