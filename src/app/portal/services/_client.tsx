"use client";

import Link from "next/link";
import {
  Briefcase,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Search,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Service } from "@/types";

interface Props {
  services: Service[];
}

// ─── Service Icon Mapper ──────────────────────────────────────────────────────

const iconMap: Record<string, string> = {
  accounting: "📊",
  bookkeeping: "📒",
  tax: "🧾",
  audit: "🔍",
  registration: "🏢",
  advisory: "💡",
  payroll: "💳",
  vat: "📋",
  default: "📁",
};

function getServiceEmoji(icon: string): string {
  const key = Object.keys(iconMap).find((k) => icon.toLowerCase().includes(k));
  return iconMap[key ?? "default"];
}

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({ service }: { service: Service }) {
  const emoji = getServiceEmoji(service.icon);

  return (
    <div className="bg-card rounded-2xl border border-border/70 p-6 flex flex-col gap-4 hover:border-gold/40 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gold/15 text-2xl flex items-center justify-center shrink-0">
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-bold text-sm text-foreground">{service.title}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {service.short_description}
          </p>
        </div>
      </div>

      {service.benefits && service.benefits.length > 0 && (
        <div className="space-y-1.5">
          {service.benefits.slice(0, 3).map((benefit, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-gold mt-0.5 shrink-0" />
              <span className="text-xs text-foreground leading-relaxed">{benefit}</span>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 mt-auto border-t border-border/40">
        <Link
          href={`/services/${service.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold-dark transition-colors"
        >
          <span>Learn more</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── Services Client ──────────────────────────────────────────────────────────

export default function ServicesClient({ services }: Props) {
  const [search, setSearch] = useState("");

  const filtered = services.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.short_description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-1">
            Services
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
            AccBot Services
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Expert accounting, tax, and advisory services tailored for your business.
          </p>
        </div>
        <Link href="/contact" target="_blank">
          <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-xl shrink-0">
            <span>Enquire About a Service</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Search */}
      {services.length > 3 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border/80 rounded-xl"
            aria-label="Search services"
          />
        </div>
      )}

      {/* Services Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-card rounded-2xl border border-border/70">
          <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          {search ? (
            <>
              <p className="font-bold text-sm text-foreground">No services match your search</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try a different keyword or{" "}
                <button
                  onClick={() => setSearch("")}
                  className="text-gold underline cursor-pointer"
                >
                  clear the search
                </button>
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-sm text-foreground">No services available</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Our services catalogue is being updated. Please check back soon or contact us directly.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      {/* CTA Banner */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <h3 className="font-heading font-bold text-foreground text-lg">
            Not sure which service you need?
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Our advisors are happy to help you find the right solution.
          </p>
        </div>
        <Link href="/portal/support" className="shrink-0">
          <Button className="bg-gold text-dark hover:bg-gold-dark font-bold flex items-center gap-2">
            <span>Talk to an Advisor</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
