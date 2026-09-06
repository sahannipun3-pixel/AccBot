import type { NavLink, StatItem, FeatureCard, ProcessStepUI, Service } from "@/types";

/* ─── Company Info ─── */
/* TODO: Replace placeholders with real company details */
export const COMPANY = {
  name: "AccBot",
  tagline: "Smart Accounting. Trusted Advisory.",
  description:
    "We provide premium accounting, bookkeeping, taxation, and advisory services that empower Sri Lankan businesses to grow with confidence. Our expert team delivers precise financial solutions tailored to your needs.",
  email: "info@accbot.lk",
  phone: "+94 XX XXX XXXX",              /* TODO: Add real phone */
  address: "Colombo, Sri Lanka",         /* TODO: Add full address */
  whatsapp: "+94XXXXXXXXX",              /* TODO: Add real WhatsApp */
  website: "https://accbot.lk",
} as const;

/* ─── Public Navigation Links ─── */
/* NOTE: Expense Tracker + Accounts Web are user tools — shown in profile dropdown */
export const NAV_LINKS: NavLink[] = [
  { label: "Home",     href: "/" },
  { label: "About",    href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact",  href: "/contact" },
];

/* ─── Statistics ─── */
export const STATS: StatItem[] = [
  { value: 500, suffix: "+", label: "Happy Clients" },
  { value: 12, suffix: "+", label: "Years Experience" },
  { value: 50, suffix: "+", label: "Expert Team" },
  { value: 98, suffix: "%", label: "Client Satisfaction" },
];

/* ─── Why Choose Us Features ─── */
export const WHY_CHOOSE_US: FeatureCard[] = [
  {
    icon: "ShieldCheck",
    title: "Certified Experts",
    description:
      "Our team comprises certified accountants and advisors with decades of combined expertise in financial management.",
  },
  {
    icon: "Clock",
    title: "24/7 Support",
    description:
      "Round-the-clock support ensures your financial queries and concerns are addressed promptly, any time of day.",
  },
  {
    icon: "Lock",
    title: "Data Security",
    description:
      "Your financial data is protected with enterprise-grade security protocols and strict confidentiality standards.",
  },
  {
    icon: "Settings",
    title: "Custom Solutions",
    description:
      "Tailored financial strategies designed to meet the unique requirements and goals of your business.",
  },
  {
    icon: "TrendingUp",
    title: "Growth Focused",
    description:
      "Strategic advisory services aimed at accelerating your business growth and maximizing profitability.",
  },
  {
    icon: "Award",
    title: "Award Winning",
    description:
      "Recognized by industry leaders for excellence in accounting services and client satisfaction.",
  },
];

/* ─── How We Work Process ─── */
export const PROCESS_STEPS: ProcessStepUI[] = [
  {
    step: 1,
    title: "Consult",
    description:
      "Schedule a free consultation to discuss your business needs and financial goals with our experts.",
    icon: "MessageSquare",
  },
  {
    step: 2,
    title: "Analyze",
    description:
      "We conduct a thorough analysis of your current financial position and identify opportunities for improvement.",
    icon: "BarChart3",
  },
  {
    step: 3,
    title: "Implement",
    description:
      "Our team implements customized solutions and systems tailored to optimize your financial operations.",
    icon: "Cog",
  },
  {
    step: 4,
    title: "Support",
    description:
      "Ongoing monitoring, reporting, and support to ensure sustained growth and financial compliance.",
    icon: "HeartHandshake",
  },
];

/* ─── Core Values ─── */
export const CORE_VALUES: FeatureCard[] = [
  {
    icon: "Scale",
    title: "Integrity",
    description:
      "We uphold the highest ethical standards in every engagement, ensuring transparency and honesty in all our dealings.",
  },
  {
    icon: "Target",
    title: "Excellence",
    description:
      "We strive for perfection in every service we deliver, continuously improving our processes and methodologies.",
  },
  {
    icon: "Lightbulb",
    title: "Innovation",
    description:
      "We leverage cutting-edge technology and modern approaches to deliver superior financial solutions.",
  },
  {
    icon: "Users",
    title: "Client-First",
    description:
      "Your success is our priority. We build lasting relationships by putting your needs at the center of everything we do.",
  },
  {
    icon: "Eye",
    title: "Transparency",
    description:
      "Clear communication and full visibility into our processes, pricing, and recommendations at every step.",
  },
];

/* ─── Services Data ─── */
export const SERVICES_DATA: Omit<Service, "id" | "created_at" | "updated_at">[] = [
  {
    title: "Company Registration",
    slug: "company-registration",
    icon: "Building2",
    short_description:
      "Seamless company formation and registration services across multiple jurisdictions with expert guidance.",
    overview:
      "Starting a business requires navigating complex regulatory requirements. Our company registration services streamline the entire process, from choosing the right business structure to obtaining all necessary licenses and permits. We handle mainland, free zone, and offshore company formations with precision and speed.",
    benefits: [
      "Expert guidance on business structure selection",
      "Complete documentation and filing assistance",
      "Fast-track processing available",
      "Post-registration compliance support",
      "Multi-jurisdiction expertise",
      "Transparent pricing with no hidden fees",
    ],
    process_steps: [
      { step: 1, title: "Initial Consultation", description: "We assess your business needs and recommend the optimal structure and jurisdiction." },
      { step: 2, title: "Documentation", description: "Our team prepares all required documents and applications with meticulous attention to detail." },
      { step: 3, title: "Filing & Approval", description: "We submit your application and liaise with authorities to ensure swift approval." },
      { step: 4, title: "Handover & Support", description: "You receive your complete registration package with ongoing compliance guidance." },
    ],
    faqs: [
      { question: "How long does company registration take?", answer: "Depending on the jurisdiction and business type, registration typically takes 3-10 business days." },
      { question: "What documents do I need?", answer: "Generally, you'll need passport copies, proof of address, business plan, and initial capital documentation." },
      { question: "Can you help with visa processing?", answer: "Yes, we provide complete visa processing services as part of our company formation packages." },
    ],
    is_active: true,
    sort_order: 1,
  },
  {
    title: "Audit & Assurance",
    slug: "audit-assurance",
    icon: "ClipboardCheck",
    short_description:
      "Comprehensive audit services that ensure financial accuracy, regulatory compliance, and stakeholder confidence.",
    overview:
      "Our audit and assurance services provide independent, objective assessments of your financial statements and internal controls. We help organizations maintain transparency, comply with regulations, and build trust with stakeholders through rigorous, professional audit procedures.",
    benefits: [
      "Independent and objective financial assessment",
      "Regulatory compliance assurance",
      "Enhanced stakeholder confidence",
      "Identification of process improvements",
      "Risk assessment and mitigation",
      "Detailed management letters and recommendations",
    ],
    process_steps: [
      { step: 1, title: "Planning", description: "We develop a comprehensive audit plan tailored to your organization's needs and risk profile." },
      { step: 2, title: "Fieldwork", description: "Our auditors conduct thorough testing of your financial records and internal controls." },
      { step: 3, title: "Analysis", description: "We analyze findings, identify discrepancies, and assess the overall financial health." },
      { step: 4, title: "Reporting", description: "A detailed audit report with findings, opinions, and actionable recommendations is delivered." },
    ],
    faqs: [
      { question: "How often should my company be audited?", answer: "Most jurisdictions require annual audits. However, interim audits can be beneficial for larger organizations." },
      { question: "What is the difference between audit and assurance?", answer: "An audit provides the highest level of assurance on financial statements, while other assurance services offer varying levels of confidence on different types of information." },
      { question: "How long does an audit take?", answer: "A typical audit takes 2-6 weeks, depending on the size and complexity of the organization." },
    ],
    is_active: true,
    sort_order: 2,
  },
  {
    title: "Accounts & Bookkeeping",
    slug: "accounts-bookkeeping",
    icon: "BookOpen",
    short_description:
      "Accurate, timely bookkeeping and accounting services that keep your financials organized and compliant.",
    overview:
      "Maintaining accurate financial records is the foundation of business success. Our accounts and bookkeeping services ensure your transactions are properly recorded, categorized, and reconciled. We provide real-time financial visibility so you can make informed decisions with confidence.",
    benefits: [
      "Real-time financial reporting",
      "Accurate transaction recording and categorization",
      "Monthly bank reconciliation",
      "VAT-compliant record keeping",
      "Cloud-based accounting solutions",
      "Dedicated account manager",
    ],
    process_steps: [
      { step: 1, title: "Setup", description: "We configure your chart of accounts and accounting system to match your business needs." },
      { step: 2, title: "Recording", description: "All financial transactions are accurately recorded and categorized on a regular basis." },
      { step: 3, title: "Reconciliation", description: "Monthly bank reconciliation and financial statement preparation." },
      { step: 4, title: "Reporting", description: "Comprehensive financial reports delivered to support your business decisions." },
    ],
    faqs: [
      { question: "Do you use cloud-based accounting software?", answer: "Yes, we work with leading platforms like QuickBooks, Xero, and Zoho Books for seamless collaboration." },
      { question: "How often will I receive financial reports?", answer: "We provide monthly financial statements and can offer weekly or daily reporting based on your needs." },
      { question: "Can you handle multi-currency accounting?", answer: "Absolutely. We have extensive experience managing multi-currency transactions and reporting." },
    ],
    is_active: true,
    sort_order: 3,
  },
  {
    title: "Tax & Advisory",
    slug: "tax-advisory",
    icon: "Calculator",
    short_description:
      "Strategic tax planning and advisory services that minimize liabilities while ensuring full regulatory compliance.",
    overview:
      "Navigating the complex landscape of tax regulations requires expert guidance. Our tax and advisory services help businesses and individuals optimize their tax positions through strategic planning, compliance management, and proactive advisory. We stay current with evolving tax laws to protect your interests.",
    benefits: [
      "Strategic tax planning and optimization",
      "VAT registration and return filing",
      "Corporate tax compliance",
      "Transfer pricing documentation",
      "Tax-efficient business structuring",
      "Representation before tax authorities",
    ],
    process_steps: [
      { step: 1, title: "Assessment", description: "We review your current tax position and identify optimization opportunities." },
      { step: 2, title: "Strategy", description: "A comprehensive tax strategy is developed aligned with your business objectives." },
      { step: 3, title: "Implementation", description: "We implement the tax plan, ensuring all filings and payments are made accurately and on time." },
      { step: 4, title: "Monitoring", description: "Ongoing monitoring of tax developments and proactive adjustments to your strategy." },
    ],
    faqs: [
      { question: "Do you handle VAT filing?", answer: "Yes, we provide complete VAT registration, return filing, and compliance services." },
      { question: "Can you help with corporate tax planning?", answer: "Absolutely. Our tax advisors specialize in corporate tax planning and optimization strategies." },
      { question: "What if I receive a tax audit notice?", answer: "We provide full representation and support during tax audits and investigations." },
    ],
    is_active: true,
    sort_order: 4,
  },
  {
    title: "Payroll Management",
    slug: "payroll-management",
    icon: "Wallet",
    short_description:
      "End-to-end payroll solutions that ensure accurate, timely compensation and full regulatory compliance.",
    overview:
      "Managing payroll is critical yet complex. Our payroll management services handle everything from salary calculations and disbursements to statutory compliance and reporting. We ensure your employees are paid accurately and on time, every time, while keeping you compliant with labor regulations.",
    benefits: [
      "Accurate salary calculations and disbursements",
      "WPS (Wage Protection System) compliance",
      "End-of-service benefit calculations",
      "Leave management and tracking",
      "Payslip generation and distribution",
      "Comprehensive payroll reporting",
    ],
    process_steps: [
      { step: 1, title: "Configuration", description: "We set up your payroll structure including salary components, deductions, and benefits." },
      { step: 2, title: "Processing", description: "Monthly payroll is calculated with all variables, overtime, and adjustments." },
      { step: 3, title: "Disbursement", description: "Salaries are disbursed through compliant channels with proper documentation." },
      { step: 4, title: "Reporting", description: "Detailed payroll reports and analytics are provided for management review." },
    ],
    faqs: [
      { question: "Do you handle WPS compliance?", answer: "Yes, we ensure all payroll disbursements comply with the Wage Protection System requirements." },
      { question: "Can you manage payroll for multiple entities?", answer: "Yes, we handle multi-entity and multi-jurisdiction payroll with consolidated reporting." },
      { question: "How do you handle confidentiality?", answer: "Payroll data is treated with the highest level of confidentiality with restricted access controls." },
    ],
    is_active: true,
    sort_order: 5,
  },
  {
    title: "Trade License",
    slug: "trade-license",
    icon: "FileText",
    short_description:
      "Expert trade license services covering new applications, renewals, amendments, and compliance requirements.",
    overview:
      "Obtaining and maintaining a trade license is essential for legal business operations. Our trade license services cover the entire lifecycle — from initial application and activity selection to annual renewals and amendments. We navigate the regulatory landscape so you can focus on growing your business.",
    benefits: [
      "New trade license application assistance",
      "Annual renewal management",
      "Activity addition and amendment services",
      "License upgrade and downgrade support",
      "Compliance monitoring and alerts",
      "Multi-jurisdiction license management",
    ],
    process_steps: [
      { step: 1, title: "Consultation", description: "We understand your business activities and recommend the appropriate license type." },
      { step: 2, title: "Application", description: "Complete application preparation with all required documents and approvals." },
      { step: 3, title: "Processing", description: "We liaise with authorities and track your application through to approval." },
      { step: 4, title: "Maintenance", description: "Ongoing renewal reminders, compliance monitoring, and amendment support." },
    ],
    faqs: [
      { question: "What types of trade licenses are available?", answer: "Common types include professional, commercial, industrial, and tourism licenses, depending on your business activity." },
      { question: "How long does license processing take?", answer: "Processing typically takes 5-15 business days depending on the license type and jurisdiction." },
      { question: "Do you handle license renewals?", answer: "Yes, we manage the entire renewal process and send timely reminders before expiry dates." },
    ],
    is_active: true,
    sort_order: 6,
  },
  {
    title: "Investment Planning",
    slug: "investment-planning",
    icon: "LineChart",
    short_description:
      "Strategic investment planning and portfolio advisory services to maximize returns and build long-term wealth.",
    overview:
      "Building wealth requires careful planning and expert guidance. Our investment planning services help individuals and businesses develop comprehensive investment strategies aligned with their risk profiles and financial objectives. We provide ongoing portfolio monitoring and rebalancing to optimize returns.",
    benefits: [
      "Personalized investment strategy development",
      "Risk assessment and profiling",
      "Portfolio diversification guidance",
      "Regular performance monitoring and reporting",
      "Market analysis and insights",
      "Retirement and succession planning",
    ],
    process_steps: [
      { step: 1, title: "Profiling", description: "We assess your financial goals, risk tolerance, and investment timeline." },
      { step: 2, title: "Strategy Design", description: "A customized investment strategy is crafted to align with your objectives." },
      { step: 3, title: "Execution", description: "We guide the implementation of your investment plan across selected instruments." },
      { step: 4, title: "Review", description: "Regular performance reviews and strategy adjustments to keep you on track." },
    ],
    faqs: [
      { question: "What is the minimum investment amount?", answer: "We work with clients across various investment levels and can tailor solutions accordingly." },
      { question: "How often will my portfolio be reviewed?", answer: "We conduct quarterly reviews with additional ad-hoc reviews during significant market events." },
      { question: "Do you provide financial planning for retirement?", answer: "Yes, retirement planning is a key component of our investment advisory services." },
    ],
    is_active: true,
    sort_order: 7,
  },
];

/* ─── Testimonials (Placeholder) ─── */
export const TESTIMONIALS = [
  {
    name: "Ahmed Al-Rashid",
    company: "Gulf Trading LLC",
    role: "Managing Director",
    content:
      "Accbot transformed our financial operations. Their attention to detail and proactive advisory helped us save significantly on taxes while maintaining full compliance. Exceptional service.",
    rating: 5,
  },
  {
    name: "Sarah Mitchell",
    company: "Innovate Tech Solutions",
    role: "CEO",
    content:
      "The team at Accbot made our company registration process seamless. From licensing to setting up our accounts, everything was handled professionally and efficiently.",
    rating: 5,
  },
  {
    name: "Rajesh Patel",
    company: "Meridian Consulting",
    role: "Finance Director",
    content:
      "We've been working with Accbot for over three years. Their bookkeeping accuracy and timely financial reports have been instrumental in our business growth.",
    rating: 5,
  },
  {
    name: "Fatima Hassan",
    company: "Bloom Interiors",
    role: "Founder",
    content:
      "As a startup founder, I needed reliable financial guidance. Accbot provided exactly that — clear advice, organized books, and a partner I could trust with my business finances.",
    rating: 5,
  },
  {
    name: "James Wilson",
    company: "Atlas Logistics",
    role: "Operations Manager",
    content:
      "Their payroll management service is flawless. Zero errors, always on time, and their team is incredibly responsive to any queries. Highly recommended.",
    rating: 5,
  },
];

/* ─── Social Links ─── */
/* TODO: Replace # with real social media profile URLs */
export const SOCIAL_LINKS = [
  { name: "LinkedIn",  href: "#", icon: "Linkedin" },  /* TODO: real URL */
  { name: "Facebook",  href: "#", icon: "Facebook" },  /* TODO: real URL */
  { name: "Instagram", href: "#", icon: "Instagram" }, /* TODO: real URL */
];

/* ─── Footer Links ─── */
export const FOOTER_LINKS = {
  quickLinks: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  services: [
    { label: "Company Registration", href: "/services/company-registration" },
    { label: "Audit & Assurance", href: "/services/audit-assurance" },
    { label: "Accounts & Bookkeeping", href: "/services/accounts-bookkeeping" },
    { label: "Tax & Advisory", href: "/services/tax-advisory" },
    { label: "Payroll Management", href: "/services/payroll-management" },
    { label: "Trade License", href: "/services/trade-license" },
    { label: "Investment Planning", href: "/services/investment-planning" },
  ],
};
