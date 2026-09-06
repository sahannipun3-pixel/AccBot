-- ─── Services Seed ───
insert into public.services (title, slug, icon, short_description, overview, benefits, process_steps, faqs, is_active, sort_order)
values
(
  'Company Registration',
  'company-registration',
  'Building2',
  'Seamless company formation and registration services across multiple jurisdictions with expert guidance.',
  'Starting a business requires navigating complex regulatory requirements. Our company registration services streamline the entire process, from choosing the right business structure to obtaining all necessary licenses and permits. We handle mainland, free zone, and offshore company formations with precision and speed.',
  array['Expert guidance on business structure selection', 'Complete documentation and filing assistance', 'Fast-track processing available', 'Post-registration compliance support', 'Multi-jurisdiction expertise', 'Transparent pricing with no hidden fees'],
  '[{"step": 1, "title": "Initial Consultation", "description": "We assess your business needs and recommend the optimal structure and jurisdiction."}, {"step": 2, "title": "Documentation", "description": "Our team prepares all required documents and applications with meticulous attention to detail."}, {"step": 3, "title": "Filing & Approval", "description": "We submit your application and liaise with authorities to ensure swift approval."}, {"step": 4, "title": "Handover & Support", "description": "You receive your complete registration package with ongoing compliance guidance."}]'::jsonb,
  '[{"question": "How long does company registration take?", "answer": "Depending on the jurisdiction and business type, registration typically takes 3-10 business days."}, {"question": "What documents do I need?", "answer": "Generally, you''ll need passport copies, proof of address, business plan, and initial capital documentation."}, {"question": "Can you help with visa processing?", "answer": "Yes, we provide complete visa processing services as part of our company formation packages."}]'::jsonb,
  true,
  1
),
(
  'Audit & Assurance',
  'audit-assurance',
  'ClipboardCheck',
  'Comprehensive audit services that ensure financial accuracy, regulatory compliance, and stakeholder confidence.',
  'Our audit and assurance services provide independent, objective assessments of your financial statements and internal controls. We help organizations maintain transparency, comply with regulations, and build trust with stakeholders through rigorous, professional audit procedures.',
  array['Independent and objective financial assessment', 'Regulatory compliance assurance', 'Enhanced stakeholder confidence', 'Identification of process improvements', 'Risk assessment and mitigation', 'Detailed management letters and recommendations'],
  '[{"step": 1, "title": "Planning", "description": "We develop a comprehensive audit plan tailored to your organization''s needs and risk profile."}, {"step": 2, "title": "Fieldwork", "description": "Our auditors conduct thorough testing of your financial records and internal controls."}, {"step": 3, "title": "Analysis", "description": "We analyze findings, identify discrepancies, and assess the overall financial health."}, {"step": 4, "title": "Reporting", "description": "A detailed audit report with findings, opinions, and actionable recommendations is delivered."}]'::jsonb,
  '[{"question": "How often should my company be audited?", "answer": "Most jurisdictions require annual audits. However, interim audits can be beneficial for larger organizations."}, {"question": "What is the difference between audit and assurance?", "answer": "An audit provides the highest level of assurance on financial statements, while other assurance services offer varying levels of confidence on different types of information."}, {"question": "How long does an audit take?", "answer": "A typical audit takes 2-6 weeks, depending on the size and complexity of the organization."}]'::jsonb,
  true,
  2
),
(
  'Accounts & Bookkeeping',
  'accounts-bookkeeping',
  'BookOpen',
  'Accurate, timely bookkeeping and accounting services that keep your financials organized and compliant.',
  'Maintaining accurate financial records is the foundation of business success. Our accounts and bookkeeping services ensure your transactions are properly recorded, categorized, and reconciled. We provide real-time financial visibility so you can make informed decisions with confidence.',
  array['Real-time financial reporting', 'Accurate transaction recording and categorization', 'Monthly bank reconciliation', 'VAT-compliant record keeping', 'Cloud-based accounting solutions', 'Dedicated account manager'],
  '[{"step": 1, "title": "Setup", "description": "We configure your chart of accounts and accounting system to match your business needs."}, {"step": 2, "title": "Recording", "description": "All financial transactions are accurately recorded and categorized on a regular basis."}, {"step": 3, "title": "Reconciliation", "description": "Monthly bank reconciliation and financial statement preparation."}, {"step": 4, "title": "Reporting", "description": "Comprehensive financial reports delivered to support your business decisions."}]'::jsonb,
  '[{"question": "Do you use cloud-based accounting software?", "answer": "Yes, we work with leading platforms like QuickBooks, Xero, and Zoho Books for seamless collaboration."}, {"question": "How often will I receive financial reports?", "answer": "We provide monthly financial statements and can offer weekly or daily reporting based on your needs."}, {"question": "Can you handle multi-currency accounting?", "answer": "Absolutely. We have extensive experience managing multi-currency transactions and reporting."}]'::jsonb,
  true,
  3
),
(
  'Tax & Advisory',
  'tax-advisory',
  'Calculator',
  'Strategic tax planning and advisory services that minimize liabilities while ensuring full regulatory compliance.',
  'Navigating the complex landscape of tax regulations requires expert guidance. Our tax and advisory services help businesses and individuals optimize their tax positions through strategic planning, compliance management, and proactive advisory. We stay current with evolving tax laws to protect your interests.',
  array['Strategic tax planning and optimization', 'VAT registration and return filing', 'Corporate tax compliance', 'Transfer pricing documentation', 'Tax-efficient business structuring', 'Representation before tax authorities'],
  '[{"step": 1, "title": "Assessment", "description": "We review your current tax position and identify optimization opportunities."}, {"step": 2, "title": "Strategy", "description": "A comprehensive tax strategy is developed aligned with your business objectives."}, {"step": 3, "title": "Implementation", "description": "We implement the tax plan, ensuring all filings and payments are made accurately and on time."}, {"step": 4, "title": "Monitoring", "description": "Ongoing monitoring of tax developments and proactive adjustments to your strategy."}]'::jsonb,
  '[{"question": "Do you handle VAT filing?", "answer": "Yes, we provide complete VAT registration, return filing, and compliance services."}, {"question": "Can you help with corporate tax planning?", "answer": "Absolutely. Our tax advisors specialize in corporate tax planning and optimization strategies."}, {"question": "What if I receive a tax audit notice?", "answer": "We provide full representation and support during tax audits and investigations."}]'::jsonb,
  true,
  4
),
(
  'Payroll Management',
  'payroll-management',
  'Wallet',
  'End-to-end payroll solutions that ensure accurate, timely compensation and full regulatory compliance.',
  'Managing payroll is critical yet complex. Our payroll management services handle everything from salary calculations and disbursements to statutory compliance and reporting. We ensure your employees are paid accurately and on time, every time, while keeping you compliant with labor regulations.',
  array['Accurate salary calculations and disbursements', 'WPS (Wage Protection System) compliance', 'End-of-service benefit calculations', 'Leave management and tracking', 'Payslip generation and distribution', 'Comprehensive payroll reporting'],
  '[{"step": 1, "title": "Configuration", "description": "We set up your payroll structure including salary components, deductions, and benefits."}, {"step": 2, "title": "Processing", "description": "Monthly payroll is calculated with all variables, overtime, and adjustments."}, {"step": 3, "title": "Disbursement", "description": "Salaries are disbursed through compliant channels with proper documentation."}, {"step": 4, "title": "Reporting", "description": "Detailed payroll reports and analytics are provided for management review."}]'::jsonb,
  '[{"question": "Do you handle WPS compliance?", "answer": "Yes, we ensure all payroll disbursements comply with the Wage Protection System requirements."}, {"question": "Can you manage payroll for multiple entities?", "answer": "Yes, we handle multi-entity and multi-jurisdiction payroll with consolidated reporting."}, {"question": "How do you handle confidentiality?", "answer": "Payroll data is treated with the highest level of confidentiality with restricted access controls."}]'::jsonb,
  true,
  5
),
(
  'Trade License',
  'trade-license',
  'FileText',
  'Expert trade license services covering new applications, renewals, amendments, and compliance requirements.',
  'Obtaining and maintaining a trade license is essential for legal business operations. Our trade license services cover the entire lifecycle — from initial application and activity selection to annual renewals and amendments. We navigate the regulatory landscape so you can focus on growing your business.',
  array['New trade license application assistance', 'Annual renewal management', 'Activity addition and amendment services', 'License upgrade and downgrade support', 'Compliance monitoring and alerts', 'Multi-jurisdiction license management'],
  '[{"step": 1, "title": "Consultation", "description": "We understand your business activities and recommend the appropriate license type."}, {"step": 2, "title": "Application", "description": "Complete application preparation with all required documents and approvals."}, {"step": 3, "title": "Processing", "description": "We liaise with authorities and track your application through to approval."}, {"step": 4, "title": "Maintenance", "description": "Ongoing renewal reminders, compliance monitoring, and amendment support."}]'::jsonb,
  '[{"question": "What types of trade licenses are available?", "answer": "Common types include professional, commercial, industrial, and tourism licenses, depending on your business activity."}, {"question": "How long does license processing take?", "answer": "Processing typically takes 5-15 business days depending on the license type and jurisdiction."}, {"question": "Do you handle license renewals?", "answer": "Yes, we manage the entire renewal process and send timely reminders before expiry dates."}]'::jsonb,
  true,
  6
),
(
  'Investment Planning',
  'investment-planning',
  'LineChart',
  'Strategic investment planning and portfolio advisory services to maximize returns and build long-term wealth.',
  'Building wealth requires careful planning and expert guidance. Our investment planning services help individuals and businesses develop comprehensive investment strategies aligned with their risk profiles and financial objectives. We provide ongoing portfolio monitoring and rebalancing to optimize returns.',
  array['Personalized investment strategy development', 'Risk assessment and profiling', 'Portfolio diversification guidance', 'Regular performance monitoring and reporting', 'Market analysis and insights', 'Retirement and succession planning'],
  '[{"step": 1, "title": "Profiling", "description": "We assess your financial goals, risk tolerance, and investment timeline."}, {"step": 2, "title": "Strategy Design", "description": "A customized investment strategy is crafted to align with your objectives."}, {"step": 3, "title": "Execution", "description": "We guide the implementation of your investment plan across selected instruments."}, {"step": 4, "title": "Review", "description": "Regular performance reviews and strategy adjustments to keep you on track."}]'::jsonb,
  '[{"question": "What is the minimum investment amount?", "answer": "We work with clients across various investment levels and can tailor solutions accordingly."}, {"question": "How often will my portfolio be reviewed?", "answer": "We conduct quarterly reviews with additional ad-hoc reviews during significant market events."}, {"question": "Do you provide financial planning for retirement?", "answer": "Yes, retirement planning is a key component of our investment advisory services."}]'::jsonb,
  true,
  7
)
on conflict (slug)
do update set
  title = excluded.title,
  icon = excluded.icon,
  short_description = excluded.short_description,
  overview = excluded.overview,
  benefits = excluded.benefits,
  process_steps = excluded.process_steps,
  faqs = excluded.faqs,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

-- ─── Testimonials Seed (Using static UUIDs for safety & upsertability) ───
insert into public.testimonials (id, name, company, role, content, rating, is_active, sort_order)
values
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ahmed Al-Rashid', 'Gulf Trading LLC', 'Managing Director', 'Accbot transformed our financial operations. Their attention to detail and proactive advisory helped us save significantly on taxes while maintaining full compliance. Exceptional service.', 5, true, 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Sarah Mitchell', 'Innovate Tech Solutions', 'CEO', 'The team at Accbot made our company registration process seamless. From licensing to setting up our accounts, everything was handled professionally and efficiently.', 5, true, 2),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Rajesh Patel', 'Meridian Consulting', 'Finance Director', 'We''ve been working with Accbot for over three years. Their bookkeeping accuracy and timely financial reports have been instrumental in our business growth.', 5, true, 3),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Fatima Hassan', 'Bloom Interiors', 'Founder', 'As a startup founder, I needed reliable financial guidance. Accbot provided exactly that — clear advice, organized books, and a partner I could trust with my business finances.', 5, true, 4),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'James Wilson', 'Atlas Logistics', 'Operations Manager', 'Their payroll management service is flawless. Zero errors, always on time, and their team is incredibly responsive to any queries. Highly recommended.', 5, true, 5)
on conflict (id)
do update set
  name = excluded.name,
  company = excluded.company,
  role = excluded.role,
  content = excluded.content,
  rating = excluded.rating,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- ─── Website Settings Seed ───
insert into public.website_settings (key, value, category)
values
('company_name', 'Accbot', 'general'),
('tagline', 'Smart Accounting. Trusted Advisory.', 'general'),
('description', 'We provide premium accounting, bookkeeping, and advisory services that empower businesses to grow with confidence. Our expert team delivers precise financial solutions tailored to your needs.', 'general'),
('email', 'info@accbot.com', 'contact'),
('phone', '+971 XX XXX XXXX', 'contact'),
('address', 'Business Bay, Dubai, UAE', 'contact'),
('whatsapp', '+971XXXXXXXXX', 'contact'),
('meta_title', 'Accbot | Premium Accounting & Bookkeeping Services in Dubai', 'seo'),
('meta_description', 'FTA compliant tax agents, bookkeeping, payroll management, audit assurance, and company registration in Dubai, UAE.', 'seo'),
('linkedin_url', 'https://linkedin.com', 'social'),
('twitter_url', 'https://twitter.com', 'social'),
('facebook_url', '#', 'social'),
('instagram_url', '#', 'social')
on conflict (key)
do update set
  value = excluded.value,
  category = excluded.category,
  updated_at = timezone('utc', now());

-- ─── Team Members Seed (Using static UUIDs for safety & upsertability) ───
insert into public.team_members (id, name, role, bio, is_active, sort_order)
values
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tariq Mansoor', 'Managing Partner & Founder', 'Accredited Auditor with 15+ years experience directing audits for logistics and commerce firms in the Middle East.', true, 1),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Aisha Al-Suwaidi', 'Senior Tax Consultant', 'Registered FTA Tax Agent specializing in corporate VAT audits, restructuring, and advisory filings.', true, 2),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Michael Sterling', 'Head of Bookkeeping', 'Chartered Accountant overseeing financial reports, cloud ledgers, and accounts workflow optimizations.', true, 3)
on conflict (id)
do update set
  name = excluded.name,
  role = excluded.role,
  bio = excluded.bio,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;
