import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Çöp Kutusu | Steply",
};

export default function TrashLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden bg-slate-50">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Çöp Kutusu</h1>
            <p className="text-sm text-slate-500 mt-1">
              Silinmiş projeleriniz ve dosyalarınız burada yer alır.
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
