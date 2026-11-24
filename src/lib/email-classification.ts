import {
  isStudentEmail,
  isTeacherEmail,
  validateRoleAndEmail,
  TEACHER_EMAIL_ERROR_MESSAGE,
  STUDENT_EMAIL_ERROR_MESSAGE,
} from "@/lib/email-validation";

export {
  isStudentEmail,
  isTeacherEmail,
  validateRoleAndEmail,
  TEACHER_EMAIL_ERROR_MESSAGE,
  STUDENT_EMAIL_ERROR_MESSAGE,
};

export type EmailClassification =
  | { role: "teacher"; teacherStatus: "verified"; reason: string }
  | { role: "student"; teacherStatus: null; reason: string }
  | { role: null; teacherStatus: null; reason: "personal" };

export function classifyEmail(email: string): EmailClassification {
  if (isTeacherEmail(email)) {
    return {
      role: "teacher",
      teacherStatus: "verified",
      reason: "Kurumsal veya yetkili ogretmen e-postasi",
    };
  }

  if (isStudentEmail(email)) {
    return {
      role: "student",
      teacherStatus: null,
      reason: "Kurumsal ogrenci e-postasi",
    };
  }

  return { role: null, teacherStatus: null, reason: "personal" };
}
