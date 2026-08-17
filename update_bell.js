const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/NotificationBell.tsx', 'utf8');

const decodeFunc = `// Helper to fix UTF-8 Mojibake from old database entries
function decodeCorruptedText(text: string) {
  if (!text) return text;
  return text
    .replace(/payla\\xC5\\xB8t\\xC4\\xB1/g, 'paylaştı')
    .replace(/payla\\xef\\xbf\\xbd\\xef\\xbf\\xbdt\\xef\\xbf\\xbd/g, 'paylaştı')
    .replace(/y\\xC3\\xBCklendi/g, 'yüklendi')
    .replace(/y\\xef\\xbf\\xbdklendi/g, 'yüklendi')
    .replace(/G\\xC3\\xB6rev/g, 'Görev')
    .replace(/G\\xef\\xbf\\xbdrev/g, 'Görev')
    .replace(/g\\xC3\\xB6rev/g, 'görev')
    .replace(/g\\xef\\xbf\\xbdrev/g, 'görev')
    .replace(/de\\xC4\\x9Ferlendirme/g, 'değerlendirme')
    .replace(/de\\xef\\xbf\\xbd/g, 'değ')
    .replace(/Ã¼/g, 'ü')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã§/g, 'ç')
    .replace(/ÃŸ/g, 'ş')
    .replace(/Ä±/g, 'ı')
    .replace(/ÄŸ/g, 'ğ')
    .replace(/Ã\\x9C/g, 'Ü')
    .replace(/Ã\\x96/g, 'Ö')
    .replace(/Ã\\x87/g, 'Ç')
    .replace(/Å\\x9E/g, 'Ş')
    .replace(/Ä\\xB0/g, 'İ')
    .replace(/Ä\\x9E/g, 'Ğ')
    .replace(/\\s+/g, ' ');
}
`;

if (!content.includes('decodeCorruptedText')) {
  content = content.replace(
    'function typeIcon(type: Notification["type"]) {',
    `${decodeFunc}\nfunction typeIcon(type: Notification["type"]) {`
  );
}

// Update the notification item render inside map
const oldItemRender = `
                notifications.map((n) => {
                  const href = notificationHref(n);
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={\`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors
                        \${n.is_read ? "opacity-60 hover:bg-slate-50" : "hover:bg-violet-50/60"}
                        \${href ? "cursor-pointer" : "cursor-default"}\`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 shrink-0">
                        {typeIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={\`text-sm leading-snug \${n.is_read ? "text-slate-500" : "text-slate-800 font-medium"}\`}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{n.body}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1">
                          <p className="text-xs text-slate-300">{timeAgo(n.created_at)}</p>
                          {href && (
                            <span className="text-[10px] text-violet-400 font-medium">' Projeye git</span>
                          )}
                        </div>
                      </div>
                      {!n.is_read && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                      )}
                    </button>
                  );
                })`;

const newItemRender = `
                notifications.map((n: any) => {
                  const isDeleted = n.project_deleted;
                  const href = isDeleted ? null : notificationHref(n);
                  return (
                    <button
                      key={n.id}
                      onClick={() => !isDeleted && handleClick(n)}
                      className={\`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors
                        \${n.is_read || isDeleted ? "opacity-60 hover:bg-slate-50" : "hover:bg-violet-50/60"}
                        \${href ? "cursor-pointer" : "cursor-default pointer-events-none"}\`}
                      disabled={isDeleted}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 shrink-0">
                        {typeIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={\`text-sm leading-snug flex items-center flex-wrap gap-1 \${n.is_read || isDeleted ? "text-slate-500" : "text-slate-800 font-medium"}\`}>
                          {decodeCorruptedText(n.title)}
                          {isDeleted && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-semibold ml-1 whitespace-nowrap">
                              [Silinmiş Proje]
                            </span>
                          )}
                        </p>
                        {n.body && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{decodeCorruptedText(n.body)}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1">
                          <p className="text-xs text-slate-300">{timeAgo(n.created_at)}</p>
                          {isDeleted ? (
                             <span className="text-[10px] text-slate-400 font-medium">Projeye Ulaşılamıyor</span>
                          ) : href ? (
                            <span className="text-[10px] text-violet-400 font-medium">→ Projeye git</span>
                          ) : null}
                        </div>
                      </div>
                      {!n.is_read && !isDeleted && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                      )}
                    </button>
                  );
                })`;

content = content.replace(oldItemRender.trim(), newItemRender.trim());

// Also remove `export default function NotificationBell` signature and replace with any for initialNotifications to support `project_deleted`

content = content.replace(
  'initialNotifications: Notification[];',
  'initialNotifications: any[];'
);
content = content.replace(
  'const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);',
  'const [notifications, setNotifications] = useState<any[]>(initialNotifications);'
);

fs.writeFileSync('src/components/dashboard/NotificationBell.tsx', content, 'utf8');
console.log("Updated NotificationBell.tsx");
