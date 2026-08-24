/**
 * Institutional Email Domain Auto-Verification Utility
 * Kurumsal e-posta domain'ine gore otomatik rol ve status atar.
 */

/** Ogretmen kurumsal domainleri */
const TEACHER_DOMAINS = [
  "@meb.k12.tr",
  "@meb.gov.tr",
  "@eba.gov.tr",
];

/** Ogretmen edu.tr domainleri - ogr/std gecmeyen edu.tr adresleri ogretmen kabul edilir */
const EDU_TR_SUFFIX = ".edu.tr";
const EDU_TR_STUDENT_PREFIXES = ["ogr.", "std.", "ogrenci.", "student."];

/** Ogrenci domainleri - ogr / std alt-domain yapisi */
const STUDENT_SUBDOMAIN_PREFIXES = ["ogr.", "std.", "ogrenci.", "student."];

export type EmailClassification =
  | { role: "teacher"; teacherStatus: "verified"; reason: string }
  | { role: "student"; teacherStatus: null; reason: string }
  | { role: null; teacherStatus: null; reason: "personal" };

/**
 * E-posta adresine gore otomatik rol ve dogrulama statusu dondurur.
 *
 * Oncelik sirasi:
 * 1. MEB ogretmen domainleri -> teacher/verified
 * 2. ogr / std subdomain -> student
 * 3. edu.tr (ogrenci prefiksi yoksa) -> teacher/verified
 * 4. k12.tr -> teacher/verified
 * 5. Diger -> null (kisisel mail, fallback flow)
 */
export function classifyEmail(email: string): EmailClassification {
  const lower = email.toLowerCase().trim();
  const atIndex = lower.indexOf("@");
  if (atIndex < 0) return { role: null, teacherStatus: null, reason: "personal" };

  const domain = lower.slice(atIndex + 1); // e.g. "ogr.ksbu.edu.tr"
  const localPart = lower.slice(0, atIndex);  // e.g. "ayse.yilmaz"

  // --- 1. MEB ogretmen domainleri ---
  for (const td of TEACHER_DOMAINS) {
    if (lower.endsWith(td)) {
      return { role: "teacher", teacherStatus: "verified", reason: `MEB domain: ${td}` };
    }
  }

  // --- 2. Ogrenci subdomain (ogr, std) ---
  for (const prefix of STUDENT_SUBDOMAIN_PREFIXES) {
    if (domain.startsWith(prefix)) {
      return { role: "student", teacherStatus: null, reason: `Student subdomain: ${prefix}` };
    }
  }

  // --- 3. edu.tr kontrol: ogr/std prefiksi yoksa ogretmen ---
  if (domain.endsWith(EDU_TR_SUFFIX)) {
    const isStudent = STUDENT_SUBDOMAIN_PREFIXES.some((p) => domain.startsWith(p));
    if (!isStudent) {
      return { role: "teacher", teacherStatus: "verified", reason: `Academic edu.tr: ${domain}` };
    }
  }

  // --- 4. k12.tr (MEB ilkogretim/ortaogretim okul domainleri) ---
  if (domain.endsWith(".k12.tr") || domain === "k12.tr") {
    return { role: "teacher", teacherStatus: "verified", reason: `k12.tr school domain` };
  }

  // --- 5. Kisisel mail (gmail, hotmail, vs.) ---
  return { role: null, teacherStatus: null, reason: "personal" };
}
