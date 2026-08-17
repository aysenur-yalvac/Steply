const fs = require('fs');

let messagesClient = fs.readFileSync('src/app/dashboard/messages/MessagesClient.tsx', 'utf8');
let dashboardSidebar = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

console.log("MessagesClient lines:", messagesClient.split('\n').length);
console.log("DashboardSidebar lines:", dashboardSidebar.split('\n').length);
