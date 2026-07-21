import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Guards against an email address ending up where a school/institution name
 * should be (legacy bad data, or free-typed combobox input never confirmed
 * against the universities list). Never display or match on a value that
 * looks like an email.
 */
export function sanitizeInstitution(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes("@")) return null;
  return trimmed;
}
