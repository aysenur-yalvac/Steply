'use client';

import { downloadFileFromUrl } from '@/lib/download';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Stage, Layer, Line } from 'react-konva';
import {
  PenTool,
  Eraser,
  RotateCcw,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  FileText,
  AlertCircle,
  Download,
} from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export interface Stroke {
  tool: 'pen' | 'eraser';
  points: number[];
  color?: string;
  width?: number;
}

interface ActiveStroke {
  pageNum: number;
  tool: 'pen' | 'eraser';
  color: string;
  width: number;
  rawPoints: number[];
}

interface PdfViewerProps {
  file: {
    name: string;
    url: string;
    size?: number;
    type?: string;
  };
  annotations: any[];
  onStageAnnotation?: (annotation: any) => void;
  onImmediateSave?: (annotation: any) => void;
  canAnnotate?: boolean;
}

const COLOR_OPTIONS = [
  { label: 'Kırmızı', value: '#ef4444' },
  { label: 'Mavi', value: '#3b82f6' },
  { label: 'Yeşil', value: '#10b981' },
  { label: 'Sarı', value: '#f59e0b' },
  { label: 'Mor', value: '#8b5cf6' },
  { label: 'Siyah', value: '#0f172a' },
];

const WIDTH_OPTIONS = [
  { label: 'İnce', value: 2 },
  { label: 'Orta', value: 4 },
  { label: 'Kalın', value: 8 },
];

function extractDrawingsByPage(annotations: any[]): Record<number, Stroke[]> {
  const result: Record<number, Stroke[]> = {};

  if (!Array.isArray(annotations)) return result;

  annotations.forEach((item) => {
    const data = item?.annotation_data;
    if (!data || data.type !== 'drawing') return;

    // Format 1: data.pages = { 1: [...], 2: [...] }
    if (data.pages && typeof data.pages === 'object' && !Array.isArray(data.pages)) {
      Object.entries(data.pages).forEach(([pageNumStr, strokes]) => {
        const pageNum = parseInt(pageNumStr, 10);
        if (pageNum && Array.isArray(strokes)) {
          result[pageNum] = [...(result[pageNum] || []), ...(strokes as Stroke[])];
        }
      });
      return;
    }

    // Format 2: data.lines is an object with page keys
    if (data.lines && typeof data.lines === 'object' && !Array.isArray(data.lines)) {
      Object.entries(data.lines).forEach(([pageNumStr, strokes]) => {
        const pageNum = parseInt(pageNumStr, 10);
        if (pageNum && Array.isArray(strokes)) {
          result[pageNum] = [...(result[pageNum] || []), ...(strokes as Stroke[])];
        }
      });
      return;
    }

    // Format 3: data.page is number, data.lines is array
    if (typeof data.page === 'number' && Array.isArray(data.lines)) {
      result[data.page] = [...(result[data.page] || []), ...(data.lines as Stroke[])];
      return;
    }

    // Format 4: legacy single array without page (fallback to page 1)
    if (Array.isArray(data.lines)) {
      result[1] = [...(result[1] || []), ...(data.lines as Stroke[])];
    }
  });

  return result;
}

function denormalizePoints(points: number[], dims: { width: number; height: number }): number[] {
  if (!points || !dims || !dims.width || !dims.height) return [];
  const isNormalized = points.every((p) => p >= 0 && p <= 1.05);
  if (isNormalized) {
    return points.map((p, idx) => (idx % 2 === 0 ? p * dims.width : p * dims.height));
  }
  return points;
}

export default function PdfViewer({
  file,
  annotations,
  onStageAnnotation,
  canAnnotate = false,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [strokeColor, setStrokeColor] = useState<string>('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [pageDimensions, setPageDimensions] = useState<Record<number, { width: number; height: number }>>({});
  const [drawings, setDrawings] = useState<Record<number, Stroke[]>>({});
  const [activeStroke, setActiveStroke] = useState<ActiveStroke | null>(null);
  const [history, setHistory] = useState<{ pageNum: number; stroke: Stroke }[]>([]);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // Initialize drawings from annotations
  useEffect(() => {
    const extracted = extractDrawingsByPage(annotations);
    setDrawings(extracted);
  }, [annotations]);

  // Track container width for responsive PDF rendering
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const measured = containerRef.current.clientWidth;
        if (measured > 0) {
          setContainerWidth(measured);
        }
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePageRenderSuccess = useCallback((pageNum: number, page: any) => {
    setPageDimensions((prev) => ({
      ...prev,
      [pageNum]: {
        width: page.width,
        height: page.height,
      },
    }));
  }, []);

  // Drawing handlers for each page stage
  const handleMouseDown = (pageNum: number, e: any) => {
    if (!canAnnotate) return;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    setActiveStroke({
      pageNum,
      tool,
      color: strokeColor,
      width: strokeWidth,
      rawPoints: [pos.x, pos.y],
    });
  };

  const handleMouseMove = (pageNum: number, e: any) => {
    if (!activeStroke || activeStroke.pageNum !== pageNum || !canAnnotate) return;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    setActiveStroke((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        rawPoints: [...prev.rawPoints, pos.x, pos.y],
      };
    });
  };

  const handleMouseUp = (pageNum: number) => {
    if (!activeStroke || activeStroke.pageNum !== pageNum) return;
    const dims = pageDimensions[pageNum];
    if (!dims || dims.width === 0 || dims.height === 0) {
      setActiveStroke(null);
      return;
    }

    // Convert raw points to normalized coords (0..1)
    const normalizedPoints = activeStroke.rawPoints.map((p, idx) =>
      idx % 2 === 0 ? p / dims.width : p / dims.height
    );

    const newStroke: Stroke = {
      tool: activeStroke.tool,
      points: normalizedPoints,
      color: activeStroke.color,
      width: activeStroke.width,
    };

    const updatedPageStrokes = [...(drawings[pageNum] || []), newStroke];
    const updatedDrawings = {
      ...drawings,
      [pageNum]: updatedPageStrokes,
    };

    setDrawings(updatedDrawings);
    setHistory((prev) => [...prev, { pageNum, stroke: newStroke }]);
    setActiveStroke(null);

    if (onStageAnnotation) {
      onStageAnnotation({
        type: 'drawing',
        pages: updatedDrawings,
        lines: updatedDrawings,
      });
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastAction = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    const pageStrokes = [...(drawings[lastAction.pageNum] || [])];
    pageStrokes.pop();
    const updatedDrawings = {
      ...drawings,
      [lastAction.pageNum]: pageStrokes,
    };

    setDrawings(updatedDrawings);
    if (onStageAnnotation) {
      onStageAnnotation({
        type: 'drawing',
        pages: updatedDrawings,
        lines: updatedDrawings,
      });
    }
  };

  const handleClearAll = () => {
    if (!window.confirm('Tüm sayfalardaki çizimleri temizlemek istediğinize emin misiniz?')) {
      return;
    }
    setDrawings({});
    setHistory([]);
    if (onStageAnnotation) {
      onStageAnnotation({
        type: 'drawing',
        pages: {},
        lines: {},
      });
    }
  };

  const zoomIn = () => setZoomScale((prev) => Math.min(2.5, +(prev + 0.15).toFixed(2)));
  const zoomOut = () => setZoomScale((prev) => Math.max(0.6, +(prev - 0.15).toFixed(2)));
  const resetZoom = () => setZoomScale(1.0);

  // Calculate target page width
  const baseWidth = Math.min(840, Math.max(300, containerWidth - 48));
  const renderedWidth = Math.round(baseWidth * zoomScale);

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Sticky Toolbar */}
      <div className="shrink-0 w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 px-3 py-2.5 flex flex-wrap items-center justify-between gap-3 z-30">
        {/* Left Section: Document info & Total Pages */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-300">
            <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-semibold text-slate-200">
              {numPages ? `${numPages} Sayfa` : 'Yükleniyor...'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden lg:inline">
            Dikey kaydırarak tüm sayfaları inceleyebilirsiniz
          </span>
        </div>

        {/* Center Section: Drawing Tools (if canAnnotate) */}
        {canAnnotate && (
          <div className="flex items-center flex-wrap gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            {/* Pen Tool */}
            <button
              type="button"
              onClick={() => setTool('pen')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tool === 'pen'
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Kalem Aracı"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Kalem</span>
            </button>

            {/* Eraser Tool */}
            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tool === 'eraser'
                  ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Silgi Aracı"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Silgi</span>
            </button>

            {/* Color Palette (Active when tool === 'pen') */}
            {tool === 'pen' && (
              <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setStrokeColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      strokeColor === c.value ? 'scale-125 ring-2 ring-white shadow-sm' : 'opacity-70 hover:opacity-100 hover:scale-110'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            )}

            {/* Width Selector */}
            {tool === 'pen' && (
              <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
                {WIDTH_OPTIONS.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => setStrokeWidth(w.value)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      strokeWidth === w.value
                        ? 'bg-slate-700 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={`Kalınlık: ${w.label}`}
                  >
                    {w.label[0]}
                  </button>
                ))}
              </div>
            )}

            {/* Undo */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Geri Al"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Clear All */}
            <button
              type="button"
              onClick={handleClearAll}
              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
              title="Tüm Çizimleri Temizle"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right Section: Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoomScale <= 0.6}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Uzaklaştır"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="px-2 py-1 rounded-lg text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Yakınlaştırmayı Sıfırla (%100)"
          >
            {Math.round(zoomScale * 100)}%
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoomScale >= 2.5}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Yakınlaştır"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors hidden sm:inline-flex"
            title="Genişliğe Sığdır"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Continuous Scroll Area */}
      <div
        ref={scrollViewportRef}
        className="flex-1 w-full overflow-y-auto overflow-x-auto p-4 md:p-8 flex flex-col items-center gap-8 bg-slate-950"
      >
        <Document
          file={file.url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center p-16 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">PDF belgesi yükleniyor...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center p-12 text-center max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl gap-4">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">PDF önizlemesi yüklenemedi</p>
                <p className="text-xs text-slate-400 mt-1">Dosya tarayıcıda doğrudan açılamıyor veya erişim izni gerekebilir.</p>
              </div>
              <button
                type="button"
                onClick={() => downloadFileFromUrl(file.url, file.name)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Dosyayı Doğrudan İndir
              </button>
            </div>
          }
          className="flex flex-col items-center gap-8 w-full"
        >
          {numPages &&
            Array.from(new Array(numPages), (_, index) => {
              const pageNum = index + 1;
              const dims = pageDimensions[pageNum];

              return (
                <div
                  key={`pdf_page_${pageNum}`}
                  id={`pdf_page_${pageNum}`}
                  className="relative shadow-2xl rounded-sm overflow-hidden file-preview-isolated ring-1 ring-slate-800"
                  style={{
                    width: renderedWidth,
                    minHeight: dims ? dims.height : Math.round(renderedWidth * 1.414),
                    backgroundColor: '#ffffff',
                    color: '#000000',
                  }}
                >
                  <Page
                    pageNumber={pageNum}
                    width={renderedWidth}
                    onRenderSuccess={(page) => handlePageRenderSuccess(pageNum, page)}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    loading={
                      <div
                        className="flex items-center justify-center bg-white text-slate-400"
                        style={{ height: Math.round(renderedWidth * 1.414) }}
                      >
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
                        <span className="text-xs">Sayfa {pageNum} yükleniyor...</span>
                      </div>
                    }
                  />

                  {/* Konva Drawing Stage Overlay */}
                  {dims && dims.width > 0 && dims.height > 0 && (
                    <div
                      className="absolute inset-0 z-10"
                      style={{
                        pointerEvents: canAnnotate ? 'auto' : 'none',
                        cursor: canAnnotate ? 'crosshair' : 'default',
                      }}
                    >
                      <Stage
                        width={dims.width}
                        height={dims.height}
                        onMouseDown={(e) => handleMouseDown(pageNum, e)}
                        onMouseMove={(e) => handleMouseMove(pageNum, e)}
                        onMouseUp={() => handleMouseUp(pageNum)}
                        onTouchStart={(e) => handleMouseDown(pageNum, e)}
                        onTouchMove={(e) => handleMouseMove(pageNum, e)}
                        onTouchEnd={() => handleMouseUp(pageNum)}
                      >
                        <Layer>
                          {/* Saved / Committed strokes */}
                          {(drawings[pageNum] || []).map((stroke, i) => {
                            const pts = denormalizePoints(stroke.points, dims);
                            return (
                              <Line
                                key={`stroke_${pageNum}_${i}`}
                                points={pts}
                                stroke={stroke.tool === 'eraser' ? '#ffffff' : (stroke.color || '#ef4444')}
                                strokeWidth={stroke.tool === 'eraser' ? 24 : (stroke.width || 4)}
                                tension={0.5}
                                lineCap="round"
                                lineJoin="round"
                                globalCompositeOperation={
                                  stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
                                }
                              />
                            );
                          })}

                          {/* Active stroke being drawn */}
                          {activeStroke && activeStroke.pageNum === pageNum && (
                            <Line
                              points={activeStroke.rawPoints}
                              stroke={activeStroke.tool === 'eraser' ? '#ffffff' : (activeStroke.color || '#ef4444')}
                              strokeWidth={activeStroke.tool === 'eraser' ? 24 : (activeStroke.width || 4)}
                              tension={0.5}
                              lineCap="round"
                              lineJoin="round"
                              globalCompositeOperation={
                                activeStroke.tool === 'eraser' ? 'destination-out' : 'source-over'
                              }
                            />
                          )}
                        </Layer>
                      </Stage>
                    </div>
                  )}

                  {/* Page indicator pill at bottom right */}
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur text-white text-[10px] font-mono font-medium pointer-events-none select-none z-20 shadow-sm border border-slate-700/50">
                    {pageNum} / {numPages}
                  </div>
                </div>
              );
            })}
        </Document>
      </div>
    </div>
  );
}
