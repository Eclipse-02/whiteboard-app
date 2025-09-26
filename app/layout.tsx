import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A Whiteboard",
  description: "Just a simple whiteboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
