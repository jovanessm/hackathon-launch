import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type Company = {
  id: string;
  name: string;
  products_interested: string[];
  description: string;
  contact_email: string;
  contact_phone: string;
  contact_website: string;
  ai_summary: string;
  competencies: string[];
  citations: { label: string; href: string }[];
  opportunity_id?: string;
};

// Initial mock data
let mockCustomers: Company[] = [
  {
    id: "c1",
    name: "GreenLeaf Logistics",
    products_interested: ["Opportunity Scoring", "Document Insights"],
    description: "A regional freight and logistics operator optimizing last-mile deliveries.",
    contact_email: "hello@greenleaflogistics.example",
    contact_phone: "+1 (555) 210-4451",
    contact_website: "https://greenleaflogistics.example",
    competencies: ["manufacturing strengths", "logistics"],
    ai_summary: "Matches SCHOTT's `manufacturing strengths` — Opportunity Scoring highlights high-value shipping partners; Document Insights can extract supplier contracts and SLAs to validate partner fit.",
    citations: [{ label: "DHL Last Mile Delivery Trends", href: "https://www.dhl.com" }],
  },
  {
    id: "c2",
    name: "Aperture Health",
    products_interested: ["Report Builder", "Evaluation Log"],
    description: "A healthcare analytics startup building clinical trial matching tools.",
    contact_email: "contact@aperturehealth.example",
    contact_phone: "+1 (555) 332-9987",
    contact_website: "https://aperturehealth.example",
    competencies: ["pharmaceutical glass", "primary packaging"],
    ai_summary: "Report signals (Phase II→III transitions, regulatory filings) point to upcoming primary packaging demand — aligns directly with SCHOTT `pharmaceutical glass` competency.",
    citations: [{ label: "ClinicalTrials.gov", href: "https://clinicaltrials.gov/" }],
  },
  {
    id: "c3",
    name: "Oak & Ember Retail",
    products_interested: ["Opportunity Alerts", "Watchlist"],
    description: "A boutique retail chain focusing on curated home goods and seasonal collections.",
    contact_email: "sales@oakandember.example",
    contact_phone: "+1 (555) 987-4412",
    contact_website: "https://oakandember.example",
    competencies: ["display & cover glass"],
    ai_summary: "Competitor product movement and vendor deals in Opportunity reports indicate demand for strengthened `display & cover glass` for point-of-care devices and retail hardware.",
    citations: [{ label: "NRF Retail insights", href: "https://nrf.com" }],
  },
  {
    id: "c4",
    name: "Summit Fintech",
    products_interested: ["Scoring Engine", "Document Insights"],
    description: "A payments infrastructure provider for SMBs and marketplaces.",
    contact_email: "partnerships@summitfintech.example",
    contact_phone: "+1 (555) 101-2020",
    contact_website: "https://summitfintech.example",
    competencies: ["manufacturing strengths"],
    ai_summary: "Transaction and integration opportunity signals surface operational partners — while not a direct materials match, `manufacturing strengths` and ecosystem partnerships can enable new packaging workflows for SMB marketplaces.",
    citations: [{ label: "Deloitte supply chain insights", href: "https://www2.deloitte.com" }],
  },
  {
    id: "c5",
    name: "Blue Horizon Energy",
    products_interested: ["Opportunity Scoring", "Evaluation Log"],
    description: "A renewable-energy project developer focused on small-scale solar and storage projects.",
    contact_email: "team@bluehorizon.example",
    contact_phone: "+1 (555) 404-1212",
    contact_website: "https://bluehorizon.example",
    competencies: ["specialty glass & glass-ceramics"],
    ai_summary: "Opportunity Scoring surfaces land parcels and partners for energy hardware; `specialty glass & glass-ceramics` competency maps to glass components used in energy sensors and optics.",
    citations: [{ label: "IEA energy storage and solar outlook", href: "https://www.iea.org" }],
  }
];

export const listCustomers = createServerFn({ method: "GET" })
  .handler(async () => {
    return mockCustomers;
  });

const addCustomerSchema = z.object({
  opportunity_id: z.string().optional(),
  name: z.string(),
  products_interested: z.array(z.string()).optional(),
  description: z.string().optional(),
  contact_email: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_website: z.string().optional(),
  ai_summary: z.string().optional(),
  competencies: z.array(z.string()).optional(),
  citations: z.any().optional(),
});

export const addCustomer = createServerFn({ method: "POST" })
  .inputValidator((d) => addCustomerSchema.parse(d))
  .handler(async ({ data }) => {
    const newCustomer: Company = {
      id: "c_" + Math.random().toString(36).substr(2, 9),
      opportunity_id: data.opportunity_id,
      name: data.name,
      products_interested: data.products_interested || [],
      description: data.description || "",
      contact_email: data.contact_email || "",
      contact_phone: data.contact_phone || "",
      contact_website: data.contact_website || "",
      ai_summary: data.ai_summary || "",
      competencies: data.competencies || [],
      citations: data.citations || [],
    };
    mockCustomers = [newCustomer, ...mockCustomers];
    return newCustomer;
  });

const deleteCustomerSchema = z.object({
  id: z.string(),
});

export const deleteCustomer = createServerFn({ method: "POST" })
  .inputValidator((d) => deleteCustomerSchema.parse(d))
  .handler(async ({ data }) => {
    mockCustomers = mockCustomers.filter(c => c.id !== data.id);
    return { success: true };
  });
