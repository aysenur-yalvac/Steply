
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { connectGitHubRepoAction, removeGitHubRepoAction } from '@/lib/actions';
import { Github, Check, Copy, Trash2, GitCommit, Settings, X, AlertCircle } from 'lucide-react';

export function GitHubIntegrationCard({ projectId, repo, commits, isTeamMember }: { projectId: string, repo: any, commits: any[], isTeamMember: boolean }) {
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

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await connectGitHubRepoAction(projectId, repoUrl);
    if (res.error) setError(res.error);
    setLoading(false);
  };

  const handleRemove = async () => {
    if (!confirm('GitHub baglantisini kaldirmak istediginize emin misiniz?')) return;
    setLoading(true);
    await removeGitHubRepoAction(projectId);
    setLoading(false);
    setShowSettings(false);
  };

  const copyToClipboard = (text: string, setCopied: any) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const payloadUrl = `https://${typeof window !== 'undefined' ? window.location.host : 'localhost'}/api/webhooks/github?projectId=${projectId}`;

  const modalContent = showSettings ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5" /> GitHub Ayarları
          </h3>
          <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors p-2 bg-slate-50 dark:bg-zinc-800 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!repo ? (
          <div className="max-w-md mx-auto py-8">
            <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6 text-center">
              Projenize GitHub deposunu bağlayarak commit'lerin otomatik senkronize olmasını sağlayın.
            </p>
            <form onSubmit={handleConnect} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Repository URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/kullanici/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 bg-white dark:bg-zinc-950 border-slate-300 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm">
                {loading ? 'Bağlanıyor...' : 'Depoyu Bağla'}
              </button>
              {error && <p className="text-red-500 text-xs text-center mt-2 font-medium bg-red-50 dark:bg-red-900/30 p-2 rounded-lg">{error}</p>}
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Data & Actions */}
            <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <Github className="w-5 h-5" /> {repo.repo_owner}/{repo.repo_name}
              </h4>

              <div className="space-y-5 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Payload URL</label>
                  <div className="flex gap-2 items-center">
                    <input type="text" readOnly value={payloadUrl} className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-zinc-100 font-mono focus:outline-none" />
                    <button onClick={() => copyToClipboard(payloadUrl, setCopiedUrl)} className="p-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors">
                      {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500 dark:text-zinc-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Secret Key</label>
                  <div className="flex gap-2 items-center">
                    <input type="text" readOnly value={repo.webhook_secret} className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-zinc-100 font-mono focus:outline-none" />
                    <button onClick={() => copyToClipboard(repo.webhook_secret, setCopiedSecret)} className="p-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors">
                      {copiedSecret ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500 dark:text-zinc-400" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button onClick={handleRemove} disabled={loading} className="w-full py-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" /> Bağlantıyı Kes
                </button>
              </div>
            </div>

            {/* Right Column: Setup Guide */}
            <div className="bg-slate-100 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700/60 p-5 rounded-xl h-full flex flex-col">
              <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
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
                <p className="text-slate-600 dark:text-zinc-300 mb-2 leading-relaxed text-xs">
                  Projeye ortak olan diğer üyelerin de attığı commit'lerin Steply akışına düşmesi için:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-zinc-300 text-xs">
                  <li>
                    GitHub deponuzdan <strong>Settings &gt; Collaborators</strong> sekmesine gidip arkadaşlarınızı ekleyin.
                  </li>
                  <li>
                    Ekip üyelerinizin <strong>Steply e-postaları</strong> ile bilgisayarlarındaki <strong>Git e-postasının</strong> (<code>git config user.email</code>) aynı olduğundan emin olun.
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

  return (
    <div className="rounded-3xl p-6 md:p-8 shadow-sm mb-6 relative w-full col-span-full max-h-[360px] h-[360px] flex flex-col overflow-hidden" style={{ background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.55)' }}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 mb-4 shrink-0">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
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
          <p className="text-sm text-slate-500 mb-2">Henüz GitHub bağlanmadı.</p>
          {isTeamMember && (
            <button onClick={() => setShowSettings(true)} className="text-xs font-bold text-indigo-600 hover:underline">
              Depo Bağla
            </button>
          )}
        </div>
      ) : (
        commits.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500">Henüz commit bulunmuyor.</p>
            <p className="text-xs text-slate-400 mt-1">Webhook bağlandığında push edilen commitler burada görünecek.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-indigo-100 ml-3 flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {commits.map((commit: any) => (
              <div key={commit.id} className="relative pl-8">
                <span className="absolute -left-[11px] top-3 w-5 h-5 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center overflow-hidden z-10">
                  {commit.author_avatar ? (
                    <img src={commit.author_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Github className="w-3 h-3 text-indigo-400" />
                  )}
                </span>
                <div className="flex flex-col bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/50 rounded-xl p-3 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">{new Date(commit.pushed_at).toLocaleString('tr-TR')}</span>
                  <p className="text-sm text-slate-700 font-medium mt-1 break-words">{commit.commit_message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-slate-500">{commit.author_name}</span>
                    <a href={commit.commit_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline font-mono">
                      {commit.commit_hash.substring(0, 7)}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {mounted && typeof document !== 'undefined' && modalContent ? createPortal(modalContent, document.body) : null}
    </div>
  );
}
