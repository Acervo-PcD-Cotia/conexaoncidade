
# Upload de Imagens para Anuncios - Sistema Padronizado

## Resumo

Atualizar o sistema de anuncios (Ads + Publidoor) para suportar **upload direto de imagens** como padrao, mantendo a opcao de URL externa como alternativa avancada. Isso permitira que admins, prefeituras e anunciantes subam imagens sem depender de hospedagem externa.

---

## Arquitetura da Solucao

```text
+-------------------+       +------------------+       +----------------+
|   Admin/Usuario   |  -->  |  AdImageUploader |  -->  |  Supabase      |
|                   |       |  (Novo Comp.)    |       |  Storage       |
+-------------------+       +------------------+       +----------------+
         |                          |                         |
         |  1. Upload de arquivo    |  2. Gera URL publica    |
         |  ou cola URL externa     |                         |
         v                          v                         v
+-------------------+       +------------------+       +----------------+
|  Formulario de    |       |  Salva image_url |       |  Bucket: ads   |
|  Anuncio          |       |  no banco        |       |  (Organizado)  |
+-------------------+       +------------------+       +----------------+
```

---

## 1. Migracao de Banco de Dados

Criar bucket `ads` com organizacao por tipo:

```sql
-- Criar bucket publico para anuncios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ads',
  'ads',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Politica: qualquer usuario autenticado pode fazer upload
CREATE POLICY "Authenticated users can upload ads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ads');

-- Politica: leitura publica
CREATE POLICY "Public read access for ads"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'ads');

-- Politica: autores podem deletar suas proprias imagens
CREATE POLICY "Users can delete own ads"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'ads');
```

---

## 2. Novo Componente: AdImageUploader

Criar `src/components/admin/AdImageUploader.tsx` baseado no `ImageUploader.tsx` existente, com:

**Diferenciais:**
- Upload como aba padrao (invertido em relacao ao original)
- Organizacao automatica por tipo de anuncio (subpastas)
- Validacao de tamanho 2MB (nao 5MB)
- Preview com aspect-ratio do formato escolhido
- Indicador visual de safe area (80% central)

**Interface:**

```typescript
interface AdImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
  alt?: string;
  format: 'home-topo' | 'retangulo-medio' | 'arranha-ceu' | 'popup';
  label?: string;
  required?: boolean;
}
```

**Estrutura de Pastas no Storage:**

```text
ads/
  home-topo/
    1706123456789-abc123.jpg
    1706123456789-def456.png
  retangulo-medio/
    ...
  arranha-ceu/
    ...
  popup/
    ...
```

---

## 3. Atualizar src/pages/admin/Ads.tsx

Substituir o campo de URL simples (linhas 289-312) pelo novo componente:

**Antes:**
```tsx
<div>
  <Label htmlFor="image_url">URL da Imagem *</Label>
  <Input
    id="image_url"
    value={form.image_url}
    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
    placeholder="https://..."
    required
  />
</div>
```

**Depois:**
```tsx
<AdImageUploader
  value={form.image_url}
  onChange={(url) => setForm({ ...form, image_url: url })}
  onAltChange={(alt) => setForm({ ...form, alt_text: alt })}
  alt={form.alt_text}
  format={getFormatFromSlot(form.slot_type)}
  label="Imagem do Anuncio"
  required
/>
```

**Mapeamento de slots para formatos:**

```typescript
const SLOT_TO_FORMAT = {
  home_top: 'home-topo',
  home_banner: 'home-topo',
  super_banner: 'home-topo',
  rectangle: 'retangulo-medio',
  skyscraper: 'arranha-ceu',
  popup: 'popup',
} as const;
```

---

## 4. Atualizar src/pages/admin/publidoor/PublidoorCreate.tsx

Substituir os campos de URL (media_url e logo_url) pelo novo uploader:

**Secao de Midia (linhas 166-211):**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Midia</CardTitle>
    <CardDescription>Imagem do Publidoor</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <AdImageUploader
      value={formData.media_url || ''}
      onChange={(url) => updateField('media_url', url)}
      format="home-topo"
      label="Imagem Principal *"
      required
    />
    
    <AdImageUploader
      value={formData.logo_url || ''}
      onChange={(url) => updateField('logo_url', url)}
      format="retangulo-medio"
      label="Logo (opcional)"
    />
  </CardContent>
</Card>
```

---

## 5. Atualizar src/pages/admin/publidoor/PublidoorEdit.tsx

Mesma atualizacao do Create (linhas 217-262).

---

## 6. Componente AdImageUploader - Especificacao Detalhada

```tsx
// src/components/admin/AdImageUploader.tsx

// Props
interface AdImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
  alt?: string;
  format: 'home-topo' | 'retangulo-medio' | 'arranha-ceu' | 'popup';
  label?: string;
  required?: boolean;
}

// Constantes de dimensoes por formato
const FORMAT_DIMENSIONS = {
  'home-topo': { width: 970, height: 250, ratio: '21/9' },
  'retangulo-medio': { width: 300, height: 250, ratio: '6/5' },
  'arranha-ceu': { width: 300, height: 600, ratio: '1/2' },
  'popup': { width: 580, height: 400, ratio: '29/20' },
};

// Funcionalidades:
// - Tabs: "Upload" (padrao) | "URL Externa"
// - Drag and drop
// - Validacao: JPG, PNG, WebP ate 2MB
// - Preview com aspect-ratio do formato
// - Overlay mostrando safe area (80% central)
// - Campo de alt text apos upload
// - Botao de remover imagem
```

---

## 7. Fluxo de Usuario

1. Admin abre formulario de anuncio ou Publidoor
2. Seleciona "Local do Anuncio" (determina formato)
3. Na secao de imagem:
   - **Tab Upload (padrao):** Arrasta ou clica para enviar
   - **Tab URL:** Cola link externo (uso avancado)
4. Preview exibe imagem com:
   - Proporcao correta do formato
   - Overlay indicando safe area
5. Preenche texto alternativo (acessibilidade)
6. Salva anuncio

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/components/admin/AdImageUploader.tsx` | Componente de upload para anuncios |

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/admin/Ads.tsx` | Substituir Input por AdImageUploader |
| `src/pages/admin/publidoor/PublidoorCreate.tsx` | Substituir Inputs de media por AdImageUploader |
| `src/pages/admin/publidoor/PublidoorEdit.tsx` | Idem ao Create |

---

## Performance e UX

- **Lazy loading:** Imagens no storage ja suportam
- **CLS zero:** Preview com aspect-ratio fixo
- **Feedback imediato:** Loader durante upload
- **Erro amigavel:** Toast em caso de falha
- **Tamanho maximo:** 2MB (validado client-side)

---

## Secao Tecnica

### Estrutura do AdImageUploader

```text
AdImageUploader
|-- Tabs (Upload | URL)
|   |-- TabUpload
|   |   |-- Dropzone (drag and drop)
|   |   |-- Input type="file" (click to select)
|   |   |-- Progress/Loader
|   |-- TabURL
|       |-- Input text
|       |-- Button submit
|-- Preview (se value)
|   |-- Image com aspect-ratio
|   |-- Overlay safe area (opcional)
|   |-- Button remover
|-- Input alt_text (se value)
```

### Logica de Upload

```typescript
async function handleUpload(file: File) {
  // 1. Validar tipo (image/jpeg, image/png, image/webp)
  // 2. Validar tamanho (max 2MB)
  // 3. Gerar nome unico: timestamp-random.ext
  // 4. Upload para bucket 'ads' no path do formato
  // 5. Obter URL publica
  // 6. Chamar onChange(publicUrl)
}
```

### Safe Area Visual

O overlay de safe area sera uma borda semitransparente indicando os 10% de margem em cada lado:

```css
.safe-area-overlay {
  position: absolute;
  inset: 10%;
  border: 2px dashed rgba(255, 255, 255, 0.5);
  pointer-events: none;
}
```

---

## Validacao

- Testar upload de JPG, PNG, WebP
- Testar rejeicao de arquivos > 2MB
- Testar rejeicao de tipos invalidos (GIF, PDF)
- Testar URL externa funcionando
- Testar preview com aspect-ratio correto
- Testar em dispositivos moveis (responsivo)
- Verificar que imagens aparecem corretamente nos anuncios publicados
