const fs = require('fs');
let content = fs.readFileSync('src/lib/actions.ts', 'utf8');

const regex = /export type ProjectFile = \{[\s\S]*?\};/;
const match = content.match(regex);
if (match) {
    console.log(match[0]);
    const newType = `export type FileVisibility = 'PUBLIC' | 'MEMBERS_ONLY' | 'ONLY_ME';

export type ProjectFile = {
  id?: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploaded_at: string;
  visibility?: FileVisibility;
  uploaderId?: string;
  isPrivate?: boolean; // legacy
};`;
    content = content.replace(match[0], newType);
    fs.writeFileSync('src/lib/actions.ts', content, 'utf8');
    console.log("Replaced ProjectFile type");
} else {
    console.log("Could not find ProjectFile type.");
}
