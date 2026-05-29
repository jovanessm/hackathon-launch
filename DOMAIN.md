# SCHOTT AG — Project Context for Coding Agents

> This file gives a coding agent the business context needed to make good decisions
> about data sources, scoring logic, domain terminology, and opportunity matching.
> Read this before writing any feature related to opportunity scoring or market intelligence.

---

## 1. Who Is SCHOTT?

SCHOTT AG is an international technology group specializing in **specialty glass and glass-ceramics**.

- Founded: 1884, headquartered in Mainz, Germany
- Revenue: €2.8 billion (2024/25)
- Employees: 17,000+ across 30+ countries
- Listed subsidiary: **SCHOTT Pharma** (MDAX) — one of the world's leading makers of pharmaceutical primary packaging
- Scale: More than 30,000 people receive an injection from a SCHOTT product **every minute**

---

## 2. What SCHOTT Makes (Core Competencies)

These competencies are the foundation for **opportunity matching**. Every scored opportunity must map to at least one of these. Do not surface generic MedTech trends — only opportunities where SCHOTT's materials or manufacturing capabilities are directly relevant.

| Competency | What It Means in Practice | Key Terms for Matching |
|---|---|---|
| **Pharmaceutical glass** | Syringes, vials, ampoules, cartridges in borosilicate glass for injectable drugs. Ultra-pure, chemically inert, compatible with biologics, mRNA, GLP-1 and other high-value drugs | primary packaging, injectable, borosilicate, vial, prefillable syringe, ampoule, cartridge, biologics, mRNA, GLP-1 |
| **Specialty glass & glass-ceramics** | Custom compositions for extreme conditions: high heat resistance (CERAN), optical precision (Advanced Optics), radiation shielding, electrical insulation | high-temperature, radiation shielding, optical, glass-ceramic, advanced optics |
| **Glass-to-metal seals** | Hermetic connections for sensors, connectors and electronics needing absolute sealing. Used in implantables, aerospace, industry | hermetic seal, implantable, feedthrough, sensor housing, hermetic connector |
| **Fiber optics & light guides** | Precision light transmission for medical imaging, endoscopy, diagnostics, industrial inspection | fiber optic, light guide, endoscopy, imaging, miniaturized, flexible optics |
| **Display & cover glass** | Ultra-thin, chemically strengthened glass for screens and protective surfaces. Relevant for wearables, point-of-care and digital health hardware | cover glass, strengthened glass, wearable, point-of-care, thin glass, display |
| **Manufacturing strengths** | Very small volumes at very high precision, clean-room production, decades of regulatory experience (FDA, EMA), global production network (Europe, Americas, Asia) | clean-room, precision manufacturing, FDA, EMA, regulatory, small-batch, GMP |

---

## 3. The Problem SCHOTT Wants to Solve

### Core challenge
The market intelligence team must identify MedTech growth opportunities **before they become obvious** to competitors. The timing window is narrow:

- **Too late (3+ years):** capacity built into a saturated market
- **Too early (3+ years):** investment in demand that does not yet exist
- **The goal:** catch opportunities when they are real but not yet obvious

### Current state (manual, broken)
Today the team works by hand:
- Desk research using Copilot
- Expensive reports from large market research providers
- Internal platform (Intellify)
- Customer conversations

**Signals are scattered across:**
- Patent filings
- Clinical trial registries
- Startup funding rounds
- Regulatory filings
- Academic papers
- Competitor news and M&A activity

**Problems with the current approach:**
1. By the time an opportunity appears in a published market study, every competitor has already read it
2. Manual work scales badly across a fast-moving market
3. Early signals are weak and easy to miss
4. No systematic way to rank or prioritize

---

## 4. What the Ideal Output Looks Like

The user (a market intelligence professional) wants to open their morning to:

> A **short, ranked set of specific opportunities**, each answering:
> - Why should we act on this?
> - Why now?

**Not** a feed of trends. **Not** a generic market report. A handful of **concrete, prioritized bets**, each:
- Tied to one of SCHOTT's competencies (see Section 2)
- Backed by **traceable public sources** (no black-box claims)
- Including a timing argument (why now, not just why)

---

## 5. Signal Types That Matter

Use these to drive data source selection and scoring logic.

| Signal Type | Why It Matters | Timing Proxy |
|---|---|---|
| **New therapeutic modalities** | Each new drug class (mRNA, ADCs, cell therapies, GLP-1) creates new demands on primary packaging, 3–5 years before market launch | Phase II → Phase III transition = ~2–4 years to packaging demand |
| **Emerging device categories** | New diagnostics, wearables, implantables, or surgical tools may need optical components, hermetic seals, or protective glass | FDA 510(k) / PMA filings, patent clusters |
| **Regulatory shifts** | New EU or FDA rules can mandate different material properties, sterility standards or traceability — creating demand before customers start looking | Regulatory consultation periods, proposed rule publications |
| **Competitor & adjacent moves** | Where specialty-material companies invest, acquire or partner signals new supply chain directions | SEC EDGAR filings, press releases, job postings |
| **White spaces** | Fast-growing sub-markets with material needs that fit SCHOTT's competencies but where SCHOTT has no product today | Funding rounds in adjacent segments, academic paper clusters |

### Timing logic (important for scoring)
The hardest part of any opportunity is **why now**, not what. Build timing arguments using:
- Drug pipeline phase transitions (Phase II → III = ~2–4 years to packaging demand)
- Patent filing density trends (acceleration = approaching commercialization)
- Funding round size and frequency in a sub-sector
- Regulatory comment periods and finalization timelines

---

## 6. Public Data Sources

These are the approved, free, open sources. Do not scrape paywalled data.

| Source | What It Provides | API / Access |
|---|---|---|
| **ClinicalTrials.gov** | Global clinical trial database including US trials | Free REST API at `clinicaltrials.gov` |
| **EU CTIS** | EU/EEA trial registry (since Jan 2025) | `euclinicaltrials.eu`, free open access |
| **openFDA** | 510(k) and PMA device clearances, drug approvals | `api.fda.gov`, free open API |
| **EMA medicine data** | European drug approvals and pipeline | `ema.europa.eu`, free open-data download |
| **Espacenet / Google Patents** | Patent search for MedTech R&D signals | EPO OPS API (free, rate-limited); `patents.google.com` |
| **OpenAlex** | Broad scientific literature, early trend detection | `openalex.org`, free open API |
| **PubMed** | Biomedical literature | `pubmed.ncbi.nlm.nih.gov`, free open API |
| **EU CORDIS** | European public research funding | `cordis.europa.eu`, free bulk download or API |
| **NIH RePORTER** | US public research funding | `reporter.nih.gov`, free API |
| **SEC EDGAR** | Competitor acquisition and investment filings | `sec.gov/edgar`, free |
| **Dealroom / Crunchbase** | MedTech startup funding flows by sub-sector | Dealroom.co, Crunchbase |

### Non-obvious signal sources worth considering
- Hiring patterns (job postings from competitors)
- Conference agendas (which topics are getting sessions)
- Patient forums (unmet needs surfacing early)
- Import/export trade data
- Procurement notices

---

## 7. Competitor Landscape

Track these companies for "competitor moves" signals.

**Pharmaceutical glass packaging:**
- Gerresheimer
- Stevanato Group
- Nipro
- Corning (Valor Glass)
- BD (Becton Dickinson) — adjacent
- West Pharmaceutical Services — adjacent

**Specialty & technical glass:**
- Corning
- AGC
- Nippon Electric Glass
- Ohara
- HOYA
- Saint-Gobain

---

## 8. Constraints for the Coding Agent

These are hard constraints — do not work around them.

1. **Every surfaced opportunity must link to traceable public sources.** No black-box scores without evidence. The user is a professional making high-stakes strategic bets.
2. **Only public data.** Do not scrape paywalled sources. SCHOTT's internal data (Intellify, customer base, competency sheets) is context only — do not build it into the product.
3. **Every opportunity must map to a specific SCHOTT competency** (Section 2). Generic MedTech trends that do not connect to what SCHOTT makes are not useful output.
4. **MedTech is the primary domain, but the architecture should not be hardcoded to it.** Design so the signal pipeline and scoring engine can be pointed at other markets later.

---

## 9. Opportunity Scoring — What "Good" Looks Like

An opportunity is high-quality when it answers all three:

| Question | What to Look For |
|---|---|
| **What?** | A specific, named sub-market or technology trend (e.g. "prefillable syringes for GLP-1 peptide drugs" — not "injectable drug market") |
| **Why SCHOTT?** | A direct match to one or more competencies in Section 2 — SCHOTT must be able to supply something the opportunity requires |
| **Why now?** | A timing argument backed by signals (e.g. "three GLP-1 candidates entering Phase III in Q1 2025 implies primary packaging demand in 2027–2028") |

### Score dimensions to consider
- **Signal strength** — how many independent sources confirm the trend
- **Timing fit** — how far out is the demand window (too early / right now / too late)
- **Competency match** — how directly does SCHOTT's capability address the need
- **Competition density** — how many competitors are already serving this space
- **Market size** — rough magnitude of the opportunity

---

## 10. Domain Vocabulary

Use these terms correctly in the UI, data models, and API responses.

| Term | Definition |
|---|---|
| `primary packaging` | The container in direct contact with the drug (vial, syringe, ampoule, cartridge) |
| `biologics` | Large-molecule drugs (antibodies, proteins) requiring chemically inert packaging |
| `mRNA therapeutics` | RNA-based drugs (e.g. COVID vaccines, new modalities) with strict packaging requirements |
| `ADC` | Antibody-drug conjugate — highly potent, sensitive to container interactions |
| `GLP-1` | Glucagon-like peptide-1 agonists (e.g. semaglutide/Ozempic) — fast-growing injectable segment |
| `cell & gene therapy` | Emerging modalities with novel containment requirements |
| `hermetic seal` | Airtight glass-to-metal seal used in implantable devices |
| `510(k)` | FDA premarket notification pathway for medical devices |
| `PMA` | FDA premarket approval — higher bar, for high-risk devices |
| `borosilicate` | The standard glass type for pharmaceutical primary packaging (Type I glass) |
| `white space` | A market segment where SCHOTT's capabilities fit but SCHOTT has no current product |
| `Phase II → III` | Clinical trial transition that signals ~2–4 years to commercialization and packaging demand |
| `HVS` | High-value solutions — SCHOTT Pharma's strategic growth segment |