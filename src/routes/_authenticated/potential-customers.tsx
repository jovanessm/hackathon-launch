import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { createFileRoute } from "@tanstack/react-router";

type Company = {
  id: string;
  name: string;
  productsInterested: string[];
  description: string;
  contact: { email: string; phone: string; website: string };
  aiSummary: string;
  competencies: string[];
};

const mockCompanies: Company[] = [
  {
    id: "c1",
    name: "GreenLeaf Logistics",
    productsInterested: ["Opportunity Scoring", "Document Insights"],
    description:
      "A regional freight and logistics operator optimizing last-mile deliveries.",
    contact: {
      email: "hello@greenleaflogistics.example",
      phone: "+1 (555) 210-4451",
      website: "https://greenleaflogistics.example",
    },
    competencies: ["manufacturing strengths", "logistics"],
    aiSummary:
      "Matches SCHOTT's `manufacturing strengths` — Opportunity Scoring highlights high-value shipping partners; Document Insights can extract supplier contracts and SLAs to validate partner fit.",
  },
  {
    id: "c2",
    name: "Aperture Health",
    productsInterested: ["Report Builder", "Evaluation Log"],
    description:
      "A healthcare analytics startup building clinical trial matching tools.",
    contact: {
      email: "contact@aperturehealth.example",
      phone: "+1 (555) 332-9987",
      website: "https://aperturehealth.example",
    },
    competencies: ["pharmaceutical glass", "primary packaging"],
    aiSummary:
      "Report signals (Phase II→III transitions, regulatory filings) point to upcoming primary packaging demand — aligns directly with SCHOTT `pharmaceutical glass` competency.",
  },
  {
    id: "c3",
    name: "Oak & Ember Retail",
    productsInterested: ["Opportunity Alerts", "Watchlist"],
    description:
      "A boutique retail chain focusing on curated home goods and seasonal collections.",
    contact: {
      email: "sales@oakandember.example",
      phone: "+1 (555) 987-4412",
      website: "https://oakandember.example",
    },
    competencies: ["display & cover glass"],
    aiSummary:
      "Competitor product movement and vendor deals in Opportunity reports indicate demand for strengthened `display & cover glass` for point-of-care devices and retail hardware.",
  },
  {
    id: "c4",
    name: "Summit Fintech",
    productsInterested: ["Scoring Engine", "Document Insights", "Report Builder"],
    description: "A payments infrastructure provider for SMBs and marketplaces.",
    contact: {
      email: "partnerships@summitfintech.example",
      phone: "+1 (555) 101-2020",
      website: "https://summitfintech.example",
    },
    competencies: ["manufacturing strengths"],
    aiSummary:
      "Transaction and integration opportunity signals surface operational partners — while not a direct materials match, `manufacturing strengths` and ecosystem partnerships can enable new packaging workflows for SMB marketplaces.",
  },
  {
    id: "c5",
    name: "Blue Horizon Energy",
    productsInterested: ["Opportunity Scoring", "Evaluation Log"],
    description:
      "A renewable-energy project developer focused on small-scale solar and storage projects.",
    contact: {
      email: "team@bluehorizon.example",
      phone: "+1 (555) 404-1212",
      website: "https://bluehorizon.example",
    },
    competencies: ["specialty glass & glass-ceramics"],
    aiSummary:
      "Opportunity Scoring surfaces land parcels and partners for energy hardware; `specialty glass & glass-ceramics` competency maps to glass components used in energy sensors and optics.",
  },
];

export const Route = createFileRoute("/_authenticated/potential-customers")({ component: PotentialCustomersPage });

function PotentialCustomersPage(): JSX.Element {
  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        eyebrow="Potential Customers"
        title="Potential Customers"
        description="List of mock potential customers and why our products might interest them."
      />

      <div style={{ display: "grid", gap: 12 }}>
        {mockCompanies.map((c) => (
          <section key={c.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
            <h2 style={{ margin: 0 }}>{c.name}</h2>
            <p style={{ margin: "6px 0", color: "#374151" }}>
              <strong>Products:</strong> {c.productsInterested.join(", ")}
            </p>
            <p style={{ margin: "6px 0", color: "#374151" }}>
              <strong>Competencies:</strong> {c.competencies?.join(", ")}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Description:</strong> {c.description}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Contact:</strong>
              <br />
              <a href={`mailto:${c.contact.email}`}>{c.contact.email}</a>
              <br />
              {c.contact.phone}
              <br />
              <a href={c.contact.website} target="_blank" rel="noreferrer">
                {c.contact.website}
              </a>
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>AI Summary:</strong> {c.aiSummary}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
