const fs = require('fs');
let path = 'src/components/dashboard/DashboardViewSwitcher.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove states and submit function
content = content.replace(
  /const \[isJoinModalOpen, setIsJoinModalOpen\] = useState\(false\);\s*const \[joinCodeInput, setJoinCodeInput\] = useState\(''\);\s*const \[isJoining, setIsJoining\] = useState\(false\);\s*const handleJoinProjectSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?^\s*\};\n/m,
  ''
);

// 2. Remove Katıl button
content = content.replace(
  /<\s*button\s*onClick=\{\(e\) => \{[\s\S]*?console\.log\("👉 Katıl butonuna tıklandı!"\);\s*setIsJoinModalOpen\(true\);\s*\}\}[\s\S]*?Katıl\s*<\/button>/m,
  ''
);

// 3. Remove modal
content = content.replace(
  /\{isJoinModalOpen && \([\s\S]*?<\/form>\s*<\/div>\s*<\/div>\s*\)\}/m,
  ''
);

fs.writeFileSync(path, content, 'utf8');
console.log('Cleaned DashboardViewSwitcher');
