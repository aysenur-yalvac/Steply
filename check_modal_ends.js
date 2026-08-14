const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Check the end of the remove modal (at 22501) and switch modal (at 24301)
// Remove modal ends before switch modal starts
const rmEnd = content.substring(22501, 24200);
const swEnd = content.substring(24301, 26000);

// Count their closing tags to verify they close correctly
console.log('=== Remove modal end ===');
console.log(rmEnd.substring(rmEnd.length - 400));
console.log('\n=== Switch modal end ===');
console.log(swEnd.substring(swEnd.length - 400));
