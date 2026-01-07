-- Insert example tags
INSERT INTO public.tags (name, slug) VALUES
  ('Transporte', 'transporte'),
  ('Investimento', 'investimento'),
  ('Economia Local', 'economia-local'),
  ('Esportes Regionais', 'esportes-regionais'),
  ('Cultura Local', 'cultura-local'),
  ('Segurança', 'seguranca'),
  ('Educação Pública', 'educacao-publica'),
  ('Tecnologia', 'tecnologia');

-- Get category IDs for news insertion
DO $$
DECLARE
  cat_economia uuid;
  cat_esportes uuid;
  cat_politica uuid;
  cat_saude uuid;
  cat_cultura uuid;
  cat_policia uuid;
  cat_educacao uuid;
  cat_tecnologia uuid;
  tag_transporte uuid;
  tag_investimento uuid;
  tag_economia_local uuid;
  tag_esportes_regionais uuid;
  tag_cultura_local uuid;
  tag_seguranca uuid;
  tag_educacao_publica uuid;
  tag_tecnologia uuid;
  news_1 uuid;
  news_2 uuid;
  news_3 uuid;
  news_4 uuid;
  news_5 uuid;
  news_6 uuid;
  news_7 uuid;
  news_8 uuid;
  news_9 uuid;
  news_10 uuid;
  news_11 uuid;
  news_12 uuid;
  story_1 uuid;
  story_2 uuid;
  story_3 uuid;
  story_4 uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_economia FROM public.categories WHERE slug = 'economia';
  SELECT id INTO cat_esportes FROM public.categories WHERE slug = 'esportes';
  SELECT id INTO cat_politica FROM public.categories WHERE slug = 'politica';
  SELECT id INTO cat_saude FROM public.categories WHERE slug = 'saude';
  SELECT id INTO cat_cultura FROM public.categories WHERE slug = 'cultura';
  SELECT id INTO cat_policia FROM public.categories WHERE slug = 'policia';
  SELECT id INTO cat_educacao FROM public.categories WHERE slug = 'educacao';
  SELECT id INTO cat_tecnologia FROM public.categories WHERE slug = 'tecnologia';

  -- Get tag IDs
  SELECT id INTO tag_transporte FROM public.tags WHERE slug = 'transporte';
  SELECT id INTO tag_investimento FROM public.tags WHERE slug = 'investimento';
  SELECT id INTO tag_economia_local FROM public.tags WHERE slug = 'economia-local';
  SELECT id INTO tag_esportes_regionais FROM public.tags WHERE slug = 'esportes-regionais';
  SELECT id INTO tag_cultura_local FROM public.tags WHERE slug = 'cultura-local';
  SELECT id INTO tag_seguranca FROM public.tags WHERE slug = 'seguranca';
  SELECT id INTO tag_educacao_publica FROM public.tags WHERE slug = 'educacao-publica';
  SELECT id INTO tag_tecnologia FROM public.tags WHERE slug = 'tecnologia';

  -- Insert news articles
  INSERT INTO public.news (title, subtitle, hat, slug, excerpt, content, featured_image_url, category_id, status, highlight, published_at)
  VALUES (
    'Cidade recebe investimento histórico para modernização do transporte público',
    'Projeto prevê renovação completa da frota de ônibus e expansão das ciclovias',
    'Desenvolvimento Urbano',
    'cidade-recebe-investimento-historico-transporte-publico',
    'Prefeitura anuncia pacote de R$ 500 milhões para transformar a mobilidade urbana nos próximos 5 anos.',
    '<p>A prefeitura anunciou nesta segunda-feira o maior pacote de investimentos em transporte público da história da cidade. Com um orçamento de R$ 500 milhões, o projeto prevê a renovação completa da frota de ônibus, a expansão das ciclovias e a implementação de um sistema de bilhetagem eletrônica integrado.</p><p>O secretário de Mobilidade Urbana destacou que as obras começarão no próximo trimestre e serão concluídas em até cinco anos. "Esta é uma transformação sem precedentes na forma como os cidadãos se locomovem", afirmou.</p><p>Entre as principais melhorias estão a aquisição de 200 novos ônibus com ar-condicionado e acessibilidade total, a construção de 50 km de novas ciclovias e a instalação de 1.000 pontos de bicicletas compartilhadas.</p>',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200',
    cat_economia, 'published', 'home', now() - interval '2 hours'
  ) RETURNING id INTO news_1;

  INSERT INTO public.news (title, subtitle, hat, slug, excerpt, content, featured_image_url, category_id, status, highlight, published_at)
  VALUES (
    'Time local conquista vitória histórica no campeonato estadual',
    'Equipe vence rival por 3 a 1 e garante vaga nas semifinais',
    'Futebol',
    'time-local-conquista-vitoria-historica-campeonato-estadual',
    'Com gols de João Silva, Pedro Santos e Lucas Oliveira, equipe avança para a próxima fase.',
    '<p>Em uma noite inesquecível para a torcida local, o time da casa conquistou uma vitória histórica sobre o tradicional rival por 3 a 1, garantindo sua vaga nas semifinais do Campeonato Estadual.</p><p>O atacante João Silva abriu o placar aos 15 minutos do primeiro tempo com um belo chute de fora da área. Pedro Santos ampliou aos 32 minutos após jogada individual pela esquerda. O rival descontou no início do segundo tempo, mas Lucas Oliveira fechou o placar aos 78 minutos.</p><p>O técnico elogiou o empenho dos jogadores: "A equipe mostrou maturidade e determinação. Estamos prontos para as semifinais".</p>',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200',
    cat_esportes, 'published', 'featured', now() - interval '4 hours'
  ) RETURNING id INTO news_2;

  INSERT INTO public.news (title, subtitle, hat, slug, excerpt, content, featured_image_url, category_id, status, highlight, published_at)
  VALUES (
    'Câmara aprova projeto de lei para modernização urbana',
    'Texto prevê incentivos fiscais para construções sustentáveis',
    'Legislação',
    'camara-aprova-projeto-lei-modernizacao-urbana',
    'Vereadores aprovaram por unanimidade medidas que visam transformar o planejamento da cidade.',
    '<p>A Câmara Municipal aprovou por unanimidade o projeto de lei que estabelece novas diretrizes para a modernização urbana. O texto prevê incentivos fiscais para construções sustentáveis, revisão do plano diretor e criação de zonas de desenvolvimento prioritário.</p><p>Entre as principais medidas estão a redução de IPTU em até 30% para edifícios com certificação ambiental, a obrigatoriedade de áreas verdes em novos empreendimentos e a criação de corredores de mobilidade sustentável.</p><p>O presidente da Câmara destacou a importância da votação: "Este é um marco para o futuro da nossa cidade. Estamos criando as bases para um desenvolvimento mais equilibrado e sustentável".</p>',
    'https://images.unsplash.com/photo-1577415124269-fc1140a69e91?w=1200',
    cat_politica, 'published', 'home', now() - interval '6 hours'
  ) RETURNING id INTO news_3;

  INSERT INTO public.news (title, subtitle, hat, slug, excerpt, content, featured_image_url, category_id, status, highlight, published_at)
  VALUES (
    'Hospital público inaugura nova ala de emergência com equipamentos modernos',
    'Investimento de R$ 80 milhões amplia capacidade de atendimento em 40%',
    'Saúde Pública',
    'hospital-publico-inaugura-nova-ala-emergencia',
    'Nova estrutura conta com 50 leitos, centro cirúrgico e UTI com tecnologia de ponta.',
    '<p>O Hospital Municipal inaugurou nesta terça-feira sua nova ala de emergência, resultado de um investimento de R$ 80 milhões em infraestrutura e equipamentos de última geração. A nova estrutura amplia a capacidade de atendimento do hospital em 40%.</p><p>A ala conta com 50 novos leitos, dois centros cirúrgicos, uma UTI com 20 vagas e equipamentos de diagnóstico por imagem de última geração. "Estamos preparados para oferecer um atendimento de excelência à população", afirmou o diretor do hospital.</p><p>A inauguração contou com a presença do governador, que anunciou novos investimentos para a rede pública de saúde.</p>',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200',
    cat_saude, 'published', 'none', now() - interval '8 hours'
  ) RETURNING id INTO news_4;

  INSERT INTO public.news (title, subtitle, hat, slug, excerpt, content, featured_image_url, category_id, status, highlight, published_at)
  VALUES (
    'Festival cultural reúne mais de 50 mil pessoas no centro da cidade',
    'Evento contou com shows, exposições e gastronomia de diversas regiões',
    'Entretenimento',
    'festival-cultural-reune-50-mil-pessoas-centro-cidade',
    'Três dias de programação celebraram a diversidade cultural com atrações nacionais e internacionais.',
    '<p>O Festival Cultural da Cidade encerrou sua 15ª edição com um público recorde de mais de 50 mil pessoas ao longo dos três dias de evento. A programação incluiu shows de música, exposições de arte, apresentações de dança e uma praça gastronômica com culinária de todas as regiões do país.</p><p>O destaque ficou por conta do show de encerramento, que reuniu artistas locais e nacionais em uma celebração da música brasileira. "Foi uma edição histórica, que mostrou todo o potencial cultural da nossa cidade", disse a secretária de Cultura.</p><p>Para o próximo ano, a organização já planeja expandir o evento para cinco dias de programação.</p>',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200',
    cat_cultura, 'published', 'none', now() - interval '10 hours'
  ) RETURNING id INTO news_5;

  INSERT INTO public.news (title, subtitle, hat, slug, excerpt, content, featured_image_url, category_id, status, highlight, published_at)
  VALUES (
    'Operação policial desmantela quadrilha que atuava em cinco cidades',
    'Grupo é suspeito de praticar mais de 200 crimes nos últimos dois anos',
    'Segurança Pública',
    'operacao-policial-desmantela-quadrilha-cinco-cidades',
    'Ação conjunta das polícias Civil e Militar resultou na prisão de 15 pessoas e apreensão de armas.',
    '<p>Uma operação conjunta das polícias Civil e Militar desmantelou na madrugada desta quarta-feira uma quadrilha especializada em roubos que atuava em cinco cidades da região metropolitana. A ação resultou na prisão de 15 pessoas e na apreensão de armas, veículos e objetos roubados.</p><p>Segundo a polícia, o grupo é suspeito de praticar mais de 200 crimes nos últimos dois anos, incluindo roubos a residências, comércios e veículos. O líder da organização, que estava foragido há seis meses, foi capturado em uma casa no interior.</p><p>O delegado responsável pela investigação afirmou que a operação é resultado de oito meses de trabalho de inteligência policial.</p>',
    'https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=1200',
    cat_policia, 'published', 'urgent', now() - interval '1 hour'
  ) RETURNING id INTO news_6;

  INSERT INTO public.news (title, subtitle, hat, slug, excerpt, content, featured_image_url, category_id, status, highlight, published_at)
  VALUES (
    'Escolas municipais recebem novos laboratórios de informática',
    'Investimento de R$ 15 milhões beneficia 50 escolas e 30 mil alunos',
    'Tecnologia na Educação',
    'escolas-municipais-recebem-novos-laboratorios-informatica',
    'Programa inclui computadores novos, internet de alta velocidade e capacitação de professores.',
    '<p>A Secretaria Municipal de Educação inaugurou nesta quinta-feira os novos laboratórios de informática em 50 escolas da rede pública. O investimento de R$ 15 milhões beneficia cerca de 30 mil alunos do ensino fundamental e médio.</p><p>Cada laboratório conta com 25 computadores novos, internet de alta velocidade e mobiliário adequado. Além da infraestrutura, o programa inclui a capacitação de 200 professores para o uso de tecnologias educacionais.</p><p>"Queremos preparar nossos alunos para o mundo digital", afirmou a secretária de Educação. "A tecnologia é uma ferramenta fundamental para o aprendizado no século 21".</p>',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200',
    cat_educacao, 'published', 'none', now() - interval '12 hours'
  ) RETURNING id INTO news_7;

  INSERT INTO public.news (title, subtitle, hat, slug, excerpt, content, featured_image_url, category_id, status, highlight, published_at)
  VALUES (
    'Startup local recebe investimento de R$ 10 milhões',
    'Empresa de tecnologia vai expandir operações para toda América Latina',
    'Inovação',
    'startup-local-recebe-investimento-10-milhoes',
    'Rodada de investimentos foi liderada por fundo internacional especializado em tecnologia.',
    '<p>A startup de tecnologia TechLocal anunciou nesta sexta-feira a conclusão de uma rodada de investimentos de R$ 10 milhões, liderada por um fundo internacional especializado em empresas de tecnologia. Os recursos serão utilizados para expandir as operações da empresa para toda a América Latina.</p><p>Fundada há três anos, a TechLocal desenvolveu uma plataforma de gestão empresarial que já atende mais de 500 empresas na região. Com o novo investimento, a meta é chegar a 5.000 clientes até o final do próximo ano.</p><p>O CEO da empresa destacou o potencial do mercado latino-americano: "Estamos prontos para levar nossa solução para empresas de todo o continente".</p>',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200',
    cat_tecnologia, 'published', 'none', now() - interval '14 hours'
  ) RETURNING id INTO news_8;

  INSERT INTO public.news (title, subtitle, hat, slug, excerpt, content, featured_image_url, category_id, status, highlight, published_at)
  VALUES (
    'Nova lei ambiental entra em vigor e empresas precisam se adaptar',
    'Legislação prevê multas pesadas para quem não cumprir as normas',
    'Meio Ambiente',
    'nova-lei-ambiental-entra-vigor-empresas-adaptar',
    'Prazo para adequação é de 180 dias; especialistas recomendam ação imediata.',
    '<p>Entrou em vigor nesta segunda-feira a nova legislação ambiental que estabelece regras mais rígidas para o descarte de resíduos industriais e a emissão de poluentes. As empresas têm 180 dias para se adequar às novas normas, sob pena de multas que podem chegar a R$ 50 milhões.</p><p>A lei exige que todas as empresas com potencial poluidor apresentem um plano de gestão ambiental e implementem sistemas de monitoramento em tempo real. Especialistas recomendam que as empresas iniciem imediatamente o processo de adequação.</p><p>"Esta é uma das legislações ambientais mais avançadas do país", afirmou o secretário de Meio Ambiente. "Estamos comprometidos com o desenvolvimento sustentável".</p>',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200',
    cat_politica, 'published', 'none', now() - interval '16 hours'
  ) RETURNING id INTO news_9;

  INSERT INTO public.news (title, subtitle, hat, slug, excerpt, content, featured_image_url, category_id, status, highlight, published_at)
  VALUES (
    'Comércio projeta crescimento de 15% para o próximo trimestre',
    'Otimismo é impulsionado por novos investimentos e abertura de lojas',
    'Mercado',
    'comercio-projeta-crescimento-15-proximo-trimestre',
    'Associação comercial prevê geração de 5 mil novos empregos na região.',
    '<p>A Associação Comercial divulgou nesta terça-feira uma pesquisa que aponta expectativa de crescimento de 15% nas vendas do comércio local para o próximo trimestre. O otimismo é impulsionado pela abertura de novas lojas, investimentos em infraestrutura e melhora nos indicadores econômicos.</p><p>Segundo a pesquisa, 78% dos comerciantes pretendem ampliar seus estoques e 45% planejam contratar novos funcionários. A projeção é de que sejam gerados 5 mil novos empregos diretos no setor.</p><p>"O cenário é muito positivo", afirmou o presidente da associação. "Os consumidores estão mais confiantes e o crédito está mais acessível".</p>',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200',
    cat_economia, 'published', 'none', now() - interval '18 hours'
  ) RETURNING id INTO news_10;

  INSERT INTO public.news (title, subtitle, hat, slug, excerpt, content, featured_image_url, category_id, status, highlight, published_at)
  VALUES (
    'Maratona da cidade abre inscrições com meta de 20 mil participantes',
    'Evento esportivo acontecerá em outubro e terá percursos de 5km, 10km, 21km e 42km',
    'Corrida de Rua',
    'maratona-cidade-abre-inscricoes-meta-20-mil-participantes',
    'Prova terá largada no centro histórico e passará pelos principais pontos turísticos.',
    '<p>A organização da Maratona da Cidade abriu nesta quarta-feira as inscrições para a edição deste ano, com meta de reunir 20 mil participantes. O evento, que acontecerá em outubro, oferece percursos de 5km, 10km, 21km (meia maratona) e 42km (maratona completa).</p><p>A largada será no centro histórico e o percurso passará pelos principais pontos turísticos da cidade. A prova de 42km terá premiação em dinheiro para os primeiros colocados, com R$ 50 mil para o campeão.</p><p>As inscrições podem ser feitas pelo site oficial do evento até o dia 30 de setembro ou até o preenchimento das vagas.</p>',
    'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200',
    cat_esportes, 'published', 'none', now() - interval '20 hours'
  ) RETURNING id INTO news_11;

  INSERT INTO public.news (title, subtitle, hat, slug, excerpt, content, featured_image_url, category_id, status, highlight, published_at)
  VALUES (
    'Campanha de vacinação atinge 95% de cobertura na região',
    'Meta estabelecida pelo Ministério da Saúde foi superada em todas as faixas etárias',
    'Imunização',
    'campanha-vacinacao-atinge-95-cobertura-regiao',
    'Secretaria de Saúde destaca importância da mobilização da população e dos profissionais.',
    '<p>A campanha de vacinação contra a gripe atingiu 95% de cobertura na região, superando a meta de 90% estabelecida pelo Ministério da Saúde. Os números foram divulgados pela Secretaria Municipal de Saúde, que destacou a importância da mobilização da população e dos profissionais de saúde.</p><p>A cobertura foi superior à meta em todas as faixas etárias prioritárias: idosos (98%), crianças (94%), gestantes (93%) e profissionais de saúde (97%). Foram aplicadas mais de 150 mil doses em três semanas de campanha.</p><p>"Este resultado mostra a conscientização da população sobre a importância da vacinação", afirmou a secretária de Saúde.</p>',
    'https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200',
    cat_saude, 'published', 'none', now() - interval '22 hours'
  ) RETURNING id INTO news_12;

  -- Insert news_tags relationships
  INSERT INTO public.news_tags (news_id, tag_id) VALUES
    (news_1, tag_transporte),
    (news_1, tag_investimento),
    (news_2, tag_esportes_regionais),
    (news_3, tag_investimento),
    (news_4, tag_investimento),
    (news_5, tag_cultura_local),
    (news_6, tag_seguranca),
    (news_7, tag_educacao_publica),
    (news_7, tag_tecnologia),
    (news_8, tag_tecnologia),
    (news_8, tag_investimento),
    (news_9, tag_economia_local),
    (news_10, tag_economia_local),
    (news_11, tag_esportes_regionais),
    (news_12, tag_economia_local);

  -- Insert Web Stories
  INSERT INTO public.web_stories (title, slug, cover_image_url, status, published_at)
  VALUES (
    'Novo parque inaugurado na zona sul',
    'novo-parque-inaugurado-zona-sul',
    'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800',
    'published', now() - interval '1 day'
  ) RETURNING id INTO story_1;

  INSERT INTO public.web_stories (title, slug, cover_image_url, status, published_at)
  VALUES (
    'Festival de música agita o fim de semana',
    'festival-musica-agita-fim-de-semana',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    'published', now() - interval '2 days'
  ) RETURNING id INTO story_2;

  INSERT INTO public.web_stories (title, slug, cover_image_url, status, published_at)
  VALUES (
    'Feira gastronômica reúne chefs renomados',
    'feira-gastronomica-reune-chefs-renomados',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    'published', now() - interval '3 days'
  ) RETURNING id INTO story_3;

  INSERT INTO public.web_stories (title, slug, cover_image_url, status, published_at)
  VALUES (
    'Maratona da cidade bate recorde',
    'maratona-cidade-bate-recorde',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
    'published', now() - interval '4 days'
  ) RETURNING id INTO story_4;

  -- Insert Web Story Slides
  -- Story 1 slides
  INSERT INTO public.web_story_slides (story_id, sort_order, background_image_url, content_html, duration_seconds, animation_type)
  VALUES
    (story_1, 0, 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=1080', '<h2 style="color: white; font-size: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">Novo Parque Inaugurado!</h2><p style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Zona Sul ganha área verde de 50 mil m²</p>', 5, 'fade'),
    (story_1, 1, 'https://images.unsplash.com/photo-1516383607781-913a19294fd1?w=1080', '<h2 style="color: white; font-size: 1.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">Playground para crianças</h2><p style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Área dedicada com brinquedos modernos e seguros</p>', 5, 'slide'),
    (story_1, 2, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080', '<h2 style="color: white; font-size: 1.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">Pista de caminhada</h2><p style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">3km de percurso arborizado para exercícios</p>', 5, 'slide'),
    (story_1, 3, 'https://images.unsplash.com/photo-1587381420270-0e6c93e22819?w=1080', '<h2 style="color: white; font-size: 1.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">Visite o novo parque!</h2><p style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Aberto todos os dias das 6h às 22h</p>', 5, 'fade');

  -- Story 2 slides
  INSERT INTO public.web_story_slides (story_id, sort_order, background_image_url, content_html, duration_seconds, animation_type, cta_text, cta_url)
  VALUES
    (story_2, 0, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1080', '<h2 style="color: white; font-size: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">Festival de Música</h2><p style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">O maior evento musical do ano!</p>', 5, 'fade', NULL, NULL),
    (story_2, 1, 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1080', '<h2 style="color: white; font-size: 1.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">Mais de 30 atrações</h2><p style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Artistas nacionais e internacionais</p>', 5, 'slide', NULL, NULL),
    (story_2, 2, 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1080', '<h2 style="color: white; font-size: 1.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">Garanta seu ingresso!</h2><p style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Últimas unidades disponíveis</p>', 5, 'fade', 'Comprar Ingresso', 'https://example.com');

  -- Story 3 slides
  INSERT INTO public.web_story_slides (story_id, sort_order, background_image_url, content_html, duration_seconds, animation_type)
  VALUES
    (story_3, 0, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1080', '<h2 style="color: white; font-size: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">Feira Gastronômica</h2><p style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Sabores de todo o Brasil</p>', 5, 'fade'),
    (story_3, 1, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1080', '<h2 style="color: white; font-size: 1.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">Chefs renomados</h2><p style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">20 restaurantes participando</p>', 5, 'slide'),
    (story_3, 2, 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1080', '<h2 style="color: white; font-size: 1.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">Pratos exclusivos</h2><p style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Criações especiais para o evento</p>', 5, 'slide'),
    (story_3, 3, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080', '<h2 style="color: white; font-size: 1.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">Não perca!</h2><p style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Entrada gratuita neste fim de semana</p>', 5, 'fade');

  -- Story 4 slides
  INSERT INTO public.web_story_slides (story_id, sort_order, background_image_url, content_html, duration_seconds, animation_type, cta_text, cta_url)
  VALUES
    (story_4, 0, 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1080', '<h2 style="color: white; font-size: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">Maratona da Cidade</h2><p style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Recorde de participantes!</p>', 5, 'fade', NULL, NULL),
    (story_4, 1, 'https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=1080', '<h2 style="color: white; font-size: 1.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">20 mil corredores</h2><p style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">De todas as partes do país</p>', 5, 'slide', NULL, NULL),
    (story_4, 2, 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1080', '<h2 style="color: white; font-size: 1.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">Próxima edição em outubro</h2><p style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Inscrições abertas!</p>', 5, 'fade', 'Inscrever-se', 'https://example.com');

END $$;