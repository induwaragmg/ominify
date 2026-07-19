import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer } from "react-toastify";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div >
            <div className="mx-auto bg-accent-dark width-full">
            <Navbar />
            </div>
           <div className="mx-auto p-4 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl"> 
            {children}
           </div>
            <div className="mx-auto bg-accent-dark width-full">
            <Footer />
            </div>
          </div>
          <ToastContainer position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}