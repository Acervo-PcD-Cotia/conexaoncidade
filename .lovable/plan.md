

# Atualizar Formato para Incluir "Cotia | Categoria"

## Objetivo

Modificar a lógica de exibição para que **TODAS** as notícias exibam o formato **"Cidade | Categoria"**, incluindo as notícias de Cotia.

**Antes:** Cotia exibia apenas "Educação"
**Depois:** Cotia exibirá "Cotia | Educação"

---

## Mudança Necessária

### Arquivo: `src/utils/categoryDisplay.ts`

A lógica atual só adiciona a cidade para cidades vizinhas. Precisamos modificar para:

1. **Detectar qualquer cidade** nas tags (não apenas vizinhas)
2. **Sempre exibir** no formato "Cidade | Categoria"

### Nova Lógica

| Tag encontrada | Exibição |
|----------------|----------|
| Cotia | Cotia \| Saúde |
| Granja Viana | Cotia \| Educação |
| Itapevi | Itapevi \| Esportes |
| Osasco | Osasco \| Política |
| São Paulo | São Paulo \| Brasil |

---

## Alterações Técnicas

### 1. Adicionar Cotia à lista de cidades reconhecidas

```
// Lista COMPLETA de cidades (incluindo Cotia)
const ALL_CITIES = [
  'cotia',  // Agora incluída!
  'são paulo', 'osasco', 'carapicuíba', 'barueri', 'itapevi', 
  'jandira', 'embu', 'embu das artes', 'taboão', 'taboão da serra',
  'vargem grande', 'vargem grande paulista', 'ibiúna', 'mairinque',
  'itapecerica', 'itapecerica da serra', 'são roque'
];
```

### 2. Mapear bairros de Cotia para "Cotia"

```
// Bairros que devem ser exibidos como "Cotia"
const COTIA_NEIGHBORHOODS = [
  'granja viana', 'caucaia do alto', 'jardim da glória',
  'jardim são fernando', 'ressaca', 'patrimônio da lagoa'
];
```

### 3. Nova função `extractCityFromTags`

```
export function extractCityFromTags(tags: string[]): string | null {
  for (const tag of tags) {
    const normalizedTag = tag.toLowerCase().trim();
    
    // Se for bairro de Cotia, retorna "Cotia"
    if (COTIA_NEIGHBORHOODS.some(n => normalizedTag.includes(n))) {
      return 'Cotia';
    }
    
    // Se for Cotia diretamente
    if (normalizedTag.includes('cotia')) {
      return 'Cotia';
    }
    
    // Se for outra cidade conhecida
    const foundCity = ALL_CITIES.find(city => 
      normalizedTag.includes(city) || city.includes(normalizedTag)
    );
    
    if (foundCity) {
      // Capitalizar
      return foundCity.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  }
  return null;
}
```

### 4. Atualizar `getCategoryDisplay`

```
export function getCategoryDisplay(category: string, tags: string[]): string {
  const city = extractCityFromTags(tags);
  
  // SEMPRE exibe "Cidade | Categoria" se encontrar cidade
  if (city) {
    return `${city} | ${category}`;
  }
  
  // Fallback: apenas categoria (para notícias sem tag de cidade)
  return category;
}
```

---

## Resultado Esperado

| Tags | Categoria | Exibição Final |
|------|-----------|----------------|
| ["Cotia", "UBS"] | Saúde | **Cotia \| Saúde** |
| ["Granja Viana", "Escola"] | Educação | **Cotia \| Educação** |
| ["Itapevi", "Hospital"] | Saúde | **Itapevi \| Saúde** |
| ["Osasco", "Prefeitura"] | Política | **Osasco \| Política** |
| ["Brasil", "Economia"] | Brasil | **Brasil** (sem cidade) |

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/utils/categoryDisplay.ts` | Refatorar lógica para incluir Cotia no formato |

Apenas **1 arquivo** precisa ser alterado. Os componentes já usam `getCategoryDisplay()` e receberão a mudança automaticamente.

