const fs = require('fs');
let content = fs.readFileSync('src/lib/database.types.ts', 'utf8');

if (!content.includes('deleted_at: string | null')) {
  // Add to projects Row
  content = content.replace(/team_members: Json\s*created_at: string/, 'team_members: Json\n          created_at: string\n          deleted_at: string | null');
  // Add to projects Insert
  content = content.replace(/team_members\?: Json\s*created_at\?: string/, 'team_members?: Json\n          created_at?: string\n          deleted_at?: string | null');
  // Add to projects Update
  content = content.replace(/team_members\?: Json\s*created_at\?: string/, 'team_members?: Json\n          created_at?: string\n          deleted_at?: string | null');
  fs.writeFileSync('src/lib/database.types.ts', content, 'utf8');
  console.log('Added deleted_at to database.types.ts');
} else {
  console.log('Already exists');
}
