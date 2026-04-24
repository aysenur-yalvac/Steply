# Steply — Pipeline

> **Yönetici:** PM_Steply | **Son Güncelleme:** 2026-04-24 (Operasyon 2)

---

## Aktif Görevler

> ⚠️ **Manuel Adım Gerekli:** `supabase/migrations/20260424_notifications.sql` içeriğini Supabase SQL Editor'da çalıştır.

| Görev ID | Departman | Görev Tanımı | Durum | QA Onayı |
|----------|-----------|--------------|-------|----------|
| BE-029 | Backend_Agent | `createNotificationAction`: `createClient()` → `createAdminClient()` (RLS bypass); try/catch + console.error logging; `addProjectMemberAction`'da owner adı ile zengin bildirim | Yapılıyor | — |

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

---

## Pipeline Durumu

```
Toplam Görev    : 47
Tamamlandı      : 47
Yapılıyor       : 0
QA Onaylı       : 47
Deploy Hazır    : EVET (⚠️ SQL migration apply edilmeli)
Son Deploy      : cb0c005 — 2026-04-24
```
