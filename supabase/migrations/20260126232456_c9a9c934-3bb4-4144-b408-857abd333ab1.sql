-- Add checklist column to academy_lessons if not exists
ALTER TABLE academy_lessons 
ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]';

-- Seed initial courses only if no courses exist
DO $$
DECLARE
  course_count INTEGER;
  webradio_course_id UUID;
  webtv_course_id UUID;
BEGIN
  SELECT COUNT(*) INTO course_count FROM academy_courses;
  
  IF course_count = 0 THEN
    -- Create WebRádio course
    INSERT INTO academy_courses (
      id, title, slug, description, visibility, is_published, duration_minutes, sort_order
    ) VALUES (
      gen_random_uuid(),
      'WebRádio: do zero ao ar',
      'webradio-do-zero-ao-ar',
      'Aprenda a configurar sua WebRádio no Conexão e colocar no ar com qualidade.',
      'all',
      true,
      45,
      1
    ) RETURNING id INTO webradio_course_id;

    -- WebRádio Lessons - M1: Preparação
    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webradio_course_id, 'O que é WebRádio no Conexão', 'Entenda o conceito e as possibilidades', 
     '<h2>Bem-vindo ao mundo da WebRádio!</h2>
      <p>Uma <strong>WebRádio</strong> é uma estação de rádio que transmite conteúdo de áudio pela internet. Diferente do rádio tradicional (AM/FM), ela não depende de frequências de ondas eletromagnéticas, mas sim de servidores e protocolos de streaming.</p>
      <h3>Vantagens da WebRádio</h3>
      <ul>
        <li><strong>Alcance global</strong>: qualquer pessoa com internet pode ouvir</li>
        <li><strong>Baixo custo inicial</strong>: não precisa de antenas ou licenças caras</li>
        <li><strong>Interatividade</strong>: chat, pedidos de música, enquetes em tempo real</li>
        <li><strong>Métricas precisas</strong>: saiba quantos ouvintes tem a cada momento</li>
      </ul>
      <h3>No Conexão</h3>
      <p>O Conexão oferece toda a infraestrutura para você criar e gerenciar sua WebRádio, incluindo player, programação, automação e distribuição para assistentes de voz como Alexa.</p>', 
     1, true, 5);

    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webradio_course_id, 'Materiais necessários', 'Lista completa do que você precisa',
     '<h2>O que você vai precisar</h2>
      <p>Montar uma WebRádio é mais simples do que parece. Aqui está a lista essencial:</p>
      <h3>Equipamentos Básicos</h3>
      <ul>
        <li><strong>Computador</strong>: Windows, Mac ou Linux (2GB RAM mínimo)</li>
        <li><strong>Microfone</strong>: USB (iniciante) ou XLR + interface de áudio (profissional)</li>
        <li><strong>Fone de ouvido</strong>: para monitorar o áudio sem microfonia</li>
        <li><strong>Internet estável</strong>: mínimo 2 Mbps de upload</li>
      </ul>
      <h3>Softwares</h3>
      <ul>
        <li><strong>Encoder</strong>: BUTT (gratuito), RadioBOSS, ou OBS Studio</li>
        <li><strong>Player de músicas</strong>: para programação musical</li>
        <li><strong>Navegador</strong>: para acessar o painel do Conexão</li>
      </ul>
      <h3>Conteúdo</h3>
      <ul>
        <li>Vinhetas e spots</li>
        <li>Músicas licenciadas ou royalty-free</li>
        <li>Identidade visual (logo, cores)</li>
      </ul>',
     2, true, 5);

    INSERT INTO academy_lessons (course_id, title, description, checklist, sort_order, is_published, duration_minutes) VALUES
    (webradio_course_id, 'Checklist mínimo', 'Verifique antes de começar',
     '[
       {"item": "Definir formato da rádio (musical, talk, misto)", "order": 1},
       {"item": "Escolher nome e identidade visual", "order": 2},
       {"item": "Providenciar computador com internet estável", "order": 3},
       {"item": "Adquirir microfone e fone de ouvido", "order": 4},
       {"item": "Baixar e configurar software encoder (BUTT, OBS)", "order": 5},
       {"item": "Separar músicas e vinhetas iniciais", "order": 6},
       {"item": "Criar conta no Conexão e acessar painel", "order": 7},
       {"item": "Testar conexão de internet (upload mínimo 2Mbps)", "order": 8}
     ]'::jsonb,
     3, true, 3);

    -- WebRádio Lessons - M2: Implantação
    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webradio_course_id, 'Criando a rádio no painel', 'Passo a passo no dashboard',
     '<h2>Configurando sua WebRádio no Conexão</h2>
      <p>Siga este passo a passo para criar sua rádio:</p>
      <h3>1. Acessar o módulo de Streaming</h3>
      <p>No menu lateral, vá em <strong>Streaming → Rádio Web</strong></p>
      <h3>2. Criar nova rádio</h3>
      <p>Clique em <strong>"Nova Rádio"</strong> e preencha:</p>
      <ul>
        <li><strong>Nome</strong>: nome de exibição da rádio</li>
        <li><strong>Slug</strong>: URL amigável (ex: minha-radio)</li>
        <li><strong>Descrição</strong>: breve texto sobre a rádio</li>
        <li><strong>Logo</strong>: imagem quadrada (mínimo 300x300px)</li>
      </ul>
      <h3>3. Configurar servidor de streaming</h3>
      <p>O Conexão vai gerar automaticamente:</p>
      <ul>
        <li>URL do servidor (host)</li>
        <li>Porta de conexão</li>
        <li>Senha de transmissão</li>
        <li>Mount point</li>
      </ul>
      <p>Copie essas informações para usar no seu encoder.</p>',
     4, true, 8);

    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webradio_course_id, 'Configurando streaming e player', 'RTMP, Icecast, player embed',
     '<h2>Conectando seu encoder ao servidor</h2>
      <h3>Usando o BUTT (Broadcast Using This Tool)</h3>
      <ol>
        <li>Baixe o BUTT em <code>butt.sourceforge.io</code></li>
        <li>Vá em <strong>Settings → Main → Server</strong></li>
        <li>Preencha: 
          <ul>
            <li>Type: Icecast</li>
            <li>Address: (URL do servidor Conexão)</li>
            <li>Port: (porta fornecida)</li>
            <li>Password: (senha fornecida)</li>
            <li>Mountpoint: (mount fornecido)</li>
          </ul>
        </li>
        <li>Em <strong>Audio</strong>, selecione seu microfone</li>
        <li>Clique em <strong>Play</strong> para iniciar a transmissão</li>
      </ol>
      <h3>Embed do Player</h3>
      <p>Para colocar o player no seu site, copie o código embed disponível no painel do Conexão e cole no HTML do seu site.</p>',
     5, true, 8);

    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webradio_course_id, 'Testes e validação', 'Como testar antes de publicar',
     '<h2>Validando sua WebRádio</h2>
      <p>Antes de publicar, faça estes testes:</p>
      <h3>1. Teste de conexão</h3>
      <ul>
        <li>Verifique se o encoder conecta ao servidor sem erros</li>
        <li>Confirme que o status mostra "Conectado" ou "Streaming"</li>
      </ul>
      <h3>2. Teste de áudio</h3>
      <ul>
        <li>Ouça a rádio em outro dispositivo</li>
        <li>Verifique volume, qualidade e ausência de ruídos</li>
        <li>Teste transições entre músicas e locuções</li>
      </ul>
      <h3>3. Teste de player</h3>
      <ul>
        <li>Acesse o player pelo link público</li>
        <li>Teste em diferentes navegadores (Chrome, Firefox, Safari)</li>
        <li>Teste em dispositivo móvel</li>
      </ul>
      <h3>4. Teste de estabilidade</h3>
      <ul>
        <li>Deixe transmitindo por pelo menos 1 hora</li>
        <li>Monitore quedas ou interrupções</li>
      </ul>',
     6, true, 5);

    -- WebRádio Lessons - M3: Publicação
    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webradio_course_id, 'Publicando no portal', 'Ativação e destaque',
     '<h2>Publicando sua WebRádio</h2>
      <h3>Ativação no Portal</h3>
      <p>Para que sua rádio apareça no portal público:</p>
      <ol>
        <li>Acesse <strong>Streaming → Rádio Web → [sua rádio]</strong></li>
        <li>Marque a opção <strong>"Publicar no portal"</strong></li>
        <li>Escolha a posição de destaque (se disponível)</li>
        <li>Salve as alterações</li>
      </ol>
      <h3>Otimização para SEO</h3>
      <ul>
        <li>Use um nome descritivo e único</li>
        <li>Preencha a descrição com palavras-chave relevantes</li>
        <li>Adicione tags relacionadas ao seu conteúdo</li>
      </ul>',
     7, true, 5);

    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webradio_course_id, 'Alexa e apps: visão geral', 'Próximos passos',
     '<h2>Distribuição em Assistentes de Voz e Apps</h2>
      <h3>Amazon Alexa</h3>
      <p>O Conexão pode integrar sua rádio com a Alexa, permitindo que ouvintes digam:</p>
      <p><em>"Alexa, abrir [nome da sua rádio]"</em></p>
      <p>Para isso, é necessário:</p>
      <ul>
        <li>Rádio ativa e estável por pelo menos 7 dias</li>
        <li>Conteúdo 24/7 (ou automação configurada)</li>
        <li>Solicitação ao suporte do Conexão</li>
      </ul>
      <h3>Aplicativos Mobile</h3>
      <p>Sua rádio também pode aparecer em apps de agregadores de rádio. O Conexão fornece os metadados necessários para cadastro.</p>
      <h3>Próximos passos</h3>
      <ul>
        <li>Mantenha programação consistente</li>
        <li>Crie grade de programas</li>
        <li>Configure automação para horários sem locutor</li>
      </ul>',
     8, true, 5);

    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webradio_course_id, 'Boas práticas e padrões', 'Qualidade de áudio, horários',
     '<h2>Boas Práticas para sua WebRádio</h2>
      <h3>Qualidade de Áudio</h3>
      <ul>
        <li><strong>Bitrate</strong>: mínimo 128kbps para música, 64kbps para talk</li>
        <li><strong>Formato</strong>: MP3 ou AAC</li>
        <li><strong>Volume</strong>: normalize todos os áudios para mesmo nível</li>
      </ul>
      <h3>Programação</h3>
      <ul>
        <li>Crie uma grade semanal de programas</li>
        <li>Respeite horários anunciados</li>
        <li>Use vinhetas para identificar mudanças de programa</li>
      </ul>
      <h3>Interação</h3>
      <ul>
        <li>Responda mensagens dos ouvintes</li>
        <li>Faça enquetes e promoções</li>
        <li>Divulgue nas redes sociais</li>
      </ul>
      <h3>Aspectos Legais</h3>
      <ul>
        <li>Use músicas licenciadas ou royalty-free</li>
        <li>Cadastre-se no ECAD se usar músicas comerciais</li>
        <li>Evite conteúdo que viole direitos autorais</li>
      </ul>',
     9, true, 5);

    -- Create WebTV course
    INSERT INTO academy_courses (
      id, title, slug, description, visibility, is_published, duration_minutes, sort_order
    ) VALUES (
      gen_random_uuid(),
      'WebTV: do zero ao ar',
      'webtv-do-zero-ao-ar',
      'Configure sua WebTV no Conexão, publique e distribua com padrão profissional.',
      'all',
      true,
      50,
      2
    ) RETURNING id INTO webtv_course_id;

    -- WebTV Lessons - M1: Preparação
    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webtv_course_id, 'O que é WebTV e formatos', 'Ao vivo, gravado, híbrido',
     '<h2>Introdução à WebTV</h2>
      <p>Uma <strong>WebTV</strong> é um canal de televisão que transmite conteúdo audiovisual pela internet. Diferente da TV tradicional, não depende de antenas ou cabo.</p>
      <h3>Formatos de Transmissão</h3>
      <ul>
        <li><strong>Ao vivo (Live)</strong>: transmissão em tempo real, ideal para eventos, noticiários, programas de auditório</li>
        <li><strong>Sob demanda (VOD)</strong>: vídeos gravados disponíveis a qualquer momento</li>
        <li><strong>Híbrido</strong>: combinação de ao vivo + biblioteca de vídeos</li>
      </ul>
      <h3>Vantagens</h3>
      <ul>
        <li>Alcance ilimitado pela internet</li>
        <li>Interatividade com o público (chat, enquetes)</li>
        <li>Métricas detalhadas de audiência</li>
        <li>Custo muito menor que TV tradicional</li>
      </ul>',
     1, true, 5);

    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webtv_course_id, 'Materiais necessários', 'Câmera, encoder, iluminação',
     '<h2>Equipamentos para WebTV</h2>
      <h3>Câmera</h3>
      <ul>
        <li><strong>Webcam HD</strong>: para início (Logitech C920 ou similar)</li>
        <li><strong>Câmera DSLR/Mirrorless</strong>: qualidade profissional</li>
        <li><strong>Camcorder</strong>: para gravações longas</li>
        <li><strong>Smartphone</strong>: câmeras recentes têm ótima qualidade</li>
      </ul>
      <h3>Áudio</h3>
      <ul>
        <li>Microfone de lapela ou shotgun</li>
        <li>Interface de áudio (se usar microfone XLR)</li>
      </ul>
      <h3>Iluminação</h3>
      <ul>
        <li>Ring light para vlogs e entrevistas</li>
        <li>Softbox ou painéis LED para estúdio</li>
        <li>Luz natural bem aproveitada</li>
      </ul>
      <h3>Software</h3>
      <ul>
        <li><strong>OBS Studio</strong>: gratuito e profissional</li>
        <li><strong>Streamlabs</strong>: mais amigável para iniciantes</li>
        <li><strong>vMix</strong>: solução profissional paga</li>
      </ul>',
     2, true, 5);

    INSERT INTO academy_lessons (course_id, title, description, checklist, sort_order, is_published, duration_minutes) VALUES
    (webtv_course_id, 'Checklist de qualidade mínima', 'Verificação técnica',
     '[
       {"item": "Definir formato do canal (ao vivo, VOD, híbrido)", "order": 1},
       {"item": "Providenciar câmera HD ou superior", "order": 2},
       {"item": "Configurar iluminação adequada", "order": 3},
       {"item": "Testar microfone e áudio sem ruídos", "order": 4},
       {"item": "Instalar e configurar OBS Studio ou similar", "order": 5},
       {"item": "Testar conexão de internet (upload mínimo 5Mbps)", "order": 6},
       {"item": "Criar cenário ou background adequado", "order": 7},
       {"item": "Preparar vinhetas e identidade visual", "order": 8}
     ]'::jsonb,
     3, true, 3);

    -- WebTV Lessons - M2: Implantação
    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webtv_course_id, 'Criando canal e player', 'Configuração no dashboard',
     '<h2>Criando seu canal de WebTV no Conexão</h2>
      <h3>1. Acessar módulo de TV</h3>
      <p>No menu lateral: <strong>Streaming → TV Web</strong></p>
      <h3>2. Criar novo canal</h3>
      <ul>
        <li><strong>Nome</strong>: nome do canal</li>
        <li><strong>Slug</strong>: URL amigável</li>
        <li><strong>Descrição</strong>: sobre o canal</li>
        <li><strong>Logo e banner</strong>: imagens de identidade</li>
      </ul>
      <h3>3. Configurar fonte de vídeo</h3>
      <p>O Conexão suporta:</p>
      <ul>
        <li>RTMP push (você envia para o servidor)</li>
        <li>HLS pull (servidor puxa de outra fonte)</li>
        <li>YouTube/Vimeo embed (restream)</li>
      </ul>
      <h3>4. Obter credenciais</h3>
      <p>Copie a URL RTMP e a chave de stream para usar no OBS.</p>',
     4, true, 8);

    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webtv_course_id, 'RTMP vs HLS: quando usar', 'Diferenças técnicas',
     '<h2>Protocolos de Streaming</h2>
      <h3>RTMP (Real-Time Messaging Protocol)</h3>
      <ul>
        <li><strong>Uso</strong>: para ENVIAR o vídeo do seu computador ao servidor</li>
        <li><strong>Latência</strong>: baixa (2-5 segundos)</li>
        <li><strong>Qualidade</strong>: excelente para ao vivo</li>
        <li><strong>Compatibilidade</strong>: OBS, vMix, todos os encoders</li>
      </ul>
      <h3>HLS (HTTP Live Streaming)</h3>
      <ul>
        <li><strong>Uso</strong>: para DISTRIBUIR o vídeo aos espectadores</li>
        <li><strong>Latência</strong>: maior (10-30 segundos)</li>
        <li><strong>Vantagem</strong>: funciona em todos os navegadores e dispositivos</li>
        <li><strong>Qualidade adaptativa</strong>: ajusta automaticamente à conexão</li>
      </ul>
      <h3>Na prática</h3>
      <p>Você envia via <strong>RTMP</strong> → Servidor converte para <strong>HLS</strong> → Público assiste HLS</p>',
     5, true, 5);

    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webtv_course_id, 'Testes: imagem, som, bitrate', 'Validação de qualidade',
     '<h2>Testando sua WebTV</h2>
      <h3>Configurações recomendadas no OBS</h3>
      <ul>
        <li><strong>Resolução</strong>: 1920x1080 (Full HD) ou 1280x720 (HD)</li>
        <li><strong>FPS</strong>: 30 (padrão) ou 60 (games/esportes)</li>
        <li><strong>Bitrate vídeo</strong>: 4000-6000 kbps para 1080p</li>
        <li><strong>Bitrate áudio</strong>: 128-320 kbps</li>
        <li><strong>Encoder</strong>: x264 ou NVENC (se tiver placa NVIDIA)</li>
      </ul>
      <h3>Checklist de teste</h3>
      <ul>
        <li>Verificar enquadramento e iluminação</li>
        <li>Testar áudio sem eco ou ruído</li>
        <li>Confirmar que não há travamentos</li>
        <li>Assistir de outro dispositivo para validar</li>
        <li>Testar por pelo menos 30 minutos contínuos</li>
      </ul>',
     6, true, 6);

    -- WebTV Lessons - M3: Publicação
    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webtv_course_id, 'Publicação no portal + destaque', 'Visibilidade',
     '<h2>Publicando no Portal</h2>
      <h3>Ativação</h3>
      <ol>
        <li>Acesse <strong>Streaming → TV Web → [seu canal]</strong></li>
        <li>Marque <strong>"Publicar no portal"</strong></li>
        <li>Escolha a categoria adequada</li>
        <li>Defina posição de destaque (se disponível)</li>
      </ol>
      <h3>Otimização</h3>
      <ul>
        <li>Use thumbnail atrativo</li>
        <li>Escreva título chamativo</li>
        <li>Descrição com palavras-chave relevantes</li>
        <li>Adicione tags para facilitar busca</li>
      </ul>
      <h3>Engajamento</h3>
      <ul>
        <li>Ative o chat para interação</li>
        <li>Divulgue horários de programação</li>
        <li>Compartilhe nas redes sociais</li>
      </ul>',
     7, true, 5);

    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webtv_course_id, 'Smart TVs: visão geral do caminho', 'Futuras integrações',
     '<h2>Expansão para Smart TVs</h2>
      <h3>O caminho para as Smart TVs</h3>
      <p>Sua WebTV pode ir além do navegador e chegar às TVs inteligentes:</p>
      <ul>
        <li><strong>Apps nativos</strong>: desenvolver app para Samsung Tizen, LG WebOS, Android TV</li>
        <li><strong>Fire TV</strong>: Amazon permite criar apps para Fire Stick</li>
        <li><strong>Roku</strong>: plataforma popular nos EUA</li>
        <li><strong>Chromecast</strong>: transmitir do celular para a TV</li>
      </ul>
      <h3>Requisitos</h3>
      <ul>
        <li>Canal estável e ativo</li>
        <li>Conteúdo regular (24/7 ou grade definida)</li>
        <li>Investimento em desenvolvimento de apps</li>
      </ul>
      <h3>Alternativa imediata</h3>
      <p>O player do Conexão funciona em qualquer Smart TV com navegador, permitindo acesso imediato sem app dedicado.</p>',
     8, true, 5);

    INSERT INTO academy_lessons (course_id, title, description, content_html, sort_order, is_published, duration_minutes) VALUES
    (webtv_course_id, 'Monetização e publicidade', 'Oportunidades',
     '<h2>Monetizando sua WebTV</h2>
      <h3>Modelos de Receita</h3>
      <ul>
        <li><strong>Publicidade (Ads)</strong>: venda espaços para anunciantes
          <ul>
            <li>Pre-roll: antes do conteúdo</li>
            <li>Mid-roll: durante o conteúdo</li>
            <li>Banners no player</li>
          </ul>
        </li>
        <li><strong>Patrocínio</strong>: marcas patrocinam programas específicos</li>
        <li><strong>Assinatura</strong>: conteúdo exclusivo para assinantes</li>
        <li><strong>Doações</strong>: Super Chat, PIX, apoio recorrente</li>
        <li><strong>Afiliados</strong>: comissão por vendas indicadas</li>
      </ul>
      <h3>No Conexão</h3>
      <p>O módulo de publicidade permite:</p>
      <ul>
        <li>Inserir banners no player</li>
        <li>Gerenciar campanhas de anunciantes</li>
        <li>Acompanhar métricas de visualização</li>
      </ul>
      <h3>Dicas</h3>
      <ul>
        <li>Comece com patrocínios locais</li>
        <li>Ofereça pacotes de mídia</li>
        <li>Mostre métricas aos anunciantes</li>
      </ul>',
     9, true, 6);
  END IF;
END $$;