const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /\{inviteTab === 'link' && \(\(\) => \{[\s\S]*?\}\)\(\)\}/;

const replacement = `{inviteTab === 'link' && (() => {
  // İstemci tarafında Origin ve Token tespiti
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  // invite_token yoksa proje ID'sini kullan (Hiçbir zaman boş kalmaz)
  const activeToken = project?.invite_token || project?.id;
  const inviteUrl = activeToken ? \`\${origin}/join/\${activeToken}\` : '';

  return (
    <div className="space-y-4 mt-4">
      <label className="text-xs font-medium text-slate-400">Proje Davet Bağlantısı</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={inviteUrl || "Bağlantı oluşturulamadı"}
          className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 select-all focus:outline-none"
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

if(regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Replaced link tab content with fallback');
} else {
  console.log('Could not find the inviteTab link block');
}
