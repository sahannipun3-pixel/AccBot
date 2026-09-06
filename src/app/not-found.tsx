import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-surface">
      <div className="container-custom max-w-2xl text-center py-20">
        {/* Large 404 */}
        <div className="relative mb-8">
          <h1 className="text-[10rem] sm:text-[14rem] font-extrabold font-heading leading-none select-none text-gold/10">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-dark">
                Page Not Found
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                The page you are looking for doesn&apos;t exist or has been moved. Let us guide you back.
              </p>
            </div>
          </div>
        </div>

        {/* Gold Divider */}
        <div className="gold-divider mx-auto mb-10" />

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="flex items-center gap-2 px-8 shadow-md">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="flex items-center gap-2 px-8">
              <ArrowLeft className="h-4 w-4" />
              <span>Contact Us</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
