const fs = require("fs");
let client = fs.readFileSync("src/components/assignments/AssignmentListClient.tsx", "utf8");

const oldDelete = `  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm("Bu odevi silmek istediginize emin misiniz? (Cop kutusuna tasinacaktir)")) return;
    
    // Optimistic Update
    setAssignmentsList(prev => prev.filter(item => item.id !== id));

    const res = await softDeleteAssignmentAction(id);
    if (!res.success) {
      alert("Silme basarisiz: " + res.error);
      router.refresh();
    } else {
      router.refresh();
    }
  };`;

const newDelete = `  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm('Bu odev cop kutusuna tasinsin mi?')) return;

    const res = await softDeleteAssignmentAction(id);
    
    if (!res.success) {
      alert(\`SILME BASARISIZ (DB HATASI): \${res.error}\`);
      router.refresh();
    } else {
      setAssignmentsList(prev => prev.filter(item => item.id !== id));
      router.refresh();
    }
  };`;

client = client.replace(oldDelete, newDelete);
fs.writeFileSync("src/components/assignments/AssignmentListClient.tsx", client, "utf8");
console.log("Updated AssignmentListClient.tsx");
