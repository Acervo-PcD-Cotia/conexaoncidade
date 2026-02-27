import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Settings2, CheckCircle2, AlertCircle, ExternalLink, Key } from "lucide-react";
import { 
  useSocialAccountsNew, 
  useCreateSocialAccount, 
  useUpdateSocialAccount, 
  useDeleteSocialAccount 
} from "@/hooks/usePostSocial";
import { 
  SOCIAL_PLATFORMS, 
  PLATFORM_LABELS, 
  PLATFORM_ICONS, 
  PLATFORM_COLORS,
  getPlatformUrl,
  canAutoPost,
  requiresAssistedMode,
} from "@/types/postsocial";
import type { SocialPlatform, SocialAccountType, SocialAccount } from "@/types/postsocial";

export default function PostSocialSettings() {
  const { data: accounts, isLoading } = useSocialAccountsNew();
  const createAccount = useCreateSocialAccount();
  const updateAccount = useUpdateSocialAccount();
  const deleteAccount = useDeleteSocialAccount();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editAccount, setEditAccount] = useState<SocialAccount | null>(null);
  
  // Form state for new account
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('instagram');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newAccountType, setNewAccountType] = useState<SocialAccountType>('page');
  
  const handleAddAccount = async () => {
    if (!newDisplayName.trim()) return;
    
    await createAccount.mutateAsync({
      platform: newPlatform,
      display_name: newDisplayName.trim(),
      username: newUsername.trim() || undefined,
      account_type: newAccountType,
      default_enabled: true,
    });
    
    setIsAddModalOpen(false);
    setNewDisplayName('');
    setNewUsername('');
  };
  
  const handleToggleActive = async (account: SocialAccount) => {
    await updateAccount.mutateAsync({
      id: account.id,
      is_active: !account.is_active,
    });
  };
  
  const handleToggleDefault = async (account: SocialAccount) => {
    await updateAccount.mutateAsync({
      id: account.id,
      default_enabled: !account.default_enabled,
    });
  };
  
  const handleDelete = async (id: string) => {
    await deleteAccount.mutateAsync(id);
    setDeleteConfirm(null);
  };
  
  // Group accounts by platform
  const accountsByPlatform = SOCIAL_PLATFORMS.reduce((acc, platform) => {
    acc[platform] = accounts?.filter(a => a.platform === platform) || [];
    return acc;
  }, {} as Record<SocialPlatform, SocialAccount[]>);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configurar Redes Sociais</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas conectadas para postagem
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/spah/painel/postsocial/platforms'}>
            <Key className="h-4 w-4 mr-2" />
            Configurar APIs
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Conta
          </Button>
        </div>
      </div>
      
      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Settings2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Modos de Postagem</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                <strong>Automático:</strong> Facebook, LinkedIn, X, Pinterest e Telegram suportam postagem via API.
                <br />
                <strong>Assistido:</strong> Instagram, TikTok, YouTube e WhatsApp requerem postagem manual com auxílio do sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Accounts by Platform */}
      <div className="grid gap-4">
        {SOCIAL_PLATFORMS.map(platform => (
          <Card key={platform}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{PLATFORM_ICONS[platform]}</span>
                  <div>
                    <CardTitle className="text-base">{PLATFORM_LABELS[platform]}</CardTitle>
                    <CardDescription>
                      {canAutoPost(platform) ? (
                        <Badge variant="outline" className="mt-1 text-green-600 border-green-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Automático
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-1 text-orange-600 border-orange-300">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Modo Assistido
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewPlatform(platform);
                    setIsAddModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            {accountsByPlatform[platform].length > 0 && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {accountsByPlatform[platform].map(account => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{account.display_name}</p>
                          {account.username && (
                            <p className="text-sm text-muted-foreground">@{account.username}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {account.account_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Default Toggle */}
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`default-${account.id}`} className="text-sm">
                            Padrão
                          </Label>
                          <Switch
                            id={`default-${account.id}`}
                            checked={account.default_enabled}
                            onCheckedChange={() => handleToggleDefault(account)}
                          />
                        </div>
                        {/* Active Toggle */}
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${account.id}`} className="text-sm">
                            Ativo
                          </Label>
                          <Switch
                            id={`active-${account.id}`}
                            checked={account.is_active}
                            onCheckedChange={() => handleToggleActive(account)}
                          />
                        </div>
                        {/* Actions */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(getPlatformUrl(platform), '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(account.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
      
      {/* Add Account Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Conta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Plataforma</Label>
              <Select value={newPlatform} onValueChange={(v) => setNewPlatform(v as SocialPlatform)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.map(p => (
                    <SelectItem key={p} value={p}>
                      {PLATFORM_ICONS[p]} {PLATFORM_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Nome de Exibição *</Label>
              <Input
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="Ex: Conexão na Cidade"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Username (opcional)</Label>
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Ex: conexaonacidade"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Conta</Label>
              <Select value={newAccountType} onValueChange={(v) => setNewAccountType(v as SocialAccountType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Página</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="creator">Creator</SelectItem>
                  <SelectItem value="channel">Canal</SelectItem>
                  <SelectItem value="personal">Pessoal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {requiresAssistedMode(newPlatform) && (
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30">
                <CardContent className="p-3">
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    <strong>{PLATFORM_LABELS[newPlatform]}</strong> não suporta postagem automática via API.
                    O sistema irá preparar o conteúdo e você poderá copiar/baixar para postar manualmente.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddAccount} 
              disabled={!newDisplayName.trim() || createAccount.isPending}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os posts associados a esta conta serão desvinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
