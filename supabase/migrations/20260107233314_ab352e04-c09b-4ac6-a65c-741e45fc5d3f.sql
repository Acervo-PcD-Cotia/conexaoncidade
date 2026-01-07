-- Inserir/atualizar categorias padrão na ordem correta
-- Primeiro, atualizar as existentes com a ordem correta
UPDATE public.categories SET sort_order = 1 WHERE slug = 'cultura';
UPDATE public.categories SET sort_order = 2 WHERE slug = 'direitos-humanos';
UPDATE public.categories SET sort_order = 3 WHERE slug = 'economia';
UPDATE public.categories SET sort_order = 4 WHERE slug = 'educacao';
UPDATE public.categories SET sort_order = 5 WHERE slug = 'esportes';
UPDATE public.categories SET sort_order = 6 WHERE slug = 'geral';
UPDATE public.categories SET sort_order = 7 WHERE slug = 'internacional';
UPDATE public.categories SET sort_order = 8 WHERE slug = 'justica';
UPDATE public.categories SET sort_order = 9 WHERE slug = 'meio-ambiente';
UPDATE public.categories SET sort_order = 10 WHERE slug = 'politica';
UPDATE public.categories SET sort_order = 11 WHERE slug = 'policia';
UPDATE public.categories SET sort_order = 12 WHERE slug = 'saude';

-- Inserir categorias que não existem (usando ON CONFLICT para evitar duplicatas)
INSERT INTO public.categories (name, slug, color, sort_order, is_active)
VALUES 
  ('Cultura', 'cultura', '#F59E0B', 1, true),
  ('Direitos Humanos', 'direitos-humanos', '#EC4899', 2, true),
  ('Economia', 'economia', '#10B981', 3, true),
  ('Educação', 'educacao', '#8B5CF6', 4, true),
  ('Esportes', 'esportes', '#22C55E', 5, true),
  ('Geral', 'geral', '#6B7280', 6, true),
  ('Internacional', 'internacional', '#3B82F6', 7, true),
  ('Justiça', 'justica', '#DC2626', 8, true),
  ('Meio Ambiente', 'meio-ambiente', '#059669', 9, true),
  ('Política', 'politica', '#EF4444', 10, true),
  ('Polícia', 'policia', '#1E40AF', 11, true),
  ('Saúde', 'saude', '#06B6D4', 12, true)
ON CONFLICT (slug) DO UPDATE SET 
  sort_order = EXCLUDED.sort_order,
  name = EXCLUDED.name,
  color = EXCLUDED.color;