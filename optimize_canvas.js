const fs = require('fs');
const path = require('path');

let codeViewerPath = path.join(process.cwd(), 'src/components/projects/viewer/CodeViewer.tsx');
let content = fs.readFileSync(codeViewerPath, 'utf8');

// 1. Optimize Drawing (No setState on mousemove)
// We will replace the handleMouseDown, handleMouseMove, handleMouseUp logic and use refs for the current drawing shape
const newDrawingLogic = `
  const currentShapeRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  const handleMouseDown = (e: any) => {
    if (!canAnnotate || tool === 'none') return;
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    
    let newShape = { type: 'line', tool, points: [pos.x, pos.y], color, strokeWidth };
    if (tool === 'rect') newShape = { type: 'rect', tool, points: [pos.x, pos.y, pos.x, pos.y], color, strokeWidth };
    if (tool === 'circle') newShape = { type: 'circle', tool, points: [pos.x, pos.y, 0], color, strokeWidth };
    
    currentShapeRef.current = newShape;

    // To prevent React re-renders, we could manually inject a Konva Node into the layer here, 
    // but the easiest way is to push it to state ONCE on mouse down, 
    // then mutate the Konva node directly during mousemove.
    const newLines = [...currentLines, newShape];
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newLines);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    setMousePos(pos);

    if (!isDrawing.current || !canAnnotate || tool === 'none' || !currentShapeRef.current) return;
    
    // Direct DOM/Konva manipulation to avoid React re-render lag
    const shape = currentShapeRef.current;
    
    if (tool === 'pen' || tool === 'eraser') {
      shape.points.push(pos.x, pos.y);
    } else if (tool === 'rect') {
      shape.points = [shape.points[0], shape.points[1], pos.x, pos.y];
    } else if (tool === 'circle') {
      const dx = pos.x - shape.points[0];
      const dy = pos.y - shape.points[1];
      const radius = Math.sqrt(dx * dx + dy * dy);
      shape.points = [shape.points[0], shape.points[1], radius];
    }
    
    // Find the actual Konva node and update it directly
    const layer = layerRef.current;
    if (layer) {
      const nodes = layer.getChildren();
      const lastNode = nodes[nodes.length - 2]; // -2 because the eraser cursor is the very last node!
      if (lastNode) {
        if (tool === 'pen' || tool === 'eraser') {
          lastNode.points(shape.points);
        } else if (tool === 'rect') {
          lastLinePointsToRect(lastNode, shape.points);
        } else if (tool === 'circle') {
          lastNode.radius(shape.points[2]);
        }
        layer.batchDraw();
      }
    }
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
    // We update the state once at the end so React reconciles the mutated ref data
    const finalHistory = [...history];
    finalHistory[historyStep] = [...currentLines.slice(0, -1), currentShapeRef.current];
    setHistory(finalHistory);
    onStageAnnotation({ type: 'drawing', lines: finalHistory[historyStep] });
    currentShapeRef.current = null;
  };
`;

// Replace the old mouse handlers
content = content.replace(
  /const handleMouseDown = \(e: any\) => \{[\s\S]*?const handleMouseUp = \(\) => \{[\s\S]*?onStageAnnotation\(\{ type: 'drawing', lines: currentLines \}\);\s*\};/m,
  newDrawingLogic.trim()
);

// Add layerRef to Layer
content = content.replace(
  /<Layer>/,
  '<Layer ref={layerRef}>'
);

fs.writeFileSync(codeViewerPath, content, 'utf8');
console.log("Optimized CodeViewer canvas performance");
