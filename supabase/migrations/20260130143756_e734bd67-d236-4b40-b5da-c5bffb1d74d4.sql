-- Inserir categorias faltantes (ignorar se já existir)
INSERT INTO public.categories (name, slug, color, is_active, sort_order)
VALUES 
  ('Brasil', 'brasil', '#22c55e', true, 1),
  ('Cidades', 'cidades', '#3b82f6', true, 2),
  ('Política', 'politica', '#ef4444', true, 3),
  ('Economia', 'economia', '#f59e0b', true, 4),
  ('Justiça', 'justica', '#6366f1', true, 5),
  ('Segurança Pública', 'seguranca-publica', '#dc2626', true, 6),
  ('Ciência', 'ciencia', '#14b8a6', true, 7),
  ('Infraestrutura', 'infraestrutura', '#64748b', true, 8),
  ('Entretenimento', 'entretenimento', '#ec4899', true, 9),
  ('Comportamento', 'comportamento', '#8b5cf6', true, 10),
  ('Lifestyle', 'lifestyle', '#f97316', true, 11),
  ('Emprego & Renda', 'emprego-renda', '#10b981', true, 12),
  ('Mobilidade Urbana', 'mobilidade-urbana', '#0ea5e9', true, 13),
  ('Inclusão & PCD', 'inclusao-pcd', '#a855f7', true, 14),
  ('Projetos Sociais', 'projetos-sociais', '#84cc16', true, 15),
  ('Inovação Pública', 'inovacao-publica', '#06b6d4', true, 16),
  ('Conexão Academy', 'conexao-academy', '#7c3aed', true, 17),
  ('Web Rádio', 'web-radio', '#f43f5e', true, 18),
  ('Web TV', 'web-tv', '#e11d48', true, 19)
ON CONFLICT (slug) DO NOTHING;