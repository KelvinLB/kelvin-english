import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kelvin English — Tu Coach Personal",
  description:
    "Aprendizaje de inglés personalizado, adaptado a cómo aprende tu cerebro.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-slate-950 text-slate-200 antialiased">{children}</body>
    </html>
  );
}
