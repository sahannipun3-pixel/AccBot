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
  title: "AccBot | Accounting, Bookkeeping & Tax Advisory Services in Sri Lanka",
  description:
    "AccBot provides expert chartered accounting, IRD tax advisory, company registration, and audit services for modern businesses across Sri Lanka.",
  metadataBase: new URL("https://accbot.lk"),
  openGraph: {
    title: "AccBot | Smart Accounting & Advisory — Sri Lanka",
    description: "Premium accounting, bookkeeping, and tax advisory services built on trust, precision, and compliance.",
    url: "https://accbot.lk",
    siteName: "AccBot",
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AccBot | Smart Accounting & Advisory — Sri Lanka",
    description: "Premium accounting, bookkeeping, and tax advisory services built on trust, precision, and compliance.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AccountingService",
  name: "AccBot Accounting & Advisory Sri Lanka",
  description: "AccBot provides expert chartered accounting, IRD tax advisory, company registration, and audit assurance.",
  url: "https://accbot.lk",
  telephone: "+94 11 234 5678",
  email: "info@accbot.lk",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Level 12, West Tower, World Trade Center, Echelon Square",
    addressLocality: "Colombo",
    postalCode: "00100",
    addressCountry: "LK",
  },
  priceRange: "LKR",
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
          defaultTheme="light"
          enableSystem={false}
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
