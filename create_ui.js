const fs = require('fs');
const content = `
'use client';

import { useState } from 'react';
import { connectGitHubRepoAction, removeGitHubRepoAction } from '@/lib/actions';
import { Github, Check, Copy, Trash2, GitCommit, AlertCircle } from 'lucide-react';

export function GitHubSettings({ projectId, repo }: { projectId: string, repo: any }) {
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
  };

  const copyToClipboard = (text: string, setCopied: any) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!repo) {
    return (
      <div className="rounded-2xl p-6 shadow-sm mb-6" style={{ background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.55)' }}>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Github className="w-5 h-5" /> GitHub Entegrasyonu
        </h3>
        <p className="text-sm text-slate-500 mb-4">Projenize GitHub baglayarak commit'leri otomatik olarak takip edin.</p>
        <form onSubmit={handleConnect} className="flex gap-2">
          <input
            type="url"
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button type="submit" disabled={loading} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 disabled:opacity-50">
            {loading ? 'Baglaniyor...' : 'Bagla'}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>
    );
  }

  const payloadUrl = \`https://\${typeof window !== 'undefined' ? window.location.host : 'localhost'}/api/webhooks/github?projectId=\${projectId}\`;

  return (
    <div className="rounded-2xl p-6 shadow-sm mb-6" style={{ background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.55)' }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Github className="w-5 h-5" /> {repo.repo_owner}/{repo.repo_name}
        </h3>
        <button onClick={handleRemove} disabled={loading} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white/60 p-4 rounded-xl border border-slate-200 mb-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Webhook Kurulum Rehberi</h4>
        <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1 mb-4">
          <li>GitHub reponuzda <strong>Settings {'>'} Webhooks {'>'} Add webhook</strong>'a gidin.</li>
          <li>Asagidaki Payload URL'yi ve Secret'i yapistirin.</li>
          <li>Content type olarak <strong>application/json</strong> secin.</li>
        </ol>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-400">Payload URL</label>
            <div className="flex gap-2 items-center mt-1">
              <input type="text" readOnly value={payloadUrl} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 font-mono" />
              <button onClick={() => copyToClipboard(payloadUrl, setCopiedUrl)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 border border-slate-200">
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400">Secret</label>
            <div className="flex gap-2 items-center mt-1">
              <input type="text" readOnly value={repo.webhook_secret} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 font-mono" />
              <button onClick={() => copyToClipboard(repo.webhook_secret, setCopiedSecret)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 border border-slate-200">
                {copiedSecret ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GitHubTimeline({ commits }: { commits: any[] }) {
  if (!commits || commits.length === 0) return null;

  return (
    <div className="rounded-3xl p-6 md:p-8 shadow-sm mb-6" style={{ background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.55)' }}>
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <GitCommit className="w-4 h-4" /> Son Commit'ler
      </h3>
      <div className="relative border-l-2 border-indigo-100 ml-3 space-y-6">
        {commits.map((commit: any) => (
          <div key={commit.id} className="relative pl-6">
            <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center">
              {commit.author_avatar ? (
                <img src={commit.author_avatar} alt="" className="w-4 h-4 rounded-full" />
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
    </div>
  );
}
`;
fs.writeFileSync('src/components/projects/GitHubIntegrationCard.tsx', content, 'utf8');
console.log("Created UI component");
