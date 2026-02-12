
# Fix Definitivo: React Error #185 -- CampaignForm

## Causa Raiz Confirmada (com evidencia)

A tabela `system_logs` registra 4 ocorrencias do Error #185, todas na rota `/admin/campaigns/new`, **incluindo apos todas as correcoes anteriores** (Collapsible removido, Select values corrigidos). Isso confirma que a causa raiz NAO era o Collapsible nem os valores vazios dos Selects.

A analise do component stack do erro mostra:
```text
button -> Radix Slot -> Radix Primitives -> SelectTrigger -> SelectValue -> Select
-> ... -> Card -> CardContent -> form -> CampaignForm -> CampaignEditor
```

O erro origina-se no Select de **status** dentro do `CampaignForm.tsx`, que e o UNICO Select usando o padrao `watch()` + `setValue()` do react-hook-form. Todos os outros Selects (canais, configs) usam `useState` e NAO crasham.

### O Problema Tecnico

```tsx
// ESTE padrao causa o loop:
const status = watch('status');  // Cria subscription -> re-render quando status muda

<Select
  value={status}
  onValueChange={(value) => setValue('status', value)}  // Dispara update -> watch detecta -> re-render -> ...
>
```

`watch('status')` forca re-render a cada mudanca. O Radix Select internamente sincroniza o `value` prop com seu estado, o que pode disparar `onValueChange` durante a reconciliacao, criando o ciclo:

1. `watch` detecta mudanca -> re-render
2. Select recebe novo `value` -> sincroniza internamente
3. Sincronizacao dispara `onValueChange`
4. `setValue` atualiza form state
5. `watch` detecta mudanca -> volta ao passo 1

Este bug e uma [classe conhecida de problemas](https://github.com/react-hook-form/react-hook-form/issues/4646) entre react-hook-form e componentes Radix controlados.

## Solucao

Substituir `watch('status')` + `setValue('status')` por `useState`, seguindo o MESMO padrao ja usado para TODOS os outros campos controlados do formulario (selectedChannels, adsConfig, pushConfig, etc.).

### Alteracao 1: CampaignForm.tsx

**Remover** o uso de `watch` e `setValue` para o campo status:

```tsx
// ANTES (causa o loop):
const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CampaignFormData>({...});
const status = watch('status');
// ...
<Select value={status} onValueChange={(value) => setValue('status', value as CampaignStatus)}>

// DEPOIS (seguro):
const { register, handleSubmit, formState: { errors } } = useForm<CampaignFormData>({...});
const [status, setStatus] = useState<CampaignStatus>(initialData?.status || 'draft');
// ...
<Select value={status} onValueChange={(v) => setStatus(v as CampaignStatus)}>
```

E no submit handler, incluir `status` no payload:

```tsx
onSubmit({
  ...data,
  status,  // <-- adicionar aqui
  enabledChannels: selectedChannels,
  ...
});
```

### Alteracao 2: Remover `watch` e `setValue` dos imports

Como `watch` e `setValue` nao serao mais usados em nenhum lugar do componente, remover dos imports do `useForm`.

## Arquivos alterados

| Arquivo | Alteracao |
|---|---|
| `src/components/admin/campaigns/CampaignForm.tsx` | Substituir `watch('status')` + `setValue` por `useState` para o campo status |

## Detalhes tecnicos

1. Adicionar `const [status, setStatus] = useState<CampaignStatus>(initialData?.status || 'draft')` junto dos outros useState (linha ~92)
2. Remover `watch` e `setValue` do destructuring do `useForm` (linha 41)
3. Remover `const status = watch('status')` (linha 110)
4. Alterar o Select onValueChange de `setValue('status', value)` para `setStatus(value as CampaignStatus)` (linha 304)
5. Incluir `status` no objeto passado ao `onSubmit` (linha 224)
6. Remover `status` do `defaultValues` do `useForm` (opcional, limpeza)

## Por que isso resolve

- Elimina a interacao entre `watch()` (que forca re-render via subscription) e o Radix Select (que pode disparar `onValueChange` durante reconciliacao)
- Usa o padrao `useState` que ja funciona corretamente para TODOS os outros 8+ campos controlados do formulario
- Nao muda comportamento visivel -- o Select continua controlado, so muda a fonte de verdade de react-hook-form para useState local

## Evidencia de que e a causa

1. O component stack do erro mostra o crash originando em `button -> SelectTrigger -> Select -> Card -> form -> CampaignForm`
2. O UNICO Select diretamente dentro de CampaignForm (nao dentro de ChannelSelector) e o Select de status
3. O UNICO campo usando `watch()` + `setValue()` e o status -- todos os outros usam `useState`
4. O erro persiste APOS remocao do Collapsible e correcao dos valores de Select (4 ocorrencias no banco apos as correcoes)
5. A classe de bug `watch + setValue + Radix Select` e documentada em issues do react-hook-form
