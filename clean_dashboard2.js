const fs = require('fs');
let path = 'src/components/dashboard/DashboardViewSwitcher.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove states
content = content.replace(/const \[isJoinModalOpen, setIsJoinModalOpen\] = useState\(false\);\s*const \[joinCodeInput, setJoinCodeInput\] = useState\(''\);\s*const \[isJoining, setIsJoining\] = useState\(false\);\n/, '');

// Remove handleJoinProjectSubmit
content = content.replace(/const handleJoinProjectSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?finally \{\s*setIsJoining\(false\);\s*\}\s*\};\n/, '');

// Remove inline modal at the bottom (I also had `\{isJoinModalOpen && \(` ...)
content = content.replace(/\{isJoinModalOpen && \([\s\S]*?<\/form>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Fully cleaned DashboardViewSwitcher');
