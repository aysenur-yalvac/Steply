const fs = require('fs');

let content = fs.readFileSync('src/lib/actions.ts', 'utf8');

// 1. Update ProjectFile type
const oldType = `export type ProjectFile = {
  id?: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploaded_at: string;
  isPrivate?: boolean;
};`;

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

content = content.replace(oldType, newType);

// 2. Update saveFileRecordAction signature
// The signature: 
/*
export async function saveFileRecordAction(
  projectId: string,
  fileName: string,
  fileUrl: string,
  fileSize: number,
  fileType: string,
  isPrivate: boolean = false
): Promise<{ success: true; file: ProjectFile } | { error: string }> {
*/
// It might be formatted differently. Let's find it with regex.
const saveFileRegex = /export async function saveFileRecordAction\([\s\S]*?\)\s*:\s*Promise<\{ success\: true; file\: ProjectFile \} | \{ error\: string \}> \{/;
const newSignature = `export async function saveFileRecordAction(
  projectId: string,
  fileName: string,
  fileUrl: string,
  fileSize: number,
  fileType: string,
  visibility: FileVisibility = 'MEMBERS_ONLY'
): Promise<{ success: true; file: ProjectFile } | { error: string }> {`;
content = content.replace(saveFileRegex, newSignature);

// Inside saveFileRecordAction, we need to update the object being created:
/*
    const newFile: ProjectFile = {
      id: `${Date.now()}`,
      name: fileName,
      url: publicUrl,
      size: fileSize,
      type: fileType,
      uploaded_at: new Date().toISOString(),
      isPrivate,
    };
*/
// We need to change it to use visibility and user.id
const newFileRegex = /const newFile\: ProjectFile \= \{[\s\S]*?isPrivate,?\s*\};/;
const newNewFile = `const newFile: ProjectFile = {
      id: \`\${Date.now()}\`,
      name: fileName,
      url: publicUrl,
      size: fileSize,
      type: fileType,
      uploaded_at: new Date().toISOString(),
      visibility,
      uploaderId: user.id,
    };`;
content = content.replace(newFileRegex, newNewFile);

fs.writeFileSync('src/lib/actions.ts', content, 'utf8');
console.log("Updated actions.ts");
