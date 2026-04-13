# Steply — Pipeline

> **Yönetici:** PM_Steply | **Son Güncelleme:** 2026-04-13

---

## Aktif Görevler

| Görev ID | Departman | Görev Tanımı | Durum | QA Onayı |
|----------|-----------|--------------|-------|----------|
| BE-007 | Backend_Agent | Dashboard page: collaborator projeleri fetch et; project detail page: `isCollaborator` flag ekle | Yapılıyor | Beklemede |
| FE-002 | Frontend_Agent | ProjectCard: `isCollaborator` badge + davranış; ProjectEditableContent: `canEdit` flag ile collaborator edit erişimi | Yapılıyor | Beklemede |
| FE-003 | Frontend_Agent | Dashboard page: "Ortak Olduğum Projeler" section UI | Yapılıyor | Beklemede |

---

## Tamamlanan Görevler

| Görev ID | Departman | Görev Tanımı | Tamamlanma Tarihi | QA Onayı |
|----------|-----------|--------------|-------------------|----------|
| BE-001 | Backend_Agent | `user_id` → `student_id` düzeltmesi | 2026-04-13 | QA: OK |
| BE-002 | Backend_Agent | Root `middleware.ts` → `updateSession` bağlandı | 2026-04-13 | QA: OK |
| BE-003 | Backend_Agent | `page.tsx` iki adımlı fetch, broken FK join kaldırıldı | 2026-04-13 | QA: OK |
| BE-004 | Backend_Agent | Migration `20260413_project_members_fk_fix.sql` | 2026-04-13 | QA: OK |
| BE-005 | Backend_Agent | `searchProfilesAction` role filtresi kaldırıldı | 2026-04-13 | QA: OK |
| BE-006 | Backend_Agent | middleware root → `src/middleware.ts` (Vercel NFT fix) | 2026-04-13 | QA: OK |
| FE-001 | Frontend_Agent | Arama sonuçları role badge + gruplama | 2026-04-13 | QA: OK |

---

## Pipeline Durumu

```
Toplam Görev    : 10
Tamamlandı      : 7
Yapılıyor       : 3
QA Onaylı       : 7
Deploy Hazır    : HAYIR
```
