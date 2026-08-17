const fs = require('fs');
let layout = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

const badgeHtml = `          {((profile as any)?.total_score ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 shadow-sm shadow-amber-200/50 select-none">
              🏆 {((profile as any).total_score as number).toLocaleString('tr-TR')} puan
            </span>
          )}`;

layout = layout.replace(badgeHtml, '');
fs.writeFileSync('src/app/dashboard/layout.tsx', layout, 'utf8');

let agenda = fs.readFileSync('src/app/dashboard/agenda/AgendaClient.tsx', 'utf8');
agenda = agenda.replace(/if \(!currentStatus\) confettiTrigger\(\);/g, '');

const confettiTriggerFunc = /const confettiTrigger = \(\) => \{[\s\S]*?\}\);[\s\S]*?\};/;
agenda = agenda.replace(confettiTriggerFunc, '');

fs.writeFileSync('src/app/dashboard/agenda/AgendaClient.tsx', agenda, 'utf8');
console.log("Removed badge and confetti");
