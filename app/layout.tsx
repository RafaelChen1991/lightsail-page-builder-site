import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PageBuilder Lightsail",
  description: "Next.js page builder official website with PostgreSQL and admin editing."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
