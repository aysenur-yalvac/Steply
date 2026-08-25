"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Upload, FileText, CheckCircle, Shield, Clock, Bot } from "lucide-react";

export default function TeacherPendingPage() {
  const router = useRouter();
  const [institutionCode, setInstitutionCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !institutionCode.trim()) {
      setError("Lutfen MEB kurum kodu veya gorev belgesi yukleyin.");
      return;
    }
    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Oturum bulunamadi.");
      }

      let docUrl = null;
      if (file) {
        if (file.size > 4 * 1024 * 1024) throw new Error("Dosya boyutu 4MB altinda olmalidir.");
        const ext = file.name.split(".").pop();
        const path = `${user.id}/verification.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("verifications")
          .upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("verifications")
          .getPublicUrl(path);
        docUrl = urlData.publicUrl;
      }

      // Eger belge varsa Yapay Zeka dogrulamasi yap
      if (docUrl && file?.name.toLowerCase().endsWith(".pdf")) {
        setUploading(false);
        setAnalyzing(true);

        const res = await fetch("/api/teacher/auto-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ docUrl, userId: user.id, institutionCode: institutionCode.trim() })
        });
        const data = await res.json();

        if (data.success) {
          router.replace("/dashboard/teacher");
          return; // Bitir
        } else {
          // AI reddetti veya okuyamadi -> yine de pending'e at ve bekle
          setError(data.error || "Yapay zeka belgenizi dogrulayamadi. Manuel onaya alinmistir.");
        }
      }

      // Update profile as pending if AI failed or it's an image
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          institution_code: institutionCode.trim() || null,
          verification_doc_url: docUrl,
          teacher_status: "pending",
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setUploaded(true);
    } catch (err: any) {
      setError(err?.message ?? "Bir hata olustu.");
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0B0E14" }}
    >
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[700px] h-[600px]"
          style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(255,127,80,0.12) 0%, transparent 58%)" }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px]"
          style={{ background: "radial-gradient(ellipse at 100% 100%, rgba(160,32,240,0.10) 0%, transparent 58%)" }} />
      </div>

      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#FBBF24" }}>
            <Clock className="w-4 h-4" />
            Kurumsal Dogrulama Bekleniyor
          </div>
        </div>

        <div className="rounded-3xl p-8"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>

          {analyzing ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
                style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)" }}>
                <Bot className="w-8 h-8 text-sky-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Yapay Zeka Analiz Ediyor...</h2>
              <p className="text-slate-400 text-sm max-w-sm">
                Belgeniz Yapay Zeka tarafindan otomatik olarak dogrulaniyor. Bu islem birkac saniye surebilir. Lutfen bekleyin.
              </p>
            </div>
          ) : uploaded ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Belgeniz Alindi!</h2>
              <p className="text-slate-400 text-sm max-w-sm">
                Belgeleriniz basariyla iletildi. Yonetici incelemesinin ardindan hesabiniz aktif hale getirilecektir.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(160,32,240,0.12)", border: "1px solid rgba(160,32,240,0.25)" }}>
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-white">Ogretmen Kimligini Dogrula</h1>
                  <p className="text-slate-400 text-sm mt-1">
                    PDF formatindaki belgeniz <strong className="text-purple-400">Yapay Zeka</strong> tarafindan aninda onaylanabilir.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">MEBBIS / Kurum Kodu</label>
                  <input
                    type="text"
                    value={institutionCode}
                    onChange={(e) => setInstitutionCode(e.target.value)}
                    placeholder="Ornek: MEBBIS-12345"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Gorev Belgesi (Aninda Onay Icin PDF Onerilir)
                  </label>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full flex flex-col items-center gap-3 px-4 py-6 rounded-xl transition-all"
                    style={{
                      background: file ? "rgba(160,32,240,0.08)" : "rgba(255,255,255,0.03)",
                      border: file ? "2px dashed rgba(160,32,240,0.4)" : "2px dashed rgba(255,255,255,0.12)",
                    }}
                  >
                    {file ? (
                      <>
                        <FileText className="w-6 h-6 text-purple-400" />
                        <span className="text-sm text-purple-300 font-medium">{file.name}</span>
                        <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-500" />
                        <span className="text-sm text-slate-400">Dosya secmek icin tiklayin</span>
                        <span className="text-xs text-slate-600">PDF, PNG, JPG - Maks. 4 MB</span>
                      </>
                    )}
                  </button>
                  <input ref={fileRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => {
  const selectedFile = e.target.files?.[0] ?? null;
  if (selectedFile && selectedFile.size > 4 * 1024 * 1024) {
    setError("Dosya boyutu 4 MB'tan buyuk olamaz. Lutfen daha kucuk bir belge yukleyin.");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  } else {
    setError(null);
    setFile(selectedFile);
  }
}} />
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm text-red-300"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading || (!institutionCode.trim() && !file)}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #A020F0 0%, #7C3AFF 100%)",
                    opacity: uploading || (!institutionCode.trim() && !file) ? 0.5 : 1,
                  }}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Yukleniyor..." : "Dogrulama Belgemi Gonder"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

