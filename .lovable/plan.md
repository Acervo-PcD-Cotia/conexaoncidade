
# Plano de Implementação: Emissão de NFS-e no Módulo Comprovantes de Campanha

## Resumo Executivo

Implementar funcionalidade de emissão de Nota Fiscal de Serviço Eletrônica (NFS-e) integrada ao módulo **Comprovantes de Campanha**, com foco em automação máxima conforme a "Regra do Benilton Freitas": o que muda entre notas é **apenas o número da PI na descrição**.

O sistema terá cliente padrão **Prefeitura do Município de Cotia** pré-configurado, permitindo emissão em 2 minutos sem retrabalho.

---

## Arquitetura Proposta

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MÓDULO EMISSÃO NFS-e                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  UI (React + Tailwind)                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────────────┐ │
│  │ EmitInvoiceModal│  │ClientSelectorMod│  │ InvoiceIssuedForm           │ │
│  │ (PI-only input) │  │(troca cliente)  │  │ (pós-emissão: nº nota, PDF) │ │
│  └─────────────────┘  └─────────────────┘  └──────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│  Botões de Atalho                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ "Emitir NF Prefeitura de Cotia" (atalho 1 clique, PI-only)         │    │
│  │ "Emitir Nota Fiscal" (fluxo padrão, cliente selecionável)          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Hooks (TanStack Query)                                                     │
│  useBillingClients, useBillingProvider, useProofInvoices                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Supabase (Database + Storage)                                              │
│  ┌──────────────────┐ ┌────────────────────┐ ┌─────────────────────────┐    │
│  │ billing_clients  │ │ billing_provider   │ │ campaign_proof_invoices │    │
│  │ (Tomadores)      │ │ (Prestador)        │ │ (NFS-e vinculada a PI)  │    │
│  └──────────────────┘ └────────────────────┘ └─────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Database (Migrations)

### 1.1 Tabela: billing_clients (Tomadores de Serviço)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | ID único |
| user_id | uuid FK auth.users | Dono do registro |
| legal_name | text NOT NULL | Razão social |
| cnpj | text NOT NULL | CNPJ formatado |
| im | text NULL | Inscrição Municipal |
| address_line | text NULL | Endereço completo |
| city | text NULL | Cidade |
| state | text NULL | UF |
| email | text NULL | Email do tomador |
| is_default | boolean DEFAULT false | Cliente padrão para emissão |
| is_active | boolean DEFAULT true | Ativo/inativo |
| created_at | timestamptz | Criação |

**Trigger obrigatório**: Ao setar `is_default=true`, setar todos os outros do `user_id` para `false`.

### 1.2 Tabela: billing_client_defaults (Configurações por Cliente)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | ID único |
| client_id | uuid FK billing_clients | Referência ao cliente |
| service_code | text DEFAULT '107' | Código do serviço municipal |
| cnae | text DEFAULT '6209100' | CNAE |
| iss_rate | numeric(5,2) DEFAULT 2.00 | Alíquota ISS |
| service_description_short | text | Descrição curta do serviço |
| invoice_text_template | text | Template com {PI} placeholder |
| created_at | timestamptz | Criação |

### 1.3 Tabela: billing_provider_profile (Prestador de Serviço)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | ID único |
| user_id | uuid UNIQUE FK auth.users | 1 por usuário |
| legal_name | text NOT NULL | Razão social |
| trade_name | text NULL | Nome fantasia |
| cnpj | text NOT NULL | CNPJ |
| im | text NULL | Inscrição Municipal |
| address_line | text NULL | Endereço |
| email | text NULL | Email |
| created_at | timestamptz | Criação |
| updated_at | timestamptz | Atualização |

### 1.4 Tabela: campaign_proof_invoices (NFS-e vinculada ao comprovante)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | ID único |
| user_id | uuid FK auth.users | Criador |
| campaign_proof_id | uuid FK campaign_proofs | Ref ao comprovante (opcional) |
| client_id | uuid FK billing_clients | Tomador |
| pi_number | text NOT NULL | Número da PI |
| description_final | text NOT NULL | Template renderizado com PI |
| service_code | text | Código do serviço |
| cnae | text | CNAE |
| iss_rate | numeric(5,2) | Alíquota |
| service_description_short | text | Descrição do serviço |
| status | text DEFAULT 'draft' | draft / issued |
| nf_number | text NULL | Número da NF (pós-emissão) |
| nf_verification_code | text NULL | Código de verificação |
| nf_issue_datetime | timestamptz NULL | Data/hora emissão |
| nf_pdf_url | text NULL | URL do PDF da NFS-e |
| client_snapshot | jsonb NULL | Snapshot do cliente na emissão |
| provider_snapshot | jsonb NULL | Snapshot do prestador |
| created_at | timestamptz | Criação |
| updated_at | timestamptz | Atualização |

### 1.5 Tabela: campaign_proof_invoice_files (Arquivos anexos)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | ID único |
| invoice_id | uuid FK campaign_proof_invoices | Ref à invoice |
| file_type | text CHECK | pi_pdf, evidence, nf_pdf, other |
| file_url | text NOT NULL | URL no Storage |
| file_name | text NULL | Nome original |
| created_at | timestamptz | Upload |

### 1.6 Tabela: campaign_proof_invoice_audit (Auditoria)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | ID único |
| invoice_id | uuid FK | Ref à invoice |
| user_id | uuid FK | Quem fez a ação |
| action | text | created, client_changed, issued, file_uploaded |
| meta | jsonb NULL | Dados adicionais |
| created_at | timestamptz | Timestamp |

---

## Fase 2: Seeds (Dados Pré-configurados)

### 2.1 Cliente Padrão: Prefeitura do Município de Cotia

```sql
INSERT INTO billing_clients (
  user_id, legal_name, cnpj, im, address_line, city, state, email, is_default
) VALUES (
  auth.uid(),
  'Prefeitura do Município de Cotia',
  '46.523.049/0001-20',
  '3000014',
  'Avenida Professor Manoel José Pedroso, 1347 – Parque Bahia',
  'Cotia',
  'SP',
  'contabilidade@cotia.sp.gov.br',
  true
);
```

### 2.2 Defaults do Cliente Prefeitura de Cotia

```sql
INSERT INTO billing_client_defaults (
  client_id, service_code, cnae, iss_rate, service_description_short, invoice_text_template
) VALUES (
  '<id_prefeitura>',
  '107',
  '6209100',
  2.00,
  'SUPORTE TÉCNICO, MANUTENÇÃO E OUTROS SERVIÇOS EM TECNOLOGIA DA INFORMAÇÃO',
  'AOS CUIDADOS DA VERBO COMUNICAÇÃO LTDA. CONTRATO Nº 055/2024.
REFERENTE À VEICULAÇÃO DE ANÚNCIO INSTITUCIONAL NO PORTAL CONEXÃO NA CIDADE.
PEDIDO DE INSERÇÃO (PI): Nº {PI}.'
);
```

### 2.3 Prestador Padrão: Benilton Silva Freitas

Criar via UI na primeira execução ou seed:

```sql
INSERT INTO billing_provider_profile (
  user_id, legal_name, trade_name, cnpj, im, address_line, email
) VALUES (
  auth.uid(),
  'Benilton Silva Freitas – Informática',
  'Conexão na Cidade',
  '13.794.818/0001-75',
  '6023077',
  'Rua da Fraternidade, 343 – Jardim Cotia – Cotia/SP',
  'conexaonacidade@gmail.com'
);
```

---

## Fase 3: Storage

### Bucket: campaign-invoices (privado)

Estrutura:
```text
campaign-invoices/
├── {invoice_id}/
│   ├── nf-pdf/           # PDF da NFS-e emitida
│   │   └── nf-12345.pdf
│   ├── evidence/         # Comprovantes adicionais
│   │   └── comprovante.jpg
│   └── pi-pdf/           # PDF da PI relacionada
│       └── pi-269.pdf
```

### Policies RLS

- INSERT/SELECT/UPDATE/DELETE: apenas quando `user_id = auth.uid()`

---

## Fase 4: Tipos TypeScript

### Arquivo: src/types/billing.ts

```typescript
export interface BillingClient {
  id: string;
  user_id: string;
  legal_name: string;
  cnpj: string;
  im: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  email: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface BillingClientDefaults {
  id: string;
  client_id: string;
  service_code: string;
  cnae: string;
  iss_rate: number;
  service_description_short: string;
  invoice_text_template: string;
  created_at: string;
}

export interface BillingProviderProfile {
  id: string;
  user_id: string;
  legal_name: string;
  trade_name: string | null;
  cnpj: string;
  im: string | null;
  address_line: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProofInvoice {
  id: string;
  user_id: string;
  campaign_proof_id: string | null;
  client_id: string;
  pi_number: string;
  description_final: string;
  service_code: string;
  cnae: string;
  iss_rate: number;
  service_description_short: string;
  status: 'draft' | 'issued';
  nf_number: string | null;
  nf_verification_code: string | null;
  nf_issue_datetime: string | null;
  nf_pdf_url: string | null;
  client_snapshot: Record<string, any> | null;
  provider_snapshot: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export type InvoiceFileType = 'pi_pdf' | 'evidence' | 'nf_pdf' | 'other';

export interface ProofInvoiceFile {
  id: string;
  invoice_id: string;
  file_type: InvoiceFileType;
  file_url: string;
  file_name: string | null;
  created_at: string;
}
```

---

## Fase 5: Hooks

### Arquivo: src/hooks/useBillingClients.ts

- `useBillingClients()` - Lista todos os clientes ativos do usuário
- `useBillingClient(id)` - Detalhes de um cliente
- `useDefaultBillingClient()` - Busca cliente com `is_default=true`
- `useCreateBillingClient()` - Criar novo cliente
- `useUpdateBillingClient()` - Atualizar cliente
- `useSetDefaultBillingClient()` - Define como padrão (trigger cuida do resto)
- `useBillingClientDefaults(clientId)` - Busca defaults do cliente

### Arquivo: src/hooks/useBillingProvider.ts

- `useBillingProvider()` - Perfil do prestador atual
- `useCreateBillingProvider()` - Criar perfil inicial
- `useUpdateBillingProvider()` - Atualizar perfil

### Arquivo: src/hooks/useProofInvoices.ts

- `useProofInvoices(proofId?)` - Lista invoices (opcionalmente por comprovante)
- `useProofInvoice(id)` - Detalhes de uma invoice
- `useCreateProofInvoice()` - Criar nova invoice (draft)
- `useUpdateProofInvoice()` - Atualizar invoice
- `useMarkInvoiceIssued()` - Marcar como emitida (preencher nf_number, etc)
- `useProofInvoiceFiles(invoiceId)` - Arquivos anexos
- `useUploadInvoiceFile()` - Upload de arquivo

---

## Fase 6: Componentes UI

### 6.1 Componente: EmitInvoiceModal

**Localização**: `src/components/admin/comprovantes/EmitInvoiceModal.tsx`

**Funcionalidades**:
- Modal com formulário de emissão
- Cliente travado (default: Prefeitura de Cotia) com botão [Alterar cliente]
- Input `pi_number` (obrigatório, focado automaticamente)
- Descrição renderizada em tempo real ao digitar PI
- Serviço/ISS/CNAE puxados do `billing_client_defaults`
- Botões: "Copiar Descrição", "Salvar Rascunho", "Fechar"

**Props**:
```typescript
interface EmitInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proofId?: string;
  forceClient?: string; // ID do cliente (para atalho Prefeitura)
  onSuccess?: (invoiceId: string) => void;
}
```

### 6.2 Componente: ClientSelectorModal

**Localização**: `src/components/admin/comprovantes/ClientSelectorModal.tsx`

**Funcionalidades**:
- Lista de clientes cadastrados
- Select + busca
- Botão [+ Novo cliente] abre NewClientModal
- Toggle "Definir como padrão"
- Opção default: "Usar só nesta emissão"

### 6.3 Componente: NewClientModal

**Localização**: `src/components/admin/comprovantes/NewClientModal.tsx`

**Funcionalidades**:
- Formulário de cadastro de novo tomador
- Campos: Razão social, CNPJ, IM, Endereço, Email
- Checkbox "Definir como padrão"
- Botão Salvar

### 6.4 Componente: InvoiceIssuedForm

**Localização**: `src/components/admin/comprovantes/InvoiceIssuedForm.tsx`

**Funcionalidades**:
- Formulário pós-emissão
- Inputs: Número da NF, Código de Verificação, Data/Hora
- Upload do PDF da NFS-e
- Botão "Marcar como Emitida"

### 6.5 Componente: ProofInvoiceCard

**Localização**: `src/components/admin/comprovantes/ProofInvoiceCard.tsx`

**Funcionalidades**:
- Card resumo de uma invoice
- Status badge (Rascunho / Emitida)
- Ações: Editar, Copiar Descrição, Marcar Emitida, Download PDF

### 6.6 Componente: CopyToClipboardButton

**Localização**: `src/components/admin/comprovantes/CopyToClipboardButton.tsx`

**Funcionalidades**:
- Botão que copia texto para clipboard
- Feedback visual (toast "Copiado!")

---

## Fase 7: Integração na UI Existente

### 7.1 Modificar: ProofExportPanel.tsx

Adicionar nova seção "Nota Fiscal" com:
- Botão destacado: **"Emitir NF Prefeitura de Cotia"** (atalho)
- Botão secundário: **"Emitir Nota Fiscal"** (fluxo padrão)
- Lista de invoices já criadas para este comprovante

### 7.2 Modificar: CampaignProofEditor.tsx

Adicionar nova aba **"Nota Fiscal"** no TabsList:
- Mostra formulário de emissão rápida
- Lista de notas emitidas para este comprovante
- Histórico de ações

### 7.3 Modificar: CampaignProofsList.tsx

Adicionar no DropdownMenu de ações:
- "Emitir NF Prefeitura de Cotia" (atalho direto)
- "Emitir Nota Fiscal" (fluxo padrão)

---

## Fase 8: Função de Renderização de Template

### Arquivo: src/lib/invoiceTemplate.ts

```typescript
/**
 * Renderiza o template de descrição substituindo {PI} pelo número real
 */
export function renderInvoiceDescription(template: string, piNumber: string): string {
  return template.replace(/{PI}/g, piNumber);
}

/**
 * Template padrão da Prefeitura de Cotia
 */
export const PREFEITURA_COTIA_TEMPLATE = `AOS CUIDADOS DA VERBO COMUNICAÇÃO LTDA. CONTRATO Nº 055/2024.
REFERENTE À VEICULAÇÃO DE ANÚNCIO INSTITUCIONAL NO PORTAL CONEXÃO NA CIDADE.
PEDIDO DE INSERÇÃO (PI): Nº {PI}.`;
```

---

## Fase 9: Páginas Admin (Opcional)

### 9.1 Página: /admin/settings/billing-clients

CRUD de clientes/tomadores de serviço:
- Lista com busca
- Botão definir padrão
- Editar/excluir

### 9.2 Página: /admin/settings/billing-provider

Perfil do prestador:
- Formulário único
- Editável uma vez, reaproveitável sempre

---

## Ordem de Implementação (Build Order)

| Ordem | Fase | Descrição | Prioridade |
|-------|------|-----------|------------|
| 1 | Migration | Criar tabelas billing_clients, billing_client_defaults, billing_provider_profile, campaign_proof_invoices, etc + RLS + triggers | 🔴 CRÍTICA |
| 2 | Storage | Criar bucket campaign-invoices + policies | 🔴 CRÍTICA |
| 3 | Seeds | Inserir Prefeitura de Cotia como cliente padrão + defaults | 🔴 CRÍTICA |
| 4 | Tipos | Criar src/types/billing.ts | 🟡 ALTA |
| 5 | Hooks | Criar useBillingClients, useBillingProvider, useProofInvoices | 🟡 ALTA |
| 6 | UI Modal | Criar EmitInvoiceModal com PI-only input | 🟡 ALTA |
| 7 | Atalho | Adicionar botão "Emitir NF Prefeitura de Cotia" no ProofExportPanel | 🟡 ALTA |
| 8 | Client Modal | Criar ClientSelectorModal e NewClientModal | 🟢 MÉDIA |
| 9 | Pós-emissão | Criar InvoiceIssuedForm (nº nota, PDF) | 🟢 MÉDIA |
| 10 | Auditoria | Implementar logging em campaign_proof_invoice_audit | 🔵 BAIXA |
| 11 | Admin Pages | Criar páginas de gestão de clientes e prestador | 🔵 BAIXA |

---

## Resumo de Arquivos

### Novos Arquivos

| Arquivo | Descrição |
|---------|-----------|
| supabase/migrations/XXXX_billing_tables.sql | Migration com todas as tabelas |
| src/types/billing.ts | Tipos TypeScript |
| src/hooks/useBillingClients.ts | CRUD clientes/tomadores |
| src/hooks/useBillingProvider.ts | Perfil do prestador |
| src/hooks/useProofInvoices.ts | CRUD invoices |
| src/lib/invoiceTemplate.ts | Função de renderização |
| src/components/admin/comprovantes/EmitInvoiceModal.tsx | Modal de emissão |
| src/components/admin/comprovantes/ClientSelectorModal.tsx | Troca de cliente |
| src/components/admin/comprovantes/NewClientModal.tsx | Novo cliente |
| src/components/admin/comprovantes/InvoiceIssuedForm.tsx | Pós-emissão |
| src/components/admin/comprovantes/ProofInvoiceCard.tsx | Card de invoice |
| src/components/admin/comprovantes/CopyToClipboardButton.tsx | Copiar texto |

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| src/components/admin/comprovantes/ProofExportPanel.tsx | Adicionar seção NF + botões |
| src/pages/admin/comprovantes/CampaignProofEditor.tsx | Adicionar aba "Nota Fiscal" |
| src/pages/admin/comprovantes/CampaignProofsList.tsx | Adicionar ações no dropdown |
| src/types/campaign-proofs.ts | Adicionar refs de invoice |

---

## Critérios de Aceite (Definition of Done)

O módulo estará completo quando:

1. Botão **"Emitir NF Prefeitura de Cotia"** visível em cada comprovante
2. Ao clicar, abre modal com cliente travado (Prefeitura)
3. Cursor focado no input de PI
4. Ao digitar PI, descrição renderiza em tempo real
5. Botão **"Copiar Descrição"** funciona (feedback toast)
6. Ao salvar, cria invoice em status `draft`
7. Após emitir no portal da Prefeitura, preencher nº nota + upload PDF
8. Status muda para `issued`
9. Histórico de notas visível no comprovante
10. Tempo total de emissão: **menos de 2 minutos**
