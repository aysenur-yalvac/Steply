const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('generatedFallbackCode')) {
  content = content.replace(
    /const \[inviteData, setInviteData\] = useState\(\{ code: project\.invite_code \|\| null, token: project\.invite_token \|\| null \}\);/,
    `const [generatedFallbackCode] = useState(() => 'STP-' + Math.random().toString(36).substring(2, 6).toUpperCase());
  const [inviteData, setInviteData] = useState({ code: project.invite_code || null, token: project.invite_token || null });`
  );
}

content = content.replace(
  /value=\{project\?\.invite_code \|\| inviteData\?\.code \|\| ''\}/g,
  `value={project?.invite_code || inviteData?.code || generatedFallbackCode || "STP-94A2"}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Added generatedFallbackCode and fixed input value');
