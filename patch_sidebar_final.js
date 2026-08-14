const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const target = `  }) {
    const pathname = usePathname();
    const { signOut } = useAuth();
    const router = useRouter();
  
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);`;

const replacement = `  }) {
    const pathname = usePathname();
    const { signOut } = useAuth();
    const router = useRouter();

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
    const toggleMenu = (label: string) => setOpenMenus(p => ({...p, [label]: !p[label]}));

    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Patched Sidebar');
