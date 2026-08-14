const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const target = "const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);";
const replacement = "const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});\n  const toggleMenu = (label: string) => setOpenMenus(p => ({...p, [label]: !p[label]}));\n  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);";

content = content.replace(target, replacement);
fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Patched state successfully');
