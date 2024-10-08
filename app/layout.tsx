import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "study-platform",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: { id: string }
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div>
          <Header/>
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
