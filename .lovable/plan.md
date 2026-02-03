

# Plano de Implementação: Módulo Comprovantes de Campanha

## Resumo Executivo

Criar um módulo completo para cadastrar campanhas publicitárias e gerar automaticamente PDFs de Comprovante de Veiculação e Relatório Google Analytics, com upload de prints, métricas manuais opcionais e histórico de versões.

Este módulo é **independente** do sistema "Campanhas 360" existente, focado especificamente em **documentação comprobatória** para clientes e agências.

---

## Arquitetura Proposta

```text
┌──────────────────────────────────────────────────────────────────┐
│                    MÓDULO COMPROVANTES                           │
├──────────────────────────────────────────────────────────────────┤
│  UI (React + Tailwind)                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐    │
│  │ Lista       │ │ Editor      │ │ Exportação/Preview      │    │
│  │ Campanhas   │ │ Multi-Abas  │ │ PDF                     │    │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘    │
├──────────────────────────────────────────────────────────────────┤
│  Hooks (TanStack Query)                                          │
│  useCampaignProofs, useProofChannels, useProofAssets, etc.      │
├──────────────────────────────────────────────────────────────────┤
│  Edge Function: generate-campaign-proof                          │
│  - Gera PDF A4 com template HTML renderizado                     │
│  - Salva em Storage bucket "campaign-proofs"                     │
├──────────────────────────────────────────────────────────────────┤
│  Supabase                                                        │
│  ┌──────────────┐ ┌───────────────────┐ ┌──────────────────┐    │
│  │ Tabelas      │ │ Storage           │ │ RLS Policies     │    │
│  │ (5 novas)    │ │ campaign-proofs   │ │ Admin only       │    │
│  └──────────────┘ └───────────────────┘ └──────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Database (Migrations)

### Tabelas a Criar

#### 1. campaign_proofs (tabela principal)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | ID único |
| client_name | text NOT NULL | Nome do cliente |
| campaign_name | text NOT NULL | Nome da campanha |
| insertion_order | text NOT NULL | Pedido de Inserção (PI) |
| internal_number | text NULL | Número interno opcional |
| internal_code | text NULL | Código interno opcional |
| site_name | text DEFAULT 'Jornal Conexão na Cidade' | Nome do veículo |
| site_domain | text DEFAULT 'www.conexaonacidade.com.br' | Domínio |
| start_date | date NOT NULL | Data início |
| end_date | date NOT NULL | Data fim |
| status | text CHECK (draft, final, sent) | Status atual |
| created_by | uuid FK auth.users | Criador |
| created_at | timestamptz | Criação |
| updated_at | timestamptz | Atualização |

#### 2. campaign_proof_channels (canais de veiculação)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | ID único |
| campaign_proof_id | uuid FK CASCADE | Ref campanha |
| channel_name | text NOT NULL | Ex: "Site", "Newsletter", "Redes Sociais" |
| channel_value | text NULL | Valor ou descrição |
| channel_metric | text NULL | Métrica associada |
| sort_order | int DEFAULT 0 | Ordem de exibição |

#### 3. campaign_proof_assets (prints e imagens)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | ID único |
| campaign_proof_id | uuid FK CASCADE | Ref campanha |
| asset_type | text CHECK | VEICULACAO_PRINT, ANALYTICS_PRINT, CAPA_IMAGEM |
| file_path | text NOT NULL | Caminho no Storage |
| file_url | text NOT NULL | URL pública/signed |
| caption | text NULL | Legenda opcional |
| sort_order | int DEFAULT 0 | Ordem de exibição |
| created_at | timestamptz | Upload timestamp |

#### 4. campaign_proof_analytics (métricas manuais)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| campaign_proof_id | uuid PK FK | 1:1 com campaign_proofs |
| users | int NULL | Usuários |
| new_users | int NULL | Novos usuários |
| pageviews | int NULL | Visualizações |
| unique_pageviews | int NULL | Visualizações únicas |
| sessions | int NULL | Sessões |
| bounce_rate | numeric(5,2) NULL | Taxa de rejeição |
| avg_time | text NULL | Tempo médio |
| entrances | int NULL | Entradas |
| show_on_pdf | boolean DEFAULT false | Exibir no PDF |
| notes | text NULL | Observações |

#### 5. campaign_proof_documents (PDFs gerados)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | ID único |
| campaign_proof_id | uuid FK CASCADE | Ref campanha |
| doc_type | text CHECK | VEICULACAO, ANALYTICS, BOTH_ZIP |
| version | int DEFAULT 1 | Versão do documento |
| file_path | text NOT NULL | Caminho no Storage |
| file_url | text NULL | URL signed |
| file_size | bigint NULL | Tamanho em bytes |
| created_at | timestamptz | Geração timestamp |

### RLS Policies
- Somente usuários com role admin/editor podem acessar
- Usar função `is_admin_or_editor(auth.uid())` existente

---

## Fase 2: Storage Bucket

### Criar bucket: campaign-proofs (privado)

Estrutura de diretórios:
```text
campaign-proofs/
├── {campaign_id}/
│   ├── veiculacao/          # Prints de veiculação
│   │   ├── print-001.jpg
│   │   └── print-002.png
│   ├── analytics/           # Prints do Analytics
│   │   ├── overview.png
│   │   └── sources.png
│   └── generated/           # PDFs gerados
│       ├── veiculacao-v1.pdf
│       ├── veiculacao-v2.pdf
│       └── analytics-v1.pdf
```

### Policies
- INSERT: admin/editor autenticado
- SELECT: admin/editor autenticado
- DELETE: admin apenas

---

## Fase 3: Tipos TypeScript + Hooks

### Arquivo: src/types/campaign-proofs.ts

Tipos principais:
- CampaignProof
- CampaignProofChannel
- CampaignProofAsset
- CampaignProofAnalytics
- CampaignProofDocument
- CreateCampaignProofInput
- UpdateCampaignProofInput

### Arquivo: src/hooks/useCampaignProofs.ts

Hooks a implementar:
- `useCampaignProofs(filters)` - Lista com busca/filtros
- `useCampaignProof(id)` - Detalhes completos
- `useCreateCampaignProof()` - Criar campanha
- `useUpdateCampaignProof()` - Atualizar campanha
- `useDeleteCampaignProof()` - Excluir campanha
- `useDuplicateCampaignProof()` - Duplicar campanha

### Arquivo: src/hooks/useCampaignProofChannels.ts

- `useProofChannels(campaignId)` - Listar canais
- `useCreateProofChannel()` - Adicionar canal
- `useUpdateProofChannel()` - Editar canal
- `useDeleteProofChannel()` - Remover canal
- `useReorderProofChannels()` - Reordenar (drag & drop)
- `useApplyDefaultChannels()` - Aplicar modelo Conexão

### Arquivo: src/hooks/useCampaignProofAssets.ts

- `useProofAssets(campaignId, type?)` - Listar assets
- `useUploadProofAsset()` - Upload com progresso
- `useDeleteProofAsset()` - Remover asset
- `useReorderProofAssets()` - Reordenar

### Arquivo: src/hooks/useCampaignProofAnalytics.ts

- `useProofAnalytics(campaignId)` - Buscar métricas
- `useUpsertProofAnalytics()` - Criar/Atualizar métricas

### Arquivo: src/hooks/useCampaignProofDocuments.ts

- `useProofDocuments(campaignId)` - Histórico de PDFs
- `useGenerateProofPDF()` - Chamar Edge Function
- `useDownloadProofDocument()` - Baixar PDF com signed URL

---

## Fase 4: UI (Páginas e Componentes)

### Rotas a Adicionar (App.tsx)

| Rota | Componente | Descrição |
|------|------------|-----------|
| /admin/comprovantes | CampaignProofsList | Lista de campanhas |
| /admin/comprovantes/novo | CampaignProofEditor | Criar nova |
| /admin/comprovantes/:id | CampaignProofEditor | Editar existente |
| /admin/comprovantes/:id/exportar | CampaignProofExport | Preview e exportação |

### Adicionar ao Menu (AdminSidebar.tsx)

```text
Publicidade & Monetização
  └── Comprovantes        (novo item)
      - Ícone: FileCheck
      - Rota: /admin/comprovantes
```

### Componentes a Criar

#### Página: CampaignProofsList.tsx
- Header com título e botão "Nova Campanha"
- Barra de busca (por PI, campanha, cliente)
- Filtros: status, período
- Tabela com colunas: Cliente, Campanha, PI, Período, Status, Ações
- Ações: Editar, Duplicar, Gerar Veiculação, Gerar Analytics, Gerar Ambos, Baixar

#### Página: CampaignProofEditor.tsx
- Tabs: Dados | Canais | Veiculação | Analytics | Exportação
- Tab Dados: Formulário com campos da campanha
- Tab Canais: Lista editável + botão "Modelo Padrão Conexão"
- Tab Veiculação: Upload múltiplo + drag-to-reorder + preview
- Tab Analytics: Upload prints + campos manuais + toggle "exibir no PDF"
- Tab Exportação: Botões de geração + histórico de versões

#### Componentes Auxiliares

| Componente | Função |
|------------|--------|
| ProofDataForm | Formulário de dados básicos |
| ProofChannelsList | Lista editável de canais |
| ProofAssetUploader | Upload múltiplo com preview |
| ProofAnalyticsForm | Formulário de métricas manuais |
| ProofExportPanel | Botões de geração e histórico |
| ProofDocumentCard | Card de documento gerado |

---

## Fase 5: Edge Function (Geração de PDF)

### Arquivo: supabase/functions/generate-campaign-proof/index.ts

#### Input
```json
{
  "campaign_proof_id": "uuid",
  "doc_type": "VEICULACAO" | "ANALYTICS" | "BOTH"
}
```

#### Processo

1. **Validação**
   - Verificar se campanha existe
   - Para ANALYTICS: exigir pelo menos 1 print OU métricas manuais preenchidas

2. **Buscar dados**
   - Campanha + canais + assets + analytics_manual
   - Gerar signed URLs para assets (duração: 1 hora)

3. **Renderizar HTML**
   - Template capa: título, site, PI, campanha, número/código (se houver)
   - Página canais: lista formatada
   - Páginas de prints: grid 2x1 ou 3x1 por página
   - Rodapé: data de geração + domínio

4. **Converter para PDF**
   - Usar jsPDF (já disponível no projeto)
   - Formato A4
   - Margem 20mm

5. **Salvar no Storage**
   - Path: campaigns/{id}/generated/{tipo}-v{version}.pdf
   - Incrementar version

6. **Registrar em campaign_proof_documents**
   - doc_type, version, file_path

7. **Retornar**
   - URL signed do PDF
   - Metadados (version, size)

#### Para doc_type = BOTH
- Gerar ambos PDFs
- Criar ZIP com os dois
- Salvar ZIP no Storage

### Template HTML (simplificado)

```text
┌──────────────────────────────────────────┐
│         COMPROVANTE DE VEICULAÇÃO        │
│                                          │
│  Veículo: Jornal Conexão na Cidade       │
│  Site: www.conexaonacidade.com.br        │
│                                          │
│  Pedido de Inserção: PI-2024-001         │
│  Campanha: Black Friday 2024             │
│  Cliente: Loja Exemplo                   │
│  Período: 15/11/2024 a 30/11/2024        │
│                                          │
│  [Número: 12345] [Código: BF2024]        │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│     PEDIDOS DE INSERÇÃO - NOSSOS CANAIS  │
├──────────────────────────────────────────┤
│  ● Site Principal                        │
│  ● Newsletter Semanal (15.000 envios)    │
│  ● Redes Sociais (Instagram, Facebook)   │
│  ● Push Notifications                    │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│           PRINTS DE VEICULAÇÃO           │
├──────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐        │
│  │   Print 1   │  │   Print 2   │        │
│  └─────────────┘  └─────────────┘        │
│  Legenda 1         Legenda 2             │
└──────────────────────────────────────────┘
```

---

## Fase 6: Arquivos a Criar

### Novos Arquivos

| Arquivo | Descrição |
|---------|-----------|
| src/types/campaign-proofs.ts | Tipos TypeScript |
| src/hooks/useCampaignProofs.ts | CRUD campanhas |
| src/hooks/useCampaignProofChannels.ts | CRUD canais |
| src/hooks/useCampaignProofAssets.ts | Upload assets |
| src/hooks/useCampaignProofAnalytics.ts | Métricas manuais |
| src/hooks/useCampaignProofDocuments.ts | Documentos gerados |
| src/pages/admin/comprovantes/CampaignProofsList.tsx | Lista |
| src/pages/admin/comprovantes/CampaignProofEditor.tsx | Editor |
| src/components/admin/comprovantes/ProofDataForm.tsx | Form dados |
| src/components/admin/comprovantes/ProofChannelsList.tsx | Lista canais |
| src/components/admin/comprovantes/ProofAssetUploader.tsx | Upload |
| src/components/admin/comprovantes/ProofAnalyticsForm.tsx | Form analytics |
| src/components/admin/comprovantes/ProofExportPanel.tsx | Exportação |
| src/lib/campaignProofPdf.ts | Geração de PDF client-side |
| supabase/functions/generate-campaign-proof/index.ts | Edge Function |

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| AdminSidebar.tsx | Adicionar item "Comprovantes" |
| App.tsx | Adicionar rotas /admin/comprovantes/* |
| create-signed-url/index.ts | Adicionar "campaign-proofs" aos buckets permitidos |

---

## Fase 7: Ordem de Implementação

```text
1. [DB] Migration: Criar tabelas e RLS
2. [DB] Storage: Criar bucket campaign-proofs + policies
3. [TS] Criar tipos em src/types/campaign-proofs.ts
4. [TS] Criar hooks CRUD principais
5. [TS] Criar hooks de upload e documentos
6. [UI] Criar página CampaignProofsList
7. [UI] Criar página CampaignProofEditor + componentes
8. [UI] Adicionar rotas e menu
9. [PDF] Implementar geração client-side (jsPDF)
10. [Edge] Criar Edge Function para geração server-side (opcional)
11. [Test] Testar fluxo completo
```

---

## Modelo Padrão de Canais (Conexão na Cidade)

Ao clicar em "Aplicar Modelo Padrão", inserir:

| Canal | Valor | Métrica |
|-------|-------|---------|
| Site Principal | Banner destaque home | Impressões |
| Matérias Relacionadas | Inserção entre parágrafos | Visualizações |
| Newsletter | Envio semanal | Disparos |
| Redes Sociais | Facebook + Instagram | Alcance |
| Push Notifications | Notificação direta | Cliques |
| Exit-Intent | Modal de saída | Impressões |

---

## Critérios de Aceite

O módulo estará completo quando:

1. Menu "Comprovantes" visível em Publicidade & Monetização
2. Listagem com busca, filtros e paginação funcionando
3. Editor com todas as 5 abas funcionais
4. Upload de prints com drag-to-reorder
5. Métricas manuais opcionais salvando corretamente
6. Geração de PDF de Veiculação funcionando
7. Geração de PDF Analytics funcionando
8. Download de ZIP com ambos funcionando
9. Histórico de versões dos PDFs disponível
10. Nenhum erro de console ou TypeScript

