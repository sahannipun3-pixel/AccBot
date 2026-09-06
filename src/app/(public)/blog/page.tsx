import Link from "next/link";
import { getPublishedPosts } from "@/actions/blog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, BookOpen, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog & Advisory Insights | AccBot",
  description:
    "Expert articles, regulatory updates, VAT guidelines, and corporate tax insights from AccBot chartered accountants and financial advisors.",
};

export const dynamic = "force-dynamic";

export default async function PublicBlogPage() {
  const posts = await getPublishedPosts(50);

  return (
    <div className="min-h-screen bg-surface py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12 text-left">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge
            variant="outline"
            className="bg-gold-50 text-gold border-gold/20 text-xs uppercase font-bold tracking-wider px-3 py-1"
          >
            Insights &amp; Knowledge Base
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-dark tracking-tight">
            Financial &amp; Advisory Perspectives
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Stay informed with the latest updates on corporate tax, accounting standards, VAT regulations, and business advisory in Dubai and Sri Lanka.
          </p>
        </div>

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <div className="bg-card rounded-3xl border border-border/80 p-12 sm:p-20 text-center max-w-xl mx-auto shadow-xs">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading font-bold text-lg text-foreground">No Articles Published Yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
              Our advisory team is preparing new in-depth guides and accounting perspectives. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex">
                <Card className="flex flex-col justify-between h-full bg-card rounded-2xl border border-border/80 shadow-xs hover:border-gold/40 hover:shadow-lg transition-all duration-200 overflow-hidden">
                  <div>
                    {/* Cover image */}
                    {post.cover_image ? (
                      <div className="relative h-48 w-full overflow-hidden bg-surface">
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-40 w-full bg-surface/60 border-b border-border/60 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Card Content */}
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        {post.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gold" />
                            {new Date(post.published_at).toLocaleDateString("en-AE", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gold" />
                          {Math.max(1, Math.ceil((post.content?.split(" ").length || 100) / 200))} min read
                        </span>
                      </div>

                      <h2 className="font-heading font-bold text-lg text-foreground group-hover:text-gold transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h2>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </CardContent>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6 pt-2 flex items-center justify-between text-xs font-bold text-gold">
                    <span>Read Full Article</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
