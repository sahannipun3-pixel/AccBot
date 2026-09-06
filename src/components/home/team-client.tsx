"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { staggerContainer, slideUp } from "@/lib/utils";
import type { TeamMember } from "@/types";

interface Props {
  team: TeamMember[];
}

export function TeamClient({ team }: Props) {
  return (
    <section className="section-padding bg-surface relative overflow-hidden">
      {/* Decorative lines/grids */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-[0.03] pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeader
          tag="Our Experts"
          title="Meet Our Financial Advisory Team"
          description="Experienced chartered accountants, IRD-accredited tax consultants, and corporate secretarial specialists ready to support your business expansion across Sri Lanka and the region."
        />

        {team.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {team.map((member) => (
              <motion.div key={member.id} variants={slideUp}>
                <Card className="h-full border-border hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 card-hover bg-card rounded-2xl p-6 flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <Avatar className="h-28 w-28 border-2 border-gold/30 shadow-md">
                      {member.avatar_url && (
                        <AvatarImage src={member.avatar_url} alt={member.name} className="object-cover" />
                      )}
                      <AvatarFallback className="bg-gold/15 text-gold font-bold">
                        <User className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
                    {member.linkedin_url && (
                      <a
                        href={member.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-0 right-0 h-8 w-8 bg-dark border border-gold/30 rounded-full flex items-center justify-center text-gold hover:text-white hover:bg-gold transition-colors shadow-sm"
                        title="LinkedIn Profile"
                      >
                        <LinkedinIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <CardContent className="p-0 space-y-3">
                    <div>
                      <h4 className="font-heading font-bold text-lg text-foreground">
                        {member.name}
                      </h4>
                      <span className="text-xs font-semibold text-gold uppercase tracking-wider">
                        {member.role}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            No team members found.
          </p>
        )}
      </div>
    </section>
  );
}
