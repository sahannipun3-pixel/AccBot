"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  AlertTriangle,
  ImagePlus,
  Loader2,
  FileText,
  Globe,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { createPost, updatePost, deletePost } from "@/actions/blog";
import { blogPostSchema, type BlogPostFormData } from "@/lib/validators";
import type { BlogPost } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  initialPosts: BlogPost[];
}

export default function AdminBlogClient({ initialPosts }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "published" | "draft">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Delete modal state
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image: "",
      is_published: false,
    },
  });

  const isPublishedValue = watch("is_published");

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (formMode === "create") {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", slug);
    }
  };

  const openCreateDialog = () => {
    setFormMode("create");
    setEditingId(null);
    setCoverPreview("");
    reset({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image: "",
      is_published: false,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (post: BlogPost) => {
    setFormMode("edit");
    setEditingId(post.id);
    setCoverPreview(post.cover_image ?? "");
    reset({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content ?? "",
      cover_image: post.cover_image ?? "",
      is_published: post.is_published,
    });
    setDialogOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    setCoverUploading(true);
    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "blog");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");
      setValue("cover_image", data.url);
      setCoverPreview(data.url);
      toast.success("Cover image uploaded!");
    } catch {
      toast.error("Failed to upload cover image.");
      setCoverPreview("");
    } finally {
      setCoverUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const onFormSubmit = async (data: BlogPostFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title.trim(),
        slug: data.slug.trim(),
        excerpt: data.excerpt.trim(),
        content: data.content.trim(),
        cover_image: data.cover_image || null,
        is_published: data.is_published,
      };

      if (formMode === "create") {
        const result = await createPost(payload);
        if (result.success) {
          toast.success("Blog article created!");
          setPosts((prev) => [
            {
              id: result.id!,
              ...payload,
              author_id: null,
              published_at: data.is_published ? new Date().toISOString() : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            ...prev,
          ]);
          setDialogOpen(false);
        } else {
          toast.error(result.error ?? "Failed to create post.");
        }
      } else if (editingId) {
        const result = await updatePost(editingId, payload);
        if (result.success) {
          toast.success("Blog article updated!");
          setPosts((prev) =>
            prev.map((p) =>
              p.id === editingId
                ? {
                    ...p,
                    ...payload,
                    published_at:
                      data.is_published && !p.published_at
                        ? new Date().toISOString()
                        : p.published_at,
                    updated_at: new Date().toISOString(),
                  }
                : p
            )
          );
          setDialogOpen(false);
        } else {
          toast.error(result.error ?? "Failed to update post.");
        }
      }
    } catch {
      toast.error("Unexpected error saving post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    setLoadingId(post.id);
    try {
      const result = await updatePost(post.id, { is_published: !post.is_published });
      if (result.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  is_published: !post.is_published,
                  published_at: !post.is_published ? new Date().toISOString() : null,
                }
              : p
          )
        );
        toast.success(!post.is_published ? "Article published!" : "Article converted to draft.");
      } else {
        toast.error(result.error ?? "Failed to toggle status.");
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPost) return;
    setIsDeleting(true);
    try {
      const result = await deletePost(deletingPost.id);
      if (result.success) {
        setPosts((prev) => prev.filter((p) => p.id !== deletingPost.id));
        toast.success("Blog post deleted.");
        setDeletingPost(null);
      } else {
        toast.error(result.error ?? "Failed to delete post.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());

    const matchesTab =
      filterTab === "all" ||
      (filterTab === "published" && p.is_published) ||
      (filterTab === "draft" && !p.is_published);

    return matchesSearch && matchesTab;
  });

  const publishedCount = posts.filter((p) => p.is_published).length;
  const draftCount = posts.filter((p) => !p.is_published).length;

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-dark">
            Blog &amp; Knowledge Base CMS
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Publish tax advisory guides, financial regulatory updates, and corporate articles.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2 rounded-xl shrink-0">
          <Plus className="h-4 w-4" />
          <span>New Article</span>
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border border-border/80 bg-card rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-border/60 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-surface/30">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles, slugs, excerpts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border/80 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center p-1 bg-surface border border-border/80 rounded-xl">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterTab("all")}
                className={`rounded-lg text-xs font-semibold px-3 py-1.5 h-auto ${
                  filterTab === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                All ({posts.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterTab("published")}
                className={`rounded-lg text-xs font-semibold px-3 py-1.5 h-auto ${
                  filterTab === "published" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Published ({publishedCount})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterTab("draft")}
                className={`rounded-lg text-xs font-semibold px-3 py-1.5 h-auto ${
                  filterTab === "draft" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Drafts ({draftCount})
              </Button>
            </div>
          </div>

          <span className="text-xs font-semibold text-muted-foreground shrink-0">
            {publishedCount} published • {posts.length} total
          </span>
        </div>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-20 text-center px-4">
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-bold text-sm text-dark">No blog articles found</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                {search || filterTab !== "all"
                  ? "Try resetting your search filters."
                  : "Click 'New Article' above to publish accounting insights."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow>
                  <TableHead className="font-semibold text-dark font-heading">Article</TableHead>
                  <TableHead className="font-semibold text-dark font-heading">Slug / URL</TableHead>
                  <TableHead className="font-semibold text-dark font-heading">Status</TableHead>
                  <TableHead className="font-semibold text-dark font-heading">Published Date</TableHead>
                  <TableHead className="text-right font-semibold text-dark font-heading">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((post) => (
                  <TableRow key={post.id} className="hover:bg-surface/20 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        {post.cover_image ? (
                          <img
                            src={post.cover_image}
                            alt=""
                            className="h-10 w-16 object-cover rounded-lg shrink-0 border border-border/80"
                          />
                        ) : (
                          <div className="h-10 w-16 bg-surface rounded-lg shrink-0 flex items-center justify-center border border-border">
                            <FileText className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-dark line-clamp-1">{post.title}</span>
                          <span className="text-[11px] text-muted-foreground line-clamp-1">{post.excerpt}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground font-mono">
                      /blog/{post.slug}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          post.is_published
                            ? "bg-green-50 text-green-600 border-green-200"
                            : "bg-amber-50 text-amber-600 border-amber-200"
                        }
                        variant="outline"
                      >
                        {post.is_published ? "PUBLISHED" : "DRAFT"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("en-AE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>

                    <TableCell className="text-right py-4">
                      <div className="flex justify-end gap-1.5">
                        {post.is_published && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border/80 hover:border-gold text-muted-foreground hover:text-gold"
                            title="View Public Post"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={loadingId === post.id}
                          onClick={() => openEditDialog(post)}
                          className="h-8 w-8 rounded-lg hover:border-gold hover:text-gold"
                          title="Edit Article"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={loadingId === post.id}
                          onClick={() => handleTogglePublish(post)}
                          className="h-8 w-8 rounded-lg hover:border-gold hover:text-gold"
                          title={post.is_published ? "Unpublish to Draft" : "Publish to Website"}
                        >
                          {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={loadingId === post.id}
                          onClick={() => setDeletingPost(post)}
                          className="h-8 w-8 rounded-lg hover:border-error hover:text-error"
                          title="Delete Article"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl bg-card text-foreground rounded-2xl border border-border/80 shadow-2xl p-0 overflow-hidden max-h-[92vh] overflow-y-auto">
          <div className="p-1 h-1.5 bg-gradient-to-r from-gold to-gold-light sticky top-0 z-10" />
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-border/60">
            <DialogTitle className="font-heading font-bold text-xl text-foreground">
              {formMode === "create" ? "Write New Blog Post" : "Edit Blog Post"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide article content, summary metadata, and optional cover image.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onFormSubmit)} className="px-6 py-5 space-y-4">
            {/* Cover Image Upload */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-dark-800">Cover Image</Label>
              <div
                onClick={() => !coverUploading && imageInputRef.current?.click()}
                className={cn(
                  "relative w-full h-36 rounded-xl border-2 border-dashed border-border/80 bg-surface/50 flex items-center justify-center cursor-pointer hover:border-gold/50 hover:bg-gold-50/20 transition-all overflow-hidden",
                  coverUploading && "cursor-not-allowed"
                )}
              >
                {coverPreview ? (
                  <>
                    <img
                      src={coverPreview}
                      alt="Cover"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-dark/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-semibold">Click to change cover</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                    {coverUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-gold" />
                    ) : (
                      <ImagePlus className="h-6 w-6" />
                    )}
                    <span className="text-xs">{coverUploading ? "Uploading..." : "Click to upload image"}</span>
                    <span className="text-[10px] text-muted-foreground/70">JPEG, PNG, WebP • Max 5MB</span>
                  </div>
                )}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </div>

            {/* Title + Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold text-dark-800">
                  Article Title *
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  onChange={(e) => {
                    register("title").onChange(e);
                    handleTitleChange(e);
                  }}
                  placeholder="e.g. Corporate Tax Compliance Guide 2026"
                  className="bg-surface/50 border-border/80 rounded-xl text-xs"
                />
                {errors.title && (
                  <p className="text-error text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.title.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug" className="text-xs font-semibold text-dark-800">
                  URL Slug *
                </Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  placeholder="corporate-tax-compliance-guide-2026"
                  className="bg-surface/50 border-border/80 rounded-xl font-mono text-xs"
                />
                {errors.slug && (
                  <p className="text-error text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.slug.message}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <Label htmlFor="excerpt" className="text-xs font-semibold text-dark-800">
                Short Excerpt * <span className="text-muted-foreground font-normal">(displayed on listing preview)</span>
              </Label>
              <Textarea
                id="excerpt"
                {...register("excerpt")}
                rows={2}
                placeholder="A concise summary of key insights and takeaways..."
                className="bg-surface/50 border-border/80 rounded-xl resize-none text-xs leading-relaxed"
              />
              {errors.excerpt && (
                <p className="text-error text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.excerpt.message}</span>
                </p>
              )}
            </div>

            {/* Content Body */}
            <div className="space-y-1.5">
              <Label htmlFor="content" className="text-xs font-semibold text-dark-800">
                Full Article Content * <span className="text-muted-foreground font-normal">(supports Markdown headings, lists, quotes)</span>
              </Label>
              <Textarea
                id="content"
                {...register("content")}
                rows={12}
                placeholder="Write full article here. Use ## Section Headings, - bullet points, and paragraphs..."
                className="bg-surface/50 border-border/80 rounded-xl resize-y font-sans text-xs leading-relaxed"
              />
              {errors.content && (
                <p className="text-error text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.content.message}</span>
                </p>
              )}
            </div>

            {/* Publish Checkbox */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-border/60">
              <Checkbox
                id="is_published"
                checked={isPublishedValue}
                onCheckedChange={(checked) => setValue("is_published", !!checked)}
              />
              <Label
                htmlFor="is_published"
                className="text-xs font-semibold text-dark cursor-pointer flex items-center gap-1.5"
              >
                <Globe className="h-4 w-4 text-gold" />
                Publish article immediately (visible on /blog)
              </Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl text-xs">
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                {formMode === "create" ? "Save Article" : "Update Article"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingPost} onOpenChange={(open) => !open && setDeletingPost(null)}>
        <DialogContent className="max-w-md bg-card text-foreground rounded-2xl border border-border/80 shadow-2xl p-6">
          <DialogHeader className="pb-2">
            <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="font-heading font-bold text-lg text-foreground">
              Delete Blog Article
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">&quot;{deletingPost?.title}&quot;</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeletingPost(null)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="rounded-xl text-xs flex items-center gap-1.5"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              <span>Delete Article</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
