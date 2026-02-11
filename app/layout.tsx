import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/contexts/WalletContext";
import { StreamProvider } from "@/contexts/StreamContext";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "KaspaFlow — Real-Time Streaming Payments on Kaspa",
  description: "Stream money per-second on the world's fastest PoW blockchain. Create continuous payment flows with live visualization powered by Kaspa's 10 BPS BlockDAG.",
  keywords: ["Kaspa", "streaming payments", "blockchain", "KAS", "real-time", "BlockDAG", "crypto payments"],
  openGraph: {
    title: "KaspaFlow — Money That Flows Like Water",
    description: "Real-time streaming payments powered by Kaspa's lightning-fast BlockDAG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <StreamProvider>
            <Header />
            <main className="page">
              {children}
            </main>
          </StreamProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
