# Steply — Pipeline

> **Yönetici:** PM_Steply | **Son Güncelleme:** 2026-05-04 (Operasyon 12)

---

## Aktif Görevler

> ⚠️ **Manuel Adım Gerekli (4 migration):**
> 1. `supabase/migrations/20260424_notifications.sql` — bildirim sistemi
> 2. `supabase/migrations/20260424_project_tasks.sql` — görev sistemi
> 3. `supabase/migrations/20260424_project_activities.sql` — aktivite akışı
> 4. `supabase/migrations/20260504_project_tags.sql` — etiket sütunu

| Görev ID | Departman | Görev Tanımı | Durum | QA Onayı |
|----------|-----------|--------------|-------|----------|
| BE-029 | Backend_Agent | `createNotificationAction`: `createClient()` → `createAdminClient()` (RLS bypass) | Tamamlandı | QA: OK |
| BE-030 | Backend_Agent | SQL migration: `project_tasks` tablosu + RLS | Tamamlandı | QA: OK |
| BE-031 | Backend_Agent | addProjectTask, toggleTaskCompletion, deleteProjectTask + otomatik progress hesaplama | Tamamlandı | QA: OK |
| FE-031 | Frontend_Agent | `ProjectTaskList.tsx` client component: görev ekleme, checkbox, silme, optimistic UI | Tamamlandı | QA: OK |
| FE-032 | Frontend_Agent | `project/[id]/page.tsx`: project_tasks fetch + ProjectTaskList entegrasyonu | Tamamlandı | QA: OK |
| FE-033 | Frontend_Agent | `projects/new/page.tsx`: progress slider kaldır, "otomatik hesaplanır" bilgi notu | Tamamlandı | QA: OK |
| BE-034 | Backend_Agent | SQL migration: `project_activities` tablosu + kısıtlı RLS (sadece owner + members) | Tamamlandı | QA: OK |
| BE-035 | Backend_Agent | logProjectActivity helper + getProjectActivitiesAction + task action'larına entegrasyon | Tamamlandı | QA: OK |
| FE-034 | Frontend_Agent | `ActivityTimeline.tsx`: timeline UI component (ikon, isim, zaman gösterimi) | Tamamlandı | QA: OK |
| FE-035 | Frontend_Agent | `project/[id]/page.tsx`: aktivite fetch + ActivityTimeline sağ kolona entegrasyon | Tamamlandı | QA: OK |
| BE-036 | Backend_Agent | SQL migration `20260504_project_tags.sql`: `tags TEXT[]` sütunu `projects` tablosuna eklendi | Tamamlandı | QA: OK |
| BE-037 | Backend_Agent | `updateProjectTagsAction`: sanitize + admin update + revalidatePath | Tamamlandı | QA: OK |
| FE-036 | Frontend_Agent | `ProjectTags.tsx`: renk-hash badge'ler, inline input, X ile silme, optimistic update | Tamamlandı | QA: OK |
| FE-037 | Frontend_Agent | `project/[id]/page.tsx`: ProjectTags başlık altına entegre edildi, `canEdit={isTeamMember}` | Tamamlandı | QA: OK |

---

## Tamamlanan Görevler

| Görev ID | Departman | Görev Tanımı | Tamamlanma Tarihi | QA Onayı |
|----------|-----------|--------------|-------------------|----------|
| BE-001..BE-007 | Backend_Agent | Tüm önceki backend fixler | 2026-04-13 | QA: OK |
| FE-001..FE-003 | Frontend_Agent | Tüm önceki frontend fixler | 2026-04-13 | QA: OK |
| BE-008 | Backend_Agent | Collaborator yetki kontrolü | 2026-04-13 | QA: OK |
| FE-004..FE-012 | Frontend_Agent | Dashboard + Kanban + ProjectCard UI | 2026-04-13 | QA: OK |
| BE-009 | Backend_Agent | Search isWatched alanı | 2026-04-13 | QA: OK |
| FE-013..FE-016 | Frontend_Agent | Search watchlist + ProfileProjectsPanel | 2026-04-13 | QA: OK |
| FE-017 | Frontend_Agent | Password visibility toggle | 2026-04-17 | QA: OK |
| FE-018 | Frontend_Agent | Settings sidebar nav layout | 2026-04-17 | QA: OK |
| FE-019 | Frontend_Agent | Notifications sekmesi | 2026-04-17 | QA: OK |
| FE-020 | Frontend_Agent | Profile sekmesi genişletme | 2026-04-17 | QA: OK |
| FE-021 | Frontend_Agent | Profile read-only refactor + inline Location save | 2026-04-17 | QA: OK |
| BE-022 | Backend_Agent | `updateSocialLinksAction` — github/linkedin/twitter/website DB sync | 2026-04-17 | QA: OK |
| FE-022 | Frontend_Agent | Settings social links: prop geçişi + editable + website alanı + DB kayıt | 2026-04-17 | QA: OK |
| BE-023 | Backend_Agent | `updateProfileAction`: location + company alanları eklendi, id FormData bağımlılığı kaldırıldı, settings revalidate eklendi | 2026-04-24 | QA: OK |
| FE-023 | Frontend_Agent | SettingsClient Profile sekmesi: Avatar seçici + FullName/Bio/Company/Location editable + tek "Save Profile Changes" butonu | 2026-04-24 | QA: OK |
| FE-024 | Frontend_Agent | Profile sayfası read-only vitrine dönüştürüldü; ProfileForm kaldırıldı; "Edit Profile" → /dashboard/settings | 2026-04-24 | QA: OK |
| BE-024 | Backend_Agent | `updateProfileAction`: `country` alanı eklendi, `profiles` tablosuna yazılıyor | 2026-04-24 | QA: OK |
| FE-025 | Frontend_Agent | `SettingsClient.tsx`: country-state-city ile bağımlı Country + City dropdown; serbest text input kaldırıldı | 2026-04-24 | QA: OK |
| FE-026 | Frontend_Agent | `profile/page.tsx`: lokasyon "Şehir, Ülke" formatında gösteriliyor | 2026-04-24 | QA: OK |
| FE-027 | Frontend_Agent | `SettingsClient.tsx`: City → State.getStatesOfCountry ile il/province seviyesine geçildi (TR: 81 il) | 2026-04-24 | QA: OK |
| BE-025 | Backend_Agent | `supabase/migrations/20260424_notifications.sql`: notifications tablosu + RLS | 2026-04-24 | QA: OK |
| BE-026 | Backend_Agent | `lib/actions.ts`: createNotificationAction + getNotificationsAction + markAsRead/All | 2026-04-24 | QA: OK |
| BE-027 | Backend_Agent | sendMessage + addProjectMemberAction'a bildirim hook'ları | 2026-04-24 | QA: OK |
| FE-028 | Frontend_Agent | NotificationBell.tsx: zil + badge + dropdown + tip ikonları + mark-as-read | 2026-04-24 | QA: OK |
| FE-029 | Frontend_Agent | layout.tsx: top bar + NotificationBell server-side entegrasyonu + graceful degrade | 2026-04-24 | QA: OK |
| FE-030 | Frontend_Agent | dashboard/page.tsx: Upcoming Tasks banner (today/tomorrow) öğrenci dashboardında | 2026-04-24 | QA: OK |
| BE-028 | Backend_Agent | supabase/functions/send-reminders/: Resend edge function taslağı + cron talimatları | 2026-04-24 | QA: OK |
| BE-038 | Backend_Agent | migration 20260505_user_activities.sql: user_activities tablosu + increment_user_activity RPC | 2026-05-05 | QA: OK |
| BE-039 | Backend_Agent | migration 20260505_profiles_analytics.sql: university, total_score, badges kolonları | 2026-05-05 | QA: OK |
| BE-040 | Backend_Agent | actions.ts: logUserActivityAction, getUserActivitiesAction, getLeaderboardAction, awardBadgesInternal | 2026-05-05 | QA: OK |
| BE-041 | Backend_Agent | actions.ts: createProject + addProjectTask + toggleTaskCompletion + addProjectNoteAction → logUserActivityAction | 2026-05-05 | QA: OK |
| BE-042 | Backend_Agent | updateProfileAction: university alanı kaydediliyor | 2026-05-05 | QA: OK |
| FE-038 | Frontend_Agent | ActivityHeatmap.tsx: GitHub-style 365 gün heatmap, tooltip, streak sayacı, legend | 2026-05-05 | QA: OK |
| FE-039 | Frontend_Agent | BadgeDisplay.tsx: BADGE_CONFIG, BadgeIcon (tooltip), BadgeDisplay listesi | 2026-05-05 | QA: OK |
| FE-040 | Frontend_Agent | analytics/page.tsx + LeaderboardClient.tsx: 3 sekme (Global/TR/Üni), Top 50, altın/gümüş/bronz sıralama | 2026-05-05 | QA: OK |
| FE-041 | Frontend_Agent | DashboardSidebar: Analytics linki aktif edildi (/dashboard/analytics) | 2026-05-05 | QA: OK |
| FE-042 | Frontend_Agent | profile/page.tsx: ActivityHeatmap + BadgeDisplay + university + total_score gösterimi | 2026-05-05 | QA: OK |
| FE-043 | Frontend_Agent | SettingsClient + settings/page.tsx: university alanı eklendi | 2026-05-05 | QA: OK |
| FE-044 | Frontend_Agent | `activity-chart-card.tsx`: Framer Motion animasyonlu bar chart, 7/14/30 gün range dropdown | 2026-05-04 | QA: OK |
| FE-045 | Frontend_Agent | `profile/page.tsx`: ActivityHeatmap → ActivityChartCard ile değiştirildi | 2026-05-04 | QA: OK |
| FE-046 | Frontend_Agent | `analytics/page.tsx` + `LeaderboardClient.tsx`: ActivityChartCard leaderboard üstüne entegre edildi | 2026-05-04 | QA: OK |
| BE-043 | Backend_Agent | `20260506_weighted_scoring.sql`: `daily_score` sütunu + `record_user_action` RPC (10/5/2 puan ağırlıkları) | 2026-05-04 | QA: OK |
| BE-044 | Backend_Agent | `actions.ts`: `recordUserActionAction(actionType)` helper; `logUserActivityAction` deprecated wrapper'a dönüştürüldü | 2026-05-04 | QA: OK |
| BE-045 | Backend_Agent | `actions.ts` + `dashboard/actions.ts`: create_project→10pt, complete_task→5pt, add_log→2pt bağlantıları | 2026-05-04 | QA: OK |
| FE-047 | Frontend_Agent | `LeaderboardClient.tsx`: "Toplam Puan" başlığı, top-3 altın/sarı skor rengi, 🏆 ikon eklendi | 2026-05-04 | QA: OK |
| FE-048 | Frontend_Agent | `profile/page.tsx`: altın gradient puan rozeti + Toplam Puan stat kartı + ActivityChartCard yan yana | 2026-05-04 | QA: OK |

---

## Pipeline Durumu

```
Toplam Görev    : 82
Tamamlandı      : 82
Yapılıyor       : 0
QA Onaylı       : 82
Deploy Hazır    : EVET (⚠️ SQL migration apply edilmeli: 20260505_user_activities.sql + 20260505_profiles_analytics.sql + 20260504_project_tags.sql + 20260506_weighted_scoring.sql)
Son Deploy      : — (commit pending)
```
