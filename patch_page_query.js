const fs = require("fs");
let page = fs.readFileSync("src/app/dashboard/assignments/page.tsx", "utf8");

page = page.replace(
  ".select('*, teacher:profiles!assignments_teacher_id_fkey(full_name)')\n    .order('created_at', { ascending: false });",
  ".select('*, teacher:profiles!assignments_teacher_id_fkey(full_name)')\n    .or('is_deleted.eq.false,is_deleted.is.null')\n    .order('created_at', { ascending: false });"
);

fs.writeFileSync("src/app/dashboard/assignments/page.tsx", page, "utf8");
console.log("Updated page.tsx query");
