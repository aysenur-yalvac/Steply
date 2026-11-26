'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import {
  PenTool,
  Eraser,
  RotateCcw,
  Trash2,
  Hand,
  ZoomIn,
  ZoomOut,
  Loader2,
} from 'lucide-react';

export interface ImageStroke {
  tool: 'pen' | 'eraser';
  points: number[];
  color?: string;
  width?: number;
  normalized?: boolean;
}

const COLOR_OPTIONS = [
  { label: 'Kırmızı', value: '#ef4444' },
  { label: 'Mavi', value: '#3b82f6' },
  { label: 'Yeşil', value: '#10b981' },
  { label: 'Sarı', value: '#eab308' },
  { label: 'Siyah', value: '#0f172a' },
  { label: 'Beyaz', value: '#ffffff' },
];

const WIDTH_OPTIONS = [
  { label: 'İnce', value: 2 },
  { label: 'Orta', value: 4 },
  { label: 'Kalın', value: 8 },
];

function extractInitialImageLines(annotations: any[]): ImageStroke[] {
  if (!Array.isArray(annotations)) return [];
  const extracted: ImageStroke[] = [];

  annotations.forEach((a: any) => {
    const data = a?.annotation_data;
    if (!data || data.type !== 'drawing') return;

    if (Array.isArray(data.lines)) {
      extracted.push(...(data.lines as ImageStroke[]));
    } else if (data.lines && typeof data.lines === 'object' && Array.isArray(data.lines[1])) {
      extracted.push(...(data.lines[1] as ImageStroke[]));
    } else if (data.pages && typeof data.pages === 'object' && Array.isArray(data.pages[1])) {
      extracted.push(...(data.pages[1] as ImageStroke[]));
    }
  });

  return extracted;
}

function denormalizeStrokePoints(
  points: number[],
  width: number,
  height: number,
  normalizedFlag?: boolean
): number[] {
  if (!points || points.length === 0 || !width || !height) return [];
  const isNorm =
    normalizedFlag === true ||
    (normalizedFlag === undefined && points.every((p) => p >= 0 && p <= 1.05));
  if (isNorm) {
    return points.map((p, idx) => (idx % 2 === 0 ? p * width : p * height));
  }
  return points;
}

export default function ImageViewer({
  file,
  annotations,
  onStageAnnotation,
  canAnnotate = false,
}: any) {
  // Default mode MUST be 'view' (Görüntüleme / Kaydırma) so touch/mouse does not draw accidentally
  const [tool, setTool] = useState<'view' | 'pen' | 'eraser'>('view');
  const [strokeColor, setStrokeColor] = useState<string>('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600,
  });

  const [lines, setLines] = useState<ImageStroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<{
    tool: 'pen' | 'eraser';
    color: string;
    width: number;
    rawPoints: number[];
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLines(extractInitialImageLines(annotations));
  }, [annotations]);

  useEffect(() => {
    const updateContainer = () => {
      if (containerRef.current) {
        setContainerSize({
          width: Math.max(280, containerRef.current.clientWidth - 32),
          height: Math.max(280, containerRef.current.clientHeight - 32),
        });
      }
    };
    updateContainer();
    window.addEventListener('resize', updateContainer);
    return () => window.removeEventListener('resize', updateContainer);
  }, []);

  const baseScale = naturalSize
    ? Math.min(
        containerSize.width / naturalSize.width,
        containerSize.height / naturalSize.height,
        1
      )
    : 1;

  const displayWidth = naturalSize
    ? Math.max(120, Math.round(naturalSize.width * baseScale * zoomScale))
    : 0;
  const displayHeight = naturalSize
    ? Math.max(120, Math.round(naturalSize.height * baseScale * zoomScale))
    : 0;

  const isDrawingMode = canAnnotate && (tool === 'pen' || tool === 'eraser');

  const handlePointerDown = (e: any) => {
    if (!isDrawingMode || !displayWidth || !displayHeight) return;
    if (e?.evt?.cancelable) {
      e.evt.preventDefault();
    }
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    setActiveStroke({
      tool: tool === 'eraser' ? 'eraser' : 'pen',
      color: strokeColor,
      width: strokeWidth,
      rawPoints: [pos.x, pos.y],
    });
  };

  const handlePointerMove = (e: any) => {
    if (!activeStroke || !isDrawingMode) return;
    if (e?.evt?.cancelable) {
      e.evt.preventDefault();
    }
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    setActiveStroke((prev) =>
      prev
        ? {
            ...prev,
            rawPoints: [...prev.rawPoints, pos.x, pos.y],
          }
        : null
    );
  };

  const handlePointerUp = () => {
    if (!activeStroke || !displayWidth || !displayHeight) return;

    const normalizedPoints = activeStroke.rawPoints.map((p, idx) =>
      idx % 2 === 0 ? p / displayWidth : p / displayHeight
    );

    const committed: ImageStroke = {
      tool: activeStroke.tool,
      points: normalizedPoints,
      color: activeStroke.color,
      width: activeStroke.width,
      normalized: true,
    };

    const nextLines = [...lines, committed];
    setLines(nextLines);
    setActiveStroke(null);

    if (onStageAnnotation) {
      onStageAnnotation({
        type: 'drawing',
        lines: nextLines,
        pages: { 1: nextLines },
      });
    }
  };

  const handleUndo = () => {
    if (lines.length === 0) return;
    const nextLines = lines.slice(0, -1);
    setLines(nextLines);
    if (onStageAnnotation) {
      onStageAnnotation({
        type: 'drawing',
        lines: nextLines,
        pages: { 1: nextLines },
      });
    }
  };

  const handleClear = () => {
    if (lines.length === 0) return;
    setLines([]);
    if (onStageAnnotation) {
      onStageAnnotation({
        type: 'drawing',
        lines: [],
        pages: { 1: [] },
      });
    }
  };

  const zoomIn = () => setZoomScale((prev) => Math.min(2.5, +(prev + 0.2).toFixed(2)));
  const zoomOut = () => setZoomScale((prev) => Math.max(0.5, +(prev - 0.2).toFixed(2)));
  const resetZoom = () => setZoomScale(1.0);

  return (
    <div className="h-full w-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Toolbar */}
      <div className="shrink-0 w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 px-3 py-2.5 flex flex-wrap items-center justify-between gap-2.5 z-30">
        {canAnnotate ? (
          <div className="flex items-center flex-wrap gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            {/* View / Scroll Mode (Default) */}
            <button
              type="button"
              onClick={() => setTool('view')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                tool === 'view'
                  ? 'bg-violet-600 text-white shadow-sm ring-1 ring-violet-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Görüntüleme ve Kaydırma Modu"
            >
              <Hand className="w-3.5 h-3.5" />
              <span>Kaydır</span>
            </button>

            {/* Pen Tool */}
            <button
              type="button"
              onClick={() => setTool((prev) => (prev === 'pen' ? 'view' : 'pen'))}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                tool === 'pen'
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Çizim Kalemi"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Çiz</span>
            </button>

            {/* Eraser Tool */}
            <button
              type="button"
              onClick={() => setTool((prev) => (prev === 'eraser' ? 'view' : 'eraser'))}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                tool === 'eraser'
                  ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Sadece Çizimleri Silen Şeffaf Silgi"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Silgi</span>
            </button>

            {/* Color Palette */}
            {tool === 'pen' && (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setStrokeColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-4 h-4 rounded-full transition-transform cursor-pointer border border-white/30 ${
                      strokeColor === c.value
                        ? 'scale-125 ring-2 ring-violet-400 shadow-sm'
                        : 'opacity-75 hover:opacity-100 hover:scale-110'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            )}

            {/* Stroke Width */}
            {tool === 'pen' && (
              <div className="flex items-center gap-1 pl-1.5 border-l border-slate-800">
                {WIDTH_OPTIONS.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => setStrokeWidth(w.value)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      strokeWidth === w.value
                        ? 'bg-slate-700 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={`Kalınlık: ${w.label}`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            )}

            {/* Undo */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={lines.length === 0}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
              title="Son Çizimi Geri Al"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Clear All */}
            <button
              type="button"
              onClick={handleClear}
              disabled={lines.length === 0}
              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 disabled:opacity-30 transition-colors cursor-pointer"
              title="Tüm Çizimleri Temizle"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-400">Görsel Önizleme</div>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 ml-auto">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoomScale <= 0.5}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
            title="Uzaklaştır"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="px-2 py-1 rounded-lg text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Sıfırla (%100)"
          >
            {Math.round(zoomScale * 100)}%
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoomScale >= 2.5}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
            title="Yakınlaştır"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        ref={containerRef}
        className="flex-1 h-full w-full overflow-auto flex items-center justify-center p-3 sm:p-6 bg-slate-950"
      >
        {!naturalSize && (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
            <span className="text-xs">Görsel yükleniyor...</span>
          </div>
        )}

        {/* Image + Independent Transparent Canvas Overlay */}
        <div
          className="relative shadow-2xl rounded-lg overflow-hidden bg-transparent"
          style={{
            width: naturalSize ? displayWidth : 'auto',
            height: naturalSize ? displayHeight : 'auto',
            display: naturalSize ? 'block' : 'none',
          }}
        >
          {/* Underlying Photo (Separate DOM element — never touched by destination-out eraser) */}
          <img
            src={file.url}
            alt={file.name || 'Görsel'}
            draggable={false}
            onLoad={(e) => {
              const imgEl = e.currentTarget;
              if (imgEl.naturalWidth && imgEl.naturalHeight) {
                setNaturalSize({
                  width: imgEl.naturalWidth,
                  height: imgEl.naturalHeight,
                });
              }
            }}
            className="block w-full h-full object-contain select-none pointer-events-none"
          />

          {/* Transparent Top Drawing Canvas Layer */}
          {naturalSize && displayWidth > 0 && displayHeight > 0 && (
            <div
              className="absolute inset-0 z-10 bg-transparent"
              style={{
                pointerEvents: isDrawingMode ? 'auto' : 'none',
                touchAction: isDrawingMode ? 'none' : 'auto',
                cursor:
                  tool === 'pen'
                    ? 'crosshair'
                    : tool === 'eraser'
                    ? 'cell'
                    : 'default',
              }}
            >
              <Stage
                width={displayWidth}
                height={displayHeight}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
              >
                <Layer>
                  {lines.map((line, i) => {
                    const pts = denormalizeStrokePoints(
                      line.points,
                      displayWidth,
                      displayHeight,
                      line.normalized
                    );
                    return (
                      <Line
                        key={`img_line_${i}`}
                        points={pts}
                        stroke={
                          line.tool === 'eraser'
                            ? '#000000'
                            : line.color || '#ef4444'
                        }
                        strokeWidth={
                          line.tool === 'eraser' ? 24 : line.width || 4
                        }
                        tension={0.5}
                        lineCap="round"
                        lineJoin="round"
                        globalCompositeOperation={
                          line.tool === 'eraser'
                            ? 'destination-out'
                            : 'source-over'
                        }
                      />
                    );
                  })}

                  {activeStroke && (
                    <Line
                      points={activeStroke.rawPoints}
                      stroke={
                        activeStroke.tool === 'eraser'
                          ? '#000000'
                          : activeStroke.color || '#ef4444'
                      }
                      strokeWidth={
                        activeStroke.tool === 'eraser'
                          ? 24
                          : activeStroke.width || 4
                      }
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                      globalCompositeOperation={
                        activeStroke.tool === 'eraser'
                          ? 'destination-out'
                          : 'source-over'
                      }
                    />
                  )}
                </Layer>
              </Stage>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
