const fs = require("fs");
let bell = fs.readFileSync("src/components/dashboard/NotificationBell.tsx", "utf8");

// Slice first 10
bell = bell.replace(
  'const unread = notifications.filter((n) => !n.is_read).length;',
  'const unread = notifications.filter((n) => !n.is_read).length;\n  const topNotifications = notifications.slice(0, 10);'
);

bell = bell.replace(
  '{notifications.length === 0 ? (',
  '{topNotifications.length === 0 ? ('
);

bell = bell.replace(
  'notifications.map((n) => {',
  'topNotifications.map((n) => {'
);

// Translate to Turkish
bell = bell.replace(
  '<span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Notifications</span>',
  '<span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Bildirimler</span>'
);

bell = bell.replace(
  '<CheckCheck className="w-3.5 h-3.5" /> Mark all read',
  '<CheckCheck className="w-3.5 h-3.5" /> Tümünü Okundu İşaretle'
);

bell = bell.replace(
  '<p className="text-sm">No notifications yet</p>',
  '<p className="text-sm">Henüz bildirim yok</p>'
);

bell = bell.replace(
  'if (m < 1) return "just now";',
  'if (m < 1) return "şimdi";'
);

bell = bell.replace(
  'if (m < 60) return `${m}m ago`;',
  'if (m < 60) return `${m}dk önce`;'
);

bell = bell.replace(
  'if (h < 24) return `${h}h ago`;',
  'if (h < 24) return `${h}sa önce`;'
);

bell = bell.replace(
  'return `${Math.floor(h / 24)}d ago`;',
  'return `${Math.floor(h / 24)}g önce`;'
);

fs.writeFileSync("src/components/dashboard/NotificationBell.tsx", bell, "utf8");
console.log("Patched NotificationBell.tsx texts and top 10 limit");
