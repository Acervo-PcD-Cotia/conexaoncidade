-- Populate training_steps for all 10 modules with real content

-- MODULE 1: Começar Agora (getting_started)
INSERT INTO training_steps (module_id, title, content_html, video_url, action_url, action_label, sort_order)
VALUES 
  ('fb6ae71e-316d-4a37-bf30-d35f28e0b0d8', 'Bem-vindo ao Portal Conexão', 
   '<h2>Seu primeiro acesso</h2><p>Bem-vindo ao Portal Conexão! Neste tutorial, você vai conhecer as principais funcionalidades da plataforma.</p><h3>O que você vai aprender:</h3><ul><li>Navegar pelo painel administrativo</li><li>Entender o menu principal</li><li>Configurar seu perfil</li></ul>', 
   NULL, '/admin', 'Acessar Dashboard', 1),
  
  ('fb6ae71e-316d-4a37-bf30-d35f28e0b0d8', 'Conhecendo o Dashboard', 
   '<h2>Seu centro de controle</h2><p>O Dashboard é sua página inicial e mostra um resumo de toda a atividade do portal.</p><h3>Elementos principais:</h3><ul><li><strong>Cards de métricas</strong>: visualize notícias publicadas, visualizações e engajamento</li><li><strong>Ações rápidas</strong>: acesse as funções mais usadas</li><li><strong>Atividade recente</strong>: acompanhe as últimas atualizações</li></ul>', 
   NULL, '/admin', 'Ver Dashboard', 2),
  
  ('fb6ae71e-316d-4a37-bf30-d35f28e0b0d8', 'Criando sua primeira notícia', 
   '<h2>Publique em minutos</h2><p>Criar uma notícia no Portal Conexão é simples e intuitivo.</p><h3>Passo a passo:</h3><ol><li>Clique em "Nova Notícia" no Dashboard</li><li>Adicione título, conteúdo e imagem de capa</li><li>Configure categoria e tags</li><li>Publique ou agende</li></ol><h3>Dica:</h3><p>Use a IA para sugestões de título e SEO!</p>', 
   NULL, '/admin/news/new', 'Criar Notícia', 3),
  
  ('fb6ae71e-316d-4a37-bf30-d35f28e0b0d8', 'Configurando seu perfil', 
   '<h2>Personalize sua experiência</h2><p>Configure seu perfil para que outros usuários saibam quem é você.</p><h3>O que configurar:</h3><ul><li>Foto de perfil</li><li>Nome completo</li><li>Bio profissional</li><li>Redes sociais</li></ul>', 
   NULL, '/admin/settings', 'Ir para Configurações', 4);

-- MODULE 2: Como Publicar (publishing)
INSERT INTO training_steps (module_id, title, content_html, video_url, action_url, action_label, sort_order)
VALUES 
  ('dcb7f67c-0808-44cb-acb1-be074b4c1fc6', 'Anatomia de uma boa notícia', 
   '<h2>Estrutura ideal</h2><p>Uma notícia bem estruturada aumenta o engajamento e o tempo de leitura.</p><h3>Elementos essenciais:</h3><ul><li><strong>Título</strong>: claro, objetivo, até 60 caracteres</li><li><strong>Subtítulo</strong>: complementa o título com mais contexto</li><li><strong>Lide</strong>: responde O QUÊ, QUEM, QUANDO, ONDE no primeiro parágrafo</li><li><strong>Corpo</strong>: desenvolve a história em parágrafos curtos</li><li><strong>Imagem</strong>: sempre com crédito e alt text</li></ul>', 
   NULL, NULL, NULL, 1),
  
  ('dcb7f67c-0808-44cb-acb1-be074b4c1fc6', 'SEO para notícias', 
   '<h2>Apareça no Google</h2><p>Otimização para mecanismos de busca é essencial para alcance orgânico.</p><h3>Checklist SEO:</h3><ul><li>URL amigável (slug)</li><li>Meta título (até 60 caracteres)</li><li>Meta descrição (até 160 caracteres)</li><li>Palavra-chave no título e primeiro parágrafo</li><li>Imagens otimizadas com alt text</li><li>Links internos para outras notícias</li></ul>', 
   NULL, '/admin/news', 'Ver Notícias', 2),
  
  ('dcb7f67c-0808-44cb-acb1-be074b4c1fc6', 'Categorias e Tags', 
   '<h2>Organize seu conteúdo</h2><p>Categorias e tags ajudam os leitores a encontrar conteúdo relevante.</p><h3>Boas práticas:</h3><ul><li><strong>Categorias</strong>: use poucas e bem definidas (ex: Política, Economia, Esportes)</li><li><strong>Tags</strong>: palavras-chave específicas do assunto</li><li>Evite criar muitas categorias ou tags duplicadas</li></ul>', 
   NULL, '/admin/editorial/categories', 'Gerenciar Categorias', 3),
  
  ('dcb7f67c-0808-44cb-acb1-be074b4c1fc6', 'Imagens e mídia', 
   '<h2>Visual que engaja</h2><p>Imagens de qualidade aumentam significativamente o engajamento.</p><h3>Especificações recomendadas:</h3><ul><li><strong>Capa</strong>: 1200x630px (proporção 1.91:1)</li><li><strong>Card</strong>: 600x400px</li><li><strong>Formato</strong>: WebP ou JPEG otimizado</li><li><strong>Tamanho máximo</strong>: 500KB</li></ul><h3>Não esqueça:</h3><ul><li>Sempre inclua crédito da imagem</li><li>Alt text descritivo para acessibilidade</li></ul>', 
   NULL, NULL, NULL, 4);

-- MODULE 3: Como Monetizar (monetization)
INSERT INTO training_steps (module_id, title, content_html, video_url, action_url, action_label, sort_order)
VALUES 
  ('bdb1c48b-d6c2-4027-addc-6f855305222b', 'Estratégias de monetização', 
   '<h2>Gere receita com seu portal</h2><p>O Portal Conexão oferece diversas formas de monetização.</p><h3>Opções disponíveis:</h3><ul><li><strong>Banners publicitários</strong>: venda espaços em posições estratégicas</li><li><strong>Conteúdo patrocinado</strong>: artigos pagos por anunciantes</li><li><strong>Classificados</strong>: anúncios de terceiros</li><li><strong>Assinaturas</strong>: conteúdo exclusivo para assinantes</li></ul>', 
   NULL, '/admin/banners', 'Gerenciar Banners', 1),
  
  ('bdb1c48b-d6c2-4027-addc-6f855305222b', 'Gerenciando banners', 
   '<h2>Publicidade visual</h2><p>Banners são a forma mais comum de monetização em portais.</p><h3>Tipos de banner:</h3><ul><li><strong>Leaderboard</strong>: 728x90px (topo)</li><li><strong>Sidebar</strong>: 300x250px (lateral)</li><li><strong>Footer</strong>: 970x90px (rodapé)</li></ul><h3>Métricas importantes:</h3><ul><li>Impressões: quantas vezes foi exibido</li><li>Cliques: quantas vezes foi clicado</li><li>CTR: taxa de cliques</li></ul>', 
   NULL, '/admin/banners', 'Criar Banner', 2),
  
  ('bdb1c48b-d6c2-4027-addc-6f855305222b', 'Campanhas publicitárias', 
   '<h2>Gerencie anunciantes</h2><p>Campanhas permitem controlar período, orçamento e segmentação.</p><h3>Configurações:</h3><ul><li>Data início e fim</li><li>Orçamento total ou diário</li><li>Custo por clique (CPC) ou impressão (CPM)</li><li>Segmentação por categoria ou localização</li></ul>', 
   NULL, '/admin/super-banners/campaigns', 'Ver Campanhas', 3);

-- MODULE 4: Como Crescer (growth)
INSERT INTO training_steps (module_id, title, content_html, video_url, action_url, action_label, sort_order)
VALUES 
  ('2fd8ef66-9005-48e2-8266-8e8becb5a59d', 'Análise de métricas', 
   '<h2>Dados que importam</h2><p>Entenda o comportamento dos seus leitores para crescer.</p><h3>Métricas essenciais:</h3><ul><li><strong>Pageviews</strong>: total de páginas visualizadas</li><li><strong>Visitantes únicos</strong>: pessoas diferentes que acessaram</li><li><strong>Tempo na página</strong>: engajamento com o conteúdo</li><li><strong>Taxa de rejeição</strong>: visitantes que saíram sem interagir</li></ul>', 
   NULL, '/admin/analytics', 'Ver Analytics', 1),
  
  ('2fd8ef66-9005-48e2-8266-8e8becb5a59d', 'Redes sociais', 
   '<h2>Amplie seu alcance</h2><p>Distribua seu conteúdo nas redes sociais de forma estratégica.</p><h3>Plataformas integradas:</h3><ul><li>Facebook e Instagram (Meta)</li><li>X (Twitter)</li><li>LinkedIn</li><li>Telegram</li><li>WhatsApp</li></ul><h3>Dica:</h3><p>Use a Distribuição Social para agendar posts automaticamente!</p>', 
   NULL, '/admin/social-distribution', 'Distribuição Social', 2),
  
  ('2fd8ef66-9005-48e2-8266-8e8becb5a59d', 'Newsletter e notificações', 
   '<h2>Engaje sua audiência</h2><p>Mantenha seus leitores informados diretamente.</p><h3>Canais disponíveis:</h3><ul><li><strong>Push notifications</strong>: notificações no navegador</li><li><strong>Newsletter</strong>: emails periódicos</li><li><strong>Telegram</strong>: canal de notícias</li></ul>', 
   NULL, NULL, NULL, 3);

-- MODULE 5: Módulo Notícias (news_module)
INSERT INTO training_steps (module_id, title, content_html, video_url, action_url, action_label, sort_order)
VALUES 
  ('4a2c59af-de25-43bd-b6b0-0044372b35ec', 'Editor de notícias avançado', 
   '<h2>Todas as ferramentas que você precisa</h2><p>O editor de notícias do Portal Conexão é completo e intuitivo.</p><h3>Recursos:</h3><ul><li>Editor visual WYSIWYG</li><li>Inserção de imagens e vídeos</li><li>Citações e destaques</li><li>Links internos e externos</li><li>Preview em tempo real</li></ul>', 
   NULL, '/admin/news/new', 'Abrir Editor', 1),
  
  ('4a2c59af-de25-43bd-b6b0-0044372b35ec', 'Notícias com IA', 
   '<h2>Assistente inteligente</h2><p>Use inteligência artificial para acelerar sua produção.</p><h3>Funcionalidades:</h3><ul><li><strong>Sugestão de títulos</strong>: variações otimizadas para SEO</li><li><strong>Reescrita</strong>: adapte textos ao estilo do portal</li><li><strong>Resumo automático</strong>: gere excerpts</li><li><strong>Categorização</strong>: sugestão automática de categoria</li></ul>', 
   NULL, '/admin/news/ai', 'Notícias IA', 2),
  
  ('4a2c59af-de25-43bd-b6b0-0044372b35ec', 'Notas Rápidas', 
   '<h2>Breaking news em segundos</h2><p>Publique notícias curtas rapidamente.</p><h3>Quando usar:</h3><ul><li>Últimas notícias de urgência</li><li>Atualizações breves</li><li>Notas de falecimento</li><li>Resultados de jogos</li></ul>', 
   NULL, '/admin/news/quick-notes', 'Criar Nota Rápida', 3),
  
  ('4a2c59af-de25-43bd-b6b0-0044372b35ec', 'Web Stories', 
   '<h2>Formato visual imersivo</h2><p>Crie stories no estilo Instagram para seu portal.</p><h3>Características:</h3><ul><li>Formato vertical (9:16)</li><li>Imagens em tela cheia</li><li>Texto sobreposto</li><li>Navegação por toque</li></ul>', 
   NULL, '/admin/editorial/web-stories', 'Criar Web Story', 4);

-- MODULE 6: Módulo Eventos (events_module)
INSERT INTO training_steps (module_id, title, content_html, video_url, action_url, action_label, sort_order)
VALUES 
  ('9d7673a7-d73b-43e6-ba7b-7f44ebb05348', 'Criando eventos', 
   '<h2>Agenda da cidade</h2><p>Divulgue eventos culturais, esportivos e sociais.</p><h3>Campos do evento:</h3><ul><li>Título e descrição</li><li>Data/hora início e fim</li><li>Local (com mapa)</li><li>Imagem de capa</li><li>Link para ingressos</li></ul>', 
   NULL, '/admin/events', 'Gerenciar Eventos', 1),
  
  ('9d7673a7-d73b-43e6-ba7b-7f44ebb05348', 'Categorias de eventos', 
   '<h2>Organize sua agenda</h2><p>Categorize eventos para facilitar a busca.</p><h3>Sugestões:</h3><ul><li>Shows e Música</li><li>Teatro e Cinema</li><li>Esportes</li><li>Feiras e Exposições</li><li>Cursos e Workshops</li></ul>', 
   NULL, NULL, NULL, 2);

-- MODULE 7: Sindicação (syndication_module)
INSERT INTO training_steps (module_id, title, content_html, video_url, action_url, action_label, sort_order)
VALUES 
  ('ab87c036-3313-4765-8a7c-f2f145125f3d', 'O que é sindicação', 
   '<h2>Expanda seu conteúdo</h2><p>Sindicação permite compartilhar notícias entre portais parceiros.</p><h3>Benefícios:</h3><ul><li>Amplie o alcance das suas notícias</li><li>Receba conteúdo de outros portais</li><li>Monetize sua produção</li><li>Reduza custos de produção</li></ul>', 
   NULL, '/admin/syndication', 'Ver Sindicação', 1),
  
  ('ab87c036-3313-4765-8a7c-f2f145125f3d', 'Configurando parceiros', 
   '<h2>Rede de portais</h2><p>Conecte-se com outros portais da rede.</p><h3>Como funciona:</h3><ol><li>Solicite parceria</li><li>Defina regras de compartilhamento</li><li>Aprove ou recuse conteúdos</li><li>Acompanhe métricas</li></ol>', 
   NULL, '/admin/syndication', 'Gerenciar Parceiros', 2);

-- MODULE 8: Trilha Jornalista (journalist_track)
INSERT INTO training_steps (module_id, title, content_html, video_url, action_url, action_label, sort_order)
VALUES 
  ('03c08dee-6fb1-4b1f-9d06-e521e6141f05', 'Fluxo de trabalho do jornalista', 
   '<h2>Seu dia a dia no portal</h2><p>Entenda como funciona o fluxo de produção de notícias.</p><h3>Etapas:</h3><ol><li><strong>Pauta</strong>: receba ou sugira pautas</li><li><strong>Apuração</strong>: pesquise e entreviste</li><li><strong>Redação</strong>: escreva a matéria</li><li><strong>Revisão</strong>: envie para aprovação</li><li><strong>Publicação</strong>: editor aprova e publica</li></ol>', 
   NULL, '/admin/news', 'Ver Minhas Notícias', 1),
  
  ('03c08dee-6fb1-4b1f-9d06-e521e6141f05', 'Checagem de fatos', 
   '<h2>Combata fake news</h2><p>Verifique informações antes de publicar.</p><h3>Ferramentas:</h3><ul><li>Check Fake News integrado</li><li>Consulta a fontes oficiais</li><li>Verificação de imagens</li></ul>', 
   NULL, '/admin/anti-fake-news', 'Verificar Fato', 2),
  
  ('03c08dee-6fb1-4b1f-9d06-e521e6141f05', 'Créditos e fontes', 
   '<h2>Ética jornalística</h2><p>Sempre credite suas fontes corretamente.</p><h3>Boas práticas:</h3><ul><li>Cite a fonte original da informação</li><li>Credite fotógrafos e agências</li><li>Link para documentos originais quando possível</li><li>Evite usar conteúdo sem permissão</li></ul>', 
   NULL, NULL, NULL, 3);

-- MODULE 9: Trilha Editor (editor_track)
INSERT INTO training_steps (module_id, title, content_html, video_url, action_url, action_label, sort_order)
VALUES 
  ('38f77192-1690-4769-9f45-afe0e3d57552', 'Gestão da equipe', 
   '<h2>Lidere seu time</h2><p>Como editor, você gerencia jornalistas e aprova conteúdos.</p><h3>Suas responsabilidades:</h3><ul><li>Distribuir pautas</li><li>Revisar e aprovar notícias</li><li>Definir prioridades de publicação</li><li>Garantir qualidade editorial</li></ul>', 
   NULL, '/admin/users', 'Gerenciar Equipe', 1),
  
  ('38f77192-1690-4769-9f45-afe0e3d57552', 'Editor da Home', 
   '<h2>Curadoria da página inicial</h2><p>Organize os destaques da home do portal.</p><h3>Funcionalidades:</h3><ul><li>Arrastar e soltar notícias</li><li>Definir manchete principal</li><li>Organizar por editoria</li><li>Preview em tempo real</li></ul>', 
   NULL, '/admin/editorial/home-editor', 'Editar Home', 2),
  
  ('38f77192-1690-4769-9f45-afe0e3d57552', 'Moderação de conteúdo', 
   '<h2>Qualidade editorial</h2><p>Revise e aprove conteúdos antes da publicação.</p><h3>Checklist de revisão:</h3><ul><li>Título claro e atrativo</li><li>Texto sem erros ortográficos</li><li>Fontes verificadas</li><li>Imagens com crédito</li><li>SEO configurado</li></ul>', 
   NULL, '/admin/news', 'Revisar Notícias', 3);

-- MODULE 10: Trilha Comercial (commercial_track)
INSERT INTO training_steps (module_id, title, content_html, video_url, action_url, action_label, sort_order)
VALUES 
  ('cdb78782-9288-4309-900e-da2ea7bde1df', 'Vendendo publicidade', 
   '<h2>Monetize o portal</h2><p>Aprenda a vender espaços publicitários.</p><h3>Produtos disponíveis:</h3><ul><li>Banners (diversos formatos)</li><li>Conteúdo patrocinado</li><li>Classificados premium</li><li>Pacotes especiais</li></ul>', 
   NULL, '/admin/banners', 'Ver Inventário', 1),
  
  ('cdb78782-9288-4309-900e-da2ea7bde1df', 'Relatórios para anunciantes', 
   '<h2>Comprove resultados</h2><p>Gere relatórios profissionais para seus clientes.</p><h3>Métricas disponíveis:</h3><ul><li>Impressões por período</li><li>Cliques e CTR</li><li>Alcance por região</li><li>Comparativo com metas</li></ul>', 
   NULL, '/admin/super-banners/analytics', 'Ver Relatórios', 2),
  
  ('cdb78782-9288-4309-900e-da2ea7bde1df', 'Gestão de clientes', 
   '<h2>CRM de anunciantes</h2><p>Mantenha relacionamento com seus clientes.</p><h3>Funcionalidades:</h3><ul><li>Cadastro de anunciantes</li><li>Histórico de campanhas</li><li>Renovações e follow-up</li><li>Propostas comerciais</li></ul>', 
   NULL, '/admin/super-banners/campaigns', 'Ver Clientes', 3);