'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MessageSquare, Loader2, PenTool, Eraser, Undo, Redo, Square, Circle as CircleIcon } from 'lucide-react';
import { Stage, Layer, Line, Rect, Circle } from 'react-konva';
import { ColorPicker } from '@/components/ui/color-picker';

export default function CodeViewer({ file, annotations, onStageAnnotation, onImmediateSave, canAnnotate }: any) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
    const notesContainerRef = useRef<HTMLDivElement>(null);
  
  // Drawing states
  const [history, setHistory] = useState<any[]>([[]]);
  const historyRef = useRef<any[]>([[]]); // array of line arrays
  const [historyStep, setHistoryStep] = useState(0);
  const historyStepRef = useRef(0);
  const [tool, setTool] = useState('none'); // none, pen, eraser, rect, circle
  const [color, setColor] = useState('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState(4);
  
  
  const isDrawing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    fetch(file.url)
      .then(r => r.text())
      .then(t => { setCode(t); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, [file]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      setDimensions({ width: containerRef.current.scrollWidth, height: containerRef.current.scrollHeight });
    }
  }, [loading, code]);

  
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
    if (onImmediateSave) onImmediateSave({ type: 'sticky_note', text: noteText });
    else onStageAnnotation({ type: 'sticky_note', text: noteText });
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

  const savedLines = annotations
    .filter((a: any) => a.annotation_data.type === 'drawing')
    .flatMap((a: any) => typeof a.annotation_data.lines === 'string' ? JSON.parse(a.annotation_data.lines) : (a.annotation_data.lines || []));

  
  // Update refs on initial load if empty
  useEffect(() => {
    if (savedLines.length > 0 && historyRef.current[0].length === 0 && historyRef.current.length === 1) {
      historyRef.current = [savedLines];
      setHistory([savedLines]);
      setHistoryStep(0);
      historyStepRef.current = 0;
    }
  }, [annotations]);
  
  const allLines = history[historyStep] || [];

  const handleUndo = () => {
    if (historyStep === 0) return;
    historyStepRef.current -= 1;
    setHistoryStep(historyStepRef.current);
    onStageAnnotation({ type: 'drawing', lines: historyRef.current[historyStepRef.current] });
  };

  const handleRedo = () => {
    if (historyStep === history.length - 1) return;
    historyStepRef.current += 1;
    setHistoryStep(historyStepRef.current);
    onStageAnnotation({ type: 'drawing', lines: historyRef.current[historyStepRef.current] });
  };

  const currentShapeRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const eraserCursorRef = useRef<any>(null);
  const activeDrawingRef = useRef<any>(null);

  const handleMouseDown = (e: any) => {
    if (!canAnnotate || tool === 'none') return;
    isDrawing.current = true;
    const stage = e.target.getStage();
    const container = stage.container();
    const rect = container.getBoundingClientRect();
    const clientX = e.evt.touches ? e.evt.touches[0].clientX : e.evt.clientX;
    const clientY = e.evt.touches ? e.evt.touches[0].clientY : e.evt.clientY;
    const scaleX = stage.scaleX() || 1;
    const scaleY = stage.scaleY() || 1;
    const pos = { x: (clientX - rect.left) / scaleX, y: (clientY - rect.top) / scaleY };
    
    let newShape = { type: 'line', tool, points: [pos.x, pos.y], color, strokeWidth };
    if (tool === 'rect') newShape = { type: 'rect', tool, points: [pos.x, pos.y, pos.x, pos.y], color, strokeWidth };
    if (tool === 'circle') newShape = { type: 'circle', tool, points: [pos.x, pos.y, 0], color, strokeWidth };
    
    currentShapeRef.current = newShape;

    // Direct DOM: make active line visible
    if (activeDrawingRef.current) {
      activeDrawingRef.current.points(newShape.points);
      activeDrawingRef.current.stroke(color);
      activeDrawingRef.current.strokeWidth(tool === 'eraser' ? strokeWidth * 2 : strokeWidth);
      activeDrawingRef.current.globalCompositeOperation(tool === 'eraser' ? 'destination-out' : 'source-over');
      activeDrawingRef.current.show();
      layerRef.current?.batchDraw();
    }
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const container = stage.container();
    const rect = container.getBoundingClientRect();
    const clientX = e.evt.touches ? e.evt.touches[0].clientX : e.evt.clientX;
    const clientY = e.evt.touches ? e.evt.touches[0].clientY : e.evt.clientY;
    const scaleX = stage.scaleX() || 1;
    const scaleY = stage.scaleY() || 1;
    const pos = { x: (clientX - rect.left) / scaleX, y: (clientY - rect.top) / scaleY };
    if (isNaN(pos.x) || isNaN(pos.y)) return;

    if (tool === 'eraser' && eraserCursorRef.current) {
      eraserCursorRef.current.position({ x: pos.x, y: pos.y });
      layerRef.current?.batchDraw();
    }
    
    if (!isDrawing.current || !canAnnotate || tool === 'none' || !currentShapeRef.current) return;
    
    const shape = currentShapeRef.current;
    if (tool === 'pen' || tool === 'eraser') {
      shape.points.push(pos.x, pos.y);
      if (activeDrawingRef.current) activeDrawingRef.current.points(shape.points);
    } else if (tool === 'rect') {
      // not fully supported without a Rect ref
    } else if (tool === 'circle') {
      // not fully supported without a Circle ref
    }
    
    layerRef.current?.batchDraw();
  };

  const lastLinePointsToRect = (node: any, pts: number[]) => {
    node.x(Math.min(pts[0], pts[2]));
    node.y(Math.min(pts[1], pts[3]));
    node.width(Math.abs(pts[2] - pts[0]));
    node.height(Math.abs(pts[3] - pts[1]));
  };

  const handleMouseUp = () => {
    if (!canAnnotate || tool === 'none') return;
    isDrawing.current = false;
    
    if (activeDrawingRef.current) {
      activeDrawingRef.current.hide();
    }

    if (currentShapeRef.current) {
      let finalLines = [...(historyRef.current[historyStepRef.current] || [])];
      
      if (tool === 'eraser') {
        // Eraser state mismatch fix: filter lines that intersect the eraser stroke
        const eraserPoints = currentShapeRef.current.points;
        const ERASER_RADIUS = strokeWidth * 2;
        
        finalLines = finalLines.filter((line: any) => {
          if (line.type === 'rect' || line.type === 'circle') return true; // Keep shapes for simplicity, or we could filter them by bbox
          if (!line.points || line.points.length === 0) return false;
          
          for (let i = 0; i < eraserPoints.length; i += 2) {
            const ex = eraserPoints[i];
            const ey = eraserPoints[i+1];
            for (let j = 0; j < line.points.length; j += 2) {
               const px = line.points[j];
               const py = line.points[j+1];
               const dist = Math.sqrt(Math.pow(ex - px, 2) + Math.pow(ey - py, 2));
               if (dist <= ERASER_RADIUS) return false; // erase this line completely
            }
          }
          return true;
        });
      } else {
        // Normal tool: push the new shape
        finalLines.push(currentShapeRef.current);
      }

      const newHistory = historyRef.current.slice(0, historyStepRef.current + 1);
      newHistory.push(finalLines);
      historyRef.current = newHistory;
      historyStepRef.current = newHistory.length - 1;
      setHistory(newHistory);
      setHistoryStep(historyStepRef.current);
      onStageAnnotation({ type: 'drawing', lines: finalLines });
    }
    currentShapeRef.current = null;
  };

  if (loading) return <div className="h-full w-full flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin w-8 h-8 text-indigo-500"/></div>;

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      
      {/* Code Area */}
      <div className="flex-1 min-w-0 h-full flex flex-col bg-white">
        
        {/* Drawing Toolbar */}
        {canAnnotate && (
          <div className="flex flex-wrap items-center gap-2 p-2 bg-white border-b border-slate-200 shrink-0">
            <button onClick={() => setTool('none')} className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold ${tool === 'none' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}>Seç/Oku</button>
            <button onClick={() => setTool('pen')} className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold ${tool === 'pen' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}><PenTool className="w-4 h-4" /> Çiz</button>
            <button onClick={() => setTool('rect')} className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold ${tool === 'rect' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}><Square className="w-4 h-4" /></button>
            <button onClick={() => setTool('circle')} className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold ${tool === 'circle' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}><CircleIcon className="w-4 h-4" /></button>
            <button onClick={() => setTool('eraser')} className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold ${tool === 'eraser' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}><Eraser className="w-4 h-4" /> Sil</button>
            
            <div className="w-px h-6 bg-slate-200 mx-2" />
            
            <ColorPicker color={color} onChange={setColor} strokeWidth={strokeWidth} onStrokeWidthChange={setStrokeWidth} />
            
            <div className="w-px h-6 bg-slate-200 mx-2" />
            
            <button onClick={handleUndo} disabled={historyStep === 0} className="p-1.5 text-slate-500 hover:text-indigo-600 disabled:opacity-30"><Undo className="w-5 h-5" /></button>
            <button onClick={handleRedo} disabled={historyStep === history.length - 1} className="p-1.5 text-slate-500 hover:text-indigo-600 disabled:opacity-30"><Redo className="w-5 h-5" /></button>
          </div>
        )}

        {/* Scrollable Container */}
        <div className="flex-1 h-full overflow-auto relative p-4" ref={containerRef} style={{ cursor: tool === 'none' ? 'default' : tool === 'eraser' ? 'none' : 'crosshair' }}>
          <div style={{ position: 'relative' }}>
            <SyntaxHighlighter language={getLanguage(file.name)} style={vs} showLineNumbers customStyle={{ margin: 0, padding: 0, overflow: 'visible', background: 'transparent' }}>
              {code}
            </SyntaxHighlighter>

            {dimensions.width > 0 && (tool !== 'none' || allLines.length > 0) && (
              <div className="absolute inset-0" style={{ pointerEvents: tool === 'none' ? 'none' : 'auto' }}>
                <Stage width={dimensions.width} height={dimensions.height} onMouseDown={handleMouseDown} onMousemove={handleMouseMove} onMouseup={handleMouseUp} onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}>
                  <Layer ref={layerRef}>
                    {allLines.map((line: any, i: number) => {
                      const isEraser = line.tool === 'eraser';
                      const strokeColor = isEraser ? '#ffffff' : (line.color || '#ef4444');
                      const width = line.strokeWidth || 4;
                      const globalComp = isEraser ? 'destination-out' : 'source-over';
                      
                      if (line.type === 'rect') {
                        return <Rect key={i} x={Math.min(line.points[0], line.points[2])} y={Math.min(line.points[1], line.points[3])} width={Math.abs(line.points[2] - line.points[0])} height={Math.abs(line.points[3] - line.points[1])} stroke={strokeColor} strokeWidth={width} globalCompositeOperation={globalComp} />;
                      } else if (line.type === 'circle') {
                        return <Circle key={i} x={line.points[0]} y={line.points[1]} radius={line.points[2]} stroke={strokeColor} strokeWidth={width} globalCompositeOperation={globalComp} />;
                      } else {
                        // type 'line' (pen or eraser)
                        // Backward compatibility: old lines might not have type, fallback to line
                        return <Line key={i} points={line.points} stroke={strokeColor} strokeWidth={isEraser ? width * 2 : width} tension={0.5} lineCap="round" lineJoin="round" globalCompositeOperation={globalComp} closed={false} fillEnabled={false} fill="transparent" />;
                      }
                    })}
                    {tool !== 'none' && (
                        <Line ref={activeDrawingRef} points={[]} stroke="#000" strokeWidth={2} tension={0.5} lineCap="round" lineJoin="round" closed={false} fillEnabled={false} fill="transparent" listening={false} />
                      )}
                      {tool === 'eraser' && (
                      <Circle ref={eraserCursorRef} x={-100} y={-100} radius={strokeWidth} fill="rgba(0,0,0,0.1)" stroke="#ef4444" strokeWidth={1} listening={false} />
                    )}
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
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-indigo-500" /> Notlar</h3>
        </div>
        <div ref={notesContainerRef} className="flex-1 p-4 overflow-auto space-y-4">
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
          <div ref={messagesEndRef} />
        </div>
        
        {canAnnotate && (
          <div className="p-4 bg-white border-t border-slate-200">
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