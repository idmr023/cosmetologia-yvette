import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Centro de Estética Yvette",
  description:
    "Centro de Estética Yvette — peluquería y estética profesional en Cercado de Lima. Desde 2005.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
