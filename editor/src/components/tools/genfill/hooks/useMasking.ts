import { useState, RefObject } from "react";

export default function useMasking(maskCanvasRef: RefObject<HTMLCanvasElement>) {
  const [drawing, setDrawing] = useState<boolean>(false);

  const startDrawing = () => setDrawing(true);
  const stopDrawing = () => setDrawing(false);

  const drawMask = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!drawing || !maskCanvasRef.current) return;
    const rect = maskCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = maskCanvasRef.current.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "red";
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const clearMask = () => {
    if (!maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
  };

  return { startDrawing, stopDrawing, drawMask, clearMask };
}