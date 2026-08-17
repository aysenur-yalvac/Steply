const fs = require('fs');

// 1. Update Migration
let migration = fs.readFileSync('supabase/migrations/20260817093200_add_github_webhooks.sql', 'utf8');
migration = migration.replace(
  'project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,',
  'project_id uuid NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,'
);
fs.writeFileSync('supabase/migrations/20260817093200_add_github_webhooks.sql', migration, 'utf8');
console.log('Updated migration.');

// 2. Add decode function to ActivityTimeline.tsx
let timeline = fs.readFileSync('src/components/projects/ActivityTimeline.tsx', 'utf8');

const decodeFunc = `
// Helper to fix UTF-8 Mojibake from old database entries
function decodeCorruptedText(text: string) {
  if (!text) return text;
  return text
    .replace(/y\\xC3\\xBCklendi/g, 'yüklendi')
    .replace(/y\\xef\\xbf\\xbdklendi/g, 'yüklendi')
    .replace(/G\\xC3\\xB6rev/g, 'Görev')
    .replace(/G\\xef\\xbf\\xbdrev/g, 'Görev')
    .replace(/g\\xC3\\xB6rev/g, 'görev')
    .replace(/g\\xef\\xbf\\xbdrev/g, 'görev')
    .replace(/de\\xC4\\x9Ferlendirme/g, 'değerlendirme')
    .replace(/de\\xef\\xbf\\xbd/g, 'değ')
    .replace(/Ã¼/g, 'ü')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã§/g, 'ç')
    .replace(/ÃŸ/g, 'ş')
    .replace(/Ä±/g, 'ı')
    .replace(/ÄŸ/g, 'ğ')
    .replace(/Ã\\x9C/g, 'Ü')
    .replace(/Ã\\x96/g, 'Ö')
    .replace(/Ã\\x87/g, 'Ç')
    .replace(/Å\\x9E/g, 'Ş')
    .replace(/Ä\\xB0/g, 'İ')
    .replace(/Ä\\x9E/g, 'Ğ');
}
`;

if (!timeline.includes('decodeCorruptedText')) {
  timeline = timeline.replace(
    'export default function ActivityTimeline({ activities }: { activities: any[] }) {',
    `${decodeFunc}\nexport default function ActivityTimeline({ activities }: { activities: any[] }) {`
  );

  timeline = timeline.replace(
    /\{activity.action_details\}/g,
    '{decodeCorruptedText(activity.action_details)}'
  );
  
  timeline = timeline.replace(
    /\{activity.user_name\}/g,
    '{decodeCorruptedText(activity.user_name)}'
  );

  fs.writeFileSync('src/components/projects/ActivityTimeline.tsx', timeline, 'utf8');
  console.log('Updated ActivityTimeline.tsx.');
} else {
  console.log('ActivityTimeline already has decode function.');
}

