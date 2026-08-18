import { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Çöp Kutusu | Steply",
};

export default function TrashLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden bg-transparent">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <BackButton href="/dashboard" variant="light" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 dark:text-slate-100">Çöp Kutusu</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Silinmiş projeleriniz ve dosyalarınız burada yer alır.
              </p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
