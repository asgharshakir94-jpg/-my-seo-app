export type TradeCalculatorConfig = {
    slug: string;
    tradeName: string;          // e.g. "Solar Installation"
    jobUnitLabel: string;       // e.g. "installation", "service call", "inspection"
    pageTitle: string;
    pageDescription: string;
    defaults: {
      jobsPerMonth: number;
      pricePerJob: number;
      hoursPerJob: number;
      laborCostPerHour: number;
      vehicleFuelPerJob: number;
      monthlyOverhead: number;
    };
  };
  
  export const TRADE_CALCULATORS: Record<string, TradeCalculatorConfig> = {
    roofing: {
      slug: 'roofing',
      tradeName: 'Roof Inspection',
      jobUnitLabel: 'inspection',
      pageTitle: 'Roof Inspection Cost & Profit Margin Calculator | RankinSEO',
      pageDescription:
        'Free calculator for roofing contractors to price inspections and check profit margins based on labor, fuel, and overhead costs.',
      defaults: {
        jobsPerMonth: 20,
        pricePerJob: 150,
        hoursPerJob: 1.5,
        laborCostPerHour: 35,
        vehicleFuelPerJob: 15,
        monthlyOverhead: 800,
      },
    },
    solar: {
      slug: 'solar',
      tradeName: 'Solar Installation',
      jobUnitLabel: 'installation',
      pageTitle: 'Solar Installation Cost & Profit Margin Calculator | RankinSEO',
      pageDescription:
        'Free calculator for solar installers to price jobs and check profit margins based on labor, fuel, and overhead costs.',
      defaults: {
        jobsPerMonth: 6,
        pricePerJob: 18000,
        hoursPerJob: 24,
        laborCostPerHour: 45,
        vehicleFuelPerJob: 50,
        monthlyOverhead: 2000,
      },
    },
    hvac: {
      slug: 'hvac',
      tradeName: 'HVAC Service Call',
      jobUnitLabel: 'service call',
      pageTitle: 'HVAC Service Call Cost & Profit Margin Calculator | RankinSEO',
      pageDescription:
        'Free calculator for HVAC contractors to price service calls and check profit margins based on labor, fuel, and overhead costs.',
      defaults: {
        jobsPerMonth: 40,
        pricePerJob: 120,
        hoursPerJob: 1,
        laborCostPerHour: 40,
        vehicleFuelPerJob: 20,
        monthlyOverhead: 700,
      },
    },
    plumbing: {
      slug: 'plumbing',
      tradeName: 'Plumbing Service Call',
      jobUnitLabel: 'service call',
      pageTitle: 'Plumbing Service Call Cost & Profit Margin Calculator | RankinSEO',
      pageDescription:
        'Free calculator for plumbing contractors to price service calls and check profit margins based on labor, fuel, and overhead costs.',
      defaults: {
        jobsPerMonth: 35,
        pricePerJob: 110,
        hoursPerJob: 1,
        laborCostPerHour: 38,
        vehicleFuelPerJob: 15,
        monthlyOverhead: 600,
      },
    },
    electrical: {
      slug: 'electrical',
      tradeName: 'Electrical Service Call',
      jobUnitLabel: 'service call',
      pageTitle: 'Electrical Service Call Cost & Profit Margin Calculator | RankinSEO',
      pageDescription:
        'Free calculator for electrical contractors to price service calls and check profit margins based on labor, fuel, and overhead costs.',
      defaults: {
        jobsPerMonth: 30,
        pricePerJob: 130,
        hoursPerJob: 1.2,
        laborCostPerHour: 42,
        vehicleFuelPerJob: 15,
        monthlyOverhead: 650,
      },
    },
  };
  
  const TRADE_KEYWORD_PATTERNS: Array<{ slug: string; pattern: RegExp }> = [
    { slug: 'roofing', pattern: /\broof/ },
    { slug: 'solar', pattern: /\bsolar\b/ },
    { slug: 'hvac', pattern: /\bhvac\b|\bair condition|\bheating\b/ },
    { slug: 'plumbing', pattern: /\bplumb/ },
    { slug: 'electrical', pattern: /\belectric/ },
  ];
  
  export function matchTrade(keyword: string, industry?: string): TradeCalculatorConfig | null {
    const text = `${keyword} ${industry || ''}`.toLowerCase();
    for (const { slug, pattern } of TRADE_KEYWORD_PATTERNS) {
      if (pattern.test(text)) {
        return TRADE_CALCULATORS[slug];
      }
    }
    return null;
  }