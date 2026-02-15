

# Plano: Correcao Massiva de Links Restantes (/admin/ -> /spah/painel/)

## Resumo

Ainda existem **~42 arquivos** com caminhos legados `/admin/` que precisam ser migrados para `/spah/painel/`. Isso afeta links de navegacao (`to=`, `href:`), chamadas `navigate()`, e templates de URL dinamicos.

## Arquivos a Corrigir

### Grupo 1: Paginas Admin com `to="/admin/..."` (links estaticos)

1. `src/pages/admin/autopost/AutoPostSources.tsx` -- links para /admin/autopost/sources/new
2. `src/pages/admin/autopost-regional/RegionalDashboard.tsx` -- links para fontes, fila, logs
3. `src/pages/admin/broadcast/BroadcastList.tsx` -- link /admin/broadcast/new
4. `src/pages/admin/broadcast/BroadcastDashboard.tsx` -- links para list, channels, programs, new
5. `src/pages/admin/community/CommunityAdmin.tsx` -- links para members, moderation
6. `src/pages/admin/esportes/EsportesDashboard.tsx` -- links para configurar, brasileirao, sync, transmissoes, noticias
7. `src/pages/admin/SocialDashboard.tsx` -- links para settings, queue
8. `src/pages/admin/StoriesList.tsx` -- links para new, edit
9. `src/pages/admin/PodcastsList.tsx` -- links para news/edit
10. `src/pages/admin/transporte-escolar/TransporteEscolarAdmin.tsx` -- links para escolas, transportadores, leads, denuncias
11. `src/pages/admin/academy/AcademyAdminCourses.tsx` -- links para cursos/aulas
12. `src/pages/admin/academy/EnemSubmissions.tsx` -- links para enem, redacao

### Grupo 2: Paginas Conexao Studio com `to="/admin/..."` (links estaticos)

13. `src/pages/conexao-studio/StudioList.tsx` -- links para studios/new, edit, session
14. `src/pages/conexao-studio/StudioCreate.tsx` -- links para studios (voltar, cancelar)
15. `src/pages/conexao-studio/Webinars.tsx` -- links para webinars/new, edit, studio
16. `src/pages/conexao-studio/Library.tsx` -- link para studios
17. `src/pages/conexao-studio/Dashboard.tsx` -- ja corrigido parcialmente, verificar restantes

### Grupo 3: Paginas com `to={`/admin/...`}` (links dinamicos com template literals)

18. `src/components/admin/stream/StudioTabContent.tsx` -- links dinamicos para studio session
19. `src/components/admin/noticias-ai/DuplicateWarningDialog.tsx` -- link para news/edit
20. `src/components/academy/AcademyModuleAccordion.tsx` -- link para aula
21. `src/components/academy/AcademyCourseCard.tsx` -- link para curso
22. `src/components/academy/AcademyHero.tsx` -- link para aula
23. `src/components/academy/AcademyLessonNav.tsx` -- links para aula anterior/proxima
24. `src/pages/admin/broadcast/BroadcastList.tsx` -- links dinamicos para studio, edit
25. `src/pages/admin/broadcast/BroadcastDashboard.tsx` -- link dinamico para studio

### Grupo 4: Paginas com `navigate('/admin/...')` (navegacao programatica)

26. `src/pages/admin/NoticiasAI.tsx` -- navigate para /admin/news
27. `src/pages/admin/autopost-regional/RegionalSourceEdit.tsx` -- navigate para fontes
28. `src/pages/admin/community/PhoneImportAssisted.tsx` -- navigate para phone-catalog
29. `src/pages/admin/postsocial/PostSocialComposer.tsx` -- navigate para postsocial
30. `src/pages/conexao-studio/StudioSession.tsx` -- navigate para studios

### Grupo 5: Componentes com `href: "/admin/..."` (objetos de configuracao)

31. `src/pages/public/Enem2026Landing.tsx` -- href para academy/enem
32. `src/components/admin/dashboard/UserManagementPanel.tsx` -- hrefs para users
33. `src/components/admin/dashboard/DashboardProductionCard.tsx` -- hrefs para news
34. `src/components/admin/stream/TvTabContent.tsx` -- links para streaming/tv

### Grupo 6: Modulos e paginas de radio

35. `src/modules/radio/pages/RadioOverview.tsx` -- links para radio/status, autodj, library, stats
36. `src/modules/content-fix/pages/ContentFixDashboard.tsx` -- navigate para content-fix/images, dates

---

## Detalhes Tecnicos

### Criterio de substituicao (identico a fase 1)

```text
"/admin/   ->  "/spah/painel/
'/admin/   ->  '/spah/painel/
`/admin/   ->  `/spah/painel/
```

### Cuidados
- Nao alterar caminhos de importacao (ex: `from "@/components/admin/..."` deve permanecer)
- Nao alterar nomes de pastas ou arquivos
- Apenas substituir caminhos de navegacao (to=, href:, navigate())

### Total: ~36 arquivos a editar
### Nenhum arquivo novo
### Nenhuma alteracao no banco de dados

