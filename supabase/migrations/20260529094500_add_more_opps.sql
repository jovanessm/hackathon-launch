-- Add five more mock opportunities so the demo returns top 10

WITH c AS (SELECT key, id FROM public.competencies),
     s AS (SELECT key, id FROM public.data_sources)
INSERT INTO public.opportunities (title, rationale, why_now, competency_id, baseline_score, therapeutic_modality, phase)
SELECT * FROM (VALUES
  ('Wearable biosensor optics demand',
   'Increased funding for wearable continuous monitoring devices requires precision cover glass for light guides and sensors.',
   'Two large VC rounds in the past year and several product launches in EU Q4.',
   (SELECT id FROM c WHERE key='vials'), 63.4, 'Wearable sensor', 'Marketed'),
  ('Sterile microdose ampoule niche for gene editing',
   'Microdose delivery formats for CRISPR payloads need ultra-low-volume ampoules with low extractables.',
   'Patent families and NIH grants indicate rising interest; several Phase I trials beginning.',
   (SELECT id FROM c WHERE key='ampoules'), 59.7, 'Gene editing', 'Phase I'),
  ('Prefilled cartridge for inhaled biologics',
   'New inhaled biologics require novel cartridge sealants and primary packaging compatible with nebulized delivery.',
   'Regulatory filings and device clearances increasing; small CDMOs reporting prototype runs.',
   (SELECT id FROM c WHERE key='cartridges'), 57.2, 'Inhaled biologic', 'Phase II'),
  ('Compact prefilled syringe for pediatric biologics',
   'Pediatric dosing drives demand for smaller-volume prefilled syringes with improved dosing accuracy.',
   'Funding and clinical activity in pediatric formulations spiked in the last 12 months.',
   (SELECT id FROM c WHERE key='syringes'), 49.3, 'Pediatric biologic', 'Phase II'),
  ('Alternative vial coatings to reduce DWV',
   'New coating chemistries aim to reduce drug–container interactions for sensitive biologics.',
   'Multiple patent filings and a regulatory draft guidance discussion in EMA.',
   (SELECT id FROM c WHERE key='vials'), 44.8, 'Biologic stabilizers', 'Preclinical')
) AS t(title, rationale, why_now, competency_id, baseline_score, therapeutic_modality, phase);

-- Seed evidence for the new opportunities
INSERT INTO public.opportunity_evidence (opportunity_id, source_id, url, title, published_at)
SELECT o.id, s.id, v.url, v.title, v.published_at::timestamptz
FROM public.opportunities o
JOIN (VALUES
  ('Wearable biosensor optics demand', 'clinicaltrials', 'https://clinicaltrials.gov/study/NCT05000001', 'Wearable sensor trial NCT05000001', '2025-08-01'),
  ('Sterile microdose ampoule niche for gene editing', 'espacenet', 'https://worldwide.espacenet.com/patent/search?q=microdose+ampoule', 'Patent: microdose ampoule formulations', '2025-06-15'),
  ('Prefilled cartridge for inhaled biologics', 'openfda', 'https://api.fda.gov/device/510k.json', 'Device 510(k) filings for inhaled delivery cartridges', '2025-11-20'),
  ('Compact prefilled syringe for pediatric biologics', 'google_patents', 'https://patents.google.com/?q=pediatric+prefilled+syringe', 'Patent cluster: pediatric PFS designs', '2025-09-05'),
  ('Alternative vial coatings to reduce DWV', 'ema', 'https://www.ema.europa.eu/en/news/alternative-coatings', 'EMA discussion: container coating guidance', '2026-02-10')
) AS v(title_match, src_key, url, title, published_at) ON o.title = v.title_match
JOIN public.data_sources s ON s.key = v.src_key;
