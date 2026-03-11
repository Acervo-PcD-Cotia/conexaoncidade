import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface NewsItem {
  title: string;
  subtitle?: string;
  content: string;
  chapeu?: string;
  hat?: string;
  category?: string;
  category_id?: string;
  source?: string;
  fonte?: string;
  author?: string;
  editor?: string;
  featured_image_url?: string;
  image_credit?: string;
  tags?: string[];
  destaque?: 'none' | 'home' | 'featured' | 'urgent';
  status?: 'draft' | 'published';
  published_at?: string;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  excerpt?: string;
}

function str(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    + '-' + Date.now().toString(36);
}

function parseCSV(text: string): NewsItem[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) throw new Error('CSV precisa de cabeçalho + pelo menos 1 linha');

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const items: NewsItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/(".*?"|[^,]+)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = values[idx] || ''; });

    if (!obj.title && !obj.titulo) continue;

    items.push({
      title: str(obj.title || obj.titulo),
      subtitle: str(obj.subtitle || obj.subtitulo),
      content: str(obj.content || obj.conteudo),
      chapeu: str(obj.chapeu || obj.hat),
      source: str(obj.source || obj.fonte),
      author: str(obj.author || obj.editor || obj.autor),
      featured_image_url: str(obj.featured_image_url || obj.imagem),
      tags: obj.tags ? obj.tags.split(';').map(t => t.trim()).filter(Boolean) : undefined,
      destaque: (obj.destaque as NewsItem['destaque']) || 'none',
      status: (obj.status as 'draft' | 'published') || 'draft',
      meta_title: str(obj.meta_title),
      meta_description: str(obj.meta_description),
    });
  }

  return items;
}

function parseTXT(text: string): NewsItem[] {
  const blocks = text.split(/\n---\n|\n===\n/).filter(b => b.trim());
  const items: NewsItem[] = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;

    const title = lines[0].replace(/^#+\s*/, '').trim();
    const content = lines.slice(1).join('\n').trim();

    if (!title || content.length < 20) continue;

    // Try to extract metadata from first lines
    const metaLines: Record<string, string> = {};
    let contentStart = 1;
    for (let i = 1; i < lines.length; i++) {
      const match = lines[i].match(/^(fonte|source|autor|editor|chapeu|subtitulo|tags|destaque):\s*(.+)/i);
      if (match) {
        metaLines[match[1].toLowerCase()] = match[2].trim();
        contentStart = i + 1;
      } else break;
    }

    const actualContent = lines.slice(contentStart).join('\n').trim();

    items.push({
      title,
      subtitle: metaLines.subtitulo || '',
      content: actualContent.length >= 20 ? `<p>${actualContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>` : `<p>${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`,
      chapeu: metaLines.chapeu || '',
      source: metaLines.fonte || metaLines.source || '',
      author: metaLines.autor || metaLines.editor || '',
      tags: metaLines.tags ? metaLines.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      destaque: (metaLines.destaque as NewsItem['destaque']) || 'none',
      status: 'draft',
    });
  }

  return items;
}

function parseJSON(text: string): NewsItem[] {
  const parsed = JSON.parse(text);
  const arr = Array.isArray(parsed) ? parsed : [parsed];

  return arr.map(item => ({
    title: str(item.title || item.titulo),
    subtitle: str(item.subtitle || item.subtitulo),
    content: str(item.content || item.conteudo),
    chapeu: str(item.chapeu || item.hat),
    category_id: str(item.category_id),
    source: str(item.source || item.fonte),
    author: str(item.author || item.editor || item.autor),
    featured_image_url: str(item.featured_image_url || item.imagem),
    image_credit: str(item.image_credit),
    tags: Array.isArray(item.tags) ? item.tags.map(str) : undefined,
    destaque: item.destaque || 'none',
    status: item.status || 'draft',
    published_at: str(item.published_at),
    slug: str(item.slug),
    meta_title: str(item.meta_title),
    meta_description: str(item.meta_description),
    excerpt: str(item.excerpt || item.descricao),
  }));
}

function mapHighlight(destaque?: string): string {
  switch (destaque) {
    case 'home': return 'home';
    case 'featured': return 'featured';
    case 'urgent': return 'urgent';
    default: return 'none';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API Key
    const apiKey = req.headers.get('x-api-key');
    const expectedKey = Deno.env.get('NEWS_IMPORT_API_KEY');

    if (!expectedKey || apiKey !== expectedKey) {
      return new Response(
        JSON.stringify({ error: 'API Key inválida ou ausente. Envie no header x-api-key.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const contentType = req.headers.get('content-type') || '';
    let items: NewsItem[] = [];
    let format = 'json';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      format = body.format || 'json';
      const data = body.data || body;

      if (format === 'csv' && typeof data === 'string') {
        items = parseCSV(data);
      } else if (format === 'txt' && typeof data === 'string') {
        items = parseTXT(data);
      } else {
        items = parseJSON(typeof data === 'string' ? data : JSON.stringify(Array.isArray(data) ? data : (body.items || body.news || [data])));
      }
    } else if (contentType.includes('text/csv')) {
      const text = await req.text();
      items = parseCSV(text);
      format = 'csv';
    } else if (contentType.includes('text/plain')) {
      const text = await req.text();
      // Try JSON first, fallback to TXT
      try {
        items = parseJSON(text);
        format = 'json';
      } catch {
        items = parseTXT(text);
        format = 'txt';
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Content-Type não suportado. Use application/json, text/csv ou text/plain.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhuma notícia válida encontrada no conteúdo enviado.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit batch size
    if (items.length > 100) {
      return new Response(
        JSON.stringify({ error: `Limite de 100 notícias por lote. Enviadas: ${items.length}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: { title: string; status: string; id?: string; error?: string }[] = [];

    for (const item of items) {
      try {
        if (!item.title || item.title.length < 5) {
          results.push({ title: item.title || '(sem título)', status: 'error', error: 'Título muito curto (mín. 5 chars)' });
          continue;
        }
        if (!item.content || item.content.length < 20) {
          results.push({ title: item.title, status: 'error', error: 'Conteúdo muito curto (mín. 20 chars)' });
          continue;
        }

        const slug = item.slug || generateSlug(item.title);

        // Check duplicate
        const { data: dupCheck } = await supabase.rpc('check_duplicate_news', {
          p_slug: slug,
          p_source_url: item.source || '',
          p_title: item.title,
        });

        if (dupCheck && dupCheck.length > 0 && dupCheck[0].is_duplicate) {
          results.push({
            title: item.title,
            status: 'duplicate',
            id: dupCheck[0].existing_id,
            error: `Duplicada (${dupCheck[0].match_type})`,
          });
          continue;
        }

        const newsRow = {
          title: item.title,
          slug,
          subtitle: item.subtitle || null,
          content: item.content,
          hat: (item.chapeu || item.hat || '').toUpperCase() || null,
          source: item.source || item.fonte || null,
          editor_name: item.author || item.editor || null,
          featured_image_url: item.featured_image_url || null,
          image_credit: item.image_credit || null,
          excerpt: item.excerpt || null,
          meta_title: item.meta_title || item.title.slice(0, 60),
          meta_description: item.meta_description || (item.excerpt || item.content || '').replace(/<[^>]*>/g, '').slice(0, 160),
          highlight: mapHighlight(item.destaque),
          status: item.status || 'draft',
          published_at: item.status === 'published' ? (item.published_at || new Date().toISOString()) : null,
          category_id: item.category_id || null,
          origin: 'api' as const,
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('news')
          .insert(newsRow)
          .select('id')
          .single();

        if (insertErr) {
          results.push({ title: item.title, status: 'error', error: insertErr.message });
          continue;
        }

        // Insert tags if provided
        if (item.tags && item.tags.length > 0 && inserted?.id) {
          for (const tagName of item.tags.slice(0, 12)) {
            // Find or create tag
            const { data: existingTag } = await supabase
              .from('tags')
              .select('id')
              .eq('name', tagName.trim())
              .maybeSingle();

            let tagId = existingTag?.id;
            if (!tagId) {
              const tagSlug = tagName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
              const { data: newTag } = await supabase
                .from('tags')
                .insert({ name: tagName.trim(), slug: tagSlug })
                .select('id')
                .single();
              tagId = newTag?.id;
            }

            if (tagId) {
              await supabase.from('news_tags').insert({ news_id: inserted.id, tag_id: tagId }).maybeSingle();
            }
          }
        }

        results.push({ title: item.title, status: 'success', id: inserted?.id });
      } catch (itemErr) {
        results.push({
          title: item.title || '(erro)',
          status: 'error',
          error: itemErr instanceof Error ? itemErr.message : 'Erro desconhecido',
        });
      }
    }

    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      duplicates: results.filter(r => r.status === 'duplicate').length,
      errors: results.filter(r => r.status === 'error').length,
      format,
    };

    console.log(`News import: ${summary.success}/${summary.total} success, ${summary.duplicates} dupes, ${summary.errors} errors (${format})`);

    return new Response(
      JSON.stringify({ summary, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('News import error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno no servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
