const fs = require('fs');

let content = fs.readFileSync('src/components/projects/GitHubIntegrationCard.tsx', 'utf8');

const regex = /\{githubLink \? \(\s*<a href=\{githubLink\}/;

const newContent = `
  const formattedGithubLink = githubLink && !githubLink.startsWith('http') 
    ? \`https://github.com/\${githubLink}\` 
    : githubLink;

  if (!isTeamMember) {
    return (
      <div className="rounded-3xl p-6 shadow-sm mb-6 w-full col-span-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Github className="w-5 h-5 text-indigo-500" /> GitHub Bağlantısı
        </h3>
        {formattedGithubLink ? (
          <a href={formattedGithubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-4 py-2 rounded-xl transition-colors">
            <Github className="w-4 h-4" /> Repo'yu Görüntüle
          </a>
`;

// I will just replace the whole early return block to be sure
const blockRegex = /if \(\!isTeamMember\) \{[\s\S]*?\}\s*return \(/;

const newBlock = `const formattedGithubLink = githubLink && !githubLink.startsWith('http') 
    ? \`https://github.com/\${githubLink}\` 
    : githubLink;

  if (!isTeamMember) {
    return (
      <div className="rounded-3xl p-6 shadow-sm mb-6 w-full col-span-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Github className="w-5 h-5 text-indigo-500" /> GitHub Bağlantısı
        </h3>
        {formattedGithubLink ? (
          <a href={formattedGithubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-4 py-2 rounded-xl transition-colors">
            <Github className="w-4 h-4" /> Repo'yu Görüntüle
          </a>
        ) : (
          <p className="text-sm text-slate-500 dark:text-zinc-400">Bu proje sahibi henüz bir GitHub profili bağlamadı.</p>
        )}
      </div>
    );
  }

  return (`;

content = content.replace(blockRegex, newBlock);
fs.writeFileSync('src/components/projects/GitHubIntegrationCard.tsx', content, 'utf8');

console.log("Updated GitHubIntegrationCard.tsx URL formatting");
