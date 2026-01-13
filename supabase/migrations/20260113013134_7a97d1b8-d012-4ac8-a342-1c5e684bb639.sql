-- Tabela de ofertas por celular
CREATE TABLE public.phone_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_id UUID NOT NULL REFERENCES public.phone_catalog(id) ON DELETE CASCADE,
  store TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  price INTEGER,
  priority INTEGER NOT NULL DEFAULT 1,
  button_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de cliques em ofertas
CREATE TABLE public.phone_offer_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.phone_offers(id) ON DELETE CASCADE,
  phone_id UUID NOT NULL REFERENCES public.phone_catalog(id) ON DELETE CASCADE,
  store TEXT NOT NULL,
  user_id UUID,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Templates de afiliado por loja (opcional avançado)
CREATE TABLE public.phone_affiliate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store TEXT NOT NULL UNIQUE,
  url_template TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.phone_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_offer_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_affiliate_templates ENABLE ROW LEVEL SECURITY;

-- Políticas para phone_offers
CREATE POLICY "Qualquer um pode ver ofertas ativas" ON public.phone_offers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins podem gerenciar ofertas" ON public.phone_offers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Políticas para phone_offer_clicks
CREATE POLICY "Usuários autenticados podem registrar cliques" ON public.phone_offer_clicks
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins podem ver cliques" ON public.phone_offer_clicks
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Políticas para phone_affiliate_templates
CREATE POLICY "Admins podem ver templates" ON public.phone_affiliate_templates
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins podem gerenciar templates" ON public.phone_affiliate_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Índices para performance
CREATE INDEX idx_phone_offers_phone_id ON public.phone_offers(phone_id);
CREATE INDEX idx_phone_offers_priority ON public.phone_offers(priority);
CREATE INDEX idx_phone_offer_clicks_offer_id ON public.phone_offer_clicks(offer_id);
CREATE INDEX idx_phone_offer_clicks_phone_id ON public.phone_offer_clicks(phone_id);
CREATE INDEX idx_phone_offer_clicks_clicked_at ON public.phone_offer_clicks(clicked_at);
CREATE INDEX idx_phone_offer_clicks_store ON public.phone_offer_clicks(store);

-- Trigger para atualizar updated_at em phone_offers
CREATE TRIGGER update_phone_offers_updated_at
  BEFORE UPDATE ON public.phone_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();