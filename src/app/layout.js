

import NotificationHandler from "@/components/NotificationHandler";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata = {
  title: "Brew & Bite | Artisan Café Delivery",
  description: "Order fresh coffee, artisan bakery items, and more directly to your door.",
};

export default function RootLayout({ children }) {
  
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col tracking-wide">
        <ToastProvider>
          <CartProvider>
            <NotificationHandler />
            <Navbar />
            <main className="flex-1 w-full bg-brand-espresso flex flex-col">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
