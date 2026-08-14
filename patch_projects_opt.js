const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/trash/projects/TrashProjectsClient.tsx', 'utf8');

// Replace initialProjects usage with state
content = content.replace(
  'export default function TrashProjectsClient({ initialProjects, currentUserId }: { initialProjects: any[], currentUserId: string }) {',
  'export default function TrashProjectsClient({ initialProjects, currentUserId }: { initialProjects: any[], currentUserId: string }) {\n  const [projects, setProjects] = useState(initialProjects);'
);

content = content.replace(/initialProjects/g, 'projects');
// Restore the prop definition
content = content.replace(
  'export default function TrashProjectsClient({ projects, currentUserId }: { projects: any[], currentUserId: string }) {',
  'export default function TrashProjectsClient({ initialProjects, currentUserId }: { initialProjects: any[], currentUserId: string }) {'
);

// Implement instant removal in handleAction
const handleActionUpdate = `
  const handleAction = async () => {
    if (!modalState) return;
    setIsProcessing(true);
    
    // Optimistic UI update
    let idsToRemove: string[] = [];
    if (modalState.isBulk) {
      idsToRemove = selectedIds;
    } else if (modalState.targetId) {
      idsToRemove = [modalState.targetId];
    }
    
    setProjects(prev => prev.filter(p => !idsToRemove.includes(p.id)));
    setModalState(null); // Close modal immediately
    
    try {
      if (modalState.isBulk) {
        if (modalState.type === "restore") {
          await bulkRestoreProjectsAction(selectedIds);
          toast.success("Seçilen projeler geri yüklendi!");
        } else {
          await bulkPermanentDeleteProjectsAction(selectedIds);
          toast.success("Seçilen projeler kalıcı olarak silindi!");
        }
        setSelectedIds([]);
      } else if (modalState.targetId) {
        if (modalState.type === "restore") {
          await restoreProjectAction(modalState.targetId);
          toast.success("Proje geri yüklendi!");
        } else {
          await permanentDeleteProjectAction(modalState.targetId);
          toast.success("Proje kalıcı olarak silindi!");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu");
      // Revert optimistic update on error by triggering a server revalidate or just letting the user refresh
    } finally {
      setIsProcessing(false);
    }
  };
`;

content = content.replace(
  /const handleAction = async \(\) => \{[\s\S]*?setIsProcessing\(false\);\s+setModalState\(null\);\s+\}\s+\};/,
  handleActionUpdate
);

fs.writeFileSync('src/app/dashboard/trash/projects/TrashProjectsClient.tsx', content, 'utf8');
console.log('Optimized TrashProjectsClient');
