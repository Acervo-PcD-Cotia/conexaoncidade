import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, ExternalLink, Github, Loader2 } from "lucide-react";

type CheckState = "idle" | "running" | "ok" | "warn" | "fail";

interface Check {
  id: string;
  label: string;
  description: string;
  state: CheckState;
  detail?: string;
  fix?: string;
}

const INITIAL: Check[] = [
  {
    id: "github-api",
    label: "Conectividade com api.github.com",
    description: "Verifica se o navegador consegue alcançar a API pública do GitHub.",
    state: "idle",
  },
  {
    id: "github-app",
    label: "Status do Lovable GitHub App",
    description: "Verifica se o app de integração responde no domínio github.com.",
    state: "idle",
  },
  {
    id: "third-party-cookies",
    label: "Cookies de terceiros / popups",
    description: "Detecta se o navegador bloqueia janelas pop-up necessárias para o fluxo OAuth.",
    state: "idle",
  },
  {
    id: "browser-env",
    label: "Ambiente do navegador",
    description: "Coleta dados do navegador úteis para suporte (User-Agent, idioma, online).",
    state: "idle",
  },
  {
    id: "lovable-host",
    label: "Origem da sessão Lovable",
    description: "Confirma se você está em um domínio compatível com a integração (lovable.app / preview).",
    state: "idle",
  },
];

const COMMON_ERRORS: { code: string; title: string; cause: string; fix: string }[] = [
  {
    code: "GH-401 / 403",
    title: "Autorização recusada (token inválido ou expirado)",
    cause: "O token OAuth do Lovable GitHub App foi revogado, expirou, ou a conta GitHub mudou de senha / 2FA.",
    fix: "Acesse github.com/settings/installations → Lovable → Configure → Revoke. Depois reconecte em Plus (+) → GitHub no editor.",
  },
  {
    code: "GH-404",
    title: "Repositório ou organização não encontrada",
    cause: "O Lovable App não tem acesso à organização escolhida, ou o repo foi renomeado/excluído.",
    fix: "Em github.com/settings/installations, edite a instalação Lovable e marque o repo (ou 'All repositories').",
  },
  {
    code: "GH-409",
    title: "Conflito de sincronização (push rejeitado)",
    cause: "Histórico divergente — alguém deu commit direto no GitHub enquanto o Lovable também escrevia.",
    fix: "Force pull no GitHub para alinhar, ou use o History do Lovable para restaurar a versão correta antes de reconectar.",
  },
  {
    code: "GH-422",
    title: "Repositório já existe",
    cause: "Tentativa de criar repo com nome que já está em uso na organização.",
    fix: "Escolha outro nome, ou conecte o projeto Lovable ao repo existente em vez de criar um novo.",
  },
  {
    code: "GH-NET",
    title: "Falha de rede / firewall corporativo",
    cause: "Bloqueio de api.github.com, github.com ou cookies de terceiros por proxy/VPN/firewall.",
    fix: "Teste em outra rede (4G/celular) ou desative VPN/extensões. Libere *.github.com no firewall.",
  },
  {
    code: "GH-ACCT",
    title: "Conta GitHub diferente já vinculada",
    cause: "Apenas uma conta GitHub pode estar conectada por conta Lovable.",
    fix: "Desconecte a conta atual em Plus (+) → GitHub → Disconnect, depois reconecte com a conta correta.",
  },
];

export default function GitHubStatus() {
  const [checks, setChecks] = useState<Check[]>(INITIAL);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const update = (id: string, patch: Partial<Check>) =>
    setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const runChecks = async () => {
    setRunning(true);
    setChecks(INITIAL.map((c) => ({ ...c, state: "running" })));

    // 1. GitHub API connectivity
    try {
      const r = await fetch("https://api.github.com/zen", { method: "GET" });
      if (r.ok) {
        const txt = await r.text();
        update("github-api", { state: "ok", detail: `HTTP ${r.status} — "${txt.slice(0, 80)}"` });
      } else {
        update("github-api", {
          state: "fail",
          detail: `HTTP ${r.status} ${r.statusText}`,
          fix: "GitHub respondeu com erro. Verifique status em githubstatus.com.",
        });
      }
    } catch (e: any) {
      update("github-api", {
        state: "fail",
        detail: `Erro de rede: ${e?.message || e}`,
        fix: "Firewall/proxy/VPN está bloqueando api.github.com. Teste em outra rede.",
      });
    }

    // 2. GitHub App reachability (no-cors HEAD to avoid CORS noise — we just want to know it resolved)
    try {
      await fetch("https://github.com/apps/lovable-dev", { method: "HEAD", mode: "no-cors" });
      update("github-app", {
        state: "ok",
        detail: "Domínio github.com acessível. (Status interno do app não é exposto via API pública.)",
      });
    } catch (e: any) {
      update("github-app", {
        state: "fail",
        detail: `Não consegui alcançar github.com: ${e?.message || e}`,
        fix: "Desbloqueie github.com no firewall/proxy.",
      });
    }

    // 3. Popup / third-party cookies
    try {
      const popup = window.open("", "_blank", "width=1,height=1");
      if (!popup || popup.closed) {
        update("third-party-cookies", {
          state: "warn",
          detail: "Janelas pop-up bloqueadas pelo navegador.",
          fix: "O fluxo OAuth do GitHub abre uma popup. Permita pop-ups para lovable.app e github.com.",
        });
      } else {
        popup.close();
        update("third-party-cookies", { state: "ok", detail: "Pop-ups permitidos." });
      }
    } catch {
      update("third-party-cookies", {
        state: "warn",
        detail: "Não foi possível testar pop-ups.",
        fix: "Verifique manualmente em configurações do navegador.",
      });
    }

    // 4. Browser env
    update("browser-env", {
      state: "ok",
      detail: `${navigator.userAgent} | online=${navigator.onLine} | lang=${navigator.language}`,
    });

    // 5. Host
    const host = window.location.hostname;
    const isLovable = host.endsWith("lovable.app") || host.endsWith("lovableproject.com") || host === "localhost";
    update("lovable-host", {
      state: isLovable ? "ok" : "warn",
      detail: `Origem atual: ${window.location.origin}`,
      fix: isLovable ? undefined : "Conecte o GitHub a partir do editor Lovable (lovable.app), não do domínio publicado.",
    });

    setRunning(false);
    setLastRun(new Date());
  };

  useEffect(() => {
    runChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconFor = (s: CheckState) => {
    if (s === "ok") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (s === "fail") return <XCircle className="h-5 w-5 text-red-500" />;
    if (s === "warn") return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    if (s === "running") return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
    return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
  };

  const badgeFor = (s: CheckState) => {
    const map: Record<CheckState, { label: string; variant: any }> = {
      ok: { label: "OK", variant: "default" },
      fail: { label: "Falha", variant: "destructive" },
      warn: { label: "Atenção", variant: "secondary" },
      running: { label: "Testando...", variant: "outline" },
      idle: { label: "Aguardando", variant: "outline" },
    };
    const c = map[s];
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const failures = checks.filter((c) => c.state === "fail").length;
  const warnings = checks.filter((c) => c.state === "warn").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Github className="h-6 w-6" /> Status da Integração GitHub
          </h1>
          <p className="text-sm text-muted-foreground">
            Diagnóstico de conectividade, autenticação e ambiente para a sincronização Lovable ↔ GitHub.
          </p>
          {lastRun && (
            <p className="text-xs text-muted-foreground mt-1">
              Última verificação: {lastRun.toLocaleTimeString("pt-BR")}
            </p>
          )}
        </div>
        <Button onClick={runChecks} disabled={running} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} />
          {running ? "Verificando..." : "Rodar diagnóstico"}
        </Button>
      </header>

      {(failures > 0 || warnings > 0) && !running && (
        <Alert variant={failures > 0 ? "destructive" : "default"}>
          {failures > 0 ? <XCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <AlertTitle>
            {failures > 0
              ? `${failures} falha(s) detectada(s)`
              : `${warnings} aviso(s) — integração pode funcionar com restrições`}
          </AlertTitle>
          <AlertDescription>
            Veja os detalhes de cada check abaixo e os erros comuns ao final desta página.
          </AlertDescription>
        </Alert>
      )}

      {failures === 0 && warnings === 0 && !running && lastRun && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Todos os checks técnicos passaram</AlertTitle>
          <AlertDescription>
            Se mesmo assim a conexão GitHub falha no editor Lovable, o problema está no Lovable GitHub App
            (autorização/instalação). Use o guia "Erros comuns" abaixo.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Checks técnicos</CardTitle>
          <CardDescription>Sinais que o navegador consegue medir agora.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {checks.map((c) => (
            <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <div className="pt-0.5">{iconFor(c.state)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">{c.label}</h3>
                  {badgeFor(c.state)}
                </div>
                <p className="text-sm text-muted-foreground">{c.description}</p>
                {c.detail && (
                  <p className="mt-1 text-xs font-mono bg-muted/50 p-2 rounded break-all">{c.detail}</p>
                )}
                {c.fix && (
                  <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                    <strong>Como resolver:</strong> {c.fix}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Erros comuns do GitHub e como corrigir</CardTitle>
          <CardDescription>
            O status real da instalação do Lovable GitHub App não é exposto via API pública — esta tabela
            mapeia as falhas mais frequentes para você identificar a causa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {COMMON_ERRORS.map((e) => (
            <div key={e.code} className="p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-mono">{e.code}</Badge>
                <h3 className="font-medium">{e.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1"><strong>Causa:</strong> {e.cause}</p>
              <p className="text-sm mt-1"><strong>Correção:</strong> {e.fix}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ações rápidas</CardTitle>
          <CardDescription>Atalhos diretos para gerenciar a integração no GitHub.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href="https://github.com/settings/installations" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> Gerenciar Lovable App
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://github.com/settings/applications" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> Apps OAuth autorizados
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://www.githubstatus.com/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> Status oficial do GitHub
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://docs.lovable.dev/integrations/github" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> Docs Lovable + GitHub
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}