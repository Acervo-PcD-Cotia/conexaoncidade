

# Plano: Otimização do Funil Fórmula Conexão

## Problema 1: Menu/Nav sobrepondo a Landing Page

A rota `/formula-conexao` está dentro do `PublicLayout` (linha 490 do App.tsx), que inclui Header, Footer, TopAudioPlayer, AccessibilityPanel e outros overlays. Isso polui a experiência de venda.

**Solução**: Mover a rota para fora do `PublicLayout`, como já acontece com `/story/:slug` e `/webstory/:campaignId` (linhas 493-494). A página já é self-contained com seu próprio fundo e footer.

**Arquivo**: `src/App.tsx` — mover a rota `/formula-conexao` para fora do bloco `<Route element={<PublicLayout />}>`.

---

## Problema 2: "Implementar o plano completo"

O sistema já está implementado (quiz, countdown, landing page premium, pilares, timeline, pacto, disponibilidade, depoimentos, preço). Todos os componentes existem e funcionam. Não há pendências de implementação do plano original.

---

## Problema 3: Integração WhatsApp (Confirmação automática ao lead)

Criar uma edge function que envia mensagem via WhatsApp Business API após o quiz ser completado.

### Requisitos:
- **Secret necessário**: `WHATSAPP_ACCESS_TOKEN` (token permanente do Meta Business). Já existe `WHATSAPP_PHONE_ID` como variável? Não — precisarei pedir ambos.
- Na verdade, os secrets `WHATSAPP_PHONE_ID` e `WHATSAPP_ACCESS_TOKEN` não existem. Precisarei solicitar ao usuário.

### Arquitetura:
1. **Edge Function** `send-whatsapp-confirmation/index.ts`:
   - Recebe `{ phone, nome, negocio }` via POST
   - Envia template message via WhatsApp Cloud API
   - Usa secrets `WHATSAPP_ACCESS_TOKEN` e `WHATSAPP_PHONE_ID`

2. **FormulaQuizWizard.tsx**: Após salvar o lead no banco, chamar a edge function para enviar a confirmação.

### Bloqueio:
Precisarei solicitar ao usuário os secrets `WHATSAPP_ACCESS_TOKEN` e `WHATSAPP_PHONE_ID` antes de a integração funcionar. A edge function será criada e deployada, mas só funcionará após os secrets serem configurados.

---

## Arquivos a Editar/Criar

| Ação | Arquivo |
|------|---------|
| Editar | `src/App.tsx` (mover rota para fora do PublicLayout) |
| Criar | `supabase/functions/send-whatsapp-confirmation/index.ts` |
| Editar | `src/components/formula-conexao/FormulaQuizWizard.tsx` (chamar edge function) |

