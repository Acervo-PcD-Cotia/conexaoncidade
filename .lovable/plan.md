
# Plano: Mudar Cor dos Textos das Categorias para Laranja

## Resumo

Alterar a cor dos textos das categorias no gráfico de pizza "Uso por Módulo" de cinza para laranja, melhorando a legibilidade.

---

## Problema Identificado

No gráfico de pizza da página "Insights e Diagnósticos" (`/admin/conexao-ai/insights`), os textos das categorias como "Notícias 45%", "Parceiros 25%", etc. estão em cinza apagado e com baixa visibilidade.

---

## Solução

Modificar o componente `Pie` do Recharts para aplicar a cor laranja (primary color do tema) nos labels.

---

## Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/conexao-ai/ConexaoAIInsights.tsx` | Adicionar estilo de cor laranja aos labels do gráfico |

---

## Mudança Específica

Adicionar a propriedade `labelStyle` ou usar a sintaxe de `label` com componente customizado para aplicar a cor laranja:

```typescript
// Linha 180-189 - Antes:
<Pie
  data={moduleUsage}
  dataKey="value"
  nameKey="name"
  cx="50%"
  cy="50%"
  outerRadius={100}
  label={({ name, percent }) =>
    `${name} ${(percent * 100).toFixed(0)}%`
  }
>

// Depois:
<Pie
  data={moduleUsage}
  dataKey="value"
  nameKey="name"
  cx="50%"
  cy="50%"
  outerRadius={100}
  label={({ name, percent }) =>
    `${name} ${(percent * 100).toFixed(0)}%`
  }
  labelLine={{ stroke: "hsl(25, 95%, 53%)" }}
  style={{ fontSize: 12 }}
>
```

E adicionar via propriedade CSS ou usar um label customizado com `fill`:

```typescript
label={({ name, percent, x, y }) => (
  <text 
    x={x} 
    y={y} 
    fill="hsl(25, 95%, 53%)" 
    textAnchor="middle"
    fontSize={12}
  >
    {`${name} ${(percent * 100).toFixed(0)}%`}
  </text>
)}
```

---

## Cor a Aplicar

A cor laranja do tema é `hsl(25, 95%, 53%)` - corresponde à cor primary do projeto.

---

## Resultado Esperado

Os textos das categorias no gráfico de pizza ficarão em laranja vibrante, com muito mais destaque e legibilidade contra o fundo escuro do dashboard.
