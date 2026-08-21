const fs = require("fs");
let client = fs.readFileSync("src/components/assignments/TrashAssignmentListClient.tsx", "utf8");

// Add isProcessing state
client = client.replace(
  'const [selectedIds, setSelectedIds] = useState<string[]>([]);',
  'const [selectedIds, setSelectedIds] = useState<string[]>([]);\n  const [isProcessing, setIsProcessing] = useState(false);'
);

// handleRestore
client = client.replace(
  /const handleRestore = async \(id: string\) => {[\s\S]*?};/,
  `const handleRestore = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await restoreAssignmentAction(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Geri yukleme basarisiz: " + res.error);
      }
    } catch (err: any) {
      alert("Beklenmeyen Hata: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };`
);

// handlePermDelete
client = client.replace(
  /const handlePermDelete = async \(id: string\) => {[\s\S]*?};/,
  `const handlePermDelete = async (id: string) => {
    if (!confirm("Bu odevi kalici olarak silmek istediginize emin misiniz? Bu islem geri alinamaz!")) return;
    setIsProcessing(true);
    try {
      const res = await permanentlyDeleteAssignmentAction(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Silme basarisiz: " + res.error);
      }
    } catch (err: any) {
      alert("Beklenmeyen Hata: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };`
);

// handleBulkRestore
client = client.replace(
  /const handleBulkRestore = async \(\) => {[\s\S]*?};/,
  `const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(\`\${selectedIds.length} adet odevi geri yuklemek istediginize emin misiniz?\`)) return;
    
    setIsProcessing(true);
    try {
      const res = await bulkRestoreAssignmentsAction(selectedIds);
      if (res.success) {
        setSelectedIds([]);
        router.refresh();
      } else {
        alert("Geri yukleme basarisiz: " + res.error);
      }
    } catch (err: any) {
      alert("Beklenmeyen Hata: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };`
);

// handleBulkDelete
client = client.replace(
  /const handleBulkDelete = async \(\) => {[\s\S]*?};/,
  `const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(\`Secilen \${selectedIds.length} adet odev kalici olarak silinecek! Bu islem geri alinamaz.\`)) return;
    
    setIsProcessing(true);
    try {
      const res = await bulkPermanentDeleteAssignmentsAction(selectedIds);
      if (res.success) {
        setSelectedIds([]);
        router.refresh();
      } else {
        alert("KALICI SILME HATASI: " + res.error);
      }
    } catch (err: any) {
      alert("Beklenmeyen Hata: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };`
);

// Disable buttons when isProcessing
client = client.replace(
  /<button\s+onClick=\{handleBulkRestore\}/g,
  '<button onClick={handleBulkRestore} disabled={isProcessing}'
);
client = client.replace(
  /<button\s+onClick=\{handleBulkDelete\}/g,
  '<button onClick={handleBulkDelete} disabled={isProcessing}'
);
client = client.replace(
  /<button\s+onClick=\{\(\) => handleRestore\(assignment\.id\)\}/g,
  '<button onClick={() => handleRestore(assignment.id)} disabled={isProcessing}'
);
client = client.replace(
  /<button\s+onClick=\{\(\) => handlePermDelete\(assignment\.id\)\}/g,
  '<button onClick={() => handlePermDelete(assignment.id)} disabled={isProcessing}'
);
// Also add visual feedback to disabled buttons (opacity-50 cursor-not-allowed)
client = client.replace(/transition-all/g, 'transition-all disabled:opacity-50 disabled:cursor-not-allowed');

fs.writeFileSync("src/components/assignments/TrashAssignmentListClient.tsx", client, "utf8");
console.log("Updated TrashAssignmentListClient with isProcessing");
