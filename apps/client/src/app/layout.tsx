import type { Metadata } from "next";
// import { Inter, Geist_Mono } from "next/font/google";
import {  Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from "react-toastify";
import "./globals.css";

// const inter = Inter({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      {/* CHANGE: Make the html element occupy the full viewport height. */}
      <html lang="en" className="h-full">
        {/* CHANGE: Make the body occupy at least the full viewport height. */}
        <body
          // className={`${inter.className} ${inter.variable} ${geistMono.variable} min-h-screen antialiased bg-[linear-gradient(180deg,#fafafa_0%,#fbfbfb_40%,#fcfcfc_100%)]`}
          className={` ${geistMono.variable} min-h-screen antialiased bg-[linear-gradient(180deg,#fafafa_0%,#fbfbfb_40%,#fcfcfc_100%)]`}
        >
          {children}

          <ToastContainer position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}