const fs = require('fs');
const content = fs.readFileSync('src/components/ui/animated-characters-login-page.tsx', 'utf8');

const checks = {
  'use client direktifi': content.startsWith('"use client"'),
  'signInWithOAuth': content.includes('signInWithOAuth'),
  'handleOAuthLogin fonksiyonu': content.includes('handleOAuthLogin'),
  'onClick binding': content.includes('onClick={(e) => handleOAuthLogin(e, s.id)'),
  'type button attribute': content.includes('type="button"'),
  'e.preventDefault': content.includes('e.preventDefault()'),
  'e.stopPropagation': content.includes('e.stopPropagation()'),
  'redirectTo auth/callback': content.includes('/auth/callback'),
  'Google butonu': content.includes('"google"'),
  'GitHub butonu': content.includes('"github"'),
  'LinkedIn KALINTISI': content.includes('"linkedin"'),
  'Apple KALINTISI': content.includes('"apple"'),
  'grid-cols-2': content.includes('grid-cols-2'),
};

for (const [key, val] of Object.entries(checks)) {
  const icon = val ? '✓' : '✗';
  console.log(`${icon} ${key}: ${val}`);
}
