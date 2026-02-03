
# Sistema Padronizado de Publicidade - Portal Conexao na Cidade

## Resumo Executivo

Implementacao de um sistema unificado e responsivo de publicidade digital, integrando o componente `AdSlot` legado com o modulo premium `Publidoor`. O sistema adotara 5 formatos oficiais com deteccao automatica de dispositivo, aspect-ratio nativo, safe area central e metricas completas.

---

## Arquitetura Atual vs. Nova

### Estado Atual:
- `AdSlot.tsx`: Componente basico para anuncios simples (tabela `ads`)
- `SuperBanner.tsx`: Carousel de banners (tabela `super_banners`)
- `Publidoor`: Sistema premium com 10+ tabelas (items, locations, campaigns, metrics, etc.)
- **Problema**: Formatos inconsistentes, sem responsividade padronizada, sem aspect-ratio

### Nova Arquitetura:
- Componente unificado `ResponsiveAdUnit` que serve ambos sistemas
- Formatos oficiais com breakpoints padronizados
- Safe area automatica e lazy loading
- Metricas centralizadas (impressoes, cliques, CTR, tempo de exibicao)

---

## Formatos Oficiais (Constantes)

```text
+---------------------+------------------+----------------+----------------+
|     Formato         |     Desktop      |     Tablet     |     Mobile     |
+---------------------+------------------+----------------+----------------+
| SUPER_BANNER_TOPO   |    970x250       |    728x90      |    320x100     |
| ANUNCIO_HOME        |    970x250       |    728x90      |    320x100     |
| RETANGULO_MEDIO     |    300x250       |    300x250     |    300x250     |
| ARRANHA_CEU         |    300x600       |    300x600     |    300x250*    |
| POPUP_INTELIGENTE   |    580x400       |    580x400     |    fullscreen  |
+---------------------+------------------+----------------+----------------+
* fallback automatico
```

---

## Arquivos a Criar

### 1. src/lib/adFormats.ts
Constantes de formatos oficiais com breakpoints e aspect-ratios:

```typescript
export const AD_FORMATS = {
  SUPER_BANNER_TOPO: {
    id: 'super_banner_topo',
    label: 'Super Banner Topo',
    desktop: { width: 970, height: 250 },
    tablet: { width: 728, height: 90 },
    mobile: { width: 320, height: 100 },
    aspectRatio: '21/9',
    preload: true,
  },
  RETANGULO_MEDIO: {
    id: 'retangulo_medio',
    label: 'Retangulo Medio',
    desktop: { width: 300, height: 250 },
    tablet: { width: 300, height: 250 },
    mobile: { width: 300, height: 250 },
    aspectRatio: '6/5',
    preload: false,
  },
  // ... demais formatos
} as const;

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
} as const;
```

---

### 2. src/components/ads/ResponsiveAdUnit.tsx
Componente principal unificado:

**Funcionalidades:**
- Detecta dispositivo via `window.matchMedia`
- Aplica aspect-ratio nativo CSS
- Lazy loading (exceto banner topo)
- Renderiza imagem com safe area (object-position: center)
- Registra impressoes e cliques
- Suporta fallback automatico (ex: arranha-ceu para mobile)

```typescript
interface ResponsiveAdUnitProps {
  format: keyof typeof AD_FORMATS;
  slotId: string; // ID do local (publidoor_locations.slug)
  source?: 'publidoor' | 'ads'; // qual tabela consultar
  className?: string;
  onImpression?: () => void;
  onClick?: () => void;
}
```

---

### 3. src/components/ads/AdPopup.tsx
Pop-up inteligente com regras:
- Maximo 1 exibicao por sessao (sessionStorage)
- Fecha com swipe no mobile (touch events)
- Fullscreen adaptado em mobile
- Delay de 3s apos carregamento da pagina
- Botao de fechar visivel

---

### 4. src/components/ads/AdCarousel.tsx
Carousel para rotacao automatica:
- Usado em locais com `allows_rotation: true`
- Transicao suave com Tailwind
- Indicadores de posicao
- Pausa no hover

---

### 5. src/hooks/useAdUnit.ts
Hook centralizado para busca de anuncios:

```typescript
function useAdUnit(format: AdFormat, slotId: string, source: 'publidoor' | 'ads') {
  // Busca anuncio ativo no slot
  // Considera agendamento (starts_at, ends_at)
  // Considera prioridade e rotacao
  // Registra impressao automaticamente
  return { ad, isLoading, trackClick };
}
```

---

### 6. src/hooks/useAdMetrics.ts
Hook para registro de metricas:

```typescript
function useAdMetrics(adId: string, source: 'publidoor' | 'ads') {
  const trackImpression = () => { /* ... */ };
  const trackClick = (x: number, y: number) => { /* ... */ };
  const trackViewTime = (seconds: number) => { /* ... */ };
  return { trackImpression, trackClick, trackViewTime };
}
```

---

## Arquivos a Modificar

### 1. src/components/home/AdSlot.tsx
Substituir implementacao atual por wrapper do `ResponsiveAdUnit`:

```typescript
export function AdSlot({ slotType, className }: AdSlotProps) {
  return (
    <ResponsiveAdUnit
      format="RETANGULO_MEDIO"
      slotId={slotType}
      source="ads"
      className={className}
    />
  );
}
```

---

### 2. src/components/home/SuperBanner.tsx
Refatorar para usar sistema unificado:
- Manter carousel existente
- Aplicar aspect-ratio padronizado (21:9)
- Usar lazy loading condicional

---

### 3. src/components/home/DynamicHomeSection.tsx
Atualizar mapeamento de secoes:

```typescript
ad_slot_top: () => (
  <ResponsiveAdUnit format="SUPER_BANNER_TOPO" slotId="home_top" source="publidoor" />
),
ad_slot_content: () => (
  <ResponsiveAdUnit format="RETANGULO_MEDIO" slotId="news_between" source="publidoor" />
),
```

---

### 4. src/components/publidoor/PublidoorPreview.tsx
Atualizar preview do admin para usar formatos padronizados:
- Mostrar preview em diferentes dispositivos
- Aplicar safe area visual
- Indicar area segura (80% central)

---

### 5. tailwind.config.ts
Adicionar aspect-ratios customizados:

```typescript
extend: {
  aspectRatio: {
    'super-banner': '21 / 9',
    'leaderboard': '728 / 90',
    'medium-rect': '6 / 5',
    'skyscraper': '1 / 2',
    'popup': '29 / 20',
  },
}
```

---

## Migracao de Banco de Dados

### Alteracoes na tabela `ads`:
```sql
ALTER TABLE ads ADD COLUMN format_type TEXT DEFAULT 'retangulo_medio';
ALTER TABLE ads ADD COLUMN safe_area_url TEXT; -- imagem otimizada
ALTER TABLE ads ADD COLUMN avg_view_time_ms INTEGER DEFAULT 0;
```

### Alteracoes na tabela `publidoor_locations`:
```sql
ALTER TABLE publidoor_locations ADD COLUMN format_type TEXT DEFAULT 'retangulo_medio';
ALTER TABLE publidoor_locations ADD COLUMN breakpoint_overrides JSONB;
```

### Alteracoes na tabela `publidoor_metrics`:
```sql
ALTER TABLE publidoor_metrics ADD COLUMN viewport_width INTEGER;
ALTER TABLE publidoor_metrics ADD COLUMN view_time_ms INTEGER DEFAULT 0;
```

---

## Admin - Experiencia Simplificada

### Fluxo de Cadastro:
1. Usuario escolhe **Tipo de Espaco** (dropdown com 4 opcoes):
   - Topo (Super Banner)
   - Conteudo (Retangulo Medio)
   - Impacto (Arranha-ceu)
   - Pop-up (Inteligente)

2. Usuario faz **Upload de Imagem Unica** (alta resolucao)

3. Sistema processa automaticamente:
   - Redimensiona para cada breakpoint
   - Valida safe area (80% central)
   - Otimiza peso (max 500kb)
   - Gera WebP automatico

---

## Performance e SEO

### Lazy Loading:
```typescript
<img
  src={ad.image_url}
  loading={format.preload ? 'eager' : 'lazy'}
  decoding="async"
/>
```

### Preconnect (index.html):
```html
<link rel="preconnect" href="https://qfavfwvsficnqaznincz.supabase.co" />
```

### CLS Prevention:
- Aspect-ratio nativo CSS evita layout shift
- Placeholder com background-color durante loading

---

## Secao Tecnica

### Estrutura de Arquivos:

```text
src/
  lib/
    adFormats.ts          # Constantes de formatos
  components/
    ads/
      ResponsiveAdUnit.tsx  # Componente principal
      AdPopup.tsx           # Pop-up inteligente
      AdCarousel.tsx        # Rotacao automatica
      index.ts              # Exports
  hooks/
    useAdUnit.ts            # Busca de anuncios
    useAdMetrics.ts         # Metricas
```

### Deteccao de Dispositivo:
```typescript
function useDeviceType() {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  useEffect(() => {
    const checkDevice = () => {
      if (window.innerWidth <= 640) setDevice('mobile');
      else if (window.innerWidth <= 1024) setDevice('tablet');
      else setDevice('desktop');
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  return device;
}
```

### CSS Classes para Safe Area:
```css
.ad-safe-area {
  object-fit: cover;
  object-position: center center;
}

.ad-container {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
```

---

## Ordem de Implementacao

1. **Fase 1**: Constantes e tipos (`adFormats.ts`, tipos TypeScript)
2. **Fase 2**: Hooks (`useAdUnit.ts`, `useAdMetrics.ts`)
3. **Fase 3**: Componente principal (`ResponsiveAdUnit.tsx`)
4. **Fase 4**: Componentes auxiliares (`AdCarousel.tsx`, `AdPopup.tsx`)
5. **Fase 5**: Migracao de banco de dados
6. **Fase 6**: Refatoracao de componentes existentes
7. **Fase 7**: Atualizacao do admin Publidoor

---

## Validacao e Testes

- Testar em viewports: 320px, 768px, 1024px, 1440px
- Verificar Lighthouse (CLS < 0.1, LCP nao bloqueado)
- Validar impressoes e cliques no banco
- Testar pop-up (1x por sessao, swipe para fechar)
- Verificar rotacao em locais com multiplos anuncios
