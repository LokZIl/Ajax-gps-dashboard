import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FPL Fines Leaderboard",
  description: "Auto-calculated gameweek fines for the mini-league.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0b0f] font-sans antialiased">{children}</body>
    </html>
  );
}
