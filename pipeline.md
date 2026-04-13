# Steply — Pipeline

> **Yönetici:** PM_Steply | **Son Güncelleme:** 2026-04-13

---

## Aktif Görevler

| Görev ID | Departman | Görev Tanımı | Durum | QA Onayı |
|----------|-----------|--------------|-------|----------|
| BE-005 | Backend_Agent | `searchProfilesAction` — role filtresi kaldırıldı, tüm roller + limit 10 | Tamamlandı | QA: OK |
| FE-001 | Frontend_Agent | Arama sonuçlarında role badge + Öğretmenler/Öğrenciler grupları + copy güncellemeleri | Tamamlandı | QA: OK |

---

## Tamamlanan Görevler

| Görev ID | Departman | Görev Tanımı | Tamamlanma Tarihi | QA Onayı |
|----------|-----------|--------------|-------------------|----------|
| BE-001 | Backend_Agent | `user_id` → `student_id` düzeltmesi (`social-actions.ts:132`) | 2026-04-13 | QA: OK |
| BE-002 | Backend_Agent | Root `middleware.ts` oluşturuldu, `updateSession` bağlandı | 2026-04-13 | QA: OK |
| BE-003 | Backend_Agent | `page.tsx` iki adımlı fetch ile broken FK join kaldırıldı | 2026-04-13 | QA: OK |
| BE-004 | Backend_Agent | Migration `20260413_project_members_fk_fix.sql` yazıldı | 2026-04-13 | QA: OK |
| BE-005 | Backend_Agent | `searchProfilesAction` role filtresi kaldırıldı | 2026-04-13 | QA: OK |
| FE-001 | Frontend_Agent | Arama sonuçları role badge + gruplama ile güncellendi | 2026-04-13 | QA: OK |

---

## Deployment Geçmişi

| Tarih | Commit Hash | Açıklama | Deploy_Chef Notu |
|-------|-------------|----------|-----------------|
| 2026-04-13 | 7788e36 | fix(auth+backend): middleware aktif edildi, student_id düzeltmesi | Push OK |
| 2026-04-13 | 18cbc14 | fix(team-members): broken FK join düzeltildi + migration | Push OK |
| 2026-04-13 | (beklemede) | feat(team-members): öğretmen arama desteği + rol badge'leri | Deploy_Chef tetiklendi |

---

## Pipeline Durumu

```
Toplam Görev    : 6
Tamamlandı      : 6
Beklemede       : 0
Yapılıyor       : 0
QA Onaylı       : 6
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
