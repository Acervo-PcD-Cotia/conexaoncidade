

# Plano de Redesign: Tela de Login Estilo CDM Brasil

## Objetivo
Redesenhar a tela de login (`/auth`) seguindo o layout clean do CDM Brasil (2 colunas), mantendo a identidade visual do Conexão na Cidade (cores laranja + logo) e preservando toda a lógica de autenticação existente.

---

## Comparação: Atual vs. Novo

| Aspecto | Atual | Novo (CDM Style) |
|---------|-------|------------------|
| Layout | Card centralizado | 2 colunas (60/40) |
| Logo | Pequeno no topo do card | Grande na coluna esquerda |
| Tabs Login/Signup | Sim, dentro do card | Apenas Login (signup via contato) |
| Mobile | Responsivo simples | Empilhado (logo em cima) |
| Fundo | Gradiente escuro | Cinza claro (#f5f7fa) |

---

## Estrutura Visual

```text
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────────────────┐  ┌────────────────────────────┐  │
│  │                          │  │                            │  │
│  │                          │  │   E-mail                   │  │
│  │        [LOGO CNC]        │  │   ┌────────────────────┐   │  │
│  │        Grande            │  │   │ 📧 email@...       │   │  │
│  │                          │  │   └────────────────────┘   │  │
│  │   "Acesse sua conta"     │  │                            │  │
│  │   "Painel Conexões"      │  │   Senha                    │  │
│  │                          │  │   ┌────────────────────┐   │  │
│  │                          │  │   │ 🔒 ••••••••   👁   │   │  │
│  │                          │  │   └────────────────────┘   │  │
│  │                          │  │                            │  │
│  │                          │  │   [  ENTRAR  ] full-width  │  │
│  │                          │  │                            │  │
│  │                          │  │   Esqueceu sua senha?      │  │
│  │                          │  │                            │  │
│  │                          │  │   ─────────────────────    │  │
│  │                          │  │   Não tem conta? Contate   │  │
│  │                          │  │   o administrador.         │  │
│  │                          │  │                            │  │
│  │                          │  │   © Conexão na Cidade      │  │
│  └──────────────────────────┘  └────────────────────────────┘  │
│        bg: #f5f7fa                     Card branco             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detalhes de Implementação

### 1. Layout Principal
- Div `min-h-screen` com grid de 2 colunas no desktop (`lg:grid-cols-[60%_40%]`)
- Mobile: `flex-col` empilhado
- Background: cinza claro (`bg-gray-50` ou `#f5f7fa`)

### 2. Coluna Esquerda (Branding)
- Centralizado vertical e horizontal
- Logo grande (`h-24` ou maior)
- Texto: "Acesse sua conta" + "Painel Conexões"
- Fundo: mesmo cinza claro, borda direita sutil no desktop

### 3. Coluna Direita (Card de Login)
- Card branco com `shadow-lg`, `rounded-xl`, `border border-gray-200`
- Padding generoso (`p-8`)
- Campos com ícones (Mail, Lock)
- Toggle de visibilidade de senha (Eye/EyeOff)
- Botão "Entrar" com cor primária (laranja) full-width
- Link "Esqueceu sua senha?" -> `/reset-password`
- Texto inferior: "Não tem uma conta? Entre em contato com o administrador."
- Footer: "© Conexão na Cidade - Todos os direitos reservados"

### 4. Responsividade
- Desktop (`lg:` e acima): Grid 2 colunas
- Mobile/Tablet: Coluna única empilhada (logo em cima, card embaixo)
- Padding ajustado para mobile

### 5. Acessibilidade
- Labels associados com `htmlFor`
- TabIndex correto
- Mensagens de erro visíveis abaixo dos campos
- Aria-labels nos botões

---

## Mudanças no Código

### Arquivo: `src/pages/Auth.tsx`

**O que será mantido:**
- Todos os imports existentes
- Constantes `ADMIN_ROLES` e `ROLE_ROUTES`
- Schema de validação `loginSchema`
- Lógica do `useEffect` para redirecionamento
- Função `handleLogin` completa
- Estado de loading e submitting

**O que será removido:**
- Tabs de Login/Signup (apenas login nesta tela)
- Schema `signupSchema` e estados de signup
- Função `handleSignup`

**O que será adicionado:**
- Novo layout 2 colunas
- Toggle de visibilidade de senha
- Ícone Eye/EyeOff
- Link "Esqueceu sua senha?"
- Texto "Não tem conta? Contate admin"
- Footer com copyright

---

## Cores e Estilo

```css
/* Background da página */
bg-gray-50 ou bg-[#f5f7fa]

/* Card */
bg-white border border-gray-200 shadow-lg rounded-xl

/* Campos */
Input com bg-gray-50/50 no focus, borda sutil

/* Botão Entrar */
bg-primary (laranja) hover:bg-primary/90

/* Links */
text-primary hover:underline

/* Texto secundário */
text-muted-foreground ou text-gray-500
```

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/Auth.tsx` | Reescrever JSX com novo layout, remover signup |

---

## Critérios de Aceite

- [ ] Layout 2 colunas no desktop (60/40)
- [ ] Logo grande na esquerda com texto "Acesse sua conta"
- [ ] Card de login na direita com campos e botão
- [ ] Toggle de visibilidade de senha funcional
- [ ] Link "Esqueceu sua senha?" -> `/reset-password`
- [ ] Mobile: layout empilhado responsivo
- [ ] Mantém login funcionando (mesma lógica)
- [ ] Cores laranja do Conexão preservadas
- [ ] Acessibilidade: labels, tabindex, erros visíveis

---

## Observação sobre Signup

O novo design foca apenas no login, seguindo o padrão CDM. O texto "Não tem uma conta? Entre em contato com o administrador" substitui o fluxo de cadastro público. Se futuramente for necessário manter o signup, pode-se criar uma rota separada (`/cadastro`) ou um link condicional.

