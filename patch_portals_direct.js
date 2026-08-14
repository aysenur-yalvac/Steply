const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// Wrap both modals with portal manually by direct replacement
// Switch modal
content = content.replace(
  '{/* Switch account confirmation modal */}\r\n      {switchTarget && (',
  '{/* Switch account confirmation modal — portal */}\r\n      {switchTarget && mounted && createPortal('
);
content = content.replace(
  '{/* Switch account confirmation modal */}\n      {switchTarget && (',
  '{/* Switch account confirmation modal — portal */}\n      {switchTarget && mounted && createPortal('
);

// Add document.body right before the closing )} of switch modal
// Find the end of switchTarget modal: it ends before removeTarget
const swStart = content.indexOf('Switch account confirmation modal');
const rmStart = content.indexOf('Remove account confirmation modal');
// Between swStart and rmStart we need to add document.body before the last )}
const swRegion = content.substring(swStart, rmStart);
const lastParen = swRegion.lastIndexOf('      )}\n');
if (lastParen >= 0) {
  const insertAt = swStart + lastParen;
  // Replace the last )} with ),\n          document.body\n        )}
  content = content.substring(0, insertAt) + '      ),\n      document.body\n    )}\n\n      ' + content.substring(insertAt + '      )}\n'.length);
  console.log('Switch modal portal closed');
} else {
  console.log('WARNING: Could not find last paren of switch modal at offset:', lastParen);
}

// Now handle remove modal
content = content.replace(
  '{/* Remove account confirmation modal */}\r\n      {removeTarget && (',
  '{/* Remove account confirmation modal — portal */}\r\n      {removeTarget && mounted && createPortal('
);
content = content.replace(
  '{/* Remove account confirmation modal */}\n      {removeTarget && (',
  '{/* Remove account confirmation modal — portal */}\n      {removeTarget && mounted && createPortal('
);

// Find and close remove modal similarly
const rmStart2 = content.indexOf('Remove account confirmation modal');
const swStart2 = content.indexOf('Switch account confirmation modal');
// Remove modal is before switch in the file
const navEnd = content.indexOf('export default function DashboardSidebar');
const rmRegion = content.substring(rmStart2, swStart2);
const lastParenRm = rmRegion.lastIndexOf('      )}\n');
if (lastParenRm >= 0) {
  const insertAt = rmStart2 + lastParenRm;
  content = content.substring(0, insertAt) + '      ),\n      document.body\n    )}\n\n      ' + content.substring(insertAt + '      )}\n'.length);
  console.log('Remove modal portal closed');
} else {
  console.log('WARNING: Could not find last paren of remove modal at offset:', lastParenRm);
}

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Done');
