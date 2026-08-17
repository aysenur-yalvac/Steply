const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');

const regex = /export default function DashboardViewSwitcher\(\{[\s\S]*?\}\: Props\)/;
const match = content.match(regex);
if (match) {
    console.log(match[0]);
}
