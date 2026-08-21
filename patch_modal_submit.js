const fs = require("fs");
let modal = fs.readFileSync("src/components/assignments/CreateAssignmentModal.tsx", "utf8");

const oldSubmit = `  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      setError("Baslik ve Son Teslim Tarihi zorunludur.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // datetime-local returns YYYY-MM-DDTHH:mm, we need to convert to ISO string
    const isoDate = new Date(dueDate).toISOString();
    
    const res = await createAssignmentAction(title, description, isoDate, courseName);
    setLoading(false);
    
    if ("error" in res) {
      setError(res.error);
    } else {
      onClose();
      router.refresh();
    }
  }`;

const newSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      setError("Baslik ve Son Teslim Tarihi zorunludur.");
      return;
    }

    setLoading(true);
    setError(null);
    
    const isoDate = new Date(dueDate).toISOString();

    const res = await createAssignmentAction({
      title,
      description,
      course_name: courseName,
      due_date: isoDate,
    });

    setLoading(false);

    if (res.success) {
      onClose();
      router.refresh();
    } else {
      setError(res.error || 'Odev olusturulamadi.');
    }
  };`;

modal = modal.replace(oldSubmit, newSubmit);
fs.writeFileSync("src/components/assignments/CreateAssignmentModal.tsx", modal, "utf8");
console.log("Updated CreateAssignmentModal.tsx");
