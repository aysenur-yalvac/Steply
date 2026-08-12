'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, File } from 'lucide-react';

export default function FallbackViewer({ file, annotations, onStageAnnotation, onImmediateSave, canAnnotate }: any) {
  const [noteText, setNoteText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
    const notesContainerRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
      const timer = setTimeout(() => {
        if (notesContainerRef.current) {
          notesContainerRef.current.scrollTop = notesContainerRef.current.scrollHeight;
        }
      }, 150);
      return () => clearTimeout(timer);
    }, [annotations]);

  
  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    if (onImmediateSave) {
      onImmediateSave({ type: 'sticky_note', text: noteText });
    } else {
      onStageAnnotation({ type: 'sticky_note', text: noteText });
    }
    setNoteText('');
  };

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      <div className="flex-1 h-full flex flex-col items-center justify-center p-8 bg-white overflow-auto">
        <File className="w-24 h-24 text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-700">{file.name}</h3>
        <p className="text-sm text-slate-500 mt-2">Bu dosya türü için tarayıcı önizlemesi desteklenmiyor.</p>
        <a 
          href={file.url} 
          target="_blank" 
          rel="noreferrer" 
          download 
          className="mt-6 px-6 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-200 transition-colors"
        >
          Dosyayı İndir
        </a>
      </div>
      <div className="w-full md:w-80 lg:w-96 h-full border-l border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            Notlar
          </h3>
        </div>
        <div ref={notesContainerRef} className="flex-1 p-4 overflow-auto space-y-4">
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
          <div ref={messagesEndRef} />
        </div>
        {canAnnotate && (
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Dosya hakkında not yazın..."
              className="w-full text-sm p-3 text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
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