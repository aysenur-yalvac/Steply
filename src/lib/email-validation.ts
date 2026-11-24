/**
 * Ortak E-posta Doğrulama ve Rol Sınıflandırma Yardımcıları
 */

const ADMIN_DEV_EMAILS = [
  "aysenuryalvac@gmail.com",
];

const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "hotmail.com.tr",
  "outlook.com",
  "outlook.com.tr",
  "yahoo.com",
  "yahoo.com.tr",
  "icloud.com",
  "yandex.com",
  "yandex.com.tr",
  "live.com",
  "msn.com",
  "protonmail.com",
  "proton.me",
  "aol.com",
  "mail.com",
];

const STUDENT_MARKERS = [
  "@ogr.",
  ".ogr.",
  "@std.",
  ".std.",
  "@ogrenci.",
  ".ogrenci.",
  "@stu.",
  ".stu.",
  "@student.",
  ".student.",
];

export const TEACHER_EMAIL_ERROR_MESSAGE =
  "Öğretmen kaydı için öğrenci e-postası (@ogr. vb.) veya kişisel e-posta kullanılamaz. Lütfen kurumsal öğretmen/akademisyen e-postanızı girin.";

export const STUDENT_EMAIL_ERROR_MESSAGE =
  "Lütfen geçerli bir öğrenci e-posta adresi girin (örn: ad.soyad@ogr.universite.edu.tr).";

function hasStudentMarker(normalizedEmail: string): boolean {
  return STUDENT_MARKERS.some((marker) => normalizedEmail.includes(marker));
}

function isPersonalDomain(domain: string): boolean {
  return PERSONAL_EMAIL_DOMAINS.includes(domain);
}

function isAcademicOrSchoolDomain(domain: string): boolean {
  return (
    domain.endsWith(".edu.tr") ||
    domain.endsWith(".edu") ||
    domain.includes(".edu.") ||
    domain.endsWith(".ac.uk") ||
    domain.includes(".ac.") ||
    domain.endsWith(".k12.tr") ||
    domain === "meb.k12.tr" ||
    domain === "meb.gov.tr" ||
    domain === "eba.gov.tr"
  );
}

/**
 * Öğrenci E-postası Kuralı (isStudentEmail):
 * Üniversite uzantılı (.edu.tr, .edu vb.) olmalı VE mutlaka öğrenci alt alan adı/ön eki
 * (@ogr., .ogr., @std., .std., @ogrenci., .ogrenci., @stu., .stu., @student.) içermelidir.
 * Normal @gmail.com, @hotmail.com gibi kişisel mailler veya öğrenci ön eki olmayan akademisyen mailleri false döner.
 */
export function isStudentEmail(email: string): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  const atIndex = normalized.lastIndexOf("@");
  if (atIndex <= 0) return false;

  const domain = normalized.slice(atIndex + 1);
  if (!domain || isPersonalDomain(domain)) return false;

  const isUniversityDomain =
    domain.endsWith(".edu.tr") ||
    domain.endsWith(".edu") ||
    domain.includes(".edu.") ||
    domain.endsWith(".ac.uk") ||
    domain.includes(".ac.");

  if (!isUniversityDomain) return false;

  return hasStudentMarker(normalized);
}

/**
 * Öğretmen E-postası Kuralı (isTeacherEmail):
 * Kurumsal akademisyen/öğretmen uzantılı (*.edu.tr, *.k12.tr, @meb.k12.tr veya onaylı okul domainleri) olmalı,
 * ancak KESİNLİKLE öğrenci alt alan adlarını (@ogr., .ogr., @std., .std., @ogrenci., .ogrenci., @stu., .stu., @student.)
 * ve kişisel mail sağlayıcılarını (gmail.com, hotmail.com, outlook.com, yahoo.com, icloud.com vb.) reddetmelidir.
 */
export function isTeacherEmail(email: string): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();

  if (ADMIN_DEV_EMAILS.includes(normalized)) {
    return true;
  }

  const atIndex = normalized.lastIndexOf("@");
  if (atIndex <= 0) return false;

  const domain = normalized.slice(atIndex + 1);
  if (!domain || isPersonalDomain(domain)) {
    return false;
  }

  // Öğrenci alt alan adlarını kesinlikle reddet
  if (hasStudentMarker(normalized)) {
    return false;
  }

  return isAcademicOrSchoolDomain(domain);
}

export function validateRoleAndEmail(
  email: string,
  requestedRole?: string | null
): { valid: boolean; error?: string } {
  const normalized = (email || "").toLowerCase().trim();

  if (requestedRole === "teacher") {
    if (!isTeacherEmail(normalized)) {
      return {
        valid: false,
        error: TEACHER_EMAIL_ERROR_MESSAGE,
      };
    }
  }

  return { valid: true };
}
