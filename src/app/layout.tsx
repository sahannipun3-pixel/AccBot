import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Accbot | Premium Accounting, Bookkeeping & Advisory Services",
  description:
    "Accbot provides expert accounting, tax advisory, company registration, and audit services. Designed by Nexora Software Solutions for clients seeking trusted advisory.",
  metadataBase: new URL("https://accbot.com"), // Placeholder domain
  openGraph: {
    title: "Accbot | Smart Accounting & Advisory",
    description: "Premium accounting, bookkeeping, and advisory services built on trust and precision.",
    url: "https://accbot.com",
    siteName: "Accbot",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accbot | Smart Accounting & Advisory",
    description: "Premium accounting, bookkeeping, and advisory services built on trust and precision.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AccountingService",
  name: "AccBot Accounting & Advisory",
  description: "AccBot provides expert accounting, tax advisory, company registration, and audit services.",
  url: "https://accbot.lk",
  telephone: "+94 11 234 5678",
  email: "info@accbot.lk",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Colombo",
    addressCountry: "LK",
  },
  priceRange: "$$",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-gold/20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster position="top-right" closeButton richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
