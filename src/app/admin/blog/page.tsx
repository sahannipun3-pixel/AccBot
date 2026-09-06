import { getAllPosts } from "@/actions/blog";
import AdminBlogClient from "./_client";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const { posts } = await getAllPosts({ page: 1, limit: 100 });
  return <AdminBlogClient initialPosts={posts} />;
}
