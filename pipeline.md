# Steply — Pipeline

> **Yönetici:** PM_Steply | **Son Güncelleme:** 2026-04-13

---

## Aktif Görevler

| Görev ID | Departman | Görev Tanımı | Durum | QA Onayı |
|----------|-----------|--------------|-------|----------|
| — | — | — | — | — |

*Henüz aktif görev yok. Kullanıcıdan yeni talep bekleniyor.*

---

## Tamamlanan Görevler

| Görev ID | Departman | Görev Tanımı | Tamamlanma Tarihi | QA Onayı |
|----------|-----------|--------------|-------------------|----------|
| — | — | — | — | — |

---

## Deployment Geçmişi

| Tarih | Commit Hash | Açıklama | Deploy_Chef Notu |
|-------|-------------|----------|-----------------|
| — | — | — | — |

---

## Pipeline Durumu

```
Toplam Görev    : 0
Tamamlandı      : 0
Beklemede       : 0
Yapılıyor       : 0
QA Onaylı       : 0
Deploy Hazır    : HAYIR
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
