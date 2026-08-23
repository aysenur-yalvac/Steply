const fs = require('fs');
const content = fs.readFileSync('src/components/ui/animated-characters-login-page.tsx', 'utf8');

// Let's search for the actual anchor
const idx = content.indexOf('const isLogin = mode');
if (idx >= 0) {
  console.log('Found at index:', idx);
  console.log('Snippet:\n' + content.substring(idx, idx+100));
} else {
  console.log('NOT FOUND');
}

const idx2 = content.indexOf('onMouseLeave={() => setHovSocial');
if (idx2 >= 0) {
  console.log('\nFound setHovSocial at index:', idx2);
  console.log('Snippet:\n' + content.substring(idx2, idx2+200));
} else {
  console.log('\nsetHovSocial NOT FOUND');
}
