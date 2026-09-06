import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// ─── Public Website Layout ─────────────────────────────────────────────────────
// Wraps all public marketing pages with the shared Navbar and Footer.
// Authenticated portal pages use a separate layout in app/portal/layout.tsx.

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
