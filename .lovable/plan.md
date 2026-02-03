
# Plano de Implementação: Fases 4-7 — Conclusão do Sistema "Publicidade & Monetização"

## Resumo

Este plano conclui as **4 fases restantes** para entregar o sistema 100% funcional:
- **Fase 4**: Storage real + trackCampaignEvent + WebStoriesViewer
- **Fase 5**: Atualizar CampaignsHub para incluir Campanhas 360
- **Fase 6**: Push/Newsletter end-to-end
- **Fase 7**: Integração Ads/Banners com 360

---

## FASE 4: Storage Real + Helper de Métricas + WebStories

### 4.1 Migração de Banco de Dados

Adicionar campos de integração 360 nas tabelas `ads` e `super_banners`:

```sql
-- Adicionar campos de integração 360 nas tabelas legadas
ALTER TABLE ads 
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns_unified(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS managed_by_campaign BOOLEAN DEFAULT false;

ALTER TABLE super_banners 
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns_unified(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS managed_by_campaign BOOLEAN DEFAULT false;

-- Adicionar cycle_id em campaign_events se não existir
ALTER TABLE campaign_events 
  ADD COLUMN IF NOT EXISTS cycle_id UUID REFERENCES campaign_cycles(id) ON DELETE SET NULL;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ads_campaign_id ON ads(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_super_banners_campaign_id ON super_banners(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_events_cycle_id ON campaign_events(cycle_id) WHERE cycle_id IS NOT NULL;
```

### 4.2 Criar Helper de Métricas Unificado

**Novo arquivo**: `src/lib/trackCampaignEvent.ts`

```typescript
// Helper unificado para tracking de eventos de campanha
// Usado por: InlineAdSlot, ExitIntentModal, LoginPanelAd, WebStoriesViewer
export async function trackCampaignEvent({
  campaignId,
  cycleId,
  channelType,
  eventType,
  metadata = {},
}: TrackEventParams): Promise<void>

// Funções auxiliares:
// - getSessionId() - ID de sessão único
// - getDeviceType() - mobile/tablet/desktop
// - useTrackImpression() - hook wrapper
// - useTrackClick() - hook wrapper
// - useTrackCTAClick() - hook wrapper
```

### 4.3 Criar WebStoriesViewer

**Novo arquivo**: `src/components/ads/WebStoriesViewer.tsx`

Componente fullscreen para exibir WebStories de campanhas 360:
- Formato 1080x1920 (9:16)
- Navegação por swipe/clique
- Barra de progresso no topo
- Badge "Patrocinado"
- CTA no último slide
- Tracking de eventos: story_open, slide_view, story_complete, cta_click

### 4.4 Atualizar BatchAssetUploader

O `BatchAssetUploader.tsx` já implementa upload real para Storage. Verificar se está criando registros em `campaign_assets` corretamente.

---

## FASE 5: Atualizar CampaignsHub

### 5.1 Modificar `src/pages/admin/CampaignsHub.tsx`

Adicionar card de "Campanhas 360" na lista de campanhas:

```typescript
const campaigns = [
  // ... existing campaigns
  {
    id: 'unified-360',
    title: 'Campanhas 360',
    description: 'Sistema unificado para Ads, Publidoor, WebStories, Push, Newsletter e mais',
    icon: Megaphone, // ou Layers
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    href: '/admin/campaigns/unified',
    stats: [
      { label: 'Ativas', value: stats?.campaigns360Active || 0 },
      { label: 'Total', value: stats?.campaigns360Total || 0 },
    ],
    status: 'active',
    badge: 'Novo',
  },
];
```

Adicionar query para contar campanhas 360:
```typescript
const campaigns360 = await supabase
  .from('campaigns_unified')
  .select('id, status', { count: 'exact' });
```

---

## FASE 6: Push/Newsletter End-to-End

### 6.1 Atualizar Edge Functions

As Edge Functions `campaign-push` e `campaign-newsletter` já existem e estão funcionais. Verificar:

**campaign-push/index.ts**:
- Buscar VAPID keys do ambiente
- Usar web-push para envio real (requer VAPID_PRIVATE_KEY)
- Atualizar para enviar push notifications reais

**campaign-newsletter/index.ts**:
- Integrar com serviço de email (Resend, SendGrid, etc.)
- Buscar lista de subscribers
- Enviar emails reais

### 6.2 Atualizar usePushSubscription.ts

O hook já existe e está funcional. Adicionar:
- UI para ativar/desativar notificações no perfil do usuário
- Componente `PushNotificationToggle`

### 6.3 Criar Service Worker

**Novo arquivo**: `public/sw.js`

```javascript
// Service Worker para Push Notifications
self.addEventListener('push', function(event) {
  const data = event.data?.json() || {};
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: '/badge-72.png',
    data: { url: data.action_url },
    vibrate: [200, 100, 200],
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
```

---

## FASE 7: Integração Ads/Banners com 360

### 7.1 Atualizar Formulário de Ads

**Modificar**: `src/pages/admin/Ads.tsx`

Adicionar seção de vinculação ao 360:

```typescript
interface AdForm {
  // ... existing fields
  campaign_id?: string;
  managed_by_campaign: boolean;
}

// No formulário:
<div className="rounded-lg border p-4 bg-muted/50">
  <h4 className="font-medium mb-3 flex items-center gap-2">
    <Link className="h-4 w-4" />
    Vincular a Campanha 360
  </h4>
  <div className="flex items-center gap-4">
    <Switch
      checked={form.managed_by_campaign}
      onCheckedChange={(checked) => {
        setForm({ ...form, managed_by_campaign: checked });
      }}
    />
    <Label>Gerenciado por campanha</Label>
  </div>
  {form.managed_by_campaign && (
    <Select 
      value={form.campaign_id} 
      onValueChange={(v) => setForm({...form, campaign_id: v})}
    >
      <SelectTrigger className="mt-3">
        <SelectValue placeholder="Selecionar campanha" />
      </SelectTrigger>
      <SelectContent>
        {campaigns360?.map(c => (
          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
</div>
```

### 7.2 Atualizar Formulário de Super Banners

**Modificar**: `src/pages/admin/Banners.tsx`

Mesmo padrão do Ads:
- Adicionar toggle "Gerenciado por campanha"
- Select para escolher campanha
- Quando vinculado, assets podem vir do 360

### 7.3 Atualizar Display Components

**InlineAdSlot.tsx** - já funcional, atualizar para usar `trackCampaignEvent`:
```typescript
import { trackCampaignEvent } from '@/lib/trackCampaignEvent';

// Substituir recordEvent por:
trackCampaignEvent({
  campaignId: campaign.id,
  channelType: 'ads',
  eventType: 'impression',
  metadata: { position, category, format: '300x250' },
});
```

**ExitIntentModal.tsx** - já funcional, atualizar import

**LoginPanelAd.tsx** - já funcional, atualizar import

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/trackCampaignEvent.ts` | Helper unificado de tracking |
| `src/components/ads/WebStoriesViewer.tsx` | Visualizador fullscreen de stories |
| `public/sw.js` | Service Worker para Push |

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/admin/CampaignsHub.tsx` | Adicionar card Campanhas 360 |
| `src/pages/admin/Ads.tsx` | Adicionar integração 360 |
| `src/pages/admin/Banners.tsx` | Adicionar integração 360 |
| `src/components/ads/InlineAdSlot.tsx` | Usar trackCampaignEvent |
| `src/components/ads/ExitIntentModal.tsx` | Usar trackCampaignEvent |
| `src/components/auth/LoginPanelAd.tsx` | Usar trackCampaignEvent |

## Migração de Banco de Dados

```sql
-- Campos de integração 360
ALTER TABLE ads 
  ADD COLUMN campaign_id UUID REFERENCES campaigns_unified(id),
  ADD COLUMN managed_by_campaign BOOLEAN DEFAULT false;

ALTER TABLE super_banners 
  ADD COLUMN campaign_id UUID REFERENCES campaigns_unified(id),
  ADD COLUMN managed_by_campaign BOOLEAN DEFAULT false;

ALTER TABLE campaign_events 
  ADD COLUMN cycle_id UUID REFERENCES campaign_cycles(id);

-- Índices
CREATE INDEX idx_ads_campaign_id ON ads(campaign_id);
CREATE INDEX idx_super_banners_campaign_id ON super_banners(campaign_id);
```

---

## Ordem de Implementação

1. Executar migração SQL
2. Criar `trackCampaignEvent.ts`
3. Criar `WebStoriesViewer.tsx`
4. Criar `public/sw.js`
5. Atualizar `CampaignsHub.tsx`
6. Atualizar `Ads.tsx` com integração 360
7. Atualizar `Banners.tsx` com integração 360
8. Atualizar componentes de display (InlineAdSlot, ExitIntentModal, LoginPanelAd)
9. Testar fluxos end-to-end

---

## Critérios de Aceite Final

Após implementação completa:

1. ✅ Menu "Campanhas 360" visível e funcional
2. ✅ Parceiros (Inbox/Manage/Pitches) sem mock data
3. ✅ Publidoor com CRUD completo
4. ✅ Upload de assets para Storage real
5. ✅ Exit-Intent, Login Panel, InlineAdSlot exibindo campanhas reais
6. ✅ WebStories funcionando
7. ✅ Push e Newsletter com fluxo testável
8. ✅ Métricas unificadas em `campaign_events`
9. ✅ Ads e Banners integráveis ao 360
