// Structured CV, sourced from the careerops `cv.md` master.
// Kept as committed content (the factual record). The hero positioning in
// profile.ts is a deliberate blend of this background with a forward-looking
// AI/automation framing.

export interface CvRole {
  title: string;
  period: string;
  bullets: string[];
}

export interface CvExperience {
  company: string;
  location: string;
  roles: CvRole[];
}

export interface CvEducation {
  degree: string;
  school: string;
  period?: string;
  detail?: string;
  /** Public thesis landing page or PDF — makes the education card pressable. */
  thesisUrl?: string;
  thesisTitle?: string;
}

export interface CvSkillGroup {
  label: string;
  items: string[];
}

export interface CvLanguage {
  name: string;
  level: string;
}

export interface Cv {
  fullName: string;
  location: string;
  email: string;
  linkedin: string;
  summary: string;
  experience: CvExperience[];
  education: CvEducation[];
  skills: CvSkillGroup[];
  languages: CvLanguage[];
  training: string[];
}

export const cv: Cv = {
  fullName: "Alexandros Touvras",
  location: "Vantaa, Finland",
  email: "a.touvras@gmail.com",
  linkedin: "linkedin.com/in/alextouvras",
  summary:
    "Credit risk and data professional with ~7 years in consumer finance and banking, now bridging into technology delivery and IT operations. Strong track record in PD models, scorecards, ECL forecasting, credit engine optimization, and portfolio steering. Combines quantitative risk expertise (Python, SQL, Power BI / Fabric) with cross-functional delivery experience across Azure platforms, middleware, and DevOps-aligned operations.",
  experience: [
    {
      company: "Santander Consumer Bank Nordics",
      location: "Finland / Nordics",
      roles: [
        {
          title: "Delivery Lead (Technology Delivery)",
          period: "Jan 2026 – Present",
          bullets: [
            "Lead IT Application Operations for Azure and middleware services, turning complex initiatives into predictable, measurable delivery.",
            "Coordinate cross-team work across cloud platforms, DevOps, and IT operations with emphasis on flow, clarity, and outcomes.",
            "Apply a data-driven approach to delivery decisions, dependencies, and operational metrics at team and leadership level.",
          ],
        },
        {
          title: "Senior Risk Analyst",
          period: "Sep 2023 – Jan 2026",
          bullets: [
            "Developed and monitored PD models, scorecards, and expected credit loss (ECL) forecasts.",
            "Used Python, SQL, and Power BI (Fabric) to analyze trends, build dashboards, and automate reporting.",
            "Supported portfolio steering: emerging risk identification, customer segment evaluation, and credit engine requirement changes.",
            "Collaborated with Nordic and European stakeholders on risk alignment while adapting to Finnish market context and regulation.",
            "Mentored junior analysts and helped build in-house analytics capability from the ground up.",
          ],
        },
        {
          title: "Risk Analyst",
          period: "Jul 2022 – Oct 2023",
          bullets: [
            "Credit risk analysis and monitoring within the Santander Nordics consumer finance portfolio.",
            "Cross-functional collaboration on risk processes, reporting, and portfolio insights.",
          ],
        },
      ],
    },
    {
      company: "Resurs Bank",
      location: "Finland / Nordics",
      roles: [
        {
          title: "Credit Analyst",
          period: "Aug 2019 – Jul 2022",
          bullets: [
            "Credit assessment for new payment solution partners and B2B loans.",
            "Part of the credit scorecard development team: cut-off setting and in-production monitoring.",
            "Development and testing of changes in the credit engine platform (Provenir).",
            "Data analysis for Credit, Business, and Customer Service to optimize decision-making.",
            "Regular monitoring of risk KPIs; Modern Workplace Change Agent.",
          ],
        },
      ],
    },
    {
      company: "Finnish Defence Forces",
      location: "Finland",
      roles: [
        {
          title: "Conscript (Kaartin Jääkäri)",
          period: "Jan 2019 – Jun 2019",
          bullets: ["Mandatory military service."],
        },
      ],
    },
    {
      company: "City of Helsinki — Social and Health Authority",
      location: "Helsinki, Finland",
      roles: [
        {
          title: "Office Administrator",
          period: "Nov 2016 – Jun 2017",
          bullets: [
            "Customer service, account management, and assessment of supplementary/preventive income support.",
          ],
        },
      ],
    },
    {
      company: "Bank of Greece",
      location: "Greece",
      roles: [
        {
          title: "Intern",
          period: "Sep 2015 – Mar 2016",
          bullets: [
            "B2B/B2C customer service, currency exchange, and daily accounting procedures.",
            "Assessment of banks' currency withdrawals and deposits.",
          ],
        },
      ],
    },
  ],
  education: [
    {
      degree: "MSc, Big Data Analytics",
      school: "Arcada University of Applied Sciences, Helsinki",
      period: "2021–2024",
      detail:
        "Machine learning methods in business environments; analytical service design.",
      thesisTitle:
        "An Analytics Process for Forecasting Expected Credit Losses for the Lifetime of Loans: auto loan portfolios",
      thesisUrl: "https://www.theseus.fi/handle/10024/860989",
    },
    {
      degree: "MSc, Banking and International Finance",
      school: "University of Jyväskylä",
      period: "2017–2019",
      detail:
        "Quantitative finance, economics, financial accounting, and banking.",
      thesisTitle:
        "Government bonds and credit risk: an assessment of diversification and a safe asset in the euro area",
      thesisUrl: "https://jyx.jyu.fi/jyx/Record/jyx_123456789_62906",
    },
    {
      degree: "Bachelor's in Economics",
      school: "Athens University of Economics and Business (AUEB)",
    },
  ],
  skills: [
    {
      label: "Credit & Risk",
      items: [
        "PD models",
        "Scorecards",
        "ECL / IFRS 9 context",
        "Portfolio steering",
        "Credit engine (Provenir)",
        "Cut-off setting",
        "In-production monitoring",
      ],
    },
    {
      label: "Data & Analytics",
      items: [
        "Python",
        "SQL",
        "SAS",
        "Statistics",
        "Power BI / Microsoft Fabric",
        "Dashboards",
        "Automation",
        "KPI monitoring",
      ],
    },
    {
      label: "Delivery & Operations",
      items: [
        "Technology delivery lead",
        "Azure application operations",
        "Middleware",
        "DevOps collaboration",
        "Cross-functional coordination",
        "Requirements management",
      ],
    },
  ],
  languages: [
    { name: "English", level: "Professional" },
    { name: "Finnish", level: "Professional" },
    { name: "Greek", level: "Native" },
  ],
  training: [
    "Power BI Data Analyst training — Sulava, 2023",
    "ScanAgile 2026 — Nordic agile conference, Helsinki (Agile Finland)",
  ],
};
