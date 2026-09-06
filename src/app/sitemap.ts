import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://accbot.lk";

  const routes = [
    "",
    "/about",
    "/services",
    "/services/company-registration",
    "/services/audit-assurance",
    "/services/accounts-bookkeeping",
    "/services/tax-advisory",
    "/contact",
    "/login",
    "/signup",
    "/privacy",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/services") ? 0.9 : 0.7,
  }));
}
