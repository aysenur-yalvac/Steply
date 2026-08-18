const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const regex = /return collapsed \? \(\s*<Link key=\{label\} href=\{href\} onClick=\{onClose\} title=\{label\} className=\{`w-full flex items-center justify-center py-2\.5 rounded-xl transition-all duration-150 \$\{isActive \? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"\}`\}>\s*<div className="relative flex items-center justify-center">\s*<Icon className="w-5 h-5 shrink-0" strokeWidth=\{isActive \? 2 : 1\.5\} \/>\s*\{isMessages && <UnreadMessagesBadge collapsed=\{true\} \/>\}\s*<\/div>\s*<\/Link>\s*\) : \(\s*<Link key=\{label\} href=\{href\} onClick=\{onClose\} className=\{`w-full flex items-center gap-3 px-3 py-2\.5 rounded-xl text-sm font-semibold transition-all duration-150 group \$\{isActive \? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"\}`\}>\s*<Icon className=\{`w-5 h-5 shrink-0 \$\{isActive \? "text-white" : "group-hover:scale-110 transition-transform"\}`\} strokeWidth=\{isActive \? 2 : 1\.5\} \/>\s*<span>\{label\}<\/span>\s*\{isMessages && <UnreadMessagesBadge collapsed=\{false\} \/>\}\s*<\/Link>\s*\);/g;

const replacement = `const isMessages = href === '/dashboard/messages' || label.toLowerCase().includes('message');
              
              return collapsed ? (
                <Link key={label} href={href} onClick={onClose} title={label} className={\`relative w-full flex items-center justify-center py-2.5 rounded-xl transition-all duration-150 \${isActive ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}\`}>
                  <div className="relative flex items-center justify-center">
                    <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                    {isMessages && <UnreadMessagesBadge collapsed={true} />}
                  </div>
                </Link>
              ) : (
                <Link key={label} href={href} onClick={onClose} className={\`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group \${isActive ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}\`}>
                  <div className="flex items-center gap-3">
                    <Icon className={\`w-5 h-5 shrink-0 \${isActive ? "text-white" : "group-hover:scale-110 transition-transform"}\`} strokeWidth={isActive ? 2 : 1.5} />
                    <span>{label}</span>
                  </div>
                  {isMessages && <UnreadMessagesBadge collapsed={false} />}
                </Link>
              );`;

content = content.replace(regex, replacement);

if (content.includes("justify-between")) {
    console.log("SUCCESS: Replaced return block with justify-between and relative.");
} else {
    console.log("FAILED to replace return block.");
}

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
