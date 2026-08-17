
'use client';

import { useState } from 'react';
import { connectGitHubRepoAction, removeGitHubRepoAction } from '@/lib/actions';
import { Github, Check, Copy, Trash2, GitCommit, Settings, X } from 'lucide-react';

export function GitHubIntegrationCard({ projectId, repo, commits, isTeamMember }: { projectId: string, repo: any, commits: any[], isTeamMember: boolean }) {
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="rounded-3xl p-6 md:p-8 shadow-sm mb-6 relative" style={{ background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.55)' }}>
      <div className="flex justify-between items-center mb-6">
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
          <p className="text-sm text-slate-500 mb-2">Henüz GitHub baglanmadi.</p>
          {isTeamMember && (
            <button onClick={() => setShowSettings(true)} className="text-xs font-bold text-indigo-600 hover:underline">
              Depo Bagla
            </button>
          )}
        </div>
      ) : (
        commits.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500">Henüz commit bulunmuyor.</p>
            <p className="text-xs text-slate-400 mt-1">Webhook baglandiginda push edilen commitler burada görünecek.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-indigo-100 ml-3 space-y-6">
            {commits.map((commit: any) => (
              <div key={commit.id} className="relative pl-6">
                <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center overflow-hidden">
                  {commit.author_avatar ? (
                    <img src={commit.author_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Github className="w-3 h-3 text-indigo-400" />
                  )}
                </span>
                <div className="flex flex-col">
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">GitHub Ayarlari</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {!repo ? (
                <>
                  <p className="text-sm text-slate-500 mb-4">Projenize GitHub deposunu baglayarak commit'lerin otomatik senkronize olmasini saglayin.</p>
                  <form onSubmit={handleConnect} className="flex flex-col gap-3">
                    <input
                      type="url"
                      placeholder="https://github.com/kullanici/repo"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border text-slate-900 placeholder:text-slate-400 bg-white border-slate-300 dark:text-slate-100 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button type="submit" disabled={loading} className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 disabled:opacity-50">
                      {loading ? 'Baglaniyor...' : 'Bagla'}
                    </button>
                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                  </form>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <Github className="w-4 h-4" /> {repo.repo_owner}/{repo.repo_name}
                    </h4>
                    <button onClick={handleRemove} disabled={loading} className="text-xs text-red-500 font-semibold hover:underline">
                      Baglantiyi Kes
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h5 className="text-xs font-bold text-slate-800 mb-2">Webhook Kurulum Rehberi</h5>
                    <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 mb-4">
                      <li>GitHub deponuzda <strong>Settings &gt; Webhooks &gt; Add webhook</strong> kismine gidin.</li>
                      <li>Asagidaki Payload URL'yi ve Secret'i kopyalayip yapistirin.</li>
                      <li>Content type olarak <strong>application/json</strong> secin.</li>
                    </ol>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Payload URL</label>
                        <div className="flex gap-2 items-center mt-1">
                          <input type="text" readOnly value={payloadUrl} className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 font-mono" />
                          <button onClick={() => copyToClipboard(payloadUrl, setCopiedUrl)} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                            {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Secret</label>
                        <div className="flex gap-2 items-center mt-1">
                          <input type="text" readOnly value={repo.webhook_secret} className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 font-mono" />
                          <button onClick={() => copyToClipboard(repo.webhook_secret, setCopiedSecret)} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                            {copiedSecret ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
