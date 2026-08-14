const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// The modals end with:  )}\r\n\r\n      
// We already converted the opening to: createPortal(\n   <div>...
// We just need to change `      )}\r\n\r\n      ` to `,\n          document.body\n        )}\n\n      `

// But we must only change the two specific closings, not others.
// Let's replace the blocks in one operation.

const rmStart = content.indexOf('{/* Remove account confirmation modal');
const swStart = content.indexOf('{/* Switch account confirmation modal');
const footerMarker = '{/* ============================================================\n            FOOTER CONTENT';
const navEnd = content.indexOf(footerMarker);

const beforeRm = content.substring(0, rmStart);
let rmBlock = content.substring(rmStart, swStart);
let swBlock = content.substring(swStart, navEnd);
const afterSw = content.substring(navEnd);

// Fix remove modal - change the closing )}\n to ,\n document.body\n        )}
rmBlock = rmBlock.replace(
  '        </div>\r\n      )}\r\n\r\n      ',
  '        </div>\r\n        ,\r\n        document.body\r\n      )}\r\n\r\n      '
);
if (!rmBlock.includes('document.body')) {
  // Try unix line endings
  rmBlock = rmBlock.replace(
    '        </div>\n      )}\n\n      ',
    '        </div>\n        ,\n        document.body\n      )}\n\n      '
  );
}

// Fix switch modal 
swBlock = swBlock.replace(
  '        </div>\r\n      )}\r\n\r\n      ',
  '        </div>\r\n        ,\r\n        document.body\r\n      )}\r\n\r\n      '
);
if (!swBlock.includes('document.body')) {
  swBlock = swBlock.replace(
    '        </div>\n      )}\n\n      ',
    '        </div>\n        ,\n        document.body\n      )}\n\n      '
  );
}

console.log('rmBlock has document.body:', rmBlock.includes('document.body'));
console.log('swBlock has document.body:', swBlock.includes('document.body'));

content = beforeRm + rmBlock + swBlock + afterSw;
fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Done');
