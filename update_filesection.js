const fs = require('fs');
let content = fs.readFileSync('src/components/projects/FileSection.tsx', 'utf8');

// 1. Imports
content = content.replace(
  `import { saveFileRecordAction, softDeleteFileAction, ProjectFile } from '@/lib/actions';`,
  `import { saveFileRecordAction, softDeleteFileAction, ProjectFile, FileVisibility } from '@/lib/actions';`
);

// 2. Props and State
content = content.replace(
  `const [makePrivate, setMakePrivate] = useState(false);`,
  `const [fileVisibility, setFileVisibility] = useState<FileVisibility>('MEMBERS_ONLY');`
);

content = content.replace(
  `export default function FileSection({ projectId, initialFiles, isOwner, isCollaborator = false }: FileSectionProps) {`,
  `export default function FileSection({ projectId, initialFiles, isOwner, isCollaborator = false, currentUserId }: FileSectionProps & { currentUserId?: string }) {`
);

// 3. handleFileChange using fileVisibility instead of makePrivate
// `const { error } = await saveFileRecordAction(projectId, file.name, publicUrl, file.size, file.type, makePrivate);`
content = content.replace(
  /const \{ error \} \= await saveFileRecordAction\(projectId, file\.name, publicUrl, file\.size, file\.type, makePrivate\);/,
  `const { error } = await saveFileRecordAction(projectId, file.name, publicUrl, file.size, file.type, fileVisibility);`
);

// Optimistic update also needs to match FileVisibility
content = content.replace(
  `isPrivate: makePrivate,`,
  `visibility: fileVisibility,\n      uploaderId: currentUserId,\n      isPrivate: fileVisibility !== 'PUBLIC',`
);

// 4. UI for visibility
const oldUI = `<label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={makePrivate}
                onChange={(e) => setMakePrivate(e.target.checked)}
                className="rounded border-slate-300 accent-[#7C3AFF] cursor-pointer"
              />
              <Lock className="w-3 h-3 text-slate-400" />
              Private
            </label>`;

const newUI = `<div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              <select
                value={fileVisibility}
                onChange={(e) => setFileVisibility(e.target.value as FileVisibility)}
                className="bg-white border border-slate-200 text-slate-600 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer w-full sm:w-[220px]"
              >
                <option value="PUBLIC">🌐 Herkese Açık</option>
                <option value="MEMBERS_ONLY">👥 Sadece Ekip Üyeleri</option>
                <option value="ONLY_ME">🔒 Sadece Bana Özel</option>
              </select>
            </div>`;

content = content.replace(oldUI, newUI);

// 5. Update filtering logic for visibleFiles
const oldVisibleFiles = `const visibleFiles = optimisticFiles.filter(file => !file.isPrivate || canManageFiles);`;

const newVisibleFiles = `const visibleFiles = optimisticFiles.filter(file => {
    const isUploader = file.uploaderId === currentUserId;
    const isMember = canManageFiles;

    if (isUploader) return true;
    if (file.visibility === 'ONLY_ME') return false;
    if (isMember) return true;
    return file.visibility === 'PUBLIC' || file.isPrivate === false;
  });`;

content = content.replace(oldVisibleFiles, newVisibleFiles);

fs.writeFileSync('src/components/projects/FileSection.tsx', content, 'utf8');
console.log("Updated FileSection.tsx");
