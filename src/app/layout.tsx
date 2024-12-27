import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Menu from "@/components/Menu";

export const metadata: Metadata = {
  title: "Vishal Shukla | Portfolio",
  description: "Developer based in India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Menu />
        {children}
      </body>
    </html>
  );
}
