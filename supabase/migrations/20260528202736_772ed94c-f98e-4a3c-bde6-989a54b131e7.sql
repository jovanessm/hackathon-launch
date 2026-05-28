
-- Roles
CREATE TYPE public.app_role AS ENUM ('analyst', 'admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  org TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self upsert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles self read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, org)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'org');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'analyst');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Shared catalog
CREATE TABLE public.data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);
GRANT SELECT ON public.data_sources TO authenticated;
GRANT ALL ON public.data_sources TO service_role;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "data_sources read all" ON public.data_sources FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "data_sources admin write" ON public.data_sources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT
);
GRANT SELECT ON public.competencies TO authenticated;
GRANT ALL ON public.competencies TO service_role;
ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "competencies read all" ON public.competencies FOR SELECT TO authenticated USING (TRUE);

CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  rationale TEXT NOT NULL,
  why_now TEXT NOT NULL,
  competency_id UUID REFERENCES public.competencies(id),
  baseline_score NUMERIC NOT NULL DEFAULT 0,
  therapeutic_modality TEXT,
  phase TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opportunities read all" ON public.opportunities FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "opportunities admin write" ON public.opportunities FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.opportunity_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  source_id UUID REFERENCES public.data_sources(id),
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  published_at TIMESTAMPTZ
);
GRANT SELECT ON public.opportunity_evidence TO authenticated;
GRANT ALL ON public.opportunity_evidence TO service_role;
ALTER TABLE public.opportunity_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "evidence read all" ON public.opportunity_evidence FOR SELECT TO authenticated USING (TRUE);

-- Watchlist
CREATE TABLE public.watchlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('drug','modality','company')),
  value TEXT NOT NULL,
  current_phase TEXT,
  last_phase_change_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watchlist_items TO authenticated;
GRANT ALL ON public.watchlist_items TO service_role;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "watchlist own" ON public.watchlist_items FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.phase_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_item_id UUID NOT NULL REFERENCES public.watchlist_items(id) ON DELETE CASCADE,
  from_phase TEXT,
  to_phase TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  evidence_url TEXT
);
GRANT SELECT, INSERT ON public.phase_events TO authenticated;
GRANT ALL ON public.phase_events TO service_role;
ALTER TABLE public.phase_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "phase_events own" ON public.phase_events FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.watchlist_items w WHERE w.id = watchlist_item_id AND w.user_id = auth.uid())
);

-- Alerts
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  signal_strength NUMERIC NOT NULL DEFAULT 0,
  source_id UUID REFERENCES public.data_sources(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts read all" ON public.alerts FOR SELECT TO authenticated USING (TRUE);

CREATE TABLE public.user_alert_state (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, alert_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_alert_state TO authenticated;
GRANT ALL ON public.user_alert_state TO service_role;
ALTER TABLE public.user_alert_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alert_state own" ON public.user_alert_state FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Saved filters
CREATE TABLE public.saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_filters TO authenticated;
GRANT ALL ON public.saved_filters TO service_role;
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "filters own" ON public.saved_filters FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Documents + evaluation log
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents own" ON public.documents FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.evaluation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modifier_value NUMERIC NOT NULL DEFAULT 0,
  snippet TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.evaluation_log TO authenticated;
GRANT ALL ON public.evaluation_log TO service_role;
ALTER TABLE public.evaluation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eval_log own" ON public.evaluation_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "eval_log own insert" ON public.evaluation_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Storage bucket for uploaded docs
INSERT INTO storage.buckets (id, name, public) VALUES ('user-documents', 'user-documents', FALSE);

CREATE POLICY "user docs read own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "user docs insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "user docs delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Seed catalog data
INSERT INTO public.data_sources (key, label, category) VALUES
  ('ctis', 'EU CTIS', 'clinical'),
  ('clinicaltrials', 'ClinicalTrials.gov', 'clinical'),
  ('openfda', 'openFDA', 'regulatory'),
  ('ema', 'EMA', 'regulatory'),
  ('espacenet', 'Espacenet', 'patents'),
  ('google_patents', 'Google Patents', 'patents');

INSERT INTO public.competencies (key, label, description) VALUES
  ('vials', 'Vials', 'Glass vials for injectable drugs'),
  ('ampoules', 'Ampoules', 'Sealed glass ampoules'),
  ('cartridges', 'Cartridges', 'Pen and pump cartridges'),
  ('syringes', 'Syringes', 'Prefilled glass syringes');

-- Seed opportunities
WITH c AS (SELECT key, id FROM public.competencies),
     s AS (SELECT key, id FROM public.data_sources)
INSERT INTO public.opportunities (title, rationale, why_now, competency_id, baseline_score, therapeutic_modality, phase)
SELECT * FROM (VALUES
  ('GLP-1 obesity pipeline expansion',
   'Surge in late-stage GLP-1 candidates (Eli Lilly, Novo, smaller biotechs) requires high-volume prefilled pen cartridge supply.',
   'Three new Phase III readouts in Q1; CDMOs reporting cartridge shortages.',
   (SELECT id FROM c WHERE key='cartridges'), 92.4, 'Peptide (GLP-1)', 'Phase III'),
  ('mRNA therapeutic vials post-COVID',
   'mRNA platforms shifting from vaccines to oncology and rare disease — low-extractables Type I vials in demand.',
   'EMA marketing authorization filings up 38% YoY for mRNA non-vaccine indications.',
   (SELECT id FROM c WHERE key='vials'), 85.1, 'mRNA', 'Phase II'),
  ('Biologic prefilled syringes for autoimmune',
   'Self-administered biologics (IL-17, IL-23 inhibitors) drive PFS demand with stricter silicone-free requirements.',
   'Patent filings for silicone-free syringe coatings spiked 4× in the last 6 months.',
   (SELECT id FROM c WHERE key='syringes'), 78.6, 'Monoclonal antibody', 'Marketed'),
  ('Gene therapy single-dose ampoules',
   'AAV-based gene therapies need ultra-low alkali ampoules for tiny, high-value doses.',
   'FDA approved 4 new gene therapies in past 12 months; ampoule re-emerging for single-shot formats.',
   (SELECT id FROM c WHERE key='ampoules'), 71.2, 'Gene therapy (AAV)', 'Phase III'),
  ('Long-acting injectable antipsychotics',
   'Shift from oral to LAI antipsychotics requires depot-compatible vials with extended shelf stability.',
   'Three Phase III LAI programs reading out in 2026; openFDA adverse-event signal stable.',
   (SELECT id FROM c WHERE key='vials'), 66.8, 'Small molecule depot', 'Phase III')
) AS t(title, rationale, why_now, competency_id, baseline_score, therapeutic_modality, phase);

-- Seed evidence
INSERT INTO public.opportunity_evidence (opportunity_id, source_id, url, title, published_at)
SELECT o.id, s.id, v.url, v.title, v.published_at::timestamptz
FROM public.opportunities o
JOIN (VALUES
  ('GLP-1 obesity pipeline expansion', 'clinicaltrials', 'https://clinicaltrials.gov/study/NCT05929066', 'NCT05929066 — Tirzepatide Phase III obesity', '2025-09-12'),
  ('GLP-1 obesity pipeline expansion', 'espacenet', 'https://worldwide.espacenet.com/patent/search?q=GLP-1%20cartridge', 'EP4321XXX — Pen cartridge glass formulation', '2025-07-04'),
  ('mRNA therapeutic vials post-COVID', 'ema', 'https://www.ema.europa.eu/en/medicines', 'EMA pipeline tracker — mRNA oncology', '2026-01-20'),
  ('Biologic prefilled syringes for autoimmune', 'google_patents', 'https://patents.google.com/?q=silicone+free+syringe+coating', 'Patent cluster: silicone-free PFS coatings', '2025-12-02'),
  ('Gene therapy single-dose ampoules', 'openfda', 'https://open.fda.gov/apis/drug/drugsfda/', 'openFDA — AAV gene therapy approvals 2025', '2025-11-18'),
  ('Long-acting injectable antipsychotics', 'ctis', 'https://euclinicaltrials.eu/search-for-clinical-trials', 'CTIS — LAI antipsychotic Phase III studies', '2025-10-10')
) AS v(title_match, src_key, url, title, published_at) ON o.title = v.title_match
JOIN public.data_sources s ON s.key = v.src_key;

-- Seed alerts
INSERT INTO public.alerts (kind, title, body, signal_strength, source_id)
SELECT * FROM (VALUES
  ('patent_spike', 'Silicone-free syringe coating filings +412%', 'Six new patent families filed in the last 30 days across Asia and EU for tungsten-free, silicone-free PFS coatings.', 0.87, (SELECT id FROM public.data_sources WHERE key='espacenet')),
  ('funding_spike', 'Series B funding into oral GLP-1 alternates', 'Three early-stage biotechs raised >$80M combined targeting injectable next-gen incretin mimetics.', 0.62, (SELECT id FROM public.data_sources WHERE key='clinicaltrials')),
  ('regulatory', 'FDA draft guidance on container closure for cell therapies', 'New draft guidance tightens extractables/leachables expectations for single-dose autologous therapies.', 0.74, (SELECT id FROM public.data_sources WHERE key='openfda')),
  ('phase_transition', 'Donanemab Phase II → III activity', 'Multiple sponsors moving anti-amyloid programs into pivotal trials — projects subcutaneous PFS demand from 2027.', 0.55, (SELECT id FROM public.data_sources WHERE key='ctis'))
) AS t(kind, title, body, signal_strength, source_id);
