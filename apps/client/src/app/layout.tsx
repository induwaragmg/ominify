import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from "react-toastify";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ominify - shop future.",
  description: "ominify is the future of shopping.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className={`${inter.className} min-h-screen antialiased bg-[linear-gradient(180deg,#fafafa_0%,#fbfbfb_40%,#fcfcfc_100%)] font-sans`}>
          {children}

          <ToastContainer position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}