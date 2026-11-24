import { Suspense } from 'react';
import { getCachedUser, getCachedProfile } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import { getLeaderboardAction, getUserActivitiesAction } from "@/lib/actions";
import LeaderboardClient from "./LeaderboardClient";
import AnalyticsLoading from "./loading";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Analitik | Must-b Academy",
};

async function AnalyticsPageContent() {
  const [user, profile] = await Promise.all([
    getCachedUser(),
    getCachedProfile(),
  ]);
  if (!user) redirect("/auth/login");

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
    <Suspense fallback={<AnalyticsLoading />}>
      <AnalyticsPageContent />
    </Suspense>
  );
}

