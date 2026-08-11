'use client';
import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MessageSquare, Loader2 } from 'lucide-react';

export default function CodeViewer({ file, annotations, onStageAnnotation, canAnnotate }: any) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetch(file.url)
      .then(r => r.text())
      .then(t => {
        setCode(t);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [file]);

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    onStageAnnotation({ type: 'sticky_note', text: noteText });
    setNoteText('');
  };

  const getLanguage = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': case 'jsx': return 'javascript';
      case 'ts': case 'tsx': return 'typescript';
      case 'py': return 'python';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      default: return 'text';
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-indigo-500"/></div>;

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-50">
      <div className="flex-1 overflow-auto bg-white p-4">
        <SyntaxHighlighter language={getLanguage(file.name)} style={vs} showLineNumbers>
          {code}
        </SyntaxHighlighter>
      </div>
      <div className="w-full md:w-80 bg-slate-100 border-l border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            Notlar
          </h3>
        </div>
        <div className="flex-1 p-4 overflow-auto space-y-4">
          {annotations.map((a: any, i: number) => (
            <div key={i} className="bg-yellow-100/80 p-3 rounded-xl border border-yellow-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <img src={a.author?.avatar_url || '/image_5.png'} alt="avatar" className="w-6 h-6 rounded-full" />
                <span className="text-xs font-bold text-slate-700">{a.author?.full_name || 'Öğretmen'}</span>
              </div>
              <p className="text-sm text-slate-800 whitespace-pre-wrap">{a.annotation_data.text}</p>
            </div>
          ))}
          {annotations.length === 0 && <p className="text-sm text-slate-400 italic text-center mt-10">Henüz not eklenmedi.</p>}
        </div>
        {canAnnotate && (
          <div className="p-4 bg-white border-t border-slate-200">
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Dosya hakkında genel bir not yazın..."
              className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              rows={3}
            />
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim()}
              className="mt-2 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50 transition-colors"
            >
              Notu Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}