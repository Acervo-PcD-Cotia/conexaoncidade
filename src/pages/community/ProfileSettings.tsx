import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Shield, Loader2, Save, Lock, Eye, EyeOff, MapPin } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/hooks/useCommunity";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AvatarUploader } from "@/components/community/AvatarUploader";
import { TwoFactorSetup } from "@/components/community/TwoFactorSetup";
import { DeleteAccountDialog } from "@/components/community/DeleteAccountDialog";
import { SessionsManager } from "@/components/community/SessionsManager";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import { ProfileTypeSelector } from "@/components/community/ProfileTypeSelector";
import { NeighborhoodSelector } from "@/components/community/NeighborhoodSelector";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirme a nova senha"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { hasAccess, isLoading: communityLoading } = useCommunity();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("profile");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile data
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileType, setProfileType] = useState("cidadao");
  const [neighborhood, setNeighborhood] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // MFA status
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [checkingMfa, setCheckingMfa] = useState(true);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setFullName(profile?.full_name || "");
        setAvatarUrl(profile?.avatar_url || null);

        // Load community member data
        const { data: member } = await supabase
          .from("community_members")
          .select("bio, profile_type, neighborhood")
          .eq("user_id", user.id)
          .single();

        if (member) {
          setBio(member.bio || "");
          setProfileType(member.profile_type || "cidadao");
          setNeighborhood(member.neighborhood || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user]);

  // Check MFA status
  useEffect(() => {
    const checkMfaStatus = async () => {
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;

        const hasVerifiedFactor = data.totp.some(f => f.status === "verified");
        setMfaEnabled(hasVerifiedFactor);
      } catch (error) {
        console.error("Error checking MFA status:", error);
      } finally {
        setCheckingMfa(false);
      }
    };

    if (user) {
      checkMfaStatus();
    }
  }, [user]);

  // Redirect if not authenticated or no community access
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth-comunidade");
      return;
    }

    if (!communityLoading && user && !hasAccess) {
      navigate("/comunidade/desbloquear");
    }
  }, [user, authLoading, hasAccess, communityLoading, navigate]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Update profile table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update community_members
      const { error: memberError } = await supabase
        .from("community_members")
        .update({ 
          bio: bio.trim(),
          profile_type: profileType,
          neighborhood: neighborhood 
        })
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordErrors({});

    const validation = passwordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (field) errors[field] = err.message;
      });
      setPasswordErrors(errors);
      return;
    }

    setIsChangingPassword(true);
    try {
      // Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        setPasswordErrors({ currentPassword: "Senha atual incorreta" });
        setIsChangingPassword(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast({
        title: "Senha alterada!",
        description: "Sua senha foi atualizada com sucesso.",
      });

      // Clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        variant: "destructive",
        title: "Erro ao alterar senha",
        description: "Tente novamente.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleMfaStatusChange = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const hasVerifiedFactor = data?.totp.some(f => f.status === "verified") ?? false;
    setMfaEnabled(hasVerifiedFactor);
  };

  if (authLoading || communityLoading || isLoadingProfile) {
    return (
      <CommunityLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-pink-600" />
            Configurações do Perfil
          </h1>
          <p className="text-muted-foreground">
            Gerencie seu perfil e preferências de segurança
          </p>

          <h1 className="text-3xl font-bold">Configurações da Conta</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seu perfil, segurança e preferências
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                Segurança
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Foto de Perfil</CardTitle>
                  <CardDescription>
                    Sua foto será exibida em publicações e comentários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AvatarUploader
                    currentAvatarUrl={avatarUrl}
                    userId={user?.id || ""}
                    userName={fullName}
                    onUploadComplete={setAvatarUrl}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tipo de Perfil</CardTitle>
                  <CardDescription>
                    Selecione o tipo que melhor representa você na comunidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileTypeSelector value={profileType} onChange={setProfileType} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Localização
                  </CardTitle>
                  <CardDescription>
                    Selecione seu bairro em Cotia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NeighborhoodSelector value={neighborhood} onChange={setNeighborhood} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Edite seu nome e biografia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Nome completo</Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome"
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      O e-mail não pode ser alterado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (opcional)</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Conte um pouco sobre você..."
                      maxLength={300}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {bio.length}/300 caracteres
                    </p>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar alterações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Alterar Senha
                  </CardTitle>
                  <CardDescription>
                    Atualize sua senha de acesso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha atual</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className={passwordErrors.currentPassword ? "border-destructive" : ""}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova senha</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className={passwordErrors.newPassword ? "border-destructive" : ""}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirmar nova senha</Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={passwordErrors.confirmPassword ? "border-destructive" : ""}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    {isChangingPassword ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4 mr-2" />
                    )}
                    Alterar senha
                  </Button>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Autenticação de Dois Fatores
                  </CardTitle>
                  <CardDescription>
                    Adicione uma camada extra de proteção à sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {checkingMfa ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <TwoFactorSetup
                      isEnabled={mfaEnabled}
                      onStatusChange={handleMfaStatusChange}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Sessions Manager */}
              <SessionsManager />

              {/* Danger Zone */}
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                  <CardDescription>
                    Ações irreversíveis para sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 space-y-4">
                    <div>
                      <p className="font-medium">Excluir conta permanentemente</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Esta ação removerá todos os seus dados e não poderá ser desfeita.
                      </p>
                    </div>
                    <DeleteAccountDialog userEmail={user?.email || ""} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </CommunityLayout>
  );
}
