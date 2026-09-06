import Link from "next/link";
import { COMPANY } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy | AccBot",
  description: "Learn how AccBot collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  const lastUpdated = "July 2025";

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="relative bg-dark text-white py-20 overflow-hidden border-b border-gold/10">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="container-custom relative z-10 text-center flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Privacy Policy</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-white mb-4">
            Privacy Policy
          </h1>
          <div className="gold-divider mb-4" />
          <p className="text-silver/80 text-sm">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-3xl">
          <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground space-y-8">

            <div className="p-5 rounded-xl bg-gold/10 border border-gold/20 text-sm text-foreground leading-relaxed">
              This Privacy Policy explains how <strong>{COMPANY.name}</strong> (&ldquo;AccBot&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) collects, uses, and protects your personal information when you use our website and services. We are committed to protecting your privacy and handling your data in an open and transparent manner.
            </div>

            <Section title="1. Information We Collect">
              <p>We may collect the following categories of personal information:</p>
              <ul>
                <li><strong>Account Information:</strong> Full name, email address, phone number, and password when you register.</li>
                <li><strong>Contact Form Data:</strong> Name, email, phone, and message content when you submit an inquiry.</li>
                <li><strong>Usage Data:</strong> IP address, browser type, pages visited, and time on site (collected automatically via server logs).</li>
                <li><strong>Communications:</strong> Any correspondence you send to us by email or through our contact form.</li>
              </ul>
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, operate, and improve our accounting and advisory services</li>
                <li>Create and manage your account on our portal</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Send transactional emails (account setup, password reset)</li>
                <li>Comply with legal obligations under UAE law and FTA regulations</li>
                <li>Detect and prevent fraud or unauthorized access</li>
              </ul>
            </Section>

            <Section title="3. Data Sharing">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share data with:</p>
              <ul>
                <li><strong>Service Providers:</strong> Trusted providers that help us operate (e.g., cloud hosting, email delivery) under strict confidentiality agreements.</li>
                <li><strong>Legal Authorities:</strong> Where required by UAE law, court order, or regulatory bodies.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or asset sale, your data may be transferred with appropriate notice.</li>
              </ul>
            </Section>

            <Section title="4. Data Security">
              <p>
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These include encrypted connections (HTTPS/TLS), bcrypt password hashing, HTTP-only cookie-based authentication, and access controls.
              </p>
              <p>
                No method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </Section>

            <Section title="5. Data Retention">
              <p>
                We retain personal data only for as long as necessary to provide our services or as required by applicable law. Account data is retained for the duration of your account. Contact form messages are retained for a period of 3 years for business records. You may request deletion of your data at any time.
              </p>
            </Section>

            <Section title="6. Your Rights">
              <p>You have the right to:</p>
              <ul>
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your personal data</li>
                <li>Withdraw consent for marketing communications at any time</li>
                <li>Lodge a complaint with the relevant data protection authority</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at{" "}
                <a href={`mailto:${COMPANY.email}`} className="text-gold hover:underline">
                  {COMPANY.email}
                </a>.
              </p>
            </Section>

            <Section title="7. Cookies">
              <p>
                Our website uses essential cookies for authentication (JWT session tokens stored in HTTP-only cookies). These cannot be disabled as they are required for the portal to function. We do not use third-party tracking or advertising cookies.
              </p>
            </Section>

            <Section title="8. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by updating the &ldquo;Last updated&rdquo; date at the top of this page. Continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </Section>

            <Section title="9. Contact Us">
              <p>
                If you have questions about this Privacy Policy or how we handle your data, please contact:
              </p>
              <div className="bg-surface rounded-xl p-5 border border-border/60 space-y-1.5 text-sm not-prose">
                <p className="font-bold text-dark">{COMPANY.name}</p>
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
