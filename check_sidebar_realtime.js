const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

if (content.includes('supabase.channel')) {
    console.log("DashboardSidebar has a supabase channel subscription.");
} else {
    console.log("DashboardSidebar DOES NOT have a realtime subscription.");
}
