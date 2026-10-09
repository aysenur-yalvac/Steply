const fs = require('fs');
const path = require('path');
const file = path.resolve('src/lib/email-classification.ts');

const content = `/**
 * Institutional Email Domain Auto-Verification Utility
 * Kurumsal e-posta domain'ine gore otomatik rol ve status atar.
 */

// Gelistirici / Admin E-posta Izin Listesi
// Bu e-postalar kurumsal domain olmasa dahi otomatik olarak "teacher" rolü alir.
const ADMIN_DEV_EMAILS = [
  "aysenuryalvac@gmail.com",
];

export function isTeacherEmail(email: string): boolean {
  if (!email) return false;
  
  const normalized = email.toLowerCase().trim();

  // 1. Gelistirici / Admin Kontrolu (Whitelist - istisna)
  if (ADMIN_DEV_EMAILS.includes(normalized)) {
    return true;
  }

  // 2. Ogrenci uzantilari kesinlikle ogretmen OLMAMALIDIR
  if (normalized.includes(".ogr.") || normalized.includes("ogrenci.") || normalized.includes("student.")) {
    return false;
  }

  // 3. Ogretmen kabul edilen resmi/kurumsal uzantilar
  return (
    normalized.endsWith("@meb.k12.tr") ||
    normalized.endsWith("@meb.gov.tr") ||
    normalized.endsWith("@eba.gov.tr") ||
    (normalized.includes(".edu.tr") && !normalized.includes(".ogr.")) ||
    normalized.endsWith(".k12.tr")
  );
}

export function validateRoleAndEmail(email: string, requestedRole: string) {
  const isTeacher = isTeacherEmail(email);

  // 1. Ogretmen Rolu Kurallari:
  if (requestedRole === "teacher") {
    if (!isTeacher) {
      return {
        valid: false,
        error: "Öğretmen hesabı için geçerli bir kurumsal e-posta (@meb.k12.tr vb.) kullanmalısınız."
      };
    }
  }

  // 2. Ogrenci Rolu Kurallari:
  if (requestedRole === "student") {
    // Ogrenciler HERHANGI bir e-posta ile kayit/giris yapabilir (Gmail, Hotmail, Okul maili vb.)
    return { valid: true };
  }

  return { valid: true };
}

export type EmailClassification =
  | { role: "teacher"; teacherStatus: "verified"; reason: string }
  | { role: "student"; teacherStatus: null; reason: string }
  | { role: null; teacherStatus: null; reason: "personal" };

export function classifyEmail(email: string): EmailClassification {
  if (isTeacherEmail(email)) {
    return { role: "teacher", teacherStatus: "verified", reason: "Kurumsal veya yetkili ogretmen e-postasi" };
  }
  
  const normalized = email.toLowerCase();
  if (normalized.includes(".ogr.") || normalized.includes("ogrenci.") || normalized.includes("student.")) {
    return { role: "student", teacherStatus: null, reason: "Kurumsal ogrenci e-postasi" };
  }
  
  return { role: null, teacherStatus: null, reason: "personal" };
}
`;

fs.writeFileSync(file, content, 'utf8');
console.log("Updated email-classification.ts with developer whitelist.");
