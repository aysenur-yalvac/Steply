# Steply — Pipeline

> **Yönetici:** PM_Steply | **Son Güncelleme:** 2026-04-13

---

## Aktif Görevler

| Görev ID | Departman | Görev Tanımı | Durum | QA Onayı |
|----------|-----------|--------------|-------|----------|
| — | — | — | — | — |

*Pipeline temiz. Yeni görev bekleniyor.*

---

## Tamamlanan Görevler

| Görev ID | Departman | Görev Tanımı | Tamamlanma Tarihi | QA Onayı |
|----------|-----------|--------------|-------------------|----------|
| BE-001 | Backend_Agent | `user_id` → `student_id` düzeltmesi | 2026-04-13 | QA: OK |
| BE-002 | Backend_Agent | Root `middleware.ts` oluşturuldu, `updateSession` bağlandı | 2026-04-13 | QA: OK |
| BE-003 | Backend_Agent | `page.tsx` iki adımlı fetch ile broken FK join kaldırıldı | 2026-04-13 | QA: OK |
| BE-004 | Backend_Agent | Migration `20260413_project_members_fk_fix.sql` yazıldı | 2026-04-13 | QA: OK |
| BE-005 | Backend_Agent | `searchProfilesAction` role filtresi kaldırıldı | 2026-04-13 | QA: OK |
| FE-001 | Frontend_Agent | Arama sonuçları role badge + gruplama ile güncellendi | 2026-04-13 | QA: OK |
| BE-006 | Backend_Agent | `middleware.ts` root → `src/middleware.ts` taşındı (Vercel NFT fix) | 2026-04-13 | QA: OK |

---

## Deployment Geçmişi

| Tarih | Commit Hash | Açıklama | Deploy_Chef Notu |
|-------|-------------|----------|-----------------|
| 2026-04-13 | 7788e36 | fix(auth+backend): middleware + student_id | Push OK |
| 2026-04-13 | 18cbc14 | fix(team-members): broken FK join + migration | Push OK |
| 2026-04-13 | b6c7f5a | feat(team-members): öğretmen arama + rol badge | Push OK |
| 2026-04-13 | (beklemede) | fix(deployment): middleware src/ konumuna taşındı | Deploy_Chef tetiklendi |

---

## Pipeline Durumu

```
Toplam Görev    : 7
Tamamlandı      : 7
Beklemede       : 0
Yapılıyor       : 0
QA Onaylı       : 7
Deploy Hazır    : EVET ✓
```
