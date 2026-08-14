const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/trash/files/TrashFilesClient.tsx', 'utf8');

// Replace initialFiles usage with state
content = content.replace(
  'export default function TrashFilesClient({ initialFiles }: { initialFiles: any[] }) {',
  'export default function TrashFilesClient({ initialFiles }: { initialFiles: any[] }) {\n  const [files, setFiles] = useState(initialFiles);'
);

content = content.replace(/initialFiles/g, 'files');
// Restore the prop definition
content = content.replace(
  'export default function TrashFilesClient({ files }: { files: any[] }) {',
  'export default function TrashFilesClient({ initialFiles }: { initialFiles: any[] }) {'
);

const handleActionUpdate = `
  const handleAction = async () => {
    if (!modalState) return;
    setIsProcessing(true);

    // Optimistic UI update
    let keysToRemove: string[] = [];
    if (modalState.isBulk) {
      keysToRemove = selectedKeys;
    } else if (modalState.targetFile) {
      keysToRemove = [\`\${modalState.targetFile.projectId}::\${modalState.targetFile.url}\`];
    }

    setFiles(prev => prev.filter(f => !keysToRemove.includes(\`\${f.projectId}::\${f.url}\`)));
    setModalState(null); // Close modal immediately

    try {
      if (modalState.isBulk) {
        const payload = selectedKeys.map(k => {
          const [projectId, url] = k.split("::");
          return { projectId, url };
        });
        if (modalState.type === "restore") {
          await bulkRestoreFilesAction(payload);
          toast.success("Seçilen dosyalar geri yüklendi!");
        } else {
          await bulkPermanentDeleteFilesAction(payload);
          toast.success("Seçilen dosyalar kalıcı olarak silindi!");
        }
        setSelectedKeys([]);
      } else if (modalState.targetFile) {
        if (modalState.type === "restore") {
          await restoreFileAction(modalState.targetFile.projectId, modalState.targetFile.url);
          toast.success("Dosya geri yüklendi!");
        } else {
          await permanentDeleteFileAction(modalState.targetFile.projectId, modalState.targetFile.url);
          toast.success("Dosya kalıcı olarak silindi!");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu");
    } finally {
      setIsProcessing(false);
    }
  };
`;

content = content.replace(
  /const handleAction = async \(\) => \{[\s\S]*?setIsProcessing\(false\);\s+setModalState\(null\);\s+\}\s+\};/,
  handleActionUpdate
);

fs.writeFileSync('src/app/dashboard/trash/files/TrashFilesClient.tsx', content, 'utf8');
console.log('Optimized TrashFilesClient');
