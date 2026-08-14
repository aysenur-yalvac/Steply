const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// 1. Add createPortal import
content = content.replace(
  'import { useState, useRef, useEffect } from "react";',
  'import { useState, useRef, useEffect, useCallback } from "react";\nimport { createPortal } from "react-dom";'
);

// 2. Add triggerRef to track the trigger button position
// Find the state declarations and add triggerRef
content = content.replace(
  'const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);',
  'const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);\n  const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null);\n  const triggerRef = useRef<HTMLButtonElement>(null);\n  const [mounted, setMounted] = useState(false);\n  useEffect(() => { setMounted(true); }, []);'
);

// 3. Replace the open handler to capture anchor position
content = content.replace(
  'onClick={() => setIsAccountMenuOpen(o => !o)}\n              title={userName || userEmail || "Hesaplar"}\n              className="flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-emerald-500 hover:ring-emerald-400 transition-all p-[2px]"',
  `ref={triggerRef}
              onClick={() => {
                const rect = triggerRef.current?.getBoundingClientRect();
                setPopoverAnchor(rect ?? null);
                setIsAccountMenuOpen(o => !o);
              }}
              title={userName || userEmail || "Hesaplar"}
              className="flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-emerald-500 hover:ring-emerald-400 transition-all p-[2px]"`
);

// 4. Find the expanded trigger button (ChevronsUpDown) and update it too
content = content.replace(
  'onClick={() => setIsAccountMenuOpen(o => !o)}\n            className="flex-1 flex items-center justify-between hover:bg-slate-100 rounded-xl p-2 transition-colors text-left group"',
  `ref={triggerRef}
            onClick={() => {
              const rect = triggerRef.current?.getBoundingClientRect();
              setPopoverAnchor(rect ?? null);
              setIsAccountMenuOpen(o => !o);
            }}
            className="flex-1 flex items-center justify-between hover:bg-slate-100 rounded-xl p-2 transition-colors text-left group"`
);

// 5. Replace the entire popover fragment with a Portal version
const oldPopover = `{isAccountMenuOpen && (
          <>
            {/* Backdrop — click outside to close */}
            <div
              className="fixed inset-0 z-[99]"
              onClick={() => setIsAccountMenuOpen(false)}
            />

            {/* Popover panel */}
            <div className={\`z-[100] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden w-64 \${
              collapsed
                ? 'fixed bottom-6 left-[72px]'   // collapsed: fixed to escape sidebar clip
                : 'absolute bottom-[calc(100%+8px)] left-0 right-0 w-auto' // expanded: opens above
            }\`}>`;

const newPopover = `{isAccountMenuOpen && mounted && createPortal(
          <>
            {/* Backdrop — click outside to close */}
            <div
              className="fixed inset-0 z-[199]"
              onClick={() => setIsAccountMenuOpen(false)}
            />

            {/* Popover panel — anchored via JS position */}
            <div
              className="fixed z-[200] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden w-64"
              style={popoverAnchor ? {
                bottom: window.innerHeight - popoverAnchor.top + 8,
                left: collapsed ? popoverAnchor.right + 8 : popoverAnchor.left,
                width: collapsed ? 256 : Math.max(256, popoverAnchor.width),
              } : { bottom: 80, left: 80 }}
            >`;

content = content.replace(oldPopover, newPopover);

// 6. Close the portal: add document.body as portal target at the end of the <>
content = content.replace(
  '          </>\n        )}\n\n        {/* ============================================================\n            FOOTER CONTENT',
  '          </>,\n          document.body\n        )}\n\n        {/* ============================================================\n            FOOTER CONTENT'
);

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Applied React Portal to account switcher popover');
