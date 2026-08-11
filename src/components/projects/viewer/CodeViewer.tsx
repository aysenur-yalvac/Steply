
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MessageSquare, Loader2, PenTool, Eraser } from 'lucide-react';
import { Stage, Layer, Line } from 'react-konva';

export default function CodeViewer({ file, annotations, onStageAnnotation, onImmediateSave, canAnnotate }: any) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  
  // Drawing state
  const [lines, setLines] = useState<any[]>([]);
  const [tool, setTool] = useState('pen'); // pen, eraser, or null (disabled)
  const isDrawing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  // Update canvas size when code is loaded or resized
  useEffect(() => {
    if (!loading && containerRef.current) {
      const el = containerRef.current;
      setDimensions({ width: el.scrollWidth, height: el.scrollHeight });
    }
  }, [loading, code]);

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    if (onImmediateSave) {
      // Optimistic UI handled by onImmediateSave in Modal
      onImmediateSave({ type: 'sticky_note', text: noteText });
    } else {
      onStageAnnotation({ type: 'sticky_note', text: noteText });
    }
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

  // Combine saved drawing annotations
  const savedLines = annotations
    .filter((a: any) => a.annotation_data.type === 'drawing')
    .flatMap((a: any) => a.annotation_data.lines || []);

  const allLines = [...savedLines, ...lines];

  const handleMouseDown = (e: any) => {
    if (!canAnnotate || tool === 'none') return;
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || !canAnnotate || tool === 'none') return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    if (!canAnnotate || tool === 'none') return;
    isDrawing.current = false;
    onStageAnnotation({ type: 'drawing', lines });
  };

  if (loading) return <div className="h-full w-full flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin w-8 h-8 text-indigo-500"/></div>;

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      
      {/* Code Area */}
      <div className="flex-1 min-w-0 h-full flex flex-col bg-white">
        
        {/* Drawing Toolbar */}
        {canAnnotate && (
          <div className="flex items-center gap-4 p-3 bg-white border-b border-slate-200 justify-center shrink-0">
            <button 
              onClick={() => setTool('none')} 
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold ${tool === 'none' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
            >
               Sadece Oku / Seç
            </button>
            <button 
              onClick={() => setTool('pen')} 
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold ${tool === 'pen' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <PenTool className="w-4 h-4" /> Çiz
            </button>
            <button 
              onClick={() => setTool('eraser')} 
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold ${tool === 'eraser' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <Eraser className="w-4 h-4" /> Sil
            </button>
            <button 
              onClick={() => { setLines([]); onStageAnnotation(null); }} 
              className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold text-red-500 hover:bg-red-50"
            >
              Temizle
            </button>
          </div>
        )}

        {/* Scrollable Container containing BOTH code and canvas */}
        <div className="flex-1 h-full overflow-auto relative p-4" ref={containerRef}>
          <div style={{ position: 'relative' }}>
            <SyntaxHighlighter 
              language={getLanguage(file.name)} 
              style={vs} 
              showLineNumbers
              customStyle={{ margin: 0, padding: 0, overflow: 'visible', background: 'transparent' }}
            >
              {code}
            </SyntaxHighlighter>

            {/* Drawing Canvas Overlay */}
            {dimensions.width > 0 && (tool !== 'none' || allLines.length > 0) && (
              <div className="absolute inset-0" style={{ pointerEvents: tool === 'none' ? 'none' : 'auto' }}>
                <Stage
                  width={dimensions.width}
                  height={dimensions.height}
                  onMouseDown={handleMouseDown}
                  onMousemove={handleMouseMove}
                  onMouseup={handleMouseUp}
                  onTouchStart={handleMouseDown}
                  onTouchMove={handleMouseMove}
                  onTouchEnd={handleMouseUp}
                >
                  <Layer>
                    {allLines.map((line: any, i: number) => (
                      <Line
                        key={i}
                        points={line.points}
                        stroke={line.tool === 'eraser' ? '#ffffff' : '#ef4444'}
                        strokeWidth={line.tool === 'eraser' ? 20 : 4}
                        tension={0.5}
                        lineCap="round"
                        lineJoin="round"
                        globalCompositeOperation={
                          line.tool === 'eraser' ? 'destination-out' : 'source-over'
                        }
                      />
                    ))}
                  </Layer>
                </Stage>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes Sidebar */}
      <div className="w-full md:w-80 lg:w-96 h-full border-l border-slate-200 bg-slate-50 flex flex-col shrink-0">
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
                <img src={a.author?.avatar_url || '/image_5.png'} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                <span className="text-xs font-bold text-slate-700">{a.author?.full_name || 'Öğretmen'}</span>
              </div>
              {a.annotation_data.type === 'sticky_note' ? (
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{a.annotation_data.text}</p>
              ) : (
                <p className="text-xs text-slate-500 italic">✏️ Ekran üzerine çizim yapıldı.</p>
              )}
            </div>
          ))}
          {annotations.length === 0 && <p className="text-sm text-slate-400 italic text-center mt-10">Henüz not eklenmedi.</p>}
        </div>
        
        {canAnnotate && (
          <div className="p-4 bg-white border-t border-slate-200">
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
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
