'use client';

import { downloadFileFromUrl } from '@/lib/download';
import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  FileText,
  PenTool,
  Highlighter,
  Eraser,
  Undo,
  Redo,
  Trash2,
  Square,
  Circle as CircleIcon,
  Minus,
  MoveRight,
  Download,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Stage, Layer, Line, Rect, Circle, Arrow } from 'react-konva';

const COLORS = [
  { label: 'Kırmızı', value: '#ef4444' },
  { label: 'Mavi', value: '#3b82f6' },
  { label: 'Yeşil', value: '#10b981' },
  { label: 'Sarı', value: '#f59e0b' },
  { label: 'Mor', value: '#8b5cf6' },
  { label: 'Pembe', value: '#ec4899' },
  { label: 'Siyah', value: '#0f172a' },
];

const STROKE_WIDTHS = [
  { label: 'İnce', value: 2 },
  { label: 'Orta', value: 4 },
  { label: 'Kalın', value: 8 },
];

function parseSavedLines(annotations: any[]): any[] {
  if (!Array.isArray(annotations)) return [];
  const all: any[] = [];
  for (const a of annotations) {
    const data = a?.annotation_data;
    if (!data || data.type !== 'drawing') continue;
    let raw = data.lines ?? data.pages;
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = [];
      }
    }
    if (Array.isArray(raw)) {
      all.push(...raw);
    } else if (raw && typeof raw === 'object') {
      Object.values(raw).forEach((arr: any) => {
        if (Array.isArray(arr)) all.push(...arr);
      });
    }
  }
  return all;
}

/**
 * Attempts to extract readable plain-text paragraphs from a .docx (ZIP containing word/document.xml)
 * directly in the browser using DecompressionStream('deflate-raw') or uncompressed ZIP entries.
 */
async function tryExtractDocxText(url: string): Promise<string[] | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);

    let offset = 0;
    const decoder = new TextDecoder('utf-8');

    while (offset + 30 < bytes.length) {
      const sig = view.getUint32(offset, true);
      if (sig !== 0x04034b50) break; // Local file header signature

      const compression = view.getUint16(offset + 8, true);
      const compressedSize = view.getUint32(offset + 18, true);
      const fileNameLength = view.getUint16(offset + 26, true);
      const extraLength = view.getUint16(offset + 28, true);

      const nameBytes = bytes.subarray(offset + 30, offset + 30 + fileNameLength);
      const entryName = decoder.decode(nameBytes);
      const dataStart = offset + 30 + fileNameLength + extraLength;
      const dataEnd = dataStart + compressedSize;

      if (entryName === 'word/document.xml' && dataEnd <= bytes.length) {
        const entryData = bytes.subarray(dataStart, dataEnd);
        let xmlText = '';

        if (compression === 0) {
          xmlText = decoder.decode(entryData);
        } else if (compression === 8 && typeof DecompressionStream !== 'undefined') {
          const ds = new DecompressionStream('deflate-raw');
          const writer = ds.writable.getWriter();
          writer.write(entryData);
          writer.close();
          const decompressedBuf = await new Response(ds.readable).arrayBuffer();
          xmlText = decoder.decode(decompressedBuf);
        }

        if (xmlText) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
          const pNodes = Array.from(xmlDoc.getElementsByTagName('w:p'));
          const paragraphs: string[] = [];
          for (const p of pNodes) {
            const tNodes = Array.from(p.getElementsByTagName('w:t'));
            const line = tNodes.map((t) => t.textContent || '').join('');
            if (line.trim()) paragraphs.push(line);
          }
          if (paragraphs.length > 0) return paragraphs;
        }
        break;
      }

      offset = dataEnd;
    }
    return null;
  } catch {
    return null;
  }
}

export default function FallbackViewer({
  file,
  annotations,
  onStageAnnotation,
  onImmediateSave,
  canAnnotate = true,
}: any) {
  const [noteText, setNoteText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const notesContainerRef = useRef<HTMLDivElement>(null);

  // Drawing states
  const [history, setHistory] = useState<any[][]>([[]]);
  const historyRef = useRef<any[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const historyStepRef = useRef(0);

  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser' | 'rect' | 'circle' | 'line' | 'arrow' | 'none'>('pen');
  const [color, setColor] = useState('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState(4);

  const [docxParagraphs, setDocxParagraphs] = useState<string[] | null>(null);
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [showOfficeFrame, setShowOfficeFrame] = useState(false);

  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const activeDrawingRef = useRef<any>(null);
  const previewRectRef = useRef<any>(null);
  const previewCircleRef = useRef<any>(null);
  const previewLineRef = useRef<any>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const currentShapeRef = useRef<any>(null);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 860, height: 1120 });

  const lowerName = (file?.name || '').toLowerCase();
  const isOfficeDoc = /\.(docx?|xlsx?|pptx?)$/i.test(lowerName);
  const isDocx = lowerName.endsWith('.docx');

  // Parse .docx text paragraphs in browser if possible
  useEffect(() => {
    let active = true;
    if (isDocx && file?.url) {
      setIsParsingDoc(true);
      tryExtractDocxText(file.url)
        .then((paragraphs) => {
          if (active) setDocxParagraphs(paragraphs);
        })
        .finally(() => {
          if (active) setIsParsingDoc(false);
        });
    } else {
      setDocxParagraphs(null);
    }
    return () => {
      active = false;
    };
  }, [isDocx, file?.url]);

  // Measure board container
  useEffect(() => {
    const updateDimensions = () => {
      if (boardContainerRef.current) {
        const w = Math.max(760, boardContainerRef.current.scrollWidth);
        const h = Math.max(1080, boardContainerRef.current.scrollHeight);
        setCanvasSize({ width: w, height: h });
      }
    };
    updateDimensions();
    const timer = setTimeout(updateDimensions, 200);
    window.addEventListener('resize', updateDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, [docxParagraphs, showOfficeFrame]);

  // Load saved drawings from annotations
  useEffect(() => {
    const saved = parseSavedLines(annotations);
    if (saved.length > 0 && historyRef.current.length === 1 && historyRef.current[0].length === 0) {
      historyRef.current = [saved];
      setHistory([saved]);
      setHistoryStep(0);
      historyStepRef.current = 0;
    }
  }, [annotations]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (notesContainerRef.current) {
        notesContainerRef.current.scrollTop = notesContainerRef.current.scrollHeight;
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [annotations]);

  const allLines = history[historyStep] || [];

  const handleUndo = () => {
    if (historyStep === 0) return;
    historyStepRef.current -= 1;
    setHistoryStep(historyStepRef.current);
    onStageAnnotation?.({ type: 'drawing', lines: historyRef.current[historyStepRef.current] });
  };

  const handleRedo = () => {
    if (historyStep >= history.length - 1) return;
    historyStepRef.current += 1;
    setHistoryStep(historyStepRef.current);
    onStageAnnotation?.({ type: 'drawing', lines: historyRef.current[historyStepRef.current] });
  };

  const handleClearCanvas = () => {
    const newHist = [...historyRef.current.slice(0, historyStepRef.current + 1), []];
    historyRef.current = newHist;
    historyStepRef.current = newHist.length - 1;
    setHistory(newHist);
    setHistoryStep(historyStepRef.current);
    onStageAnnotation?.({ type: 'drawing', lines: [] });
  };

  const getStagePos = () => {
    const stage = stageRef.current;
    if (!stage) return null;
    return stage.getRelativePointerPosition();
  };

  const pointToSegmentDist = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
    return Math.sqrt((px - (x1 + t * dx)) ** 2 + (py - (y1 + t * dy)) ** 2);
  };

  const isShapeHit = (shape: any, ex: number, ey: number, radius: number): boolean => {
    const pts = shape.points || [];
    if (shape.type === 'circle') {
      const d = Math.sqrt((ex - pts[0]) ** 2 + (ey - pts[1]) ** 2);
      return d <= pts[2] + radius;
    }
    if (shape.type === 'rect') {
      const rx = Math.min(pts[0], pts[2]);
      const ry = Math.min(pts[1], pts[3]);
      const rw = Math.abs(pts[2] - pts[0]);
      const rh = Math.abs(pts[3] - pts[1]);
      const nearX = Math.max(rx, Math.min(ex, rx + rw));
      const nearY = Math.max(ry, Math.min(ey, ry + rh));
      return Math.sqrt((ex - nearX) ** 2 + (ey - nearY) ** 2) <= radius;
    }
    if (shape.type === 'straightline' || shape.type === 'arrow') {
      return pointToSegmentDist(ex, ey, pts[0], pts[1], pts[2], pts[3]) <= radius;
    }
    for (let i = 0; i < pts.length - 2; i += 2) {
      if (pointToSegmentDist(ex, ey, pts[i], pts[i + 1], pts[i + 2], pts[i + 3]) <= radius) return true;
    }
    return false;
  };

  const handleMouseDown = () => {
    if (!canAnnotate || tool === 'none') return;
    isDrawing.current = true;
    const pos = getStagePos();
    if (!pos) return;

    originRef.current = { x: pos.x, y: pos.y };
    const effectiveWidth = tool === 'highlighter' ? Math.max(14, strokeWidth * 3) : strokeWidth;
    const effectiveOpacity = tool === 'highlighter' ? 0.38 : 1;

    let newShape: any = {
      type: 'line',
      tool,
      points: [pos.x, pos.y],
      color,
      strokeWidth: effectiveWidth,
      opacity: effectiveOpacity,
    };

    if (tool === 'rect') {
      newShape = { type: 'rect', tool, points: [pos.x, pos.y, pos.x, pos.y], color, strokeWidth };
    } else if (tool === 'circle') {
      newShape = { type: 'circle', tool, points: [pos.x, pos.y, 0], color, strokeWidth };
    } else if (tool === 'line') {
      newShape = { type: 'straightline', tool, points: [pos.x, pos.y, pos.x, pos.y], color, strokeWidth };
    } else if (tool === 'arrow') {
      newShape = { type: 'arrow', tool, points: [pos.x, pos.y, pos.x, pos.y], color, strokeWidth };
    } else if (tool === 'eraser') {
      newShape = { type: 'eraser', tool: 'eraser', points: [pos.x, pos.y], color: '#ffffff', strokeWidth: strokeWidth * 3 };
    }

    currentShapeRef.current = newShape;

    if (tool === 'pen' || tool === 'highlighter') {
      if (activeDrawingRef.current) {
        activeDrawingRef.current.points(newShape.points);
        activeDrawingRef.current.stroke(color);
        activeDrawingRef.current.strokeWidth(effectiveWidth);
        activeDrawingRef.current.opacity(effectiveOpacity);
        activeDrawingRef.current.show();
      }
    } else if (tool === 'rect' && previewRectRef.current) {
      previewRectRef.current.x(pos.x);
      previewRectRef.current.y(pos.y);
      previewRectRef.current.width(0);
      previewRectRef.current.height(0);
      previewRectRef.current.stroke(color);
      previewRectRef.current.strokeWidth(strokeWidth);
      previewRectRef.current.show();
    } else if (tool === 'circle' && previewCircleRef.current) {
      previewCircleRef.current.x(pos.x);
      previewCircleRef.current.y(pos.y);
      previewCircleRef.current.radius(0);
      previewCircleRef.current.stroke(color);
      previewCircleRef.current.strokeWidth(strokeWidth);
      previewCircleRef.current.show();
    } else if ((tool === 'line' || tool === 'arrow') && previewLineRef.current) {
      previewLineRef.current.points([pos.x, pos.y, pos.x, pos.y]);
      previewLineRef.current.stroke(color);
      previewLineRef.current.strokeWidth(strokeWidth);
      previewLineRef.current.pointerAtEnd(tool === 'arrow');
      previewLineRef.current.show();
    }

    layerRef.current?.batchDraw();
  };

  const handleMouseMove = () => {
    const pos = getStagePos();
    if (!pos) return;

    if (tool === 'eraser' && isDrawing.current && canAnnotate) {
      const ERASER_RADIUS = Math.max(12, strokeWidth * 3);
      const currentLines = historyRef.current[historyStepRef.current] || [];
      const surviving = currentLines.filter((shape: any) => !isShapeHit(shape, pos.x, pos.y, ERASER_RADIUS));
      if (surviving.length !== currentLines.length) {
        const newHist = [...historyRef.current.slice(0, historyStepRef.current + 1), surviving];
        historyRef.current = newHist;
        historyStepRef.current = newHist.length - 1;
        setHistory([...newHist]);
        setHistoryStep(historyStepRef.current);
        onStageAnnotation?.({ type: 'drawing', lines: surviving });
      }
      return;
    }

    if (!isDrawing.current || !canAnnotate || tool === 'none' || !currentShapeRef.current) return;
    const shape = currentShapeRef.current;
    const origin = originRef.current;
    if (!origin) return;

    if (tool === 'pen' || tool === 'highlighter') {
      shape.points.push(pos.x, pos.y);
      if (activeDrawingRef.current) activeDrawingRef.current.points(shape.points);
    } else if (tool === 'rect' && previewRectRef.current) {
      const x = Math.min(origin.x, pos.x);
      const y = Math.min(origin.y, pos.y);
      const w = Math.abs(pos.x - origin.x);
      const h = Math.abs(pos.y - origin.y);
      shape.points = [origin.x, origin.y, pos.x, pos.y];
      previewRectRef.current.x(x);
      previewRectRef.current.y(y);
      previewRectRef.current.width(w);
      previewRectRef.current.height(h);
    } else if (tool === 'circle' && previewCircleRef.current) {
      const dx = pos.x - origin.x;
      const dy = pos.y - origin.y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      shape.points = [origin.x, origin.y, radius];
      previewCircleRef.current.x(origin.x);
      previewCircleRef.current.y(origin.y);
      previewCircleRef.current.radius(radius);
    } else if ((tool === 'line' || tool === 'arrow') && previewLineRef.current) {
      shape.points = [origin.x, origin.y, pos.x, pos.y];
      previewLineRef.current.points([origin.x, origin.y, pos.x, pos.y]);
    }

    layerRef.current?.batchDraw();
  };

  const handleMouseUp = () => {
    if (!canAnnotate || tool === 'none') return;
    isDrawing.current = false;

    activeDrawingRef.current?.hide();
    previewRectRef.current?.hide();
    previewCircleRef.current?.hide();
    previewLineRef.current?.hide();
    originRef.current = null;

    if (currentShapeRef.current && tool !== 'eraser') {
      const finalLines = [...(historyRef.current[historyStepRef.current] || []), currentShapeRef.current];
      const newHistory = historyRef.current.slice(0, historyStepRef.current + 1);
      newHistory.push(finalLines);
      historyRef.current = newHistory;
      historyStepRef.current = newHistory.length - 1;
      setHistory(newHistory);
      setHistoryStep(historyStepRef.current);
      onStageAnnotation?.({ type: 'drawing', lines: finalLines });
    }

    currentShapeRef.current = null;
  };

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
      onStageAnnotation?.({ type: 'sticky_note', text: noteText });
    }
    setNoteText('');
  };

  const stickyNotes = annotations.filter((a: any) => a?.annotation_data?.type === 'sticky_note' || a?.annotation_data?.text);

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-slate-100 dark:bg-slate-950 overflow-hidden select-none">
      {/* Main Document & Interactive Drawing Workspace */}
      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
        {/* Top Drawing Toolbar — always active for all file types */}
        {canAnnotate && (
          <div className="shrink-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 z-20">
            {/* Tool buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTool('none')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  tool === 'none'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Seç / Kaydır
              </button>
              <button
                type="button"
                onClick={() => setTool('pen')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  tool === 'pen'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Kalem"
              >
                <PenTool className="w-3.5 h-3.5" /> Kalem
              </button>
              <button
                type="button"
                onClick={() => setTool('highlighter')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  tool === 'highlighter'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Fosforlu Kalem"
              >
                <Highlighter className="w-3.5 h-3.5" /> Fosforlu
              </button>
              <button
                type="button"
                onClick={() => setTool('rect')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  tool === 'rect'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Dikdörtgen"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTool('circle')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  tool === 'circle'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Daire"
              >
                <CircleIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTool('line')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  tool === 'line'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Çizgi"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTool('arrow')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  tool === 'arrow'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Ok"
              >
                <MoveRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTool('eraser')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  tool === 'eraser'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Silgi"
              >
                <Eraser className="w-3.5 h-3.5" /> Silgi
              </button>
            </div>

            {/* Color + Stroke Width + Undo/Redo */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    title={c.label}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                      color === c.value ? 'scale-125 ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {STROKE_WIDTHS.map((sw) => (
                  <button
                    key={sw.value}
                    type="button"
                    onClick={() => setStrokeWidth(sw.value)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      strokeWidth === sw.value
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {sw.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={historyStep === 0}
                  title="Geri Al"
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 disabled:opacity-30 cursor-pointer"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={historyStep >= history.length - 1}
                  title="İleri Al"
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 disabled:opacity-30 cursor-pointer"
                >
                  <Redo className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  title="Tüm Çizimleri Temizle"
                  className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Document Sheet + Konva Canvas Overlay */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center bg-slate-200/70 dark:bg-slate-950">
          <div
            ref={boardContainerRef}
            className="relative w-full max-w-[860px] min-h-[1080px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            style={{
              cursor: tool === 'none' ? 'default' : tool === 'eraser' ? 'cell' : 'crosshair',
            }}
          >
            {/* Document Header Banner inside Worksheet */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    {file.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Belge Çalışma ve İşaretleme Tuvali • Üzerine serbest çizim yapabilir ve kaydedebilirsiniz
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-20">
                {isOfficeDoc && (
                  <button
                    type="button"
                    onClick={() => setShowOfficeFrame((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 dark:bg-slate-800 dark:text-violet-300 border border-violet-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {showOfficeFrame ? 'Çalışma Sayfası Görünümü' : 'Web Belge Görünümü'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => downloadFileFromUrl(file.url, file.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-slate-800 dark:text-slate-200 border border-indigo-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Dosyayı İndir
                </button>
              </div>
            </div>

            {/* Document Body Content */}
            <div className="p-6 sm:p-10 min-h-[1000px] relative">
              {isParsingDoc ? (
                <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  <span className="text-sm">Belge içeriği okunuyor...</span>
                </div>
              ) : showOfficeFrame && isOfficeDoc ? (
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
                  title={file.name}
                  className="w-full h-[980px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white"
                />
              ) : docxParagraphs && docxParagraphs.length > 0 ? (
                <div className="space-y-3.5 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-sans">
                  {docxParagraphs.map((para, idx) => (
                    <p key={idx} className="whitespace-pre-wrap break-words">
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <div
                  className="w-full min-h-[940px] rounded-xl p-6 border border-dashed border-slate-200 dark:border-slate-800"
                  style={{
                    backgroundImage:
                      'radial-gradient(rgba(148, 163, 184, 0.25) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                >
                  <div className="max-w-lg mx-auto text-center py-8 px-4 mb-6 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {file.name} — İnceleme & Çizim Sayfası
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Üstteki kalem, fosforlu kalem, şekil ve silgi araçlarını kullanarak bu çalışma alanı üzerinde çizim ve işaretleme yapabilir, sağ üstteki <strong>Kaydet</strong> butonuyla kaydedebilirsiniz.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Konva Drawing Layer Over Entire Document Sheet */}
            <div
              className="absolute inset-0 z-10"
              style={{ pointerEvents: tool === 'none' ? 'none' : 'auto' }}
            >
              <Stage
                ref={stageRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
              >
                <Layer ref={layerRef}>
                  {allLines.map((line: any, i: number) => {
                    const isEraser = line.tool === 'eraser';
                    const strokeColor = isEraser ? '#ffffff' : line.color || '#ef4444';
                    const width = line.strokeWidth || 4;
                    const opacity = line.opacity ?? (line.tool === 'highlighter' ? 0.38 : 1);
                    const globalComp = isEraser ? 'destination-out' : 'source-over';

                    if (line.type === 'rect') {
                      return (
                        <Rect
                          key={i}
                          x={Math.min(line.points[0], line.points[2])}
                          y={Math.min(line.points[1], line.points[3])}
                          width={Math.abs(line.points[2] - line.points[0])}
                          height={Math.abs(line.points[3] - line.points[1])}
                          stroke={strokeColor}
                          strokeWidth={width}
                          globalCompositeOperation={globalComp}
                        />
                      );
                    }
                    if (line.type === 'circle') {
                      return (
                        <Circle
                          key={i}
                          x={line.points[0]}
                          y={line.points[1]}
                          radius={line.points[2]}
                          stroke={strokeColor}
                          strokeWidth={width}
                          globalCompositeOperation={globalComp}
                        />
                      );
                    }
                    if (line.type === 'straightline') {
                      return (
                        <Line
                          key={i}
                          points={line.points}
                          stroke={strokeColor}
                          strokeWidth={width}
                          lineCap="round"
                          lineJoin="round"
                          globalCompositeOperation={globalComp}
                        />
                      );
                    }
                    if (line.type === 'arrow') {
                      return (
                        <Arrow
                          key={i}
                          points={line.points}
                          stroke={strokeColor}
                          strokeWidth={width}
                          fill={strokeColor}
                          pointerAtEnd={true}
                          pointerLength={12}
                          pointerWidth={10}
                          globalCompositeOperation={globalComp}
                        />
                      );
                    }
                    return (
                      <Line
                        key={i}
                        points={line.points}
                        stroke={strokeColor}
                        strokeWidth={isEraser ? width * 2 : width}
                        opacity={opacity}
                        tension={0.5}
                        lineCap="round"
                        lineJoin="round"
                        globalCompositeOperation={globalComp}
                      />
                    );
                  })}

                  <Line
                    ref={activeDrawingRef}
                    points={[]}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    listening={false}
                    visible={false}
                  />
                  <Rect
                    ref={previewRectRef}
                    x={0}
                    y={0}
                    width={0}
                    height={0}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    listening={false}
                    visible={false}
                    dash={[6, 3]}
                  />
                  <Circle
                    ref={previewCircleRef}
                    x={0}
                    y={0}
                    radius={0}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    listening={false}
                    visible={false}
                    dash={[6, 3]}
                  />
                  <Arrow
                    ref={previewLineRef}
                    points={[0, 0, 0, 0]}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    listening={false}
                    visible={false}
                    fill={color}
                    pointerAtEnd={false}
                  />
                </Layer>
              </Stage>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Sticky Notes */}
      <div className="w-full md:w-80 lg:w-96 h-72 md:h-full border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            Notlar
          </h3>
        </div>
        <div ref={notesContainerRef} className="flex-1 p-4 overflow-auto space-y-3">
          {stickyNotes.map((a: any, i: number) => (
            <div
              key={a.id ?? i}
              className="bg-amber-50 dark:bg-slate-800 p-3 rounded-xl border border-amber-200/80 dark:border-slate-700 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1.5">
                {a.author?.avatar_url ? (
                  <img
                    src={a.author.avatar_url}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {(a.author?.full_name || 'Ü').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {a.author?.full_name || 'Ekip Üyesi'}
                </span>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {a.annotation_data?.text}
              </p>
            </div>
          ))}
          {stickyNotes.length === 0 && (
            <p className="text-sm text-slate-400 italic text-center mt-8">
              Henüz yazılı not eklenmedi.
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>
        {canAnnotate && (
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Dosya hakkında not yazın..."
              className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              rows={2}
            />
            <button
              type="button"
              onClick={handleAddNote}
              disabled={!noteText.trim()}
              className="mt-2 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50 transition-colors cursor-pointer"
            >
              Notu Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
