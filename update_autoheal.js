const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// Import the action
if (!content.includes('generateProjectInviteAction')) {
  content = content.replace(
    /import \{ updateProjectDetails, searchProfilesAction, toggleProjectPrivacyAction, addProjectMemberAction, removeProjectMemberAction \} from "@\/app\/dashboard\/actions";/,
    `import { updateProjectDetails, searchProfilesAction, toggleProjectPrivacyAction, addProjectMemberAction, removeProjectMemberAction, generateProjectInviteAction } from "@/app/dashboard/actions";`
  );
}

// Add state for invite data
content = content.replace(
  /const \[copied, setCopied\] = useState\(false\);/,
  `const [copied, setCopied] = useState(false);\n  const [inviteData, setInviteData] = useState({ code: project.invite_code || null, token: project.invite_token || null });\n\n  useEffect(() => {\n    if (isOwner && (!inviteData.code || !inviteData.token)) {\n      generateProjectInviteAction(project.id).then(res => {\n        if ('success' in res && res.success) {\n          setInviteData({ code: res.invite_code, token: res.invite_token });\n        }\n      });\n    }\n  }, [isOwner, project.id, inviteData.code, inviteData.token]);`
);

// Update URLs and codes to use inviteData instead of project.invite_token
content = content.replace(
  /project\.invite_token/g,
  `inviteData.token`
);
content = content.replace(
  /project\.invite_code/g,
  `inviteData.code`
);

// Prevent undefined URL in copy
content = content.replace(
  /onClick=\{\(\) => handleCopy\(`\$\{typeof window !== "undefined" \? window\.location\.origin : ""\}\/join\/\$\{inviteData\.token\}`\)\}/g,
  `onClick={() => {\n                        if (!inviteData.token) {\n                          toast.error("Davet bağlantısı hazırlanıyor, lütfen tekrar deneyin.");\n                          return;\n                        }\n                        handleCopy(\`\${typeof window !== "undefined" ? window.location.origin : ""}/join/\${inviteData.token}\`);\n                      }}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Added auto-healing for invite codes in ProjectEditableContent.tsx');
