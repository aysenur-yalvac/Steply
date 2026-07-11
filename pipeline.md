# Steply — Pipeline

> **Yönetici:** PM_Steply | **Son Güncelleme:** 2026-07-11 (Operasyon 18 — Hotfix: middleware timeout)

---

## Aktif Görevler

| Görev ID | Departman | Görev Tanımı | Durum | QA Onayı |
|----------|-----------|--------------|-------|----------|
| BE-060 | Backend_Agent | `middleware.ts`: matcher'a `api/`, font/css/js/map uzantıları eklendi | Tamamlandı | QA: OK |
| BE-061 | Backend_Agent | `utils/supabase/middleware.ts`: `getUser()` 4.5s timeout + try/catch; sonsuz döngü koruması; PUBLIC_PATHS sabitleri | Tamamlandı | QA: OK |

> ⚠️ **Manuel Adım Gerekli (4 migration):**
> 1. `supabase/migrations/20260424_notifications.sql` — bildirim sistemi
> 2. `supabase/migrations/20260424_project_tasks.sql` — görev sistemi
> 3. `supabase/migrations/20260424_project_activities.sql` — aktivite akışı
> 4. `supabase/migrations/20260504_project_tags.sql` — etiket sütunu

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
| BE-046 | Backend_Agent | `20260507_add_complete_project_action.sql`: record_user_action RPC'ye complete_project→20pt eklendi | 2026-05-04 | QA: OK |
| BE-047 | Backend_Agent | `actions.ts`: ActionType + fallback POINTS tablosuna complete_project eklendi | 2026-05-04 | QA: OK |
| BE-048 | Backend_Agent | `actions.ts`: toggleTaskCompletion → progress=100'de complete_project tetikleyici + revalidatePath | 2026-05-04 | QA: OK |
| BE-049 | Backend_Agent | `actions.ts`: addProjectNoteAction → revalidatePath profile+analytics eklendi | 2026-05-04 | QA: OK |
| BE-050 | Backend_Agent | `dashboard/actions.ts`: createProject + updateProgress(100) → revalidatePath profile+analytics eklendi | 2026-05-04 | QA: OK |
| BE-051 | Backend_Agent | `actions.ts`: ActivityDay tipine daily_score eklendi; getUserActivitiesAction daily_score çekiyor | 2026-05-04 | QA: OK |
| BE-052 | Backend_Agent | `actions.ts`: recordUserActionAction RPC hatasında console.error ile Puanlama Hatası logu | 2026-05-04 | QA: OK |
| FE-049 | Frontend_Agent | `activity-chart-card.tsx`: buildChartData + totalPrev daily_score kullanıyor; tooltip/footer "puan" olarak güncellendi | 2026-05-04 | QA: OK |
| FE-050 | Frontend_Agent | `layout.tsx`: total_score çekilip top bar'a 🏆 altın gradient puan rozeti eklendi | 2026-05-04 | QA: OK |
| FE-051 | Frontend_Agent | `activity-chart-card.tsx`: 4 aralık (7/30/365/Tümü), sıfır-doldurma, büyük aralıklarda overflow-x-auto scroll | 2026-05-04 | QA: OK |
| BE-053 | Backend_Agent | `actions.ts`: getUserActivitiesAction 365-gün limiti kaldırıldı; tüm geçmişi döndürüyor | 2026-05-04 | QA: OK |
| BE-054 | Backend_Agent | `actions.ts` + `dashboard/actions.ts`: puan kazandıran tüm action'lara revalidatePath('/', 'layout') eklendi | 2026-05-04 | QA: OK |
| BE-055 | Backend_Agent | `20260508_linked_accounts.sql`: linked_accounts tablosu + RLS; getLinkedAccountsAction / addLinkedAccountAction / removeLinkedAccountAction | 2026-05-04 | QA: OK |
| FE-052 | Frontend_Agent | `DashboardSidebar.tsx`: ChevronsUpDown hesap değiştirici; dropdown (aktif hesap + bağlı hesaplar + Yeni Hesap Ekle formu); switch AlertDialog; layout.tsx'e linkedAccounts prop | 2026-05-04 | QA: OK |
| BE-056 | Backend_Agent | `/api/auth/switch-account/route.ts`: POST endpoint; owner doğrulama + linked_accounts kontrolü + admin.auth.admin.generateLink ile magic link döner | 2026-05-04 | QA: OK |
| FE-053 | Frontend_Agent | `DashboardSidebar.tsx`: confirmSwitch → /api/auth/switch-account POST + window.location.href ile magic link yönlendirmesi; isSwitching loading state; "Geçiş yapılıyor..." butonu | 2026-05-04 | QA: OK |
| BE-029..FE-037 | Backend+Frontend | Görev sistemi, aktivite akışı, etiket sistemi (bkz. Operasyon 16 arşivi) | 2026-05-06 | QA: OK |
| BE-057 | Backend_Agent | `actions.ts`: institution fallback `''`→`null`; university best-effort ayrı update | 2026-07-11 | QA: OK |
| BE-058 | Backend_Agent | `school/page.tsx`: peers sorgusu sonrası console.log debug | 2026-07-11 | QA: OK |
| BE-059 | Backend_Agent | `actions.ts`: updateProfileAction'a `role` + `grade` alanları eklendi | 2026-07-11 | QA: OK |
| FE-055 | Frontend_Agent | `settings/page.tsx`: `initialRole` + `initialGrade` prop'ları eklendi | 2026-07-11 | QA: OK |
| FE-056 | Frontend_Agent | `SettingsClient.tsx`: Rol dropdown (Öğrenci/Öğretmen) + Sınıf dropdown (zorunlu, öğrenciye özel) | 2026-07-11 | QA: OK |
| FE-057 | Frontend_Agent | `SchoolStudentPanel.tsx`: client-side sınıf filtresi + GRADE_ORDER gruplama | 2026-07-11 | QA: OK |
| FE-058 | Frontend_Agent | `school/page.tsx`: grade query'e eklendi; öğretmenler üstte; öğrenciler SchoolStudentPanel'e geçirildi | 2026-07-11 | QA: OK |

---

## Pipeline Durumu

```
Toplam Görev    : 106
Tamamlandı      : 106
Yapılıyor       : 0
QA Onaylı       : 106
Deploy Hazır    : EVET ✅
Son Deploy      : 2026-07-11 — commit 9dfbea3 — Deploy_Chef tarafından arşivlendi
⚠️ Manuel SQL migration'lar hâlâ uygulanmalı (Supabase Dashboard):
  - 20260424_notifications.sql
  - 20260424_project_tasks.sql
  - 20260424_project_activities.sql
  - 20260504_project_tags.sql
  - 20260505_user_activities.sql
  - 20260505_profiles_analytics.sql
  - 20260506_weighted_scoring.sql
  - 20260507_add_complete_project_action.sql
  - 20260508_linked_accounts.sql
```
