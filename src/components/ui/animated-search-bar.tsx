"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

// ── Types ──────────────────────────────────────────────────────────────────────
interface GooeySearchBarProps {
  data?: string[];
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

// ── SVG Filter ─────────────────────────────────────────────────────────────────
const GooeyFilter = () => (
  <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
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
      fillRule="evenodd" clipRule="evenodd"
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
    {[
      [[128,32],[128,64]], [[195.88,60.12],[173.25,82.75]],
      [[224,128],[192,128]], [[195.88,195.88],[173.25,173.25]],
      [[128,224],[128,192]], [[60.12,195.88],[82.75,173.25]],
      [[32,128],[64,128]], [[60.12,60.12],[82.75,82.75]],
    ].map(([[x1,y1],[x2,y2]], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
        fill="none" stroke="rgba(255,255,255,0.8)"
        strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"
      />
    ))}
  </svg>
);

const InfoIcon = ({ index }: { index: number }) => (
  <motion.svg
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ delay: index * 0.12 + 0.3 }}
    viewBox="0 0 15 15"
    className="gsb-info-icon"
    aria-hidden="true"
    fill="currentColor"
  >
    <path
      d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.91420 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.91420 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z"
      fillRule="evenodd" clipRule="evenodd"
    />
  </motion.svg>
);

// ── Variants ───────────────────────────────────────────────────────────────────
const buttonVariants = {
  initial: { x: 0, width: 110 },
  step1:   { x: 0, width: 110 },
  step2:   { x: -34, width: 190 },
};

const iconVariants = {
  hidden:  { x: -50, opacity: 0 },
  visible: { x: 16,  opacity: 1 },
};

const getResultItemVariants = (index: number, isUnsupported: boolean) => ({
  initial: { y: 0, scale: 0.3, filter: isUnsupported ? "none" : "blur(10px)" },
  animate: { y: (index + 1) * 48, scale: 1, filter: "blur(0px)" },
  exit:    { y: isUnsupported ? 0 : -4, scale: 0.8, color: "#000000" },
});

const getResultItemTransition = (index: number) => ({
  duration: 0.75,
  delay: index * 0.1,
  type: "spring" as const,
  bounce: 0.35,
  filter: { ease: "easeInOut" },
});

// ── Main component ─────────────────────────────────────────────────────────────
export const GooeySearchBar = ({ data = [], placeholder = "Search projects..." }: GooeySearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isUnsupported = useMemo(() => isUnsupportedBrowser(), []);

  const [step, setStep] = useState<1 | 2>(1);
  const [searchText, setSearchText] = useState("");
  const [searchData, setSearchData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchText = useDebounce(searchText, 400);

  // Focus / reset on step change
  useEffect(() => {
    if (step === 2) {
      inputRef.current?.focus();
    } else {
      setSearchText("");
      setSearchData([]);
      setIsLoading(false);
    }
  }, [step]);

  // Filter on debounced text
  useEffect(() => {
    let cancelled = false;
    if (debouncedSearchText) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        if (!cancelled) {
          const filtered = data.filter((item) =>
            item.toLowerCase().includes(debouncedSearchText.trim().toLowerCase())
          );
          setSearchData(filtered);
          setIsLoading(false);
        }
      }, 300);
      return () => { cancelled = true; clearTimeout(timer); };
    } else {
      setSearchData([]);
      setIsLoading(false);
    }
  }, [debouncedSearchText, data]);

  // Close on outside click
  useEffect(() => {
    if (step !== 2) return;
    const handle = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest(".gsb-wrapper");
      if (!el) setStep(1);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [step]);

  return (
    <div className={clsx("gsb-wrapper", isUnsupported && "no-goo")}>
      <GooeyFilter />

      <div className="gsb-button-content">
        <motion.div
          className="gsb-button-content-inner"
          initial="initial"
          animate={step === 1 ? "step1" : "step2"}
          transition={{ duration: 0.7, type: "spring", bounce: 0.15 }}
        >
          {/* Results list */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key="results"
              className="gsb-search-results"
              role="listbox"
              aria-label="Search results"
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: isUnsupported ? 0.4 : 1.1, duration: 0.4 }}
            >
              <AnimatePresence mode="popLayout">
                {searchData.map((item, index) => (
                  <motion.div
                    key={item}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    variants={getResultItemVariants(index, isUnsupported)}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={getResultItemTransition(index)}
                    className="gsb-search-result"
                    role="option"
                  >
                    <div className="gsb-search-result-title">
                      <InfoIcon index={index} />
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.25 }}
                      >
                        {item}
                      </motion.span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* Main button / input */}
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

          {/* Separate icon element (goo blob) */}
          <AnimatePresence mode="wait">
            {step === 2 && (
              <motion.div
                key="icon"
                className="gsb-separate-element"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={iconVariants}
                transition={{ delay: 0.1, duration: 0.85, type: "spring", bounce: 0.15 }}
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
  );
};
