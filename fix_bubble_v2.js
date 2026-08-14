const fs = require('fs');
const path = 'src/components/projects/ProjectNotes.tsx';
let content = fs.readFileSync(path, 'utf8');

const startIdx = content.indexOf('function MessageBubble({ note, isOwn }');
const endIdx = content.indexOf('}', content.indexOf('return (', startIdx)) + 1;
// wait, endIdx of function is the last bracket.
// A better way: find the end of the file or the end of the component. MessageBubble is the last component in the file.
// Let's just find the exact end index:
const lastBrace = content.lastIndexOf('}');

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
`;

content = content.substring(0, startIdx) + newBubble;
fs.writeFileSync(path, content, 'utf8');
console.log('ProjectNotes.tsx bubble updated successfully');
