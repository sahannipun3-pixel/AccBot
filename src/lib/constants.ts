import type { NavLink, StatItem, FeatureCard, ProcessStepUI, Service } from "@/types";

/* ─── Company Info ─── */
export const COMPANY = {
  name: "AccBot",
  tagline: "Smart Accounting. Trusted Advisory.",
  description:
    "We provide premium chartered accounting, bookkeeping, IRD taxation, and corporate advisory services empowering Sri Lankan businesses to thrive with absolute financial integrity.",
  email: "info@accbot.lk",
  phone: "+94 11 234 5678",
  address: "Level 12, West Tower, World Trade Center, Echelon Square, Colombo 01, Sri Lanka",
  whatsapp: "+94 77 123 4567",
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
      "Seamless company formation, ROC incorporation, and business registration services across Sri Lanka with expert guidance.",
    overview:
      "Starting a business in Sri Lanka requires navigating regulatory requirements under the Companies Act No. 7 of 2007. Our company registration services streamline the entire process with the Department of the Registrar of Companies (ROC) — from name approvals and Articles of Association to obtaining your Tax Identification Number (TIN), VAT registration, and required municipal licenses. We also facilitate Board of Investment (BOI) approvals for qualified foreign and local investments.",
    benefits: [
      "Department of Registrar of Companies (ROC) filing",
      "Form 1, Form 18, and Form 19 documentation preparation",
      "Articles of Association drafting and legal compliance",
      "Fast-track processing and ROC name reservation",
      "Post-incorporation TIN & tax registration with IRD",
      "Board of Investment (BOI) project assistance",
    ],
    process_steps: [
      { step: 1, title: "Name & Structure", description: "We check ROC availability, reserve your company name, and advise on optimal shareholding." },
      { step: 2, title: "ROC Documentation", description: "Our corporate secretarial specialists draft your Articles of Association and statutory forms." },
      { step: 3, title: "Filing & Approval", description: "We submit applications directly to ROC Sri Lanka and obtain your Certificate of Incorporation." },
      { step: 4, title: "TIN & Bank Setup", description: "Receive your complete corporate pack, IRD TIN registration, and bank introduction documents." },
    ],
    faqs: [
      { question: "How long does company registration take in Sri Lanka?", answer: "Company incorporation with the Department of the Registrar of Companies (ROC) typically completes within 3 to 7 business days once documentation is signed." },
      { question: "What documents are required for incorporation?", answer: "You will need copies of National Identity Cards (NIC) or passports of directors and shareholders, proof of address, and consent forms." },
      { question: "Can foreign nationals incorporate a company in Sri Lanka?", answer: "Yes, foreign individuals and corporate entities can register private limited companies in Sri Lanka, subject to sectoral regulations and BOI guidelines." },
    ],
    is_active: true,
    sort_order: 1,
  },
  {
    title: "Audit & Assurance",
    slug: "audit-assurance",
    icon: "ClipboardCheck",
    short_description:
      "Comprehensive statutory audit services ensuring financial accuracy, SLAuS compliance, and stakeholder confidence.",
    overview:
      "Our audit and assurance services adhere to Sri Lanka Auditing Standards (SLAuS) and the Institute of Chartered Accountants of Sri Lanka (CA Sri Lanka) framework. We provide independent, objective examinations of financial statements and internal controls to help organizations ensure statutory compliance, satisfy banking criteria, and build investor trust.",
    benefits: [
      "CA Sri Lanka accredited audit methodology",
      "Statutory annual financial statement audits",
      "Sri Lanka Financial Reporting Standards (SLFRS/LKAS) compliance",
      "Internal control evaluations and risk management",
      "Management advisory letters with practical operational insights",
      "Independent assurance for banks, stakeholders, and tax authorities",
    ],
    process_steps: [
      { step: 1, title: "Planning & Scoping", description: "We review your operational risk profile and prepare a structured audit engagement plan." },
      { step: 2, title: "Fieldwork Testing", description: "Our chartered audit team verifies transactions, confirms balances, and assesses internal controls." },
      { step: 3, title: "Review & Reconciliation", description: "We analyze accounting estimates, disclosure notes, and compliance with LKAS/SLFRS." },
      { step: 4, title: "Audit Opinion & Report", description: "We deliver an independent auditor's report and management letter for shareholders and the board." },
    ],
    faqs: [
      { question: "Is an annual statutory audit mandatory in Sri Lanka?", answer: "Yes, under the Companies Act No. 7 of 2007, every private and public limited company incorporated in Sri Lanka must have its annual accounts audited by a qualified auditor." },
      { question: "What accounting standards are used in Sri Lanka?", answer: "Sri Lanka utilizes Sri Lanka Accounting Standards (LKAS/SLFRS), which are converged with International Financial Reporting Standards (IFRS)." },
      { question: "How long does an annual audit take?", answer: "Depending on transaction volume and preparedness, a standard audit takes between 2 to 4 weeks." },
    ],
    is_active: true,
    sort_order: 2,
  },
  {
    title: "Accounts & Bookkeeping",
    slug: "accounts-bookkeeping",
    icon: "BookOpen",
    short_description:
      "Accurate, timely bookkeeping and cloud accounting services keeping your financial ledger organized and compliant.",
    overview:
      "Maintaining meticulous financial records is essential for statutory filing and business visibility. Our accounts and bookkeeping services ensure all sales invoices, supplier bills, bank transactions, and ledger entries are accurately maintained. We provide monthly management accounts and cash flow forecasts so executives can steer their enterprises with clarity.",
    benefits: [
      "Real-time monthly management accounts and P&L reports",
      "SLFRS-compliant chart of accounts setup",
      "Monthly bank and credit card reconciliations",
      "Cloud-based software integration (QuickBooks, Xero, Zoho Books)",
      "Accounts receivable and payable tracking",
      "Dedicated chartered account executive for ongoing support",
    ],
    process_steps: [
      { step: 1, title: "Setup & Onboarding", description: "We configure your chart of accounts and connect your cloud accounting platform." },
      { step: 2, title: "Transaction Posting", description: "Income, expenses, bills, and receipts are categorized and posted weekly or monthly." },
      { step: 3, title: "Reconciliation", description: "Bank accounts and balance sheet items are reconciled to maintain 100% accuracy." },
      { step: 4, title: "Management Reporting", description: "Receive comprehensive financial statements with KPI dashboards every month." },
    ],
    faqs: [
      { question: "Which accounting software do you support?", answer: "We support leading cloud platforms including QuickBooks Online, Xero, Zoho Books, and bespoke enterprise systems." },
      { question: "Can you help clean up historical backlog accounts?", answer: "Yes, our team specializes in catch-up bookkeeping and reconciling overdue periods for tax filing." },
      { question: "Do you support multi-currency accounting for exporters?", answer: "Yes, we handle multi-currency accounting (LKR, USD, EUR, GBP) with automatic forex gain/loss calculations." },
    ],
    is_active: true,
    sort_order: 3,
  },
  {
    title: "Tax & Advisory",
    slug: "tax-advisory",
    icon: "Calculator",
    short_description:
      "Strategic tax planning, IRD RAMIS e-filing, VAT & SVAT management, and corporate tax compliance.",
    overview:
      "Navigating Sri Lanka's tax environment under the Inland Revenue Act No. 24 of 2017 requires specialized advisory. Our registered tax consultants handle corporate income tax computations, e-filing through the Inland Revenue Department's RAMIS system, VAT and Simplified VAT (SVAT) returns, Social Security Contribution Levy (SSCL), and tax dispute representations.",
    benefits: [
      "Inland Revenue Department (IRD) RAMIS electronic return filing",
      "Corporate Income Tax computations and quarterly installment calculations",
      "Value Added Tax (VAT) and Simplified VAT (SVAT) registration and returns",
      "Social Security Contribution Levy (SSCL) compliance",
      "Withholding Tax (WHT) and Advance Personal Income Tax (APIT)",
      "Professional representation during IRD tax reviews, inquiries, and audits",
    ],
    process_steps: [
      { step: 1, title: "Tax Health Review", description: "We review your income sources, exemptions, allowable deductions, and current tax position." },
      { step: 2, title: "Strategy & Computation", description: "We compute tax liabilities under current Inland Revenue schedules to optimize efficiency." },
      { step: 3, title: "RAMIS e-Filing", description: "All returns and statements of estimated tax are submitted on time via the IRD RAMIS portal." },
      { step: 4, title: "Ongoing Monitoring", description: "We provide timely reminders for tax installments, budget amendments, and statutory deadlines." },
    ],
    faqs: [
      { question: "Do you assist with IRD RAMIS registration and filing?", answer: "Yes, our team registers taxpayers, manages RAMIS profiles, and submits all required quarterly and annual returns." },
      { question: "Can you help obtain VAT and SVAT registration?", answer: "Yes, we handle complete VAT and Registered Identified Purchaser/Supplier (SVAT) applications with the Inland Revenue Department." },
      { question: "What support do you provide during an IRD tax audit?", answer: "We represent your company before the Inland Revenue Department, prepare documentation, and draft technical response letters." },
    ],
    is_active: true,
    sort_order: 4,
  },
  {
    title: "Payroll Management",
    slug: "payroll-management",
    icon: "Wallet",
    short_description:
      "Statutory payroll solutions covering EPF, ETF, APIT, payslip distribution, and labor law compliance.",
    overview:
      "Managing payroll in Sri Lanka requires full compliance with Department of Labour regulations, the Employees' Provident Fund (EPF) Act, Employees' Trust Fund (ETF) Act, and APIT tax withholding. We provide confidential end-to-end payroll processing, computerized payslips, statutory return generation, and gratuity liability computations.",
    benefits: [
      "Monthly salary calculations, deductions, allowances, and OT computations",
      "EPF (12% employer, 8% employee) monthly C-Form return preparation",
      "ETF (3% employer) monthly remittance scheduling",
      "Advance Personal Income Tax (APIT) withholding and annual reporting",
      "Automated digital pay slips emailed directly to employees",
      "End of service gratuity calculations under the Payment of Gratuity Act",
    ],
    process_steps: [
      { step: 1, title: "Payroll Setup", description: "We configure employee profiles, salary structures, statutory EPF/ETF numbers, and APIT bands." },
      { step: 2, title: "Monthly Processing", description: "Attendance, leave, overtime, and adjustments are calculated and verified." },
      { step: 3, title: "Remittance & Returns", description: "EPF/ETF payment schedules and electronic C-Forms are prepared for prompt submission." },
      { step: 4, title: "Disbursement & Slips", description: "Bank upload files are provided for salary transfers and confidential payslips are distributed." },
    ],
    faqs: [
      { question: "What are the statutory EPF and ETF contribution rates in Sri Lanka?", answer: "The mandatory contribution to EPF is 12% by the employer and 8% by the employee (total 20%). The employer also contributes 3% to the ETF." },
      { question: "Do you handle APIT tax deductions?", answer: "Yes, we calculate Advance Personal Income Tax (APIT) for all eligible employees based on IRD tax tables and generate statutory deduction certificates." },
      { question: "How is payroll confidentiality protected?", answer: "All employee compensation data is strictly secured with restricted access controls and end-to-end encrypted distribution." },
    ],
    is_active: true,
    sort_order: 5,
  },
  {
    title: "Trade License & Permits",
    slug: "trade-license",
    icon: "FileText",
    short_description:
      "Municipal trade license services, environmental permits, and commercial operating approvals across Sri Lanka.",
    overview:
      "Operating a commercial business in Sri Lanka often requires municipal trade licenses, public health clearances, and environmental protection licenses (EPL). Our team assists with applications, documentation, council renewals, and regulatory liaisons so your premises remain in full compliance.",
    benefits: [
      "Municipal Council (CMC and regional councils) trade licenses",
      "Central Environmental Authority (CEA) permit applications",
      "Commercial lease agreement advisory and stamp duty compliance",
      "Import/Export TIN and Customs registration (CUSDEC setup)",
      "Annual license renewals and compliance monitoring",
      "Regulatory liaison with local administrative bodies",
    ],
    process_steps: [
      { step: 1, title: "Assessment", description: "We determine the licenses and clearances required for your specific business activities and location." },
      { step: 2, title: "Application Preparation", description: "We gather council documents, health certificates, and property agreements." },
      { step: 3, title: "Council Submission", description: "Our team coordinates with local authority inspectors and processes approvals." },
      { step: 4, title: "Ongoing Maintenance", description: "We monitor expiry dates and file timely renewals to prevent operational disruptions." },
    ],
    faqs: [
      { question: "Who needs a municipal trade license in Sri Lanka?", answer: "Any business operating from commercial premises within a Municipal Council, Urban Council, or Pradeshiya Sabha area requires a valid trade license or tax certificate." },
      { question: "Can you help with Sri Lanka Customs registration?", answer: "Yes, we assist trading and export/import businesses in registering with Sri Lanka Customs and obtaining CUSDEC authorization." },
      { question: "How often do trade licenses need renewal?", answer: "Municipal trade licenses in Sri Lanka are renewed annually, typically during the first quarter of the calendar year." },
    ],
    is_active: true,
    sort_order: 6,
  },
  {
    title: "Investment Planning",
    slug: "investment-planning",
    icon: "LineChart",
    short_description:
      "Corporate financial strategy, treasury management, and capital structuring for Sri Lankan businesses.",
    overview:
      "Navigating capital allocation and business growth in Sri Lanka requires disciplined financial modeling. Our advisory team assists with corporate treasury planning, capital budgeting, debt structuring, and feasibility studies to optimize returns and ensure sustainable long-term expansion.",
    benefits: [
      "Corporate financial modeling and feasibility studies",
      "Working capital and cash flow optimization",
      "Bank loan proposal preparation and debt restructuring",
      "Board of Investment (BOI) incentives and tax holiday planning",
      "Merger and acquisition financial due diligence",
      "Long-term capital expenditure analysis",
    ],
    process_steps: [
      { step: 1, title: "Business Profiling", description: "We assess financial goals, working capital dynamics, and capital expenditure needs." },
      { step: 2, title: "Financial Modeling", description: "We build customized financial models, risk assessments, and scenario analyses." },
      { step: 3, title: "Execution Advisory", description: "We assist management in structuring financing instruments and allocating capital." },
      { step: 4, title: "Performance Review", description: "We conduct periodic reviews of investment benchmarks and financial health." },
    ],
    faqs: [
      { question: "Do you prepare bank-ready project proposals?", answer: "Yes, we prepare detailed project reports, cash flow forecasts, and debt-service feasibility studies for commercial bank financing." },
      { question: "Can you advise on BOI investment incentives?", answer: "Yes, our advisors guide investors through qualifying for BOI status, tax concessions, and customs duty exemptions under Sri Lankan law." },
      { question: "Do you provide business valuations?", answer: "Yes, we perform SLFRS-compliant valuations for mergers, acquisitions, and shareholder restructuring." },
    ],
    is_active: true,
    sort_order: 7,
  },
];

/* ─── Testimonials ─── */
export const TESTIMONIALS = [
  {
    name: "Dilshan Senanayake",
    company: "Colombo Logistics & Freight (Pvt) Ltd",
    role: "Managing Director",
    content:
      "AccBot transformed our financial operations. Their team restructured our accounting ledger, streamlined IRD RAMIS tax filings, and helped us maintain 100% statutory compliance. An exceptional partner for our business expansion.",
    rating: 5,
  },
  {
    name: "Chamari Jayawardena",
    company: "Ceylon Artisan Exports",
    role: "CEO & Founder",
    content:
      "The team at AccBot made our ROC company incorporation, VAT/SVAT registration, and Customs setup seamless. From day one, their advisory was clear, transparent, and prompt.",
    rating: 5,
  },
  {
    name: "Roshan Perera",
    company: "Lanka FinTech Solutions",
    role: "Finance Director",
    content:
      "We have worked with AccBot for over three years. Their chartered accounting accuracy, timely monthly management accounts, and tax advisory have been instrumental in our institutional funding rounds.",
    rating: 5,
  },
  {
    name: "Kaveesha Wickramasinghe",
    company: "Galle Creative Studio",
    role: "Founder & Director",
    content:
      "As a growing digital agency, managing statutory payroll and taxes was daunting. AccBot handles our books, EPF/ETF returns, and APIT deductions flawlessly, letting us focus entirely on clients.",
    rating: 5,
  },
  {
    name: "Sanjeewa Fernando",
    company: "Horizon Apparel Lanka",
    role: "Operations Manager",
    content:
      "Their statutory audit preparation and payroll management service are top-notch. Zero errors, always on time, and their chartered advisory team is always responsive to any questions.",
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
