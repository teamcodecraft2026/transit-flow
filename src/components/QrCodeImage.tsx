import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

type Props = {
  value: string;
  size?: number;
  className?: string;
};

/**
 * Renders a real QR code entirely in the browser (no third-party image API,
 * no network request, no rate limits  just the `qrcode` npm package).
 */
export function QrCodeImage({ value, size = 200, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    setError(false);
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: "#0a122a", light: "#ffffff" },
    }).catch(() => setError(true));
  }, [value, size]);

  if (error) {
    return (
      <div
        style={{ width: size, height: size }}
        className={className ? `${className} flex items-center justify-center bg-white/10 text-[11px] text-ink-muted` : undefined}
      >
        QR unavailable
      </div>
    );
  }

  return <canvas ref={canvasRef} width={size} height={size} className={className} />;
}
