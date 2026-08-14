const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// Replace the <button> for non-collapsed subItems with a hybrid: 
// onClick={() => { toggleMenu(label); router.push(href); onClose?.(); }}
// Wait, we need to extract `href` in subItems branch. It's already extracted as `href`!

content = content.replace(
  'onClick={() => toggleMenu(label)} className={`w-full flex items-center justify-between',
  'onClick={(e) => { e.preventDefault(); toggleMenu(label); if(href) { router.push(href); onClose?.(); } }} className={`w-full flex items-center justify-between'
);

content = content.replace(
  'onClick={() => toggleMenu(label)} title={label} className={`w-full flex items-center justify-center',
  'onClick={(e) => { e.preventDefault(); toggleMenu(label); if(href) { router.push(href); onClose?.(); } }} title={label} className={`w-full flex items-center justify-center'
);

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Fixed Sidebar subItems routing');
