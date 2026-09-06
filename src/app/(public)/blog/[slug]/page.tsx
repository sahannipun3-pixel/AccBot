import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug } from "@/actions/blog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article Not Found | AccBot" };

  return {
    title: `${post.title} | AccBot Insights`,
    description: post.excerpt,
  };
}

export const dynamic = "force-dynamic";

export default async function PublicBlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const readingTime = Math.max(
    1,
    Math.ceil((post.content?.split(" ").length || 100) / 200)
  );

  return (
    <article className="min-h-screen bg-surface py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10 text-left">
        {/* Back navigation */}
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Articles</span>
          </Link>
        </div>

        {/* Article Header */}
        <div className="space-y-4">
          <Badge
            variant="outline"
            className="bg-gold/15 text-gold border-gold/30 text-xs font-bold tracking-wider px-3 py-1"
          >
            Advisory &amp; Insights
          </Badge>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-foreground leading-tight tracking-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/60">
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gold" />
                Published on{" "}
                {new Date(post.published_at).toLocaleDateString("en-LK", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gold" />
              {readingTime} min read
            </span>
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="rounded-3xl overflow-hidden shadow-lg border border-border/80 max-h-[480px]">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Excerpt Lead */}
        <div className="p-6 sm:p-8 rounded-2xl bg-card border-l-4 border-gold shadow-xs">
          <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed italic">
            &ldquo;{post.excerpt}&rdquo;
          </p>
        </div>

        {/* Main Content Body */}
        <div className="bg-card rounded-3xl border border-border/80 shadow-xs p-6 sm:p-12 prose dark:prose-invert max-w-none text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
          {post.content}
        </div>

        {/* Bottom Call to Action */}
        <div className="p-8 rounded-3xl bg-dark text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 max-w-md">
            <h3 className="font-heading font-extrabold text-lg text-white">
              Need Professional Accounting Advisory?
            </h3>
            <p className="text-xs text-gray-300">
              Speak directly with our chartered accountants regarding your business requirements.
            </p>
          </div>
          <Link href="/contact">
            <Button className="bg-gold text-dark hover:bg-gold-light rounded-xl font-bold text-xs px-6 py-2.5 shrink-0">
              Book Consultation
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
