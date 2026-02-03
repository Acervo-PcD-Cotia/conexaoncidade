import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  CalendarIcon, 
  Clock, 
  Image as ImageIcon, 
  Link as LinkIcon,
  Hash,
  Send,
  Save,
  Eye,
  Copy,
  ExternalLink,
} from "lucide-react";
import { format, addHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useActiveSocialAccounts, useCreateSocialPost, useSocialTemplates } from "@/hooks/usePostSocial";
import { 
  PLATFORM_ICONS, 
  PLATFORM_LABELS, 
  PLATFORM_COLORS,
  requiresAssistedMode,
  canAutoPost,
} from "@/types/postsocial";
import type { SocialPlatform, SocialAccount, SocialOriginType, SocialMediaItem } from "@/types/postsocial";
import { toast } from "sonner";

export default function PostSocialComposer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const originType = (searchParams.get('origin') as SocialOriginType) || 'manual';
  const originId = searchParams.get('originId') || undefined;
  const prefillTitle = searchParams.get('title') || '';
  const prefillCaption = searchParams.get('caption') || '';
  const prefillLink = searchParams.get('link') || '';
  const prefillImage = searchParams.get('image') || '';
  
  const { data: accounts } = useActiveSocialAccounts();
  const { data: templates } = useSocialTemplates(originType);
  const createPost = useCreateSocialPost();
  
  // Form state
  const [title, setTitle] = useState(prefillTitle);
  const [caption, setCaption] = useState(prefillCaption);
  const [linkUrl, setLinkUrl] = useState(prefillLink);
  const [mediaUrl, setMediaUrl] = useState(prefillImage);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  
  // Scheduling
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(addHours(new Date(), 1));
  const [scheduleTime, setScheduleTime] = useState('12:00');
  
  // Platform selection
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [captionOverrides, setCaptionOverrides] = useState<Record<string, string>>({});
  
  // Initialize default accounts
  useEffect(() => {
    if (accounts) {
      const defaults = accounts.filter(a => a.default_enabled).map(a => a.id);
      setSelectedAccounts(new Set(defaults));
    }
  }, [accounts]);
  
  const toggleAccount = (accountId: string) => {
    const newSet = new Set(selectedAccounts);
    if (newSet.has(accountId)) {
      newSet.delete(accountId);
    } else {
      newSet.add(accountId);
    }
    setSelectedAccounts(newSet);
  };
  
  const selectAllAccounts = () => {
    if (accounts) {
      setSelectedAccounts(new Set(accounts.map(a => a.id)));
    }
  };
  
  const deselectAllAccounts = () => {
    setSelectedAccounts(new Set());
  };
  
  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setHashtagInput('');
    }
  };
  
  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };
  
  const getScheduledAt = (): string | undefined => {
    if (!scheduleEnabled || !scheduleDate) return undefined;
    
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    const dateTime = new Date(scheduleDate);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime.toISOString();
  };
  
  const handleSubmit = async (asDraft: boolean = false) => {
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    
    if (selectedAccounts.size === 0) {
      toast.error('Selecione pelo menos uma rede social');
      return;
    }
    
    const media: SocialMediaItem[] = mediaUrl ? [{ url: mediaUrl, type: 'image' }] : [];
    const scheduledAt = asDraft ? undefined : getScheduledAt();
    
    const targets = Array.from(selectedAccounts).map(accountId => ({
      social_account_id: accountId,
      caption_override: captionOverrides[accountId] || undefined,
      scheduled_at: scheduledAt,
    }));
    
    await createPost.mutateAsync({
      origin_type: originType,
      origin_id: originId,
      title: title.trim(),
      base_caption: caption.trim() || undefined,
      link_url: linkUrl.trim() || undefined,
      media_json: media,
      hashtags: hashtags.length > 0 ? hashtags : undefined,
      targets,
    });
    
    navigate('/admin/postsocial');
  };
  
  const getFinalCaption = (account?: SocialAccount): string => {
    let finalCaption = account && captionOverrides[account.id] 
      ? captionOverrides[account.id] 
      : caption;
    
    if (hashtags.length > 0) {
      finalCaption += '\n\n' + hashtags.map(t => `#${t}`).join(' ');
    }
    
    if (linkUrl) {
      finalCaption += '\n\n🔗 ' + linkUrl;
    }
    
    return finalCaption;
  };
  
  const copyCaption = (account?: SocialAccount) => {
    navigator.clipboard.writeText(getFinalCaption(account));
    toast.success('Legenda copiada!');
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/postsocial')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Criar Post</h1>
          <p className="text-muted-foreground">
            Publique em múltiplas redes simultaneamente
          </p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título (interno)</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Identificação do post"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Legenda Base</Label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Texto que será publicado..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  {caption.length} caracteres
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Link
                </Label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Imagem
                </Label>
                <Input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="URL da imagem"
                />
                {mediaUrl && (
                  <img 
                    src={mediaUrl} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Hashtags
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    placeholder="Adicionar hashtag"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                  />
                  <Button type="button" variant="outline" onClick={addHashtag}>
                    Adicionar
                  </Button>
                </div>
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {hashtags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={() => removeHashtag(tag)}
                      >
                        #{tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Redes Sociais</CardTitle>
                <div className="flex gap-2">
                  <Button variant="link" size="sm" onClick={selectAllAccounts}>
                    Todas
                  </Button>
                  <Button variant="link" size="sm" onClick={deselectAllAccounts}>
                    Nenhuma
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {accounts?.map(account => (
                  <div
                    key={account.id}
                    className={cn(
                      "p-3 rounded-lg border-2 cursor-pointer transition-all",
                      selectedAccounts.has(account.id) 
                        ? "border-primary bg-primary/5" 
                        : "border-transparent bg-muted/50 hover:border-muted-foreground/20"
                    )}
                    onClick={() => toggleAccount(account.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedAccounts.has(account.id)}
                        onCheckedChange={() => toggleAccount(account.id)}
                      />
                      <span className="text-xl">{PLATFORM_ICONS[account.platform]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{account.display_name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {PLATFORM_LABELS[account.platform]}
                          </p>
                          {requiresAssistedMode(account.platform) && (
                            <Badge variant="outline" className="text-[10px] h-4">
                              Assistido
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedAccounts.size === 0 && (
                <p className="text-center text-muted-foreground mt-4">
                  Selecione pelo menos uma rede social
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Scheduling */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Agendamento
                </CardTitle>
                <Switch
                  checked={scheduleEnabled}
                  onCheckedChange={setScheduleEnabled}
                />
              </div>
            </CardHeader>
            {scheduleEnabled && (
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {scheduleDate 
                          ? format(scheduleDate, "PPP", { locale: ptBR })
                          : "Selecionar data"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={scheduleDate}
                        onSelect={setScheduleDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
        
        {/* Preview Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="unified">
                <TabsList className="w-full">
                  <TabsTrigger value="unified" className="flex-1">Geral</TabsTrigger>
                  <TabsTrigger value="platforms" className="flex-1">Por Rede</TabsTrigger>
                </TabsList>
                
                <TabsContent value="unified" className="mt-4">
                  <div className="p-4 rounded-lg border bg-muted/30">
                    {mediaUrl && (
                      <img 
                        src={mediaUrl} 
                        alt="Preview" 
                        className="w-full aspect-square object-cover rounded-lg mb-3"
                      />
                    )}
                    <p className="whitespace-pre-wrap text-sm">
                      {getFinalCaption()}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => copyCaption()}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="platforms" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {accounts?.filter(a => selectedAccounts.has(a.id)).map(account => (
                        <div key={account.id} className="p-3 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <span>{PLATFORM_ICONS[account.platform]}</span>
                            <span className="font-medium text-sm">{account.display_name}</span>
                            {requiresAssistedMode(account.platform) && (
                              <Badge variant="outline" className="text-[10px] h-4 ml-auto">
                                Manual
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">
                            {getFinalCaption(account)}
                          </p>
                          <div className="mt-2 flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 text-xs"
                              onClick={() => copyCaption(account)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copiar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
              
              {/* Actions */}
              <div className="mt-6 space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => handleSubmit(false)}
                  disabled={createPost.isPending || !title.trim() || selectedAccounts.size === 0}
                >
                  {scheduleEnabled ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Agendar Post
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publicar Agora
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSubmit(true)}
                  disabled={createPost.isPending || !title.trim() || selectedAccounts.size === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Rascunho
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
