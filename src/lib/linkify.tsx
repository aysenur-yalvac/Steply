"use client";

import React from "react";
import Link from "next/link";

const URL_REGEX = /(https?:\/\/[^\s<>"']+)/gi;
const TRAILING_PUNCT_REGEX = /[),.;!?\]}>]+$/;

const INTERNAL_HOSTNAMES = new Set([
  "mustbacademy.com",
  "www.mustbacademy.com",
  "academy.must-b.com",
  "steply-app.vercel.app",
  "localhost",
  "127.0.0.1",
]);

function resolveInternalPath(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();

    const isCurrentOrigin =
      typeof window !== "undefined" &&
      window.location &&
      parsed.hostname.toLowerCase() === window.location.hostname.toLowerCase();

    const isKnownInternal =
      isCurrentOrigin ||
      INTERNAL_HOSTNAMES.has(host) ||
      host.endsWith(".mustbacademy.com") ||
      host.endsWith(".must-b.com");

    const pathWithQuery = `${parsed.pathname}${parsed.search}${parsed.hash}`;

    if (isKnownInternal) {
      return pathWithQuery || "/";
    }

    // Even if copied from a preview/deployment domain, recognize platform internal routes
    if (
      parsed.pathname.startsWith("/join/") ||
      parsed.pathname.startsWith("/invite/") ||
      parsed.pathname.startsWith("/dashboard")
    ) {
      return pathWithQuery;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Parses URLs (https://... and http://...) inside message text and converts them into clickable React nodes.
 * - Internal platform links (mustbacademy.com, /join/..., /invite/..., /dashboard/projects/...) navigate in the same tab via Next.js <Link>.
 * - External web URLs open in a new tab with target="_blank" rel="noopener noreferrer".
 */
export function renderMessageWithLinks(text: string): React.ReactNode {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(URL_REGEX.source, "gi");

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    const rawMatch = match[0];

    if (matchStart > lastIndex) {
      parts.push(text.slice(lastIndex, matchStart));
    }

    // Separate trailing punctuation (like '.', ',', ')') that isn't part of the URL
    let cleanUrl = rawMatch;
    let trailingPunct = "";
    const trailingMatch = rawMatch.match(TRAILING_PUNCT_REGEX);
    if (trailingMatch) {
      trailingPunct = trailingMatch[0];
      cleanUrl = rawMatch.slice(0, rawMatch.length - trailingPunct.length);
    }

    const internalPath = resolveInternalPath(cleanUrl);
    const linkClassName =
      "underline underline-offset-2 font-medium hover:opacity-85 break-all transition-opacity cursor-pointer";

    if (internalPath) {
      const normalizedPath = internalPath.startsWith("/invite/")
        ? internalPath.replace(/^\/invite\//, "/join/")
        : internalPath;

      parts.push(
        <Link
          key={`link-${matchStart}`}
          href={normalizedPath}
          onClick={(e) => e.stopPropagation()}
          className={linkClassName}
        >
          {cleanUrl}
        </Link>
      );
    } else {
      parts.push(
        <a
          key={`link-${matchStart}`}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={linkClassName}
        >
          {cleanUrl}
        </a>
      );
    }

    if (trailingPunct) {
      parts.push(trailingPunct);
    }

    lastIndex = matchStart + rawMatch.length;
  }

  if (parts.length === 0) {
    return text;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
