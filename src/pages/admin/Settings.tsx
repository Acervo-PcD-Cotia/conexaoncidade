import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon, Shield, Bell, Database, Wrench, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMaintenanceMode, useAdminNotificationPreferences } from "@/hooks/useMaintenanceMode";
import { useSiteSecuritySettings, useUpdateSecuritySetting } from "@/hooks/useSiteSecuritySettings";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings() {
  const { 
    isMaintenanceMode, 
    message, 
    estimatedEnd, 
    isLoading: maintenanceLoading,
    toggleMaintenance,
    updateSettings,
    isUpdating
  } = useMaintenanceMode();

  const {
    preferences,
    isLoading: preferencesLoading,
    updatePreferences,
    isUpdating: preferencesUpdating
  } = useAdminNotificationPreferences();

  const { data: securitySettings, isLoading: securityLoading } = useSiteSecuritySettings();
  const updateSecurity = useUpdateSecuritySetting();

  const [localMessage, setLocalMessage] = useState(message);
  const [localEstimatedEnd, setLocalEstimatedEnd] = useState(estimatedEnd || '');

  useEffect(() => {
    setLocalMessage(message);
    setLocalEstimatedEnd(estimatedEnd || '');
  }, [message, estimatedEnd]);

  const handleSaveMaintenanceSettings = () => {
    updateSettings({
      enabled: isMaintenanceMode,
      message: localMessage,
      estimated_end: localEstimatedEnd || null
    });
  };

  const handleSecurityChange = (key: "require_email_verification" | "admin_auth_required" | "session_timeout_minutes", value: boolean | number) => {
    updateSecurity.mutate({ key, value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Configurações gerais do sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Maintenance Mode Card */}
        <Card className="md:col-span-2 border-2 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="h-5 w-5" />
              Modo Manutenção
              {isMaintenanceMode && (
                <Badge variant="destructive" className="ml-2">
                  ATIVO
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Bloqueia o acesso ao site para visitantes (admins podem continuar acessando)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {maintenanceLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ativar modo manutenção</Label>
                    <p className="text-xs text-muted-foreground">
                      O site ficará inacessível para visitantes
                    </p>
                  </div>
                  <Switch 
                    checked={isMaintenanceMode} 
                    onCheckedChange={toggleMaintenance}
                    disabled={isUpdating}
                  />
                </div>

                {isMaintenanceMode && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      O modo manutenção está ativo. Visitantes não podem acessar o site.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>Mensagem personalizada</Label>
                  <Textarea 
                    placeholder="Mensagem exibida durante a manutenção..." 
                    value={localMessage}
                    onChange={(e) => setLocalMessage(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Previsão de retorno</Label>
                  <Input 
                    type="datetime-local" 
                    value={localEstimatedEnd}
                    onChange={(e) => setLocalEstimatedEnd(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe vazio se não houver previsão
                  </p>
                </div>

                <Button 
                  onClick={handleSaveMaintenanceSettings}
                  disabled={isUpdating}
                  className="w-full sm:w-auto"
                >
                  Salvar configurações
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Push Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5" />
              Notificações Push
            </CardTitle>
            <CardDescription>
              Receba alertas sobre conteúdo pendente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {preferencesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notícias pendentes</Label>
                    <p className="text-xs text-muted-foreground">
                      Alertar quando há notícias para revisão
                    </p>
                  </div>
                  <Switch 
                    checked={preferences?.notify_pending_news ?? true}
                    onCheckedChange={(checked) => updatePreferences({ notify_pending_news: checked })}
                    disabled={preferencesUpdating}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verificações Anti Fake</Label>
                    <p className="text-xs text-muted-foreground">
                      Alertar sobre novas verificações
                    </p>
                  </div>
                  <Switch 
                    checked={preferences?.notify_pending_factcheck ?? true}
                    onCheckedChange={(checked) => updatePreferences({ notify_pending_factcheck: checked })}
                    disabled={preferencesUpdating}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Denúncias na comunidade</Label>
                    <p className="text-xs text-muted-foreground">
                      Alertar sobre conteúdo denunciado
                    </p>
                  </div>
                  <Switch 
                    checked={preferences?.notify_community_reports ?? true}
                    onCheckedChange={(checked) => updatePreferences({ notify_community_reports: checked })}
                    disabled={preferencesUpdating}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança e acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autenticação obrigatória</Label>
                    <p className="text-xs text-muted-foreground">
                      Exigir login para acessar o admin
                    </p>
                  </div>
                  <Switch 
                    checked={securitySettings?.admin_auth_required ?? true}
                    onCheckedChange={(checked) => handleSecurityChange("admin_auth_required", checked)}
                    disabled={updateSecurity.isPending}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verificação de email</Label>
                    <p className="text-xs text-muted-foreground">
                      Usuários devem verificar email
                    </p>
                  </div>
                  <Switch 
                    checked={securitySettings?.require_email_verification ?? false}
                    onCheckedChange={(checked) => handleSecurityChange("require_email_verification", checked)}
                    disabled={updateSecurity.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timeout da sessão</Label>
                  <Select 
                    value={String(securitySettings?.session_timeout_minutes ?? 60)}
                    onValueChange={(value) => handleSecurityChange("session_timeout_minutes", parseInt(value))}
                    disabled={updateSecurity.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o timeout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="480">8 horas</SelectItem>
                      <SelectItem value="1440">24 horas</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Tempo de inatividade antes de exigir novo login
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* System Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5" />
              Sistema
            </CardTitle>
            <CardDescription>
              Informações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Versão</p>
                <p className="text-lg font-bold">1.0.0</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Ambiente</p>
                <p className="text-lg font-bold">Produção</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Última atualização</p>
                <p className="text-lg font-bold">{new Date().toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}