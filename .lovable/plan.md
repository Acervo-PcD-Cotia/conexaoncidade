

# Diagnostico Tecnico Completo -- Modulo "Streaming e Midia"

## Resumo Executivo

O modulo de Streaming e Midia do Portal Conexao na Cidade e composto por tres subsistemas: **Hub Central (Broadcast)**, **Ao Vivo (Radio Web + TV Web)** e **Studio (Conexao Studio)**. Apos analise detalhada de todo o codigo-fonte, edge functions, integracao com LiveKit e arquitetura de dados, a estimativa de conclusao real e de **55-65%** -- significativamente acima dos 25-35% sugeridos no prompt. O sistema possui infraestrutura backend real (LiveKit, Egress RTMP, gravacao S3) ja integrada, porem depende de servicos externos que ainda nao estao todos provisionados.

---

## 1. HUB CENTRAL (Modelo Streamyard)

### Funcionalidades 100% Prontas

| Funcionalidade | Evidencia |
|---|---|
| Criacao/agendamento de transmissoes | `BroadcastForm.tsx`, tabela `broadcasts` |
| Gestao de canais | `BroadcastChannels.tsx`, tabela `broadcast_channels` |
| Gestao de programas/grade | `BroadcastPrograms.tsx`, `BroadcastPlaylist.tsx` |
| Dashboard com KPIs (ao vivo, proximas, canais) | `BroadcastTabContent.tsx` |
| Integracao LiveKit completa (connect, disconnect, events) | `useLiveKit.ts` (332 linhas) |
| Token generation via Edge Function | `livekit-token/index.ts` com JWT, roles, permissions |
| Participantes (host, guest, viewer) com permissoes | Metadata JWT com roles, `broadcast_participants` |
| Convite de guests via link/token | `InviteGuestModal.tsx`, validacao de `invite_token` no backend |
| Captura de camera, microfone, tela | `toggleCamera`, `toggleMicrophone`, `toggleScreenShare` em `useLiveKit.ts` |
| Preview local antes de conectar | `useLocalPreview()` com `createLocalTracks` |
| Layouts de video (grid, spotlight, audio-only) | `LiveKitRoom.tsx` (374 linhas) com 3 layouts |
| Multi-streaming RTMP real | `conexao-stream-start/index.ts` usa Egress API do LiveKit para multiplos destinos |
| Gestao de destinos (YouTube, Facebook, Twitch, RTMP) | `useConexaoStreaming.ts`, tabela `illumina_destinations` |
| Start/Stop streaming por destino | Edge Functions `conexao-stream-start` e `conexao-stream-stop` |
| Gravacao em nuvem (S3) | `conexao-recording-start/index.ts` com `RoomCompositeEgress` |
| Gravacao local (MediaRecorder) | Fallback local em `conexao-recording-start` |
| Check de capacidades de gravacao | `conexao-recording-check/index.ts` |
| Legendas/transcricao ao vivo | `BroadcastCaptions.tsx`, `useAudioTranscription` |
| Chat de broadcast | `BroadcastChat.tsx` |

### Funcionalidades Parciais

| Funcionalidade | Status | O que falta |
|---|---|---|
| Overlays/Branding | Interface criada (`OverlayRenderer.tsx`, `LogoOverlay.tsx`, `LowerThirdOverlay.tsx`, `BannerOverlay.tsx`, `TickerOverlay.tsx`, `CommentHighlightOverlay.tsx`) | Composicao visual nos overlays nao e injetada no stream RTMP de saida -- os overlays sao renderizados apenas no navegador do host, nao no egress. LiveKit Egress precisaria de `custom_base_url` com layout customizado para incluir overlays no stream de saida. |
| Chat integrado multi-plataforma | Edge Functions existem para YouTube (`conexao-chat-youtube`) e Facebook (`conexao-chat-facebook`) | Nao ha UI de chat unificado que agregue chats de todas as plataformas em tempo real. O `UnifiedChatPanel.tsx` existe mas depende de polling nas APIs externas. |
| Estatisticas em tempo real | Viewer count basico | Sem metricas detalhadas por destino (bitrate, dropped frames, health) |

### Funcionalidades Nao Implementadas

| Funcionalidade | Complexidade |
|---|---|
| Estudio virtual (backgrounds, cenarios) | Media -- requer Canvas compositing ou ML background removal |
| Clipping automatico | Media -- requer FFmpeg server-side ou WebCodecs |
| Transicoes entre cenas | Alta -- requer pipeline de composicao em tempo real |

### Integracoes Configuradas

| Servico | Status | Segredos |
|---|---|---|
| LiveKit (WebRTC SFU) | Configurado | `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` presentes |
| S3 Storage (gravacao) | Nao configurado | `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION` ausentes |
| YouTube Live API | Parcial | Destinos RTMP manuais funcionam; API nativa para chat existe |
| Facebook Live API | Parcial | Idem YouTube |

### Integracoes Necessarias (nao presentes)

| Integracao | Motivo | Pode ser interno? |
|---|---|---|
| S3 ou compativel (R2, Spaces) | Gravacao em nuvem | Nao -- requer storage externo |
| CDN (opcional) | Distribuicao de gravacoes | Nao |

### Veredicto Hub Central: **75-80% funcional**

A arquitetura esta madura. O sistema ja faz multi-streaming RTMP real via LiveKit Egress, gerencia participantes com permissoes, e tem gravacao (pendente S3). O que falta e refinamento (overlays no egress, estudio virtual).

---

## 2. AO VIVO (Web Radio + Web TV)

### Arquitetura Atual

O modulo Radio e TV usa uma **arquitetura de proxy/gateway** onde o portal nao e o servidor de streaming, mas sim um painel de gestao que se conecta a provedores externos (VoxHD, Shoutcast, etc.) via API JSON.

### Radio Web

#### 100% Funcional

| Funcionalidade | Evidencia |
|---|---|
| Gateway de status normalizado (VoxHD, Icecast, Shoutcast) | `streaming-gateway/index.ts` (571 linhas) com parsing multi-provedor |
| Cache de 30s com fallback | `isCacheValid()`, `last_snapshot` no DB |
| Player publico de audio | `GlobalRadioContext.tsx` com `HTMLAudioElement` |
| Configuracao de conexao externa | `useStreamingConfig.ts` (salva `api_json_url`, `embed_mode`, etc.) |
| Teste de conexao com latencia | `testConnectionMutation` no hook |
| Dashboard com KPIs (ouvintes, status, tocando agora) | `RadioTabContent.tsx` |
| Modulo isolado com types/endpoints/hooks | `src/modules/radio/` completo |
| API Client com fallback para mock | `radioApiClient.ts` com mock transparente |
| AutoDJ (edge function) | `autodj-stream/index.ts` com gestao de playlists e estado por canal |
| Playlists, biblioteca de tracks, encoder config | Hooks completos em `modules/radio/hooks/` |

#### Parcial

| Funcionalidade | Status |
|---|---|
| AutoDJ real (playback de audio) | Edge function gerencia estado mas nao faz playback real -- depende de servidor Icecast/Shoutcast configurado externamente |
| Upload de tracks | Mock no `uploadTrack()` -- "gateway nao suporta upload direto ainda" |
| Estatisticas historicas | Dados vem do mock server quando nao ha provedor externo |

#### Nao Implementado

| Funcionalidade | Nota |
|---|---|
| Servidor Icecast/Shoutcast proprio | O sistema foi projetado para conectar a provedores externos, nao hospedar |
| Re-stream de audio | Nao ha pipeline para capturar e redistribuir |
| Relatorios exportaveis | Sem PDF/CSV de analytics |

### TV Web

#### 100% Funcional

| Funcionalidade | Evidencia |
|---|---|
| Gateway de status (VoxTV) | Mesmo `streaming-gateway` com parsing TV |
| Player publico com embed | `TvPage.tsx` com suporte iframe, HTML e URL |
| Configuracao de conexao externa | Mesmo `useStreamingConfig` com `kind: "tv"` |
| Dashboard com KPIs | `TvTabContent.tsx` |
| Modulo isolado completo | `src/modules/tv/` com types, endpoints, hooks |
| Gestao de VOD (interface) | `useTvVod.ts`, `useTvUploads.ts` |
| Grade de programacao (interface) | `useTvSchedule.ts` |
| Ingest credentials (interface) | `useTvIngest.ts` |
| API Client com mock | `tvApiClient.ts` |

#### Parcial

| Funcionalidade | Status |
|---|---|
| VOD real | Interface existe mas sem storage backend configurado |
| Grade linear real | Schedule existe no mock mas sem engine de execucao |
| Transcoding | Interface de upload jobs sem FFmpeg server-side |

#### Nao Implementado

| Funcionalidade | Nota |
|---|---|
| Nginx RTMP proprio | Mesma abordagem -- conecta a provedor externo |
| DVR / timeshift | Flag `enableDVR` em settings mas sem implementacao |
| CDN propria | Depende de provedor externo |

### Veredicto Ao Vivo: **60-65% funcional**

O sistema funciona como **painel de gestao** para provedores externos. A camada de gateway, normalizacao e cache esta robusta. O que falta e o backend de streaming real (Icecast, RTMP server) -- por design, isso e delegado a provedores externos.

---

## 3. STUDIO (Conexao Studio -- Modelo Streamyard/OBS)

### 100% Funcional

| Funcionalidade | Evidencia |
|---|---|
| CRUD de estuudios (nome, slug, layout, marca) | `StudioCreate.tsx`, `StudioList.tsx`, tabela `illumina_studios` |
| Sessao ao vivo com LiveKit | `StudioSession.tsx` com `useLiveKit` |
| Green Room (pre-show) | `GreenRoom.tsx` |
| Barra de controles (mic, camera, tela, gravar, go live) | `StudioControlBar.tsx` |
| Preview area com layouts (grid, spotlight, PiP, side-by-side) | `StudioPreviewArea.tsx` |
| Medidor de nivel de audio | `AudioLevelMeter.tsx` |
| Backstage/participantes | `StudioBackstage.tsx`, `ParticipantCard.tsx` |
| Overlays (logo, lower third, banner, ticker, destaque de comentario) | 6 componentes em `overlays/` + `OverlayRenderer.tsx` |
| Painel de branding | `BrandingPanel.tsx` |
| Painel de destinos multi-stream | `DestinationsPanel.tsx` |
| Painel de midia | `MediaPanel.tsx` |
| Painel de configuracoes | `SettingsPanel.tsx` |
| Chat unificado | `UnifiedChatPanel.tsx` |
| Sala de espera de convidados | `WaitingGuestsPanel.tsx` |
| Entrada de convidado via link | `GuestEntry.tsx` |
| Multi-streaming (via LiveKit Egress RTMP) | Integrado com `conexao-stream-start` |
| Gravacao cloud + local | Integrado com `conexao-recording-start/stop` |
| Biblioteca de gravacoes | `Library.tsx` |
| Gestao de time | `Team.tsx`, tabela `illumina_team_members` |
| Webinars | `Webinars.tsx` |
| Dashboard | `Dashboard.tsx` |

### Parcial

| Funcionalidade | Status |
|---|---|
| Overlays no stream de saida | Visivel apenas localmente; nao injetado no RTMP egress |
| Clipping de gravacoes | Link na interface mas sem backend de corte (FFmpeg) |
| Mixagem de audio avancada | Nivel de audio exibido, sem mixer multi-canal |

### Nao Implementado

| Funcionalidade | Complexidade |
|---|---|
| Engine de cenas com transicoes | Alta -- Canvas compositor ou WebGL |
| Filtros de video (blur, chroma key) | Media -- WebGL shaders ou ML |
| Plugins/extensoes | Alta -- requer sistema de plugins |
| Encoder integrado (WebAssembly) | Muito alta -- alternativa: manter LiveKit |

### Veredicto Studio: **70-75% funcional**

O Conexao Studio e o modulo mais completo. Funciona como um Streamyard funcional com LiveKit como backbone. A maioria das features de producao ao vivo esta implementada. O gap principal e a composicao visual no stream de saida (overlays) e funcionalidades de pos-producao.

---

## 4. Analise Geral Consolidada

### Status por Modulo

```text
+-------------------+------------------+
| Modulo            | Conclusao Real   |
+-------------------+------------------+
| Hub Central       | 75-80%           |
| Ao Vivo (Radio)   | 60-65%           |
| Ao Vivo (TV)      | 55-60%           |
| Studio            | 70-75%           |
+-------------------+------------------+
| MEDIA GERAL       | 65%              |
+-------------------+------------------+
```

### Integracoes Obrigatorias Consolidadas

| Integracao | Status Atual | Necessario Para |
|---|---|---|
| LiveKit (WebRTC SFU) | **CONFIGURADO** (secrets presentes) | Hub Central, Studio |
| Provedor Radio externo (VoxHD/Icecast) | Nao configurado (depende do cliente) | Radio Web |
| Provedor TV externo (VoxTV/RTMP) | Nao configurado (depende do cliente) | TV Web |
| S3 ou compativel | **NAO CONFIGURADO** (secrets ausentes) | Gravacao em nuvem |

### Integracoes Opcionais

| Integracao | Beneficio |
|---|---|
| YouTube Data API v3 | Gerenciar lives e ler chat diretamente |
| Facebook Graph API | Idem para Facebook Live |
| FFmpeg server-side | Clipping, transcoding VOD, AutoDJ real |
| CDN (Cloudflare/CloudFront) | Distribuicao de VOD e gravacoes |
| Whisper/Deepgram | Transcricao automatica de melhor qualidade |

### O que pode ser feito internamente (sem servico externo)

| Funcionalidade | Viabilidade |
|---|---|
| Overlays no egress | Sim -- usar `custom_base_url` do LiveKit Egress apontando para pagina de layout personalizada |
| Background virtual | Sim -- via TensorFlow.js ou MediaPipe no browser |
| Mixer de audio basico | Sim -- Web Audio API ja disponivel |
| DVR/timeshift | Parcial -- HLS com buffer, mas requer storage |

---

## 5. Roadmap Recomendado

### Fase 1 -- Operacional Minimo (1-2 semanas)

1. Configurar segredos S3 (`S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`) para habilitar gravacao em nuvem
2. Testar fluxo completo: criar broadcast, conectar LiveKit, multi-stream para YouTube/Facebook, gravar
3. Configurar pelo menos um provedor externo de Radio (VoxHD ou Icecast) para validar o gateway
4. Configurar provedor externo de TV para validar gateway TV

### Fase 2 -- Estabilidade e Qualidade (2-4 semanas)

1. Implementar overlays no stream de saida via `custom_base_url` do Egress
2. Substituir mocks do modulo Radio/TV por dados reais quando provedor estiver configurado
3. Implementar upload real de tracks (storage backend)
4. Adicionar monitoramento de saude por destino (bitrate, frames dropped)
5. Implementar chat unificado agregando YouTube + Facebook em tempo real

### Fase 3 -- Recursos Avancados (4-8 semanas)

1. Clipping de gravacoes com FFmpeg (edge function ou worker externo)
2. Background virtual com MediaPipe
3. Engine de cenas basico (2-3 layouts pre-definidos com transicoes CSS)
4. Transcoding de VOD para multiplas qualidades
5. Analytics avancado com dashboards historicos

---

## 6. Notas Tecnicas Importantes

1. **LiveKit esta configurado e funcional** -- os 3 secrets estao presentes. O sistema pode fazer WebRTC, multi-stream RTMP e gravacao (falta apenas S3).

2. **A arquitetura de Radio/TV e de proxy, nao de hosting** -- o portal nao roda Icecast/Shoutcast. Ele conecta a provedores externos via API JSON e normaliza os dados. Isso e uma decisao de arquitetura valida (menor custo de infra).

3. **O mock server e um fallback inteligente** -- quando nao ha provedor configurado, o sistema exibe dados mock transparentemente. Isso permite demonstracao e desenvolvimento sem infra real.

4. **O Conexao Studio e um produto funcional** -- com LiveKit configurado, ele ja permite transmissoes ao vivo com convidados, multi-streaming e gravacao local. E o modulo mais proximo de "pronto para producao".

