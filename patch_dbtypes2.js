const fs = require("fs");
let content = fs.readFileSync("src/lib/database.types.ts", "utf8");

// The file uses CRLF (\r\n). We need to add fields to each of Row/Insert/Update.
// Strategy: find the email field in profiles Row and insert new fields after it.

// Row block
content = content.replace(
  "email: string | null\r\n        }\r\n        Insert: {",
  "email: string | null\r\n          teacher_status: 'unverified' | 'pending' | 'verified' | null\r\n          institution_code: string | null\r\n          verification_doc_url: string | null\r\n        }\r\n        Insert: {"
);

// Insert block
content = content.replace(
  "email?: string | null\r\n        }\r\n        Update: {",
  "email?: string | null\r\n          teacher_status?: 'unverified' | 'pending' | 'verified' | null\r\n          institution_code?: string | null\r\n          verification_doc_url?: string | null\r\n        }\r\n        Update: {"
);

// Update block (followed by projects or end of profiles object)
content = content.replace(
  "email?: string | null\r\n        }\r\n      }\r\n      projects:",
  "email?: string | null\r\n          teacher_status?: 'unverified' | 'pending' | 'verified' | null\r\n          institution_code?: string | null\r\n          verification_doc_url?: string | null\r\n        }\r\n      }\r\n      projects:"
);

fs.writeFileSync("src/lib/database.types.ts", content, "utf8");
console.log("Updated:", content.includes("teacher_status"));
