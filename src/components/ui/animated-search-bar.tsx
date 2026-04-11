"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";

// ── Types ──────────────────────────────────────────────────────────────────────
interface ProjectResult {
  id: string;
  title: string;
}

interface UserResult {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface SearchResults {
  projects: ProjectResult[];
  users: UserResult[];
}

interface GooeySearchBarProps {
  placeholder?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export const isUnsupportedBrowser = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  const isSafari =
    ua.includes("safari") &&
    !ua.includes("chrome") &&
    !ua.includes("chromium") &&
    !ua.includes("android") &&
    !ua.includes("firefox");
  return isSafari || ua.includes("crios");
};

// ── SVG Filter (zero-size, outside flow) ───────────────────────────────────────
const GooeyFilter = () => (
  <svg
    aria-hidden="true"
    style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
  >
    <defs>
      <filter id="goo-effect">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -15"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
);

// ── Icons ──────────────────────────────────────────────────────────────────────
const SearchIcon = ({ isUnsupported }: { isUnsupported: boolean }) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.8, x: -4, filter: isUnsupported ? "none" : "blur(5px)" }}
    animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, scale: 0.8, x: -4, filter: isUnsupported ? "none" : "blur(5px)" }}
    transition={{ delay: 0.1, duration: 1, type: "spring", bounce: 0.15 }}
    width="16" height="16" viewBox="0 0 15 15" fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </motion.svg>
);

const LoadingIcon = () => (
  <svg
    className="gsb-loading-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    aria-label="Loading"
    role="status"
  >
    <rect width="256" height="256" fill="none" />
    {([
      [[128, 32], [128, 64]],
      [[195.88, 60.12], [173.25, 82.75]],
      [[224, 128], [192, 128]],
      [[195.88, 195.88], [173.25, 173.25]],
      [[128, 224], [128, 192]],
      [[60.12, 195.88], [82.75, 173.25]],
      [[32, 128], [64, 128]],
      [[60.12, 60.12], [82.75, 82.75]],
    ] as [number, number][][]).map(([[x1, y1], [x2, y2]], i) => (
      <line
        key={i} x1={x1} y1={y1} x2={x2} y2={y2}
        fill="none" stroke="rgba(255,255,255,0.8)"
        strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"
      />
    ))}
  </svg>
);

// ── Motion variants ────────────────────────────────────────────────────────────
const buttonVariants = {
  initial: { x: 0,   width: 110 },
  step1:   { x: 0,   width: 110 },
  step2:   { x: -34, width: 190 },
};

const iconVariants = {
  hidden:  { x: -50, opacity: 0 },
  visible: { x: -30, opacity: 1 },
};

// ── Main component ─────────────────────────────────────────────────────────────
export const GooeySearchBar = ({
  placeholder = "Search projects...",
}: GooeySearchBarProps) => {
  const inputRef     = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUnsupported = useMemo(() => isUnsupportedBrowser(), []);

  const [step,       setStep]       = useState<1 | 2>(1);
  const [searchText, setSearchText] = useState("");
  const [results,    setResults]    = useState<SearchResults>({ projects: [], users: [] });
  const [isLoading,  setIsLoading]  = useState(false);

  const debouncedText = useDebounce(searchText, 350);

  // Focus / reset on step change
  useEffect(() => {
    if (step === 2) {
      inputRef.current?.focus();
    } else {
      setSearchText("");
      setResults({ projects: [], users: [] });
      setIsLoading(false);
    }
  }, [step]);

  // Global search via API on debounced input
  useEffect(() => {
    let cancelled = false;
    if (debouncedText.trim().length >= 1) {
      setIsLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(debouncedText.trim())}`)
        .then((r) => r.json())
        .then((data: SearchResults) => {
          if (!cancelled) {
            setResults(data);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) setIsLoading(false);
        });
    } else {
      setResults({ projects: [], users: [] });
      setIsLoading(false);
    }
    return () => { cancelled = true; };
  }, [debouncedText]);

  // Close on outside click
  useEffect(() => {
    if (step !== 2) return;
    const handle = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setStep(1);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [step]);

  const hasResults = results.projects.length > 0 || results.users.length > 0;
  const showDropdown = step === 2 && (isLoading || hasResults || debouncedText.length > 0);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>

      {/* ── Dropdown results — lives OUTSIDE the goo filter stacking context ── */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              position:     "absolute",
              top:          "calc(100% + 8px)",
              right:        0,
              minWidth:     "220px",
              zIndex:       9999,
              background:   "#ffffff",
              borderRadius: "16px",
              border:       "1px solid rgba(124,58,255,0.1)",
              boxShadow:    "0 20px 40px -8px rgba(0,0,0,0.15), 0 0 0 1px rgba(124,58,255,0.06)",
              overflow:     "hidden",
            }}
            role="listbox"
            aria-label="Search results"
          >
            {isLoading ? (
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, color: "#7C3AFF", fontSize: 13, fontWeight: 600 }}>
                <LoadingIcon />
                Searching…
              </div>
            ) : hasResults ? (
              <>
                {/* ── Projects section ── */}
                {results.projects.length > 0 && (
                  <div>
                    <div style={{ padding: "8px 16px 4px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Projects
                    </div>
                    {results.projects.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.14 }}
                        role="option"
                      >
                        <Link
                          href={`/dashboard/projects/${item.id}`}
                          className="gsb-dropdown-item"
                          onClick={() => setStep(1)}
                        >
                          <span className="gsb-dropdown-dot" />
                          {item.title}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* ── Users section ── */}
                {results.users.length > 0 && (
                  <div>
                    {results.projects.length > 0 && (
                      <div style={{ margin: "4px 16px", borderTop: "1px solid rgba(0,0,0,0.06)" }} />
                    )}
                    <div style={{ padding: "8px 16px 4px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      People
                    </div>
                    {results.users.map((u, i) => {
                      const initials = u.full_name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
                      return (
                        <motion.div
                          key={u.id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (results.projects.length + i) * 0.04, duration: 0.14 }}
                          role="option"
                        >
                          <Link
                            href={`/user/${u.id}`}
                            className="gsb-dropdown-item"
                            onClick={() => setStep(1)}
                          >
                            {u.avatar_url ? (
                              <img
                                src={u.avatar_url}
                                alt={u.full_name}
                                style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                              />
                            ) : (
                              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AFF,#9333ea)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                                {initials || "?"}
                              </div>
                            )}
                            {u.full_name}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="gsb-dropdown-empty">No results found</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Goo blob wrapper — button + icon only ───────────────────────────── */}
      <div className={clsx("gsb-wrapper", isUnsupported && "no-goo")}>
        <GooeyFilter />

        <div className="gsb-button-content">
          <motion.div
            className="gsb-button-content-inner"
            initial="initial"
            animate={step === 1 ? "step1" : "step2"}
            transition={{ duration: 0.7, type: "spring", bounce: 0.15 }}
          >
            {/* Pill: label or input */}
            <motion.div
              variants={buttonVariants}
              onClick={() => setStep(2)}
              whileHover={{ scale: step === 2 ? 1 : 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="gsb-search-btn"
              role="button"
            >
              {step === 1 ? (
                <span className="gsb-search-text">Search</span>
              ) : (
                <input
                  ref={inputRef}
                  type="text"
                  className="gsb-search-input"
                  placeholder={placeholder}
                  aria-label="Search input"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              )}
            </motion.div>

            {/* Circular search / loading icon — goo-merges with pill */}
            <AnimatePresence mode="wait">
              {step === 2 && (
                <motion.div
                  key="icon"
                  className="gsb-separate-element"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={iconVariants}
                  transition={{ delay: 0.08, duration: 0.8, type: "spring", bounce: 0.15 }}
                >
                  {!isLoading
                    ? <SearchIcon isUnsupported={isUnsupported} />
                    : <LoadingIcon />
                  }
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
