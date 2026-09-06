import type { Testimonial } from "@/types";
import { getActiveTestimonials } from "@/actions/testimonials";
import { TestimonialsClient } from "./testimonials-client";

// ─── Server Component — loads testimonials from DB for home page ────────────────
export async function Testimonials() {
  let testimonials: Testimonial[] = [];
  try {
    testimonials = await getActiveTestimonials();
  } catch (err) {
    console.error("Failed to load testimonials from database:", err);
  }
  return <TestimonialsClient testimonials={testimonials} />;
}
