const fs = require('fs');
let content = fs.readFileSync('src/components/projects/GitHubIntegrationCard.tsx', 'utf8');

const regex = /export function GitHubIntegrationCard\(\{\s*projectId,\s*repo,\s*commits,\s*isTeamMember\s*\}\:\s*\{\s*projectId\:\s*string,\s*repo\:\s*any,\s*commits\:\s*any\[\],\s*isTeamMember\:\s*boolean\s*\}\)\s*\{/;

const newSignature = `export function GitHubIntegrationCard({ projectId, repo, commits, isTeamMember, githubLink }: { projectId: string, repo: any, commits: any[], isTeamMember: boolean, githubLink?: string | null }) {`;

content = content.replace(regex, newSignature);

const earlyReturn = `  if (!isTeamMember) {
    return (
      <div className="rounded-3xl p-6 shadow-sm mb-6 w-full col-span-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Github className="w-5 h-5 text-indigo-500" /> GitHub Bağlantısı
        </h3>
        {githubLink ? (
          <a href={githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-4 py-2 rounded-xl transition-colors">
            <Github className="w-4 h-4" /> Repo'yu Görüntüle
          </a>
        ) : (
          <p className="text-sm text-slate-500 dark:text-zinc-400">Bu proje sahibi henüz bir GitHub profili bağlamadı.</p>
        )}
      </div>
    );
  }`;

// Find the return of the component (first `return (` after `modalContent = showSettings ? ( ... )`)
// Instead, I'll put it right after `useEffect(() => { setMounted(true); }, []);`

const insertionPoint = `useEffect(() => {
    setMounted(true);
  }, []);`;

content = content.replace(insertionPoint, insertionPoint + '\n\n' + earlyReturn);

fs.writeFileSync('src/components/projects/GitHubIntegrationCard.tsx', content, 'utf8');

console.log("Updated GitHubIntegrationCard.tsx");
