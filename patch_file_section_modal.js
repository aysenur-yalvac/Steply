const fs = require('fs');
let content = fs.readFileSync('src/components/projects/FileSection.tsx', 'utf8');

// Add state
content = content.replace(
  'const [makePrivate, setMakePrivate] = useState(false);',
  'const [makePrivate, setMakePrivate] = useState(false);\n  const [deleteModalTarget, setDeleteModalTarget] = useState<string | null>(null);\n  const [isDeleting, setIsDeleting] = useState(false);'
);

// Replace handleDelete
const newHandleDelete = `
  const handleDeleteClick = (fileUrl: string) => {
    setDeleteModalTarget(fileUrl);
  };

  const confirmDelete = async () => {
    if (!deleteModalTarget) return;
    setIsDeleting(true);
    const fileUrl = deleteModalTarget;
    // Optimistic UI: anında kaldır
    setFiles(prev => prev.filter(f => f.url !== fileUrl));
    
    try {
      await softDeleteFileAction(projectId, fileUrl);
      toast.success('Dosya çöp kutusuna taşındı.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      toast.error('Dosya silinemedi: ' + errorMessage);
      // Geri al (isteğe bağlı) - şu anlık basit optimistic kalsın
    } finally {
      setIsDeleting(false);
      setDeleteModalTarget(null);
    }
  };
`;

content = content.replace(
  /const handleDelete = async \(fileUrl: string\) => \{[\s\S]*?toast\.error\('Dosya silinemedi: ' \+ errorMessage\);\s+\}\s+\};/,
  newHandleDelete
);

content = content.replace('handleDelete(file.url)', 'handleDeleteClick(file.url)');

// Add modal JSX at the very end of return
const modalJsx = `
      {/* Silme Onay Modalı */}
      {deleteModalTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Dosya Çöp Kutusuna Taşınsın mı?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Bu dosya çöp kutusuna gönderilecek. Dilediğiniz zaman geri yükleyebilirsiniz.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModalTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all flex items-center gap-2 bg-[#7C3AFF] hover:bg-[#682ad4]"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeleting ? "Taşınıyor..." : "Çöp Kutusuna Taşı"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
`;

content = content.replace('</div>\n  );\n}', modalJsx + '\n}');

fs.writeFileSync('src/components/projects/FileSection.tsx', content, 'utf8');
console.log('Patched FileSection Modal');
