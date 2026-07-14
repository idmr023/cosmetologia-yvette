"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Download, Home, Loader2, CalendarPlus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { waLink, bookingMessage } from "@/lib/whatsapp";

export interface ReceiptData {
  appointmentId: string;
  boletaNumber: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  serviceCategory: string;
  colaboradorName: string;
  startAt: string;
  modality: "salon" | "domicilio";
  basePrice: string;
  domicilioRecargo: string;
  totalPrice: string;
}

interface ReceiptProps {
  data: ReceiptData;
  onBack?: () => void;
}

export function Receipt({ data, onBack }: ReceiptProps) {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const googleCalendarUrl = (() => {
    const start = new Date(data.startAt);
    const end = new Date(start.getTime() + 60 * 60000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dates = `${fmt(start)}/${fmt(end)}`;
    const text = encodeURIComponent(`Cita Yvette - ${data.serviceName}`);
    const details = encodeURIComponent(
      `Especialista: ${data.colaboradorName}\nModalidad: ${data.modality === "salon" ? "En salón" : "A domicilio"}\nTotal: ${data.totalPrice}`,
    );
    const location = encodeURIComponent(
      data.modality === "salon" ? "Centro de Estética Yvette, Cercado de Lima" : "A domicilio",
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
  })();

  useEffect(() => {
    async function generateQR() {
      const QRCode = (await import("qrcode")).default;
      const url = `${window.location.origin}/cita/${data.appointmentId}`;
      const qr = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: { light: "#ffffff", dark: "#0A0A0A" },
      });
      setQrUrl(qr);
    }
    generateQR();
  }, [data.appointmentId]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(receiptRef.current!, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(img, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`boleta-${data.boletaNumber}.pdf`);
    } catch (e) {
      console.error(e);
    }
    setDownloading(false);
  }

  return (
    <div className="min-h-screen bg-pastel/20 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <CheckCircle2 className="h-14 w-14 text-green-600" />
          <h1 className="text-xl font-semibold text-ink">¡Cita reservada!</h1>
          <p className="text-sm text-neutral-500">
            Guarda o descarga tu boleta con el QR
          </p>
        </div>

        {/* Boleta */}
        <div
          ref={receiptRef}
          className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6"
        >
          {/* Header boleta */}
          <div className="text-center">
            <h2 className="text-lg font-semibold text-ink">Centro de Estética Yvette</h2>
            <p className="text-xs text-neutral-400">RUC 10107822564</p>
            <p className="text-xs text-neutral-400">Cercado de Lima</p>
          </div>

          {/* N° boleta */}
          <div className="flex justify-between border-y border-dashed border-neutral-200 py-2">
            <span className="text-xs text-neutral-400">Boleta N°</span>
            <span className="font-mono text-sm font-semibold text-ink">
              {data.boletaNumber}
            </span>
          </div>

          {/* Detalles */}
          <div className="space-y-2 text-sm">
            <ReceiptRow label="Cliente" value={data.clientName} />
            <ReceiptRow label="Teléfono" value={data.clientPhone} />
            <ReceiptRow label="Servicio" value={data.serviceName} />
            <ReceiptRow label="Especialista" value={data.colaboradorName} />
            <ReceiptRow label="Fecha" value={formatDate(data.startAt)} />
            <ReceiptRow label="Hora" value={formatTime(data.startAt)} />
            <ReceiptRow
              label="Modalidad"
              value={data.modality === "salon" ? "En salón" : "A domicilio"}
            />
          </div>

          {/* Costos */}
          <div className="border-t border-dashed border-neutral-200 pt-3 space-y-1 text-sm">
            <ReceiptRow label="Servicio" value={formatCurrency(data.basePrice)} />
            {data.modality === "domicilio" && Number(data.domicilioRecargo) > 0 && (
              <ReceiptRow
                label="Recargo domicilio"
                value={formatCurrency(data.domicilioRecargo)}
              />
            )}
            <div className="flex justify-between pt-1 text-base font-bold">
              <span className="text-neutral-600">Total</span>
              <span className="text-gold">{formatCurrency(data.totalPrice)}</span>
            </div>
          </div>

          {/* QR */}
          <div className="flex flex-col items-center gap-2 border-t border-dashed border-neutral-200 pt-3">
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt="QR de la cita" className="h-32 w-32" />
            ) : (
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            )}
            <p className="text-center text-xs text-neutral-400">
              Escanea este QR al momento de tu cita
            </p>
          </div>

          {/* Pago */}
          <div className="rounded-lg bg-pastel/40 p-3 text-center">
            <p className="text-sm font-medium text-ink">
              Pagar en efectivo, Yape o Plin
            </p>
            <p className="text-xs text-neutral-500">al momento de la cita</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleDownload} size="lg" fullWidth disabled={downloading}>
            {downloading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Download className="h-5 w-5" /> Descargar
              </>
            )}
          </Button>
          {onBack && (
            <Button onClick={onBack} variant="outline" size="lg">
              <Home className="h-5 w-5" />
            </Button>
          )}
        </div>

        <a
          href={waLink(data.clientPhone, bookingMessage({
            clientName: data.clientName,
            serviceName: data.serviceName,
            colaboradorName: data.colaboradorName,
            date: formatDate(data.startAt),
            time: formatTime(data.startAt),
            modality: data.modality === "salon" ? "En salón" : "A domicilio",
            total: formatCurrency(data.totalPrice),
          }))}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-touch items-center justify-center gap-2 rounded-xl border border-neutral-300 px-5 text-base font-medium text-ink transition-colors hover:border-green-500 hover:text-green-600"
        >
          <MessageCircle className="h-5 w-5" />
          Compartir por WhatsApp
        </a>

        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-touch items-center justify-center gap-2 rounded-xl border border-neutral-300 px-5 text-base font-medium text-ink transition-colors hover:border-gold hover:text-gold"
        >
          <CalendarPlus className="h-5 w-5" />
          Añadir a Google Calendar
        </a>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-ink text-right">{value}</span>
    </div>
  );
}