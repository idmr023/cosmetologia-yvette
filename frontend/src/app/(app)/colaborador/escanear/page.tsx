"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Loader2, AlertCircle } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Button } from "@/components/ui/Button";

export default function EscanearPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "scanning" | "error" | "success">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!containerRef.current || !active) return;

        const scanner = new Html5Qrcode("qr-reader");

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (!active) return;
            scanner.stop();
            setStatus("success");
            // El QR codifica /cita/{id} — extraer el ID
            const match = decodedText.match(/\/cita\/([a-f0-9-]+)/i);
            if (match) {
              router.push(`/cita/${match[1]}`);
            } else {
              setError("QR no válido");
              setStatus("error");
            }
          },
          () => undefined,
        );

        if (active) setStatus("scanning");
      } catch {
        if (active) {
          setError("No se pudo acceder a la cámara");
          setStatus("error");
        }
      }
    }

    startScanner();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <>
      <TopBar title="Escanear QR" />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <QrCode className="h-10 w-10 text-gold" />
          <p className="text-sm text-neutral-500">
            Apunta la cámara al QR de la boleta del cliente
          </p>
        </div>

        {status === "loading" && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        )}

        <div
          id="qr-reader"
          ref={containerRef}
          className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl"
        />

        {status === "scanning" && (
          <p className="text-center text-sm text-neutral-400">Escaneando...</p>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Reintentar
            </Button>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-sm text-neutral-500">Redirigiendo...</p>
          </div>
        )}
      </div>
    </>
  );
}