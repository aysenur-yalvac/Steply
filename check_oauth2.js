const fs = require('fs');
const content = fs.readFileSync('src/components/ui/animated-characters-login-page.tsx', 'utf8');
const lines = content.split('\n');

// Find the SOCIAL.map block
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('SOCIAL.map')) {
    for (let j = i; j < Math.min(i+25, lines.length); j++) {
      console.log(`${j+1}: ${lines[j]}`);
    }
    break;
  }
}
