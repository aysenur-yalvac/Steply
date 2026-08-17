const fs = require('fs');

let content = fs.readFileSync('src/components/projects/ProjectEditableContent.tsx', 'utf8');

// 1. Add LogOut to imports if missing
if (!content.includes('LogOut')) {
    content = content.replace(/import \{([^}]+)\} from "lucide-react";/, (match, p1) => {
        return `import {${p1}, LogOut, AlertTriangle} from "lucide-react";`;
    });
}

// 2. Modify MemberRow
const oldMemberRow = `function MemberRow({ member, roleLabel, roleColor, onRemove }: {
  member: { id: string; full_name: string; avatar_url?: string | null };
  roleLabel: string;
  roleColor?: string;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50/50 rounded-xl transition-colors group">
      <Avatar src={member.avatar_url} name={member.full_name} size="sm" />
      <div className="flex-1 min-w-0 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800 truncate">{member.full_name}</p>
        <p className={\`text-xs font-medium \${roleColor ?? "text-slate-400"}\`}>{roleLabel}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          title="Remove"
          className="p-1 text-slate-300 hover:text-red-400 transition-colors rounded-lg"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}`;

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
          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-3 py-1.5 rounded-lg text-xs font-medium border border-rose-200/60 dark:border-rose-900/50 transition-colors flex items-center gap-1.5 ml-2"
        >
          <LogOut className="w-3.5 h-3.5" /> Ayrıl
        </button>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          title="Remove"
          className="p-1 text-slate-300 hover:text-red-400 transition-colors rounded-lg ml-2"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}`;

content = content.replace(oldMemberRow, newMemberRow);

// 3. Add states for modal inside ProjectEditableContent
const stateMarker = `  const [memberPending,   setMemberPending]   = useState(false);`;
const newStates = `  const [memberPending,   setMemberPending]   = useState(false);
  const [showLeaveModal,  setShowLeaveModal]  = useState(false);
  const [isLeaving,       setIsLeaving]       = useState(false);`;

content = content.replace(stateMarker, newStates);

// 4. Add handleLeaveProject function
const funcMarker = `  const removeMember = async (id: string) => {`;
const newFunc = `  const handleLeaveProject = async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    const result = await removeProjectMemberAction(project.id, currentUserId);
    if ("error" in result) {
      toast.error(\`Ayrılma işlemi başarısız: \${result.error}\`);
      setIsLeaving(false);
      setShowLeaveModal(false);
    } else {
      toast.success("Projeden başarıyla ayrıldınız");
      router.push('/dashboard');
    }
  };

  const removeMember = async (id: string) => {`;

content = content.replace(funcMarker, newFunc);

// 5. Update teamMembers.map to pass onLeave
const oldMap = `{teamMembers.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              roleLabel={m.role ? (m.role.charAt(0).toUpperCase() + m.role.slice(1)) : "Member"}
              onRemove={isOwner ? () => removeMember(m.id) : undefined}
            />
          ))}`;
          
const newMap = `{teamMembers.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              roleLabel={m.role ? (m.role.charAt(0).toUpperCase() + m.role.slice(1)) : "Member"}
              onRemove={isOwner && m.id !== currentUserId ? () => removeMember(m.id) : undefined}
              onLeave={!isOwner && m.id === currentUserId ? () => setShowLeaveModal(true) : undefined}
            />
          ))}`;
          
content = content.replace(oldMap, newMap);

// 6. Add modal UI at the end of the component
const oldReturn = `    </>
  );
}`;

const newReturn = `
      {/* Leave Project Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-3 text-rose-600 dark:text-rose-500">
              <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-full">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Projeden Ayrıl</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6 leading-relaxed">
              Bu projeden ayrıldığınızda projedeki görevlere, dosyalara ve sohbet geçmişine erişiminizi kaybedeceksiniz. Emin misiniz?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                disabled={isLeaving}
                className="px-4 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded-xl transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleLeaveProject}
                disabled={isLeaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLeaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isLeaving ? "Ayrılıyor..." : "Evet, Ayrıl"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}`;

content = content.replace(oldReturn, newReturn);

fs.writeFileSync('src/components/projects/ProjectEditableContent.tsx', content, 'utf8');
console.log("Updated ProjectEditableContent.tsx");
