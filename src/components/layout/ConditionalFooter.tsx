"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  // Dashboard has its own footer inside the fixed-positioned layout
  if (pathname.startsWith("/dashboard")) return null;
  return <Footer />;
}
