const fs = require('fs');

let content = fs.readFileSync('src/components/projects/GitHubIntegrationCard.tsx', 'utf8');

// Update interface
content = content.replace(
  /export default function GitHubIntegrationCard\(\{\n  projectId,\n  repo,\n  commits,\n  isTeamMember\n\}\: \{\n  projectId\: string;\n  repo\: any;\n  commits\: any\[\];\n  isTeamMember\: boolean;\n\}\) \{/,
  `export default function GitHubIntegrationCard({
  projectId,
  repo,
  commits,
  isTeamMember,
  githubLink
}: {
  projectId: string;
  repo: any;
  commits: any[];
  isTeamMember: boolean;
  githubLink?: string | null;
}) {`
);

// If !isTeamMember, completely replace the render.
// The render looks like:
/*
  return (
    <div className="rounded-3xl p-6 md:p-8 shadow-sm mb-6 relative w-full col-span-full max-h-[420px] h-[420px] flex flex-col overflow-hidden" style={{ background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.55)' }}>
      ...
*/

// I'll add an early return for non-team members before the return statement:
const earlyReturn = `  if (!isTeamMember) {
    return (
      <div className="rounded-3xl p-6 shadow-sm mb-6 w-full col-span-full" style={{ background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.55)' }}>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Github className="w-5 h-5" /> GitHub Bağlantısı
        </h3>
        {githubLink ? (
          <a href={githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
            <Github className="w-4 h-4" /> Repo'yu Görüntüle
          </a>
        ) : (
          <p className="text-sm text-slate-500">Bu proje sahibi henüz bir GitHub profili bağlamadı.</p>
        )}
      </div>
    );
  }

  return (`;

content = content.replace('  return (\n    <div className="rounded-3xl p-6 md:p-8 shadow-sm mb-6 relative w-full col-span-full', earlyReturn + '\n    <div className="rounded-3xl p-6 md:p-8 shadow-sm mb-6 relative w-full col-span-full');

fs.writeFileSync('src/components/projects/GitHubIntegrationCard.tsx', content, 'utf8');

console.log("Updated GitHubIntegrationCard.tsx");
