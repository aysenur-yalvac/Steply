const fs = require('fs');
let content = fs.readFileSync('src/components/ui/animated-project-cards.tsx', 'utf8');

const confettiHtml = /import\("canvas-confetti"\)\.then\(\(m\) =>[\s\S]*?m\.default\(\{[\s\S]*?\}\)[\s\S]*?\);/;

content = content.replace(confettiHtml, '');

fs.writeFileSync('src/components/ui/animated-project-cards.tsx', content, 'utf8');
console.log("Removed confetti from animated cards");
