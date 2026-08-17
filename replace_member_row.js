const fs = require('fs');
let content = fs.readFileSync('src/components/projects/ProjectEditableContent.tsx', 'utf8');

const regex = /function MemberRow\(\{ member, roleLabel, roleColor, onRemove \}: \{[\s\S]*?\}\) \{[\s\S]*?return \([\s\S]*?\);\n\}/;

const newMemberRow = `function MemberRow({ member, roleLabel, roleColor, onRemove, onLeave }: {
  member: { id: string; full_name: string; avatar_url?: string | null };
  roleLabel: string;
  roleColor?: string;
  onRemove?: () => void;
  onLeave?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors group">
      <Avatar src={member.avatar_url} name={member.full_name} size="sm" />
      <div className="flex-1 min-w-0 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 truncate">{member.full_name}</p>
        <p className={\`text-xs font-medium \${roleColor ?? "text-slate-400 dark:text-zinc-500"}\`}>{roleLabel}</p>
      </div>
      {onLeave && (
        <button
          onClick={onLeave}
          title="Projeden Ayrıl"
          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-3 py-1.5 rounded-lg text-xs font-medium border border-rose-200/60 dark:border-rose-900/50 transition-colors flex items-center gap-1.5 ml-2 shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" /> Ayrıl
        </button>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          title="Kaldır"
          className="p-1 text-slate-300 hover:text-red-400 transition-colors rounded-lg ml-2 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}`;

content = content.replace(regex, newMemberRow);
fs.writeFileSync('src/components/projects/ProjectEditableContent.tsx', content, 'utf8');

console.log("MemberRow updated");
