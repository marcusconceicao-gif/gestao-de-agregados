import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

export interface SignaturePadHandle {
  toDataURL: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
}

interface Props {
  value?: string | null;
  onChange?: (dataUrl: string | null) => void;
  height?: number;
}

export const SignaturePad = forwardRef<SignaturePadHandle, Props>(function SignaturePad(
  { value, onChange, height = 160 },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [empty, setEmpty] = useState(true);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#111";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  useEffect(() => {
    resize();
    if (value && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const ctx = getCtx();
        const rect = canvasRef.current!.getBoundingClientRect();
        ctx?.drawImage(img, 0, 0, rect.width, rect.height);
        setEmpty(false);
      };
      img.src = value;
    }
    const onR = () => resize();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    last.current = pos(e);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const p = pos(e);
    const ctx = getCtx();
    if (ctx && last.current) {
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    last.current = p;
    if (empty) setEmpty(false);
  };

  const end = () => {
    drawing.current = false;
    last.current = null;
    const data = canvasRef.current?.toDataURL("image/png") ?? null;
    onChange?.(data);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setEmpty(true);
    onChange?.(null);
  };

  useImperativeHandle(ref, () => ({
    toDataURL: () => (empty ? null : canvasRef.current?.toDataURL("image/png") ?? null),
    clear,
    isEmpty: () => empty,
  }));

  return (
    <div className="space-y-2">
      <div
        className="rounded-md border bg-white overflow-hidden touch-none"
        style={{ height }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          <Eraser className="size-4 mr-1" /> Limpar assinatura
        </Button>
      </div>
    </div>
  );
});
