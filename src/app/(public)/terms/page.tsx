import Link from "next/link";
import { COMPANY } from "@/lib/constants";

export const metadata = {
  title: "Terms of Service | AccBot Sri Lanka",
  description: "AccBot Terms of Service — understand the terms governing use of our accounting and advisory platform in Sri Lanka.",
};

export default function TermsPage() {
  const lastUpdated = "September 2026";

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="relative bg-gradient-to-b from-surface-warm via-surface to-background text-foreground dark:from-[#111317] dark:via-surface dark:to-background py-16 sm:py-20 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="container-custom relative z-10 text-center flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold mb-4">
            <Link href="/" className="hover:text-gold transition-colors text-muted-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Terms of Service</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-foreground mb-4">
            Terms of Service
          </h1>
          <div className="gold-divider mb-4" />
          <p className="text-muted-foreground text-xs sm:text-sm">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-3xl">
          <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground space-y-8">

            <div className="p-5 rounded-2xl bg-gold/10 border border-gold/25 text-sm text-foreground leading-relaxed">
              Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the AccBot website and client portal. By accessing or using our services, you agree to be bound by these Terms.
            </div>

            <Section title="1. Acceptance of Terms">
              <p>
                By accessing or using AccBot&apos;s services, website, or client portal, you confirm that you are at least 18 years old, have the legal authority to enter into these Terms, and agree to comply with all applicable Sri Lankan laws and regulations.
              </p>
            </Section>

            <Section title="2. Description of Services">
              <p>
                {COMPANY.name} provides professional chartered accounting, bookkeeping, tax advisory, audit assurance, and company registration services in Sri Lanka. Our client portal allows registered clients to view operational accounts, submit expense entries, and communicate with our advisory team.
              </p>
              <p>
                All professional engagements are executed by qualified chartered accountants, registered tax agents, and corporate specialists. Service scope, timelines, and deliverables are defined in individual service engagement letters.
              </p>
            </Section>

            <Section title="3. User Accounts">
              <ul>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You must provide accurate, current, and complete information during registration.</li>
                <li>You must immediately notify us of any unauthorized use of your account.</li>
                <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
              </ul>
            </Section>

            <Section title="4. Acceptable Use">
              <p>You agree not to:</p>
              <ul>
                <li>Use our services for any unlawful purpose or in violation of Sri Lankan law</li>
                <li>Attempt to gain unauthorized access to any part of our systems or other accounts</li>
                <li>Upload or transmit malicious code or interfere with service operation</li>
                <li>Misrepresent your identity or affiliation with any person or entity</li>
                <li>Use our services to engage in money laundering, financial fraud, or tax evasion</li>
              </ul>
            </Section>

            <Section title="5. Professional Advice Disclaimer">
              <p>
                The information provided on our website is for general informational purposes only and does not constitute formal legal, financial, or tax advice. Formal advisory relationships are governed by executed engagement letters and agreements.
              </p>
              <p>
                AccBot&apos;s professional advice applies to the specific facts presented to our team and may not apply to your general circumstances without a formal engagement.
              </p>
            </Section>

            <Section title="6. Intellectual Property">
              <p>
                All content on the AccBot website and portal — including text, graphics, logos, and software — is the property of {COMPANY.name} or its content suppliers and is protected by Sri Lankan and international intellectual property laws.
              </p>
              <p>
                You may not reproduce, distribute, or create derivative works from our content without explicit written permission.
              </p>
            </Section>

            <Section title="7. Confidentiality">
              <p>
                We treat all client financial data as strictly confidential. Our team members are bound by professional codes of ethics and non-disclosure obligations. We do not disclose client financial or personal data to any third party without consent, except as required by Sri Lankan law or statutory regulatory bodies such as the Inland Revenue Department (IRD).
              </p>
            </Section>

            <Section title="8. Limitation of Liability">
              <p>
                To the maximum extent permitted by applicable law, AccBot shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:
              </p>
              <ul>
                <li>Your use or inability to use our services</li>
                <li>Any errors or omissions in third-party information submitted to our portal</li>
                <li>Unauthorized access to or alteration of your transmissions or data</li>
                <li>Any third-party conduct on our platform</li>
              </ul>
              <p>
                Our total liability for any claim shall not exceed the fees paid by you for the specific service giving rise to the claim in the 3 months preceding the event.
              </p>
            </Section>

            <Section title="9. Termination">
              <p>
                Either party may terminate the use of our portal services at any time. We reserve the right to terminate or suspend access immediately if we determine, in our sole discretion, that you have violated these Terms or applicable law.
              </p>
              <p>
                Upon termination, your right to use the portal ceases immediately. Provisions that should survive termination (including confidentiality, intellectual property, and limitation of liability) shall continue in full force.
              </p>
            </Section>

            <Section title="10. Governing Law">
              <p>
                These Terms are governed by and construed in accordance with the laws of the Democratic Socialist Republic of Sri Lanka. Any disputes arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the courts of Colombo, Sri Lanka.
              </p>
            </Section>

            <Section title="11. Changes to Terms">
              <p>
                We reserve the right to update these Terms at any time. We will notify registered users of material changes by email or by posting a notice on the portal. Your continued use of our services after any changes constitutes acceptance of the revised Terms.
              </p>
            </Section>

            <Section title="12. Contact">
              <p>For questions about these Terms, please contact:</p>
              <div className="bg-surface rounded-2xl p-5 border border-border space-y-1.5 text-sm not-prose">
                <p className="font-bold text-foreground">{COMPANY.name}</p>
                <p className="text-muted-foreground">{COMPANY.address}</p>
                <p>
                  <a href={`mailto:${COMPANY.email}`} className="text-gold hover:underline">
                    {COMPANY.email}
                  </a>
                </p>
                <p className="text-muted-foreground">{COMPANY.phone}</p>
              </div>
            </Section>

          </div>
        </div>
      </section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold font-heading text-foreground">{title}</h2>
      <div className="text-muted-foreground text-sm leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}
