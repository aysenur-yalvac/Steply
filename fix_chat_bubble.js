const fs = require('fs');
const path = 'src/app/dashboard/messages/ChatWindow.tsx';
let content = fs.readFileSync(path, 'utf8');

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

content = content.replace(oldStr, newStr);
fs.writeFileSync(path, content, 'utf8');
console.log('ChatWindow.tsx bubble updated successfully');
