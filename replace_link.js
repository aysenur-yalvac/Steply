const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// The block to replace:
const blockRegex = /\{inviteTab === 'link' && \([\s\S]*?\}\)\(\)\}\s*<\/div>\s*\)\}/;

const replacement = `{inviteTab === 'link' && (() => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteToken = project?.invite_token;
  const inviteUrl = inviteToken ? \`\${origin}/join/\${inviteToken}\` : '';

  return (
    <div className="space-y-4 mt-4">
      <label className="text-xs font-medium text-slate-400">Proje Davet Bağlantısı</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={inviteUrl || "Bağlantı yükleniyor..."}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 select-all focus:outline-none"
        />
        <button
          type="button"
          disabled={!inviteUrl}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (inviteUrl) {
              navigator.clipboard.writeText(inviteUrl);
              toast.success("Bağlantı panoya kopyalandı!");
            }
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
        >
          Kopyala
        </button>
      </div>
      <p className="text-xs text-slate-500">
        Bu bağlantıya sahip olan herkes projeye doğrudan katılabilir.
      </p>
    </div>
  );
})()}`;

if(blockRegex.test(content)) {
  content = content.replace(blockRegex, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Replaced link tab content');
} else {
  console.log('Could not find the inviteTab link block');
}
