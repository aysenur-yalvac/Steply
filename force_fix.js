const fs = require('fs');
const path = 'src/components/projects/ProjectNotes.tsx';
let content = fs.readFileSync(path, 'utf8');

const startIdx = content.indexOf('function MessageBubble({ note, isOwn }');

const newBubble = `function MessageBubble({ note, isOwn }: { note: ProjectNote; isOwn: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = note.content.length > LONG_MSG_CHARS;

  // 1. Bubble Container styling
  const bubbleBase = isOwn
    ? "bg-violet-50 border border-violet-100 rounded-2xl rounded-tr-none shadow-sm"
    : "bg-gray-100 border border-gray-200/60 rounded-2xl rounded-tl-none shadow-sm";

  const toggleColor = isOwn
    ? "text-violet-600 hover:text-violet-800"
    : "text-gray-600 hover:text-gray-800";

  const fromColor = isOwn ? "from-violet-50" : "from-gray-100";

  // Create timestamp
  const timestamp = note.created_at 
    ? new Date(note.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : "";

  return (
    <div className={\`max-w-[85%] w-fit px-4 py-3 \${bubbleBase}\`}>
      <div className="relative">
        <div
          className={\`text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words overflow-hidden \${
            isLong && !expanded ? "max-h-[150px]" : "max-h-none"
          }\`}
        >
          {note.content}
        </div>

        {/* Fade-out gradient when collapsed */}
        {isLong && !expanded && (
          <div
            className={\`absolute bottom-0 left-0 right-0 h-10 pointer-events-none bg-gradient-to-t \${fromColor} to-transparent\`}
          />
        )}
      </div>

      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className={\`mt-1.5 text-xs font-semibold transition-colors \${toggleColor}\`}
        >
          {expanded ? "Daha az göster" : "Devamını oku"}
        </button>
      )}

      {/* 3. Footer Timestamp */}
      <span className="text-[11px] text-gray-400 mt-2 text-right block select-none">
        {timestamp}
      </span>
    </div>
  );
}

export default ProjectNotes;
`;

if (startIdx !== -1) {
    content = content.substring(0, startIdx) + newBubble;
}

content = content.replace(/maxLength=\{1000\}/g, 'maxLength={100000}');

fs.writeFileSync(path, content, 'utf8');

const path2 = 'src/app/dashboard/messages/ChatWindow.tsx';
let content2 = fs.readFileSync(path2, 'utf8');
const oldStr = `<div 
                      className={\`max-w-[75%] px-4 py-2.5 rounded-2xl \${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-br-sm' 
                          : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-sm'
                      }\`}
                    >
                      <p className="whitespace-pre-wrap break-words text-[15px]">{msg.content}</p>
                      <span className={\`block text-[10px] mt-1 text-right \${isMe ? 'text-indigo-200' : 'text-slate-400'}\`}>
                        {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>`;

const newStr = `<div 
                      className={\`max-w-[85%] w-fit px-4 py-3 rounded-2xl shadow-sm \${
                        isMe 
                          ? 'bg-violet-50 border border-violet-100 rounded-tr-none' 
                          : 'bg-gray-100 border border-gray-200/60 rounded-tl-none'
                      }\`}
                    >
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words overflow-hidden">{msg.content}</p>
                      <span className="text-[11px] text-gray-400 mt-2 text-right block select-none">
                        {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>`;
content2 = content2.replace(oldStr, newStr);
fs.writeFileSync(path2, content2, 'utf8');

console.log('ProjectNotes and ChatWindow replaced correctly');
