const fs = require('fs');

let sidebar = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
sidebar = sidebar.replace(/chat-update/g, 'unread_count_updated');
fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', sidebar, 'utf8');

let client = fs.readFileSync('src/app/dashboard/messages/MessagesClient.tsx', 'utf8');
client = client.replace(/chat-update/g, 'unread_count_updated');
fs.writeFileSync('src/app/dashboard/messages/MessagesClient.tsx', client, 'utf8');

console.log("Renamed event to unread_count_updated");
