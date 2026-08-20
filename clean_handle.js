const fs = require('fs');
let path = 'src/components/dashboard/DashboardViewSwitcher.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const handleJoinProjectSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?finally \{\s*setIsJoining\(false\);\s*\}\s*\};/m;
content = content.replace(regex, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Cleaned handleJoinProjectSubmit');
