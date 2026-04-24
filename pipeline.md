# Steply — Pipeline

> **Yönetici:** PM_Steply | **Son Güncelleme:** 2026-04-24 (Operasyon 2)

---

## Aktif Görevler

| Görev ID | Departman | Görev Tanımı | Durum | QA Onayı |
|----------|-----------|--------------|-------|----------|
| BE-024 | Backend_Agent | `updateProfileAction`: `country` alanını FormData'dan al ve `profiles` tablosuna yaz | Yapılıyor | — |
| FE-025 | Frontend_Agent | `SettingsClient.tsx`: serbest location input'unu kaldır; `country-state-city` paketi ile bağımlı Country + City dropdown ekle; her ikisini save'e dahil et | Yapılıyor | — |
| FE-026 | Frontend_Agent | `profile/page.tsx`: lokasyon bilgisini "Şehir, Ülke" formatında göster (ör. Bursa, Turkey) | Yapılıyor | — |

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

---

## Pipeline Durumu

```
Toplam Görev    : 35
Tamamlandı      : 35
Yapılıyor       : 0
QA Onaylı       : 35
Deploy Hazır    : EVET
Son Deploy      : 207c299 — 2026-04-24
```
