import { useEffect, useRef, useState } from "react";
import type { Html5Qrcode as Html5QrcodeType } from "html5-qrcode";

type Props = {
  onScan: (decodedText: string) => void;
  onError?: (message: string) => void;
};

const ELEMENT_ID = "qr-reader-region";

/**
 * Opens the device's back camera and decodes a QR code in real time using
 * the free, open-source `html5-qrcode` library (MIT licensed, no API key,
 * no per-scan cost). Calls `onScan` once with the decoded text, then stops
 * the camera. Requires HTTPS (or localhost)  the browser will not grant
 * camera access otherwise.
 */
export function QrScanner({ onScan, onError }: Props) {
  const [starting, setStarting] = useState(true);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let scannerInstance: Html5QrcodeType | null = null;

    async function boot() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;

      const scanner = new Html5Qrcode(ELEMENT_ID, { verbose: false });
      scannerInstance = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" }, // rear camera on phones
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;
            onScan(decodedText);
          },
          () => {
            // Fires continuously while no QR code is in frame  expected, ignore.
          },
        );
        if (!cancelled) setStarting(false);
      } catch (err) {
        if (!cancelled) {
          setStarting(false);
          onError?.(
            err instanceof Error
              ? err.message
              : "Could not access the camera. Check camera permissions and try again.",
          );
        }
      }
    }

    boot();

    return () => {
      cancelled = true;
      if (scannerInstance) {
        scannerInstance
          .stop()
          .then(() => scannerInstance?.clear())
          .catch(() => {
            // Camera may already be stopped/unmounted  safe to ignore.
          });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-[12px] bg-black">
      <div id={ELEMENT_ID} className="size-full [&_video]:size-full [&_video]:object-cover" />
      {starting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-4 text-center font-sans text-[13px] text-white">
          Starting camera
        </div>
      )}
    </div>
  );
}
