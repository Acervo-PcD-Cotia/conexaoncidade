

# Remover Redirects de `/admin` e `/auth` para `/spah`

## Objetivo
Eliminar os redirects de compatibilidade que apontam `/admin`, `/auth`, `/login` e `/dashboard` para `/spah`. Assim, quem tentar acessar essas rotas antigas nao sera direcionado ao painel oculto -- vera apenas uma pagina 404 ou a home.

## Mudanca

**Arquivo**: `src/App.tsx` (linhas ~459-464)

Remover estas 6 linhas:

```text
{/* Redirects de compatibilidade */}
<Route path="/auth" element={<Navigate to="/spah" replace />} />
<Route path="/login" element={<Navigate to="/spah" replace />} />
<Route path="/admin" element={<Navigate to="/spah/painel" replace />} />
<Route path="/admin/*" element={<Navigate to="/spah/painel" replace />} />
<Route path="/dashboard" element={<Navigate to="/spah/painel" replace />} />
```

Isso garante que `/admin` e `/auth` nao revelam a existencia de `/spah`.

