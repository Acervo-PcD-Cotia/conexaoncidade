

# Plano: Unificar Layout do /admin com /auth (Estilo CDM Brasil)

## Objetivo
Refazer a tela de "Autenticação Necessária" (`AccessDeniedScreen`) para seguir o mesmo layout de 2 colunas da página `/auth`, com as seguintes alterações visuais:
- Coluna esquerda: apenas logo (sem textos "Acesse sua conta" e "Painel Conexões")
- Coluna esquerda: fundo laranja bem claro

---

## Comparação Visual

| Aspecto | Atual (`/admin` não autenticado) | Novo (CDM Style) |
|---------|----------------------------------|------------------|
| Layout | Card centralizado | 2 colunas (60/40) |
| Coluna esquerda | N/A | Logo grande + fundo laranja claro |
| Coluna direita | Card com ícone ShieldX | Card branco com mensagem e botões |
| Fundo | `bg-background` (escuro) | Laranja claro (esquerda) + cinza (direita) |

---

## Estrutura Visual Proposta

```text
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────────────────┐  ┌────────────────────────────┐  │
│  │                          │  │                            │  │
│  │                          │  │         [ShieldX]          │  │
│  │                          │  │                            │  │
│  │        [LOGO CNC]        │  │   Autenticação Necessária  │  │
│  │        Grande            │  │                            │  │
│  │                          │  │   Você precisa estar       │  │
│  │                          │  │   logado para acessar...   │  │
│  │                          │  │                            │  │
│  │                          │  │   Redirecionando em Xs...  │  │
│  │                          │  │                            │  │
│  │                          │  │   [Início]    [Entrar]     │  │
│  │                          │  │                            │  │
│  └──────────────────────────┘  └────────────────────────────┘  │
│   bg: laranja bem claro           bg: cinza claro + card      │
│   (#fef3e7 ou similar)            branco                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detalhes de Implementação

### 1. Coluna Esquerda (Branding)
- Fundo: **laranja bem claro** (`bg-orange-50` ou `#fef3e7`)
- Conteúdo: **apenas o logo** (sem textos)
- Logo grande centralizado (`h-24` a `h-32`)
- Borda direita sutil no desktop

### 2. Coluna Direita (Card de Mensagem)
- Fundo: cinza claro (`bg-muted/30`)
- Card branco com sombra e bordas arredondadas
- Ícone ShieldX (mantido)
- Título e descrição (mantidos)
- Contador de redirecionamento (mantido)
- Botões "Início" e "Entrar" (mantidos)

### 3. Responsividade
- Desktop (`lg:` e acima): Grid 2 colunas (60/40)
- Mobile/Tablet: Coluna única empilhada (logo em cima com fundo laranja, card embaixo)

---

## Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/auth/AccessDeniedScreen.tsx` | Refatorar para layout 2 colunas com fundo laranja claro na esquerda |

---

## Código: Nova Estrutura do AccessDeniedScreen

A estrutura seguirá o padrão do `Auth.tsx`:

```tsx
// Layout principal - 2 colunas
<div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[60%_40%]">
  
  {/* Coluna Esquerda - Logo com fundo laranja claro */}
  <div className="flex items-center justify-center py-12 px-6 lg:py-0 bg-orange-50 lg:border-r lg:border-orange-100">
    <img 
      src={logoFull} 
      alt="Conexão na Cidade" 
      className="h-24 lg:h-32 w-auto"
    />
  </div>

  {/* Coluna Direita - Card de mensagem */}
  <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-muted/30">
    <Card className="w-full max-w-md ...">
      {/* Conteúdo existente do card */}
    </Card>
  </div>
  
</div>
```

---

## Importações a Adicionar

```tsx
import logoFull from "@/assets/logo-full.png";
```

---

## Cor Laranja Claro - Opções

| Opção | Classe Tailwind | Hex |
|-------|-----------------|-----|
| Opção 1 | `bg-orange-50` | `#fff7ed` |
| Opção 2 | `bg-primary/5` | Baseado na cor primária |
| Opção 3 (custom) | `bg-[#fef3e7]` | Laranja mais suave |

A melhor opção é `bg-orange-50` por ser uma classe Tailwind nativa e combinar bem com a identidade laranja do Conexão.

---

## Critérios de Aceite

- [ ] Layout 2 colunas no desktop (60/40), igual ao `/auth`
- [ ] Coluna esquerda com fundo laranja bem claro (`bg-orange-50`)
- [ ] Apenas logo na coluna esquerda (sem textos)
- [ ] Card de mensagem na coluna direita (funcionalidade mantida)
- [ ] Mobile: layout empilhado (logo com fundo laranja em cima)
- [ ] Botões "Início" e "Entrar" funcionando
- [ ] Contador de redirecionamento funcionando
- [ ] Diferenciação entre "not_authenticated" e "not_authorized" mantida

