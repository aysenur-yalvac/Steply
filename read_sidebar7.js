const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Get the full NavContent function to understand collapsed + popover
const ncIdx = content.indexOf('function NavContent');
// Find collapsed useEffect or check if there's one
const collapsedEffect = content.indexOf('collapsed', ncIdx);
console.log('collapsed first ref:', collapsedEffect);
// Check for useEffect with collapsed
const effects = [];
let idx = 0;
while ((idx = content.indexOf('useEffect', idx)) !== -1) {
  effects.push(idx);
  idx++;
}
effects.forEach(e => {
  const snippet = content.substring(e, e+200);
  if (snippet.includes('collapsed') || snippet.includes('isAccountMenu')) {
    console.log('\n--- useEffect snippet ---');
    console.log(snippet);
  }
});
// Also check the footer trigger button
const footerIdx = content.indexOf('footer') >= 0 ? content.indexOf('footer') : content.indexOf('ChevronsUpDown');
console.log('\n--- Footer trigger ---');
console.log(content.substring(footerIdx, footerIdx + 500));
