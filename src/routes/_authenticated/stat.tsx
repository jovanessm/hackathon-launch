"use client";

import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExportButtons } from "@/components/ui/ExportButtons";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Progress } from "@/components/ui/progress";

type ProductSeries = {
  productId: string;
  productName: string;
  competency: string;
  series: { month: string; value: number }[];
};

const DATA: ProductSeries[] = [
  {
    productId: "p_pharma_vial",
    productName: "Pharma Vials",
    competency: "pharmaceutical glass",
    series: [
      { month: "Jan", value: 1200 },
      { month: "Feb", value: 1330 },
      { month: "Mar", value: 1410 },
      { month: "Apr", value: 1560 },
      { month: "May", value: 1700 },
      { month: "Jun", value: 1960 },
    ],
  },
  {
    productId: "p_display_cover",
    productName: "Display & Cover Glass",
    competency: "display & cover glass",
    series: [
      { month: "Jan", value: 900 },
      { month: "Feb", value: 920 },
      { month: "Mar", value: 970 },
      { month: "Apr", value: 1000 },
      { month: "May", value: 1150 },
      { month: "Jun", value: 1400 },
    ],
  },
  {
    productId: "p_specialty_optic",
    productName: "Specialty Optics",
    competency: "specialty glass & glass-ceramics",
    series: [
      { month: "Jan", value: 400 },
      { month: "Feb", value: 420 },
      { month: "Mar", value: 430 },
      { month: "Apr", value: 480 },
      { month: "May", value: 520 },
      { month: "Jun", value: 610 },
    ],
  },
];

// --- Domain signals (mock) drawn from DOMAIN.md signal types ---
const clinicalSignals = [
  { id: "cs1", name: "GLP-1 candidate enters Phase III", date: "2026-05-10", competency: "pharmaceutical glass", source: "ClinicalTrials.gov" },
  { id: "cs2", name: "New implantable sensor PMA filing", date: "2026-04-12", competency: "glass-to-metal seals", source: "FDA" },
  { id: "cs3", name: "Phase III transition — ADC formulation", date: "2026-03-04", competency: "pharmaceutical glass", source: "ClinicalTrials.gov" },
];

const patentMonthly = {
  // simple month-ordered arrays that align with DATA months (Jan..Jun)
  "pharmaceutical glass": [2, 3, 4, 5, 6, 8],
  "display & cover glass": [1, 1, 2, 2, 3, 4],
  "specialty glass & glass-ceramics": [0, 1, 1, 2, 2, 3],
};

const fundingRounds = [
  { id: "f1", company: "OptiMed Devices", amount: 4_200_000, date: "2026-04-20", competency: "display & cover glass" },
  { id: "f2", company: "BioPack Labs", amount: 12_500_000, date: "2026-02-12", competency: "pharmaceutical glass" },
  { id: "f3", company: "Thermoceramics", amount: 2_000_000, date: "2026-05-02", competency: "specialty glass & glass-ceramics" },
];

const competitorMoves = [
  { id: "cpm1", company: "Gerresheimer", action: "Expanded vial capacity (EU)", date: "2026-04-30", competency: "pharmaceutical glass" },
  { id: "cpm2", company: "Corning", action: "Patent cluster filing on optics", date: "2026-05-12", competency: "specialty glass & glass-ceramics" },
];

function buildAreaData() {
  const months = DATA[0].series.map((s) => s.month);
  return months.map((m, i) => {
    const item: Record<string, string | number> = { month: m };
    DATA.forEach((p) => {
      item[p.productId] = p.series[i].value;
    });
    return item;
  });
}

function computeGrowth(product: ProductSeries) {
  const s = product.series;
  if (s.length < 2) return 0;
  const last = s[s.length - 1].value;
  const prev = s[s.length - 2].value || 1;
  return ((last - prev) / prev) * 100;
}

// Route registration moved to bottom to avoid initialization order issues

function StatCard({ children }: { children: React.ReactNode }) {
  return <div className="border border-border bg-card p-3 rounded">{children}</div>;
}

function StatsPage() {
  const areaData = buildAreaData();

  const productStats = DATA.map((p) => ({
    id: p.productId,
    name: p.productName,
    competency: p.competency,
    growth: computeGrowth(p),
    latest: p.series[p.series.length - 1].value,
  })).sort((a, b) => b.growth - a.growth);

  const totalMonthlyRevenue = productStats.reduce((s, p) => s + p.latest, 0);

  // --- simple domain-driven demand estimator (mock) ---
  // Score each competency by signals: phaseIII presence, patent acceleration, funding share
  const competencyList = Array.from(new Set(productStats.map((p) => p.competency)));

  const patentScore = (competency: string) => {
    const arr = patentMonthly[competency as keyof typeof patentMonthly] ?? [];
    const last3 = arr.slice(-3).reduce((a, b) => a + b, 0);
    const prev3 = arr.slice(-6, -3).reduce((a, b) => a + b, 0) || 1;
    return Math.max(0, (last3 - prev3) / prev3); // e.g. 0.5 => 50% acceleration
  };

  const fundingByCompetency = fundingRounds.reduce<Record<string, number>>((acc, f) => {
    acc[f.competency] = (acc[f.competency] || 0) + f.amount;
    return acc;
  }, {});

  const fundingTotal = Math.max(1, Object.values(fundingByCompetency).reduce((a, b) => a + b, 0));
  // treat everything in clinicalSignals as recent for mock; real impl would filter by date range
  const recentClinical = clinicalSignals.filter((s) => true);

  const competencyScore = (competency: string) => {
    // base 1.0, +0.5 if a Phase III signal exists for competency, +patentScore, +funding fraction
    const hasPhaseIII = recentClinical.some((s) => s.competency === competency && /phase iii/i.test(s.name));
    const ps = patentScore(competency);
    const fs = (fundingByCompetency[competency] || 0) / fundingTotal; // fraction
    return 1 + (hasPhaseIII ? 0.5 : 0) + ps + fs;
  };

  // estimated demand sums product latest * competencyScore
  const estimatedDemand = productStats.reduce((sum, p) => {
    const score = competencyScore(p.competency);
    return sum + p.latest * score;
  }, 0);

  // --- derive domain metrics from mock signals ---
  const phaseIIICount = recentClinical.filter((s) => s.name.toLowerCase().includes("phase iii") || s.name.toLowerCase().includes("phase iii".toLowerCase())).length;

  const patent3Last = (competency: keyof typeof patentMonthly) => {
    const arr = patentMonthly[competency];
    const last3 = arr.slice(-3).reduce((a, b) => a + b, 0);
    const prev3 = arr.slice(-6, -3).reduce((a, b) => a + b, 0);
    const pct = prev3 === 0 ? 100 : ((last3 - prev3) / prev3) * 100;
    return { last3, prev3, pct };
  };

  const totalFunding = fundingRounds.reduce((a, b) => a + b.amount, 0);

  const competitorCount = competitorMoves.length;

  const opportunities = [
    { id: "o1", title: "GLP-1 prefillable syringes demand", competency: "pharmaceutical glass", why: "Multiple GLP-1 candidates entering Phase III — primary packaging demand expected in 2–4 years.", source: "ClinicalTrials.gov" },
    { id: "o2", title: "Optics for point-of-care imaging", competency: "specialty glass & glass-ceramics", why: "Patent cluster filings and funding for optical startups.", source: "Patents / Dealroom" },
  ];

  const chartConfig = {
    p_pharma_vial: { label: "Pharma Vials", color: "var(--chart-1)" },
    p_display_cover: { label: "Display & Cover", color: "var(--chart-2)" },
    p_specialty_optic: { label: "Specialty Optics", color: "var(--chart-3)" },
  } as const;

  return (
    <div className="grid grid-cols-12 gap-6 p-4 lg:p-6">
      <section className="col-span-12">
        <PageHeader
          eyebrow="Product Metrics"
          title="Opportunity Product Performance Overview"
          description="Revenue time-series and top-moving products. Items are mapped to SCHOTT competencies."
        >
          <ExportButtons
            data={productStats}
            filename="product-stats"
            columns={[
              { header: "Product", accessor: (p) => p.name },
              { header: "Competency", accessor: (p) => p.competency },
              { header: "Latest Revenue", accessor: (p) => p.latest },
              { header: "Growth (%)", accessor: (p) => p.growth.toFixed(1) }
            ]}
          />
        </PageHeader>
      </section>

      <section className="col-span-12 lg:col-span-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <StatCard>
            <p className="label-micro">Total Monthly Revenue</p>
            <div className="mt-2 text-2xl font-semibold">${totalMonthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Sum of latest monthly revenue by opportunities product</p>
          </StatCard>

          <StatCard>
            <p className="label-micro">Estimated Near-Term Packaging Demand</p>
            <div className="mt-2 text-2xl font-semibold">${Math.round(estimatedDemand).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Weighted by clinical, patent and funding signals</p>
          </StatCard>

          <StatCard>
            <p className="label-micro">Top Product</p>
            <div className="mt-2 text-lg font-semibold">{productStats[0].name}</div>
            <p className="text-xs text-muted-foreground mt-1">Latest month: ${productStats[0].latest.toLocaleString()}</p>
          </StatCard>
        </div>

        <div className="border border-border bg-card p-3 rounded">
          <ChartContainer config={chartConfig} className="h-40 w-full">
            <AreaChart data={areaData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              <Area type="monotone" dataKey="p_pharma_vial" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.12} />
              <Area type="monotone" dataKey="p_display_cover" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.12} />
              <Area type="monotone" dataKey="p_specialty_optic" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.12} />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatCard>
            <p className="label-micro">Phase III / Late-stage Transitions</p>
            <div className="mt-2 text-2xl font-semibold">{phaseIIICount}</div>
            <p className="text-xs text-muted-foreground mt-1">Signals that map to product timing</p>
          </StatCard>

          <StatCard>
            <p className="label-micro">Patent filings (last 3 months)</p>
            <div className="mt-2 text-sm space-y-2">
              {Object.keys(patentMonthly).map((k) => {
                const key = k as keyof typeof patentMonthly;
                const { last3, prev3, pct } = patent3Last(key);
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="text-sm">{key}</div>
                    <div className="text-right text-xs text-muted-foreground">{last3} ({pct >= 0 ? "+" : ""}{Math.round(pct)}%)</div>
                  </div>
                );
              })}
            </div>
          </StatCard>
        </div>

        <div className="mt-3">
          <StatCard>
            <p className="label-micro">Funding (recent rounds)</p>
            <div className="mt-2 text-2xl font-semibold">${(totalFunding / 1_000_000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground mt-1">{fundingRounds.length} rounds in the last 6 months</p>
          </StatCard>
        </div>

        <div className="mt-3 border border-border bg-card p-3 rounded">
          <p className="label-micro">Top Opportunity Picks</p>
          <ul className="mt-3 space-y-3">
            {opportunities.map((o) => (
              <li key={o.id} className="p-3 border border-border rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-semibold">{o.title}</div>
                    <div className="text-xs text-muted-foreground">{o.competency} — {o.source}</div>
                    <div className="mt-2 text-sm">{o.why}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <aside className="col-span-12 lg:col-span-4">
        <div className="space-y-3">
          <StatCard>
            <p className="label-micro">Top Movers (by MoM growth)</p>
            <ol className="mt-3 space-y-3">
              {productStats.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.competency}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{p.growth.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">${p.latest.toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ol>
          </StatCard>

          <StatCard>
            <p className="label-micro">Product Share</p>
            <div className="mt-3 space-y-3">
              {productStats.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.competency}</div>
                  </div>
                  <div className="w-28">
                    <Progress value={Math.min(100, Math.round((p.latest / totalMonthlyRevenue) * 100))} />
                  </div>
                </div>
              ))}
            </div>
          </StatCard>

          <StatCard>
            <p className="label-micro">Recent Clinical Signals</p>
            <div className="mt-3 space-y-2 text-sm">
              {clinicalSignals.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.competency} — {s.source}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{s.date}</div>
                </div>
              ))}
            </div>
          </StatCard>

          <StatCard>
            <p className="label-micro">Recent Funding</p>
            <div className="mt-3 space-y-2 text-sm">
              {fundingRounds.slice(0, 4).map((f) => (
                <div key={f.id} className="flex items-center justify-between">
                  <div className="text-sm">{f.company}</div>
                  <div className="text-xs text-muted-foreground">${(f.amount / 1_000_000).toFixed(1)}M</div>
                </div>
              ))}
            </div>
          </StatCard>

          <StatCard>
            <p className="label-micro">Competitor Moves</p>
            <div className="mt-3 space-y-2 text-sm">
              {competitorMoves.slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{c.company}</div>
                    <div className="text-xs text-muted-foreground">{c.action}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{c.date}</div>
                </div>
              ))}
            </div>
          </StatCard>

          <StatCard>
            <p className="label-micro">Patent Acceleration</p>
            <div className="mt-3 text-sm space-y-2">
              {Object.keys(patentMonthly).map((k) => {
                const key = k as keyof typeof patentMonthly;
                const { last3, prev3, pct } = patent3Last(key);
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="text-sm">{key}</div>
                    <div className="text-xs text-muted-foreground">{last3} ({pct >= 0 ? "+" : ""}{Math.round(pct)}%)</div>
                  </div>
                );
              })}
            </div>
          </StatCard>
        </div>
      </aside>
    </div>
  );
}

// Register the route after the component to avoid lexical initialization order problems
export const Route = createFileRoute("/_authenticated/stat")({ component: StatsPage });
