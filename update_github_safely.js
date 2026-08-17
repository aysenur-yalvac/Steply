const fs = require('fs');
let content = fs.readFileSync('src/components/projects/GitHubIntegrationCard.tsx', 'utf8');

const regex = /if \(\!isTeamMember\) \{[\s\S]*?return \([\s\S]*?\{githubLink \? \(\s*<a href=\{githubLink\}/;

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
          <a href={formattedGithubLink}`;

content = content.replace(regex, newBlock);
fs.writeFileSync('src/components/projects/GitHubIntegrationCard.tsx', content, 'utf8');

console.log("Updated GitHubIntegrationCard.tsx safely");
