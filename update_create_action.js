const fs = require('fs');
let path = 'src/app/dashboard/actions.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const platform = \(formData\.get\("platform"\) as string\) \|\| "General";/,
  `const platform = (formData.get("platform") as string) || "General";\n\n  const invite_code = 'STP-' + Math.random().toString(36).substring(2, 6).toUpperCase();\n  const invite_token = crypto.randomUUID();`
);

content = content.replace(
  /platform,\s*\.\.\.\(tags\.length > 0 \? \{ tags \} : \{\}\),/g,
  `platform,\n    invite_code,\n    invite_token,\n    ...(tags.length > 0 ? { tags } : {}),`
);

content = content.replace(
  /description,\s*progress_percentage,\s*\}\);\s*if \(error2\)/g,
  `description,\n        progress_percentage,\n        invite_code,\n        invite_token,\n      });\n\n      if (error2)`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated createProject to include invite_code and invite_token');
