import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export function Qr({ value, size = 160 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) {
      QRCode.toCanvas(ref.current, value, { width: size, margin: 1 }, () => {});
    }
  }, [value, size]);
  return <canvas ref={ref} style={{ width: size, height: size }} />;
}
