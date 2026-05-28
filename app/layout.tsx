import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "DefendableGraph — Living Proof Graph for Agentic Work",
  description: "Connect every agent, model, dataset, worker, assignment, verdict, receipt, and deed into one verifiable system of record.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://defendablegraph.com"),
  openGraph: { title: "DefendableGraph", description: "The living proof graph for agentic work.", url: "https://defendablegraph.com", siteName: "DefendableGraph", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${inter.variable} ${mono.variable} font-sans`}>{children}</body></html>;
}
