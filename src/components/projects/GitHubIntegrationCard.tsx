
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { connectGitHubRepoAction, removeGitHubRepoAction } from '@/lib/actions';
import { Github, Check, Copy, Trash2, GitCommit, Settings, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function GitHubIntegrationCard({ projectId, repo, commits, isTeamMember, githubLink }: { projectId: string, repo: any, commits: any[], isTeamMember: boolean, githubLink?: string | null }) {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formattedGithubLink = githubLink && !githubLink.startsWith('http') 
    ? `https://github.com/${githubLink}` 
    : githubLink;

  if (!isTeamMember) {
    return (
      <div className="rounded-3xl p-6 shadow-sm mb-6 w-full col-span-full bg-white dark:bg-[#1a2234] dark:border dark:border-slate-700/60 dark:shadow-[0_12px_30px_rgba(0,0,0,0.7)]">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Github className="w-5 h-5 text-indigo-500" /> GitHub Bağlantısı
        </h3>
        {formattedGithubLink ? (
          <a href={formattedGithubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-4 py-2 rounded-xl transition-colors">
            <Github className="w-4 h-4" /> Repo'yu Görüntüle
          </a>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-zinc-400">Bu proje sahibi henüz bir GitHub profili bağlamadı.</p>
        )}
      </div>
    );
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await connectGitHubRepoAction(projectId, repoUrl);
    if (res.error) {
      setError(res.error);
      toast.error(res.error);
    } else {
      toast.success('GitHub deposu başarıyla bağlandı!');
      router.refresh();
    }
    setLoading(false);
  };

  const handleRemove = async () => {
    if (!confirm('GitHub bağlantısını kaldırmak istediğinize emin misiniz?')) return;
    setLoading(true);
    await removeGitHubRepoAction(projectId);
    setLoading(false);
    setShowSettings(false);
    router.refresh();
  };

  const copyToClipboard = (text: string, setCopied: any) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const payloadUrl = `https://${typeof window !== 'undefined' ? window.location.host : 'localhost'}/api/webhooks/github?projectId=${projectId}`;

  const modalContent = showSettings ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2.5 sm:p-4 overflow-y-auto">
      <div className="relative w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden bg-white dark:bg-[#1a2234] dark:border dark:border-slate-700/60 dark:shadow-[0_12px_30px_rgba(0,0,0,0.7)] rounded-2xl shadow-2xl p-4 sm:p-6">
        <div className="flex justify-between items-center mb-5 sm:mb-6 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5" /> GitHub Depo Bağlantısı
          </h3>
          <button
            onClick={() => setShowSettings(false)}
            aria-label="Kapat"
            className="text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-zinc-200 transition-colors p-2 bg-slate-50 dark:bg-zinc-800 rounded-full min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!repo ? (
          <div className="max-w-xl mx-auto py-2 sm:py-4 space-y-5">
            {/* Adım Adım Türkçe Rehber Kutusu */}
            <div className="rounded-2xl bg-violet-50/70 dark:bg-slate-900/80 border border-violet-200/70 dark:border-violet-800/40 p-4 sm:p-5 space-y-3 text-left">
              <h4 className="text-sm font-bold text-violet-900 dark:text-violet-200 flex items-center gap-2">
                <Github className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                Adım Adım GitHub Depo Bağlama Rehberi
              </h4>
              <ol className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <li>
                  <strong className="text-slate-900 dark:text-white">Adım 1:</strong>{" "}
                  <code className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-800 text-violet-700 dark:text-violet-300 font-mono text-[11px] sm:text-xs">github.com</code>{" "}
                  hesabınıza giriş yapıp projenize ait depoyu (repository) açın.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Adım 2:</strong>{" "}
                  Tarayıcının üst adres çubuğundaki depo bağlantısını kopyalayın{" "}
                  <em className="text-slate-500 dark:text-slate-400">
                    (Örn: <code className="px-1 py-0.5 rounded bg-white/80 dark:bg-slate-800 font-mono text-[11px] not-italic break-all">https://github.com/kullanici-adi/proje-adi</code>)
                  </em>.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Adım 3:</strong>{" "}
                  Kopyaladığınız bağlantıyı aşağıdaki alana yapıştırıp{" "}
                  <strong className="text-slate-900 dark:text-white">Kaydet</strong> butonuna basın.
                </li>
              </ol>
              <div className="pt-2.5 border-t border-violet-200/60 dark:border-slate-700/70 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong className="text-violet-800 dark:text-violet-300">Otomatik Güncelleme (İsteğe Bağlı):</strong>{" "}
                Kod değişikliklerinizin (<code className="font-mono text-[11px]">commit</code>) projeye otomatik yansıması için GitHub deponuzda{" "}
                <strong className="text-slate-800 dark:text-slate-100">Settings → Webhooks → Add webhook</strong>{" "}
                menüsüne girip Payload URL kısmına{" "}
                <code className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-800 text-violet-700 dark:text-violet-300 font-mono text-[11px] break-all">
                  https://mustbacademy.com/api/webhooks/github
                </code>{" "}
                adresini ve Content type olarak{" "}
                <code className="px-1 py-0.5 rounded bg-white/80 dark:bg-slate-800 font-mono text-[11px]">application/json</code>{" "}
                seçeneğini ekleyin.
              </div>
            </div>

            <form onSubmit={handleConnect} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                  GitHub Depo Bağlantısı (Repository URL)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/kullanici-adi/proje-adi"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 bg-white dark:bg-zinc-950 border-slate-300 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              {error && <p className="text-red-500 text-xs text-center mt-2 font-medium bg-red-50 dark:bg-red-900/30 p-2.5 rounded-lg">{error}</p>}
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
            {/* Left Column: Data & Actions */}
            <div className="flex flex-col h-full min-w-0 bg-white dark:bg-zinc-900 rounded-xl p-3 sm:p-4">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-white flex items-center gap-2 mb-5 break-all">
                <Github className="w-5 h-5 shrink-0" /> <span className="truncate">{repo.repo_owner}/{repo.repo_name}</span>
              </h4>

              <div className="space-y-4 flex-1 min-w-0">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Payload URL</label>
                  <div className="flex gap-2 items-center min-w-0">
                    <input type="text" readOnly value={payloadUrl} className="flex-1 min-w-0 overflow-x-auto bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 dark:text-zinc-100 font-mono focus:outline-none" />
                    <button type="button" onClick={() => copyToClipboard(payloadUrl, setCopiedUrl)} className="shrink-0 p-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer" title="Kopyala">
                      {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400 dark:text-zinc-400" />}
                    </button>
                  </div>
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Secret Key</label>
                  <div className="flex gap-2 items-center min-w-0">
                    <input type="text" readOnly value={repo.webhook_secret} className="flex-1 min-w-0 overflow-x-auto bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 dark:text-zinc-100 font-mono focus:outline-none" />
                    <button type="button" onClick={() => copyToClipboard(repo.webhook_secret, setCopiedSecret)} className="shrink-0 p-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer" title="Kopyala">
                      {copiedSecret ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400 dark:text-zinc-400" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button onClick={handleRemove} disabled={loading} className="w-full py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 :bg-red-900/60 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80">
                  <Trash2 className="w-4 h-4" /> Bağlantıyı Kes
                </button>
              </div>
            </div>

            {/* Right Column: Setup Guide */}
            <div className="bg-slate-100 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700/60 p-5 rounded-xl h-full flex flex-col">
              <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 dark:text-white mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Webhook Kurulum Rehberi
              </h5>
              <ol className="list-decimal list-inside text-sm text-slate-700 dark:text-zinc-200 space-y-3 mb-6 flex-1">
                <li>GitHub deponuzda <strong>Settings &gt; Webhooks &gt; Add webhook</strong> kısmına gidin.</li>
                <li>Soldaki <strong>Payload URL</strong> ve <strong>Secret</strong> değerlerini kopyalayıp ilgili alanlara yapıştırın.</li>
                <li>Sadece <strong>Push events</strong> seçmeli veya tümünü işaretleyebilirsiniz.</li>
              </ol>

              <div className="mt-auto bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 p-3.5 rounded-lg text-xs font-medium">
                <p className="flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong className="block mb-1 text-sm">⚠️ ÖNEMLİ</strong>
                    GitHub'da <strong>'Content type'</strong> alanını mutlaka <strong>'application/json'</strong> yapın! Aksi halde webhook başarısız olacaktır.
                  </span>
                </p>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2 mb-2 text-sm">
                  <span>👥 Ekip Arkadaşları Nasıl Dahil Edilir?</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-300 dark:text-zinc-300 mb-2 leading-relaxed text-xs">
                  Projeye ortak olan diğer üyelerin de attığı commit'lerin Must-b Academy akışına düşmesi için:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 dark:text-zinc-300 text-xs">
                  <li>
                    GitHub deponuzdan <strong>Settings &gt; Collaborators</strong> sekmesine gidip arkadaşlarınızı ekleyin.
                  </li>
                  <li>
                    Ekip üyelerinizin <strong>Must-b Academy e-postaları</strong> ile bilgisayarlarındaki <strong>Git e-postasının</strong> (<code>git config user.email</code>) aynı olduğundan emin olun.
                  </li>
                </ul>
                <p className="mt-2 text-indigo-700 dark:text-indigo-300 font-medium text-xs">
                  ✨ Ekip arkadaşlarınızın ekstra bir Webhook kurmasına gerek yoktur. Attıkları push'lar doğrudan kendi adlarıyla akışa düşecektir.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  if (!isTeamMember) {
    return (
      <div className="bg-white/80 dark:bg-[#1a2234] border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-md rounded-3xl p-6 shadow-sm mb-6 w-full col-span-full">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Github className="w-5 h-5" /> GitHub Bağlantısı
        </h3>
        {githubLink ? (
          <a href={githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
            <Github className="w-4 h-4" /> Repo'yu Görüntüle
          </a>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">Bu proje sahibi henüz bir GitHub profili bağlamadı.</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-[#1a2234] border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm mb-6 relative w-full col-span-full max-h-[420px] h-[420px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 mb-4 shrink-0">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
          <Github className="w-5 h-5" /> GitHub
        </h3>
        {isTeamMember && (
          <button onClick={() => setShowSettings(true)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="Ayarlar">
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

      {!repo ? (
        <div className="text-center py-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Henüz GitHub bağlanmadı.</p>
          {isTeamMember && (
            <button onClick={() => setShowSettings(true)} className="text-xs font-bold text-indigo-600 hover:underline">
              Depo Bağla
            </button>
          )}
        </div>
      ) : (
        commits.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Henüz commit bulunmuyor.</p>
            <p className="text-xs text-slate-400 mt-1">Webhook bağlandığında push edilen commitler burada görünecek.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pl-2 pr-2 pt-4 pb-4 custom-scrollbar">
          <div className="relative border-l-2 border-indigo-100 dark:border-slate-800 ml-2 space-y-4">
            {commits.map((commit: any) => (
              <div key={commit.id} className="relative pl-8">
                <span className="absolute -left-[11px] top-3 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-700 flex items-center justify-center overflow-hidden z-10">
                  {commit.author_avatar ? (
                    <img src={commit.author_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Github className="w-3 h-3 text-indigo-400" />
                  )}
                </span>
                <div className="flex flex-col bg-slate-50 border border-slate-200/60 dark:bg-slate-900/90 dark:border-slate-800 dark:border dark:border-slate-700/80 dark:shadow-sm hover:dark:border-slate-500/80 transition-colors rounded-xl p-3 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">{new Date(commit.pushed_at).toLocaleString('tr-TR')}</span>
                  <p className="text-sm text-slate-700 dark:text-slate-100 font-medium mt-1 break-words">{commit.commit_message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{commit.author_name}</span>
                    <a href={commit.commit_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline font-mono">
                      {commit.commit_hash.substring(0, 7)}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        )
      )}

      {mounted && typeof document !== 'undefined' && modalContent ? createPortal(modalContent, document.body) : null}
    </div>
  );
}

