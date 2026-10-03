// Structured CV, sourced from the careerops `cv.md` master.
// Kept as committed content (the factual record). The hero positioning in
// profile.ts is a deliberate blend of this background with a forward-looking
// AI/automation framing.

export interface CvRole {
  title: string;
  period: string;
  bullets: string[];
}

/** Shared public fields for an employer or school place note. */
export interface CvPlaceFields {
  slug: string;
  /** Original monogram beside the name. Not the institution's trademark. */
  mark: string;
  /** One public sentence about the institution. */
  about: string;
  /** Official website. */
  url: string;
  urlLabel: string;
}

export interface CvExperience extends CvPlaceFields {
  company: string;
  location: string;
  roles: CvRole[];
}

export interface CvEducation extends CvPlaceFields {
  degree: string;
  school: string;
  location?: string;
  period?: string;
  detail?: string;
  /** Public thesis landing page or PDF. */
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
    "AI & Data Systems Lead with ~7 years in consumer finance and banking. Domain depth in PD models, scorecards, ECL forecasting, credit engines, and portfolio steering - used as an advantage, not a permanent label. Combines that background with data work (Python, SQL, Power BI / Fabric) and technology delivery across Azure platforms, middleware, and DevOps-aligned operations.",
  experience: [
    {
      company: "Santander Consumer Bank Nordics",
      location: "Finland / Nordics",
      slug: "santander-consumer-bank-nordics",
      mark: "SC",
      about: "Consumer finance in the Nordics, in the Santander group.",
      url: "https://www.santanderconsumer.fi/",
      urlLabel: "Santander Consumer Finland",
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
      slug: "resurs-bank",
      mark: "RB",
      about: "Nordic consumer-finance bank, with a business in Finland.",
      url: "https://www.resursbank.fi/",
      urlLabel: "Resurs Bank Finland",
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
      slug: "finnish-defence-forces",
      mark: "FDF",
      about: "Finland's armed forces.",
      url: "https://puolustusvoimat.fi/en/frontpage",
      urlLabel: "Finnish Defence Forces",
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
      slug: "city-of-helsinki",
      mark: "HKI",
      about:
        "The City of Helsinki's social and health services, as that work was organised in 2016–2017.",
      url: "https://www.hel.fi/en",
      urlLabel: "City of Helsinki",
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
      slug: "bank-of-greece",
      mark: "BoG",
      about: "Greece's central bank, and a member of the Eurosystem.",
      url: "https://www.bankofgreece.gr/",
      urlLabel: "Bank of Greece",
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
      location: "Helsinki, Finland",
      period: "2021–2024",
      slug: "arcada",
      mark: "ARC",
      about: "University of applied sciences in Helsinki.",
      url: "https://www.arcada.fi/en",
      urlLabel: "Arcada",
      detail:
        "Machine learning methods in business environments; analytical service design.",
      thesisTitle:
        "An Analytics Process for Forecasting Expected Credit Losses for the Lifetime of Loans: auto loan portfolios",
      thesisUrl: "https://www.theseus.fi/handle/10024/860989",
    },
    {
      degree: "MSc, Banking and International Finance",
      school: "University of Jyväskylä",
      location: "Jyväskylä, Finland",
      period: "2017–2019",
      slug: "university-of-jyvaskyla",
      mark: "JYU",
      about: "Research university in Jyväskylä.",
      url: "https://www.jyu.fi/en",
      urlLabel: "University of Jyväskylä",
      detail:
        "Quantitative finance, economics, financial accounting, and banking.",
      thesisTitle:
        "Government bonds and credit risk: an assessment of diversification and a safe asset in the euro area",
      thesisUrl: "https://jyx.jyu.fi/jyx/Record/jyx_123456789_62906",
    },
    {
      degree: "Bachelor's in Economics",
      school: "Athens University of Economics and Business (AUEB)",
      location: "Athens, Greece",
      slug: "aueb",
      mark: "AUEB",
      about: "University in Athens, focused on economics and business.",
      url: "https://www.aueb.gr/en",
      urlLabel: "Athens University of Economics and Business",
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

export type PlaceKind = "employer" | "school";

export interface ResolvedPlace {
  kind: PlaceKind;
  slug: string;
  name: string;
  location?: string;
  mark: string;
  about: string;
  url: string;
  urlLabel: string;
  experience?: CvExperience;
  education?: CvEducation;
}

export function placePath(slug: string): string {
  return `/about/${slug}`;
}

export function listPlaceSlugs(): string[] {
  return [
    ...cv.experience.map((item) => item.slug),
    ...cv.education.map((item) => item.slug),
  ];
}

export function getPlace(slug: string): ResolvedPlace | undefined {
  const experience = cv.experience.find((item) => item.slug === slug);
  if (experience) {
    return {
      kind: "employer",
      slug: experience.slug,
      name: experience.company,
      location: experience.location,
      mark: experience.mark,
      about: experience.about,
      url: experience.url,
      urlLabel: experience.urlLabel,
      experience,
    };
  }

  const education = cv.education.find((item) => item.slug === slug);
  if (!education) return undefined;

  return {
    kind: "school",
    slug: education.slug,
    name: education.school,
    location: education.location,
    mark: education.mark,
    about: education.about,
    url: education.url,
    urlLabel: education.urlLabel,
    education,
  };
}
