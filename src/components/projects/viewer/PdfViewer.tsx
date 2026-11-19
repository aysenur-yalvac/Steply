'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Stage, Layer, Line } from 'react-konva';
import { PenTool, Eraser, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export default function PdfViewer({ file, annotations, onStageAnnotation, canAnnotate }: any) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [lines, setLines] = useState<any[]>([]);
  const [tool, setTool] = useState('pen'); // pen or eraser
  const isDrawing = useRef(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Combine saved drawing annotations
  const savedLines = annotations
    .filter((a: any) => a.annotation_data.type === 'drawing' && a.annotation_data.page === pageNumber)
    .flatMap((a: any) => a.annotation_data.lines || []);

  const allLines = [...savedLines, ...lines];

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const handleMouseDown = (e: any) => {
    if (!canAnnotate) return;
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || !canAnnotate) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    
    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    if (!canAnnotate) return;
    isDrawing.current = false;
    onStageAnnotation({ type: 'drawing', page: pageNumber, lines });
  };

  // Update canvas dimensions when PDF page renders
  const onPageRenderSuccess = (pageData: any) => {
    if (containerRef.current) {
       // get the width/height of the actual rendered canvas inside react-pdf
       const canvas = containerRef.current.querySelector('canvas.react-pdf__Page__canvas');
       if (canvas) {
         setPdfDimensions({ width: canvas.clientWidth, height: canvas.clientHeight });
       }
    }
  };

  // When changing page, clear current unsaved lines and stage them if they exist? 
  // No, let's keep it simple. Only one staged annotation at a time.

  return (
    <div className="h-full w-full flex flex-col bg-slate-100 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-3 bg-white border-b border-slate-200 justify-center">
        <div className="flex items-center gap-2 mr-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <button 
            disabled={pageNumber <= 1} 
            onClick={() => { setPageNumber(p => p - 1); setLines([]); onStageAnnotation(null); }}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-50"
          >
            Önceki
          </button>
          Sayfa {pageNumber} / {numPages || '--'}
          <button 
            disabled={pageNumber >= (numPages || 1)} 
            onClick={() => { setPageNumber(p => p + 1); setLines([]); onStageAnnotation(null); }}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>

        {canAnnotate && (
          <>
            <button 
              onClick={() => setTool('pen')} 
              className={`p-2 rounded-lg flex items-center gap-2 ${tool === 'pen' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'} dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80`}
            >
              <PenTool className="w-4 h-4" /> Çiz
            </button>
            <button 
              onClick={() => setTool('eraser')} 
              className={`p-2 rounded-lg flex items-center gap-2 ${tool === 'eraser' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'} dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80`}
            >
              <Eraser className="w-4 h-4" /> Silgi
            </button>
            <button 
              onClick={() => { setLines([]); onStageAnnotation(null); }} 
              className="p-2 rounded-lg flex items-center gap-2 text-red-500 hover:bg-red-50"
            >
              Temizle
            </button>
          </>
        )}
      </div>

      <div className="flex-1 h-full overflow-auto flex items-start justify-center p-4">
        <div className="relative shadow-lg bg-white" ref={containerRef}>
          <Document
            file={file.url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(err) => console.error('[PdfViewer] Document load error:', err)}
            loading={
              <div className="p-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
                <span className="text-xs text-slate-400">PDF yükleniyor...</span>
              </div>
            }
            error={
              <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
                <div className="p-3 rounded-full bg-red-50 text-red-500">
                  <Loader2 className="w-6 h-6 rotate-45" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">PDF önizlemesi yüklenemedi</p>
                  <p className="text-xs text-slate-400 mt-1">Dosya tarayıcıda doğrudan açılamıyor olabilir.</p>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Dosyayı Doğrudan İndir
                </a>
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              onRenderSuccess={onPageRenderSuccess}
              width={window.innerWidth > 800 ? 800 : window.innerWidth - 40}
            />
          </Document>
          
          {/* Drawing Canvas Overlay */}
          {pdfDimensions.width > 0 && (
            <div className="absolute inset-0" style={{ zIndex: 10 }}>
              <Stage
                width={pdfDimensions.width}
                height={pdfDimensions.height}
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
  );
}