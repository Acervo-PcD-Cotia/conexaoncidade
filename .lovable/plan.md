
# Plano: Corrigir Banner Cortado e Atualizar Logotipo

## 1. Substituir o logotipo do site

**O que sera feito:**
- Copiar a nova imagem do logo (`CONEXÃO_LOGO_03-2.png`) para `src/assets/logo-full.png`, substituindo o logo atual
- Aumentar o tamanho do logo no header de `h-[50px]/h-[60px]/h-[70px]` para `h-[60px]/h-[75px]/h-[90px]` para maior destaque visual no canto esquerdo

**Arquivo: `src/components/layout/Header.tsx`**
- Linha 233: Atualizar as classes de tamanho do logo

## 2. Corrigir banner cortado no topo

**Problema:** O banner (SuperBanner / BannerIntro) na area superior do site esta sendo cortado porque usa `object-cover` com um aspect-ratio fixo que corta a imagem quando ela nao corresponde exatamente a proporcao esperada.

**Solucao no arquivo `src/components/ads/BannerIntro.tsx`:**
- Trocar `object-cover` por `object-contain` para garantir que a imagem inteira seja exibida sem corte
- Ajustar o container para usar `bg-transparent` em vez de `bg-muted` para evitar barras cinzas nas laterais

**Tambem verificar `src/components/home/DynamicHomeSection.tsx`:**
- Confirmar que o SuperBanner e o ad_slot_top nao estao aplicando restricoes de altura que cortam o conteudo

---

## Detalhes Tecnicos

### Arquivos a editar (2)

1. **`src/components/layout/Header.tsx`** -- substituir logo (copiar novo arquivo) e aumentar tamanho (h-[60px] sm:h-[75px] md:h-[90px])
2. **`src/components/ads/BannerIntro.tsx`** -- trocar `object-cover` por `object-contain` para nao cortar banners

### 1 arquivo a copiar
- `user-uploads://CONEXÃO_LOGO_03-2.png` -> `src/assets/logo-full.png`
