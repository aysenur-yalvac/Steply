'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { PenTool, Eraser, Loader2 } from 'lucide-react';

export default function ImageViewer({ file, annotations, onStageAnnotation, canAnnotate }: any) {
  const [image] = useImage(file.url, 'anonymous');
  const [lines, setLines] = useState<any[]>([]);
  const [tool, setTool] = useState('pen'); // pen or eraser
  const isDrawing = useRef(false);

  // Combine saved drawing annotations
  const savedLines = annotations
    .filter((a: any) => a.annotation_data.type === 'drawing')
    .flatMap((a: any) => a.annotation_data.lines || []);

  const allLines = [...savedLines, ...lines];

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
    onStageAnnotation({ type: 'drawing', lines });
  };

  if (!image) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-indigo-500"/></div>;
  }

  // Calculate scaling to fit the image in the container (very basic)
  const containerWidth = window.innerWidth * 0.8; 
  const containerHeight = window.innerHeight * 0.7;
  const scale = Math.min(containerWidth / image.width, containerHeight / image.height, 1);

  return (
    <div className="h-full flex flex-col bg-slate-100">
      {canAnnotate && (
        <div className="flex items-center gap-4 p-3 bg-white border-b border-slate-200 justify-center">
          <button 
            onClick={() => setTool('pen')} 
            className={`p-2 rounded-lg flex items-center gap-2 ${tool === 'pen' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <PenTool className="w-4 h-4" /> Çiz
          </button>
          <button 
            onClick={() => setTool('eraser')} 
            className={`p-2 rounded-lg flex items-center gap-2 ${tool === 'eraser' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Eraser className="w-4 h-4" /> Silgi (Mevcut çizimden)
          </button>
          <button 
            onClick={() => { setLines([]); onStageAnnotation(null); }} 
            className="p-2 rounded-lg flex items-center gap-2 text-red-500 hover:bg-red-50"
          >
            Temizle
          </button>
        </div>
      )}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <div className="shadow-lg bg-white" style={{ width: image.width * scale, height: image.height * scale }}>
          <Stage
            width={image.width * scale}
            height={image.height * scale}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            <Layer>
              <KonvaImage image={image} width={image.width * scale} height={image.height * scale} />
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
      </div>
    </div>
  );
}