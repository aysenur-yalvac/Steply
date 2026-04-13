# Steply — Pipeline

> **Yönetici:** PM_Steply | **Son Güncelleme:** 2026-04-13

---

## Aktif Görevler

| Görev ID | Departman | Görev Tanımı | Durum | QA Onayı |
|----------|-----------|--------------|-------|----------|
| BE-001 | Backend_Agent | `getUserProjectsAction` içinde `.eq("user_id")` → `.eq("student_id")` düzeltmesi (`src/lib/social-actions.ts`) | Tamamlandı | QA: OK |
| BE-002 | Backend_Agent | Root dizine `middleware.ts` eklenerek `/dashboard/*` auth korumasının aktif edilmesi | Tamamlandı | QA: OK |

---

## Tamamlanan Görevler

| Görev ID | Departman | Görev Tanımı | Tamamlanma Tarihi | QA Onayı |
|----------|-----------|--------------|-------------------|----------|
| BE-001 | Backend_Agent | `user_id` → `student_id` düzeltmesi (`social-actions.ts:132`) | 2026-04-13 | QA: OK |
| BE-002 | Backend_Agent | Root `middleware.ts` oluşturuldu, `updateSession` bağlandı | 2026-04-13 | QA: OK |

---

## Deployment Geçmişi

| Tarih | Commit Hash | Açıklama | Deploy_Chef Notu |
|-------|-------------|----------|-----------------|
| 2026-04-13 | (beklemede) | fix(auth+backend): middleware aktif edildi, student_id düzeltmesi | Deploy_Chef tetiklendi |

---

## Pipeline Durumu

```
Toplam Görev    : 2
Tamamlandı      : 2
Beklemede       : 0
Yapılıyor       : 0
QA Onaylı       : 2
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
