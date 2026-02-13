

# Redesenhar Pagina de Login e Corrigir Logout

## Resumo

Tres mudancas principais:
1. Ao clicar "Sair" no painel, redirecionar direto para `/spah` (pagina de login)
2. Redesenhar o lado esquerdo da pagina de login: fundo amarelo, logo maior no topo, area de campanhas abaixo
3. Corrigir rotas `/admin` remanescentes em `Auth.tsx` (ROLE_ROUTES ainda aponta para `/admin`)

---

## Mudancas Detalhadas

### 1. Corrigir Logout - Redirecionar para `/spah`

**Arquivo**: `src/components/admin/AdminHeader.tsx`

Atualmente o `signOut` apenas desloga sem redirecionar. Precisa navegar para `/spah` apos o signOut.

Adicionar `useNavigate` e fazer:
```text
const handleSignOut = async () => {
  await signOut();
  navigate("/spah");
};
```

### 2. Corrigir ROLE_ROUTES em Auth.tsx

**Arquivo**: `src/pages/Auth.tsx`

As rotas de redirecionamento pos-login ainda apontam para `/admin` em vez de `/spah/painel`:

```text
ROLE_ROUTES = {
  super_admin: '/spah/painel',
  admin: '/spah/painel',
  editor_chief: '/spah/painel',
  editor: '/spah/painel/news',
  reporter: '/spah/painel/news',
  columnist: '/spah/painel/news',
  moderator: '/spah/painel',
  commercial: '/spah/painel/ads',
  financial: '/spah/painel/financial',
}
```

E o fallback na linha 58 tambem muda de `'/admin'` para `'/spah/painel'`.

### 3. Redesenhar Painel Esquerdo da Pagina de Login

**Arquivo**: `src/pages/Auth.tsx`

O lado esquerdo da pagina sera redesenhado:
- **Fundo amarelo** (mantendo a identidade visual, como o usuario solicitou)
- **Logo maior** posicionado mais acima (nao centralizado verticalmente, mas no terco superior)
- **Area de campanhas** abaixo do logo, exibindo campanhas ativas marcadas como `login_panel_visible`
- Remover o texto "Acesse sua conta / Painel Conexoes" do lado esquerdo (fica apenas no mobile)

O componente `LoginPanelAd` sera atualizado para:
- Buscar **multiplas** campanhas ativas (nao apenas 1) que tenham o campo `login_panel_visible = true`
- Exibir como cards/banners empilhados verticalmente com scroll
- Cada campanha mostra imagem, nome do anunciante e CTA

### 4. Campo `login_panel_visible` nas campanhas

**Banco de dados**: Adicionar coluna `login_panel_visible` (boolean, default false) na tabela `campaigns_unified`.

Isso permite que o admin escolha quais campanhas aparecem na pagina de login sem depender do canal `login_panel` das Campanhas 360.

### 5. Toggle no admin para campanhas no login

**Arquivo**: Na listagem de campanhas ou na edicao de campanha, adicionar um switch "Exibir no Painel de Login" que controla o campo `login_panel_visible`.

Alternativa mais simples: adicionar a opcao diretamente na pagina de campanhas existente como uma coluna/toggle.

---

## Arquivos Modificados

| Arquivo | Tipo | Descricao |
|---|---|---|
| `src/components/admin/AdminHeader.tsx` | MODIFICAR | Redirect para `/spah` no signOut |
| `src/pages/Auth.tsx` | MODIFICAR | ROLE_ROUTES + redesign do painel esquerdo |
| `src/components/auth/LoginPanelAd.tsx` | MODIFICAR | Buscar multiplas campanhas visiveis, layout vertical |
| Migracao SQL | NOVO | Coluna `login_panel_visible` em `campaigns_unified` |

## Detalhes Tecnicos

### Layout do painel esquerdo (Auth.tsx)

```text
+---------------------------+
| [bg-yellow-400]           |
|                           |
|     [LOGO grande]         |
|     (h-32 a h-40)         |
|                           |
|  --- area campanhas ---   |
|  [Banner campanha 1]     |
|  [Banner campanha 2]     |
|  [Banner campanha 3]     |
|  (scroll se necessario)   |
|                           |
|  "Conteudo de Marca"      |
+---------------------------+
```

### Consulta de campanhas para o login

O `LoginPanelAd` passara a buscar todas campanhas com `login_panel_visible = true` e `status = active`, exibindo-as em formato de carrossel ou lista vertical com scroll.

### Migracao SQL

```text
ALTER TABLE campaigns_unified 
ADD COLUMN login_panel_visible boolean DEFAULT false;
```

Nenhuma RLS adicional necessaria pois a tabela ja possui politicas.
