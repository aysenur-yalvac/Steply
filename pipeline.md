# Steply — Pipeline

> **Yönetici:** PM_Steply | **Son Güncelleme:** 2026-04-17

---

## Aktif Görevler

| Görev ID | Departman | Görev Tanımı | Durum | QA Onayı |
|----------|-----------|--------------|-------|----------|
| FE-018 | Frontend_Agent | `SettingsClient.tsx`: Sidebar nav layout — Profile / Security / Notifications / Preferences sekmeli yapı | Yapılıyor | — |

---

## Tamamlanan Görevler

| Görev ID | Departman | Görev Tanımı | Tamamlanma Tarihi | QA Onayı |
|----------|-----------|--------------|-------------------|----------|
| BE-001..BE-007 | Backend_Agent | Tüm önceki backend fixler | 2026-04-13 | QA: OK |
| FE-001..FE-003 | Frontend_Agent | Tüm önceki frontend fixler | 2026-04-13 | QA: OK |
| BE-008 | Backend_Agent | `saveFileRecordAction` + `deleteFileAction`: collaborator yetki kontrolü | 2026-04-13 | QA: OK |
| FE-004 | Frontend_Agent | `FileSection`: `canManageFiles = isOwner\|\|isCollaborator` | 2026-04-13 | QA: OK |
| FE-005 | Frontend_Agent | `projects/[id]/page.tsx`: `isCollaborator` → `FileSection` | 2026-04-13 | QA: OK |
| FE-006 | Frontend_Agent | `dashboard/page.tsx`: `isWatched={watchedIds.has(p.id)}` watchlist fix | 2026-04-13 | QA: OK |
| FE-007 | Frontend_Agent | `KanbanBoard.tsx`: fixed-width columns, empty state, harmonized palette | 2026-04-13 | QA: OK |
| FE-008 | Frontend_Agent | `ProjectCard.tsx`: dark→light theme redesign, KanbanCard size parity | 2026-04-13 | QA: OK |
| FE-009 | Frontend_Agent | `dashboard/page.tsx`: Collaborative section spacing, divider, typography | 2026-04-13 | QA: OK |
| FE-010 | Frontend_Agent | `KanbanBoard.tsx`: grid full-width, card scale-up (p-5, text-base, h-2 progress) | 2026-04-13 | QA: OK |
| FE-011 | Frontend_Agent | `ProjectCard.tsx`: p-5, text-base, h-2 progress, text-xs badges | 2026-04-13 | QA: OK |
| FE-012 | Frontend_Agent | `DashboardViewSwitcher.tsx`: button padding scale-up, h1 text-3xl | 2026-04-13 | QA: OK |
| BE-009 | Backend_Agent | `api/search/route.ts`: `isWatched` alanı proje sonuçlarına eklendi | 2026-04-13 | QA: OK |
| FE-013 | Frontend_Agent | `animated-search-bar.tsx`: Bookmark butonu + optimistic toggle | 2026-04-13 | QA: OK |
| FE-014 | Frontend_Agent | `globals.css`: `.gsb-dropdown-project-row` + `.gsb-watchlist-btn` stilleri | 2026-04-13 | QA: OK |
| FE-015 | Frontend_Agent | `ProfileProjectsPanel.tsx`: yeni bileşen — filtre bar + iki sütun + Dashboard kart stili | 2026-04-13 | QA: OK |
| FE-016 | Frontend_Agent | `user/[id]/page.tsx`: panel entegrasyonu, max-w-6xl, yeni bölüm başlığı | 2026-04-13 | QA: OK |
| FE-017 | Frontend_Agent | `SettingsClient.tsx`: Password visibility toggle — Eye/EyeOff ikonları, ayrı state, absolute positioning | 2026-04-17 | QA: OK |

---

## Pipeline Durumu

```
Toplam Görev    : 27
Tamamlandı      : 26
Yapılıyor       : 1
QA Onaylı       : 26
Deploy Hazır    : HAYIR
Son Deploy      : 7fd0655 — 2026-04-17
```
