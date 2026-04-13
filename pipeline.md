# Steply — Pipeline

> **Yönetici:** PM_Steply | **Son Güncelleme:** 2026-04-13

---

## Aktif Görevler

| Görev ID | Departman | Görev Tanımı | Durum | QA Onayı |
|----------|-----------|--------------|-------|----------|
| BE-003 | Backend_Agent | `page.tsx` team members sorgusunu broken FK join'den iki adımlı fetch'e çevir | Tamamlandı | QA: OK |
| BE-004 | Backend_Agent | Migration: `project_members.user_id` FK → `public.profiles(id)` düzeltmesi | Tamamlandı | QA: OK |

---

## Tamamlanan Görevler

| Görev ID | Departman | Görev Tanımı | Tamamlanma Tarihi | QA Onayı |
|----------|-----------|--------------|-------------------|----------|
| BE-001 | Backend_Agent | `user_id` → `student_id` düzeltmesi (`social-actions.ts:132`) | 2026-04-13 | QA: OK |
| BE-002 | Backend_Agent | Root `middleware.ts` oluşturuldu, `updateSession` bağlandı | 2026-04-13 | QA: OK |
| BE-003 | Backend_Agent | `page.tsx` iki adımlı fetch ile broken FK join kaldırıldı | 2026-04-13 | QA: OK |
| BE-004 | Backend_Agent | Migration `20260413_project_members_fk_fix.sql` yazıldı | 2026-04-13 | QA: OK |

---

## Deployment Geçmişi

| Tarih | Commit Hash | Açıklama | Deploy_Chef Notu |
|-------|-------------|----------|-----------------|
| 2026-04-13 | 7788e36 | fix(auth+backend): middleware aktif edildi, student_id düzeltmesi | Push OK |
| 2026-04-13 | (beklemede) | fix(team-members): broken FK join düzeltildi + migration | Deploy_Chef tetiklendi |

---

## Pipeline Durumu

```
Toplam Görev    : 4
Tamamlandı      : 4
Beklemede       : 0
Yapılıyor       : 0
QA Onaylı       : 4
Deploy Hazır    : EVET ✓
```

---

## Görev Durumu Açıklamaları

- **Beklemede** — Göreve henüz başlanmadı.
- **Yapılıyor** — Agent görevi üstlendi, çalışma sürüyor.
- **Tamamlandı** — Agent kodu teslim etti, QA incelemesi bekleniyor.
- **QA: OK** — QA_Agent onayladı, Deploy_Chef tetiklenebilir.
- **QA: REVIZE** — QA_Agent hata buldu, agent düzeltme yapacak.

---

## Görev ID Formatı

`[DEPARTMAN-SAYI]` — Örnek: `FE-001`, `BE-001`, `QA-001`, `DEPLOY-001`

- `FE-XXX` → Frontend_Agent görevi
- `BE-XXX` → Backend_Agent görevi
- `QA-XXX` → QA_Agent incelemesi
- `DEPLOY-XXX` → Deploy_Chef işlemi
