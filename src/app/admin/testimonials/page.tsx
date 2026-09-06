import { getAllTestimonials } from "@/actions/testimonials";
import type { Testimonial } from "@/types";
import AdminTestimonialsClient from "./_client";

export default async function AdminTestimonialsPage() {
  let testimonials: Testimonial[] = [];
  try {
    testimonials = await getAllTestimonials();
  } catch (err) {
    console.error("Failed to fetch testimonials", err);
  }
  return <AdminTestimonialsClient initialTestimonials={testimonials} />;
}
