import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send, TestTube, Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CITIES = ['Cotia', 'São Paulo', 'Barueri', 'Itapevi', 'Jandira', 'Carapicuíba'];
const CATEGORIES = ['cotia', 'brasil', 'esportes', 'educacao', 'saude', 'politica', 'cultura', 'economia'];

export default function PushNotificationsAdmin() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [city, setCity] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['push-stats'],
    queryFn: async () => {
      const { count: totalSubs } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: totalSent } = await supabase
        .from('push_notifications')
        .select('*', { count: 'exact', head: true });

      return { totalSubs: totalSubs || 0, totalSent: totalSent || 0 };
    },
  });

  // Fetch history
  const { data: history } = useQuery({
    queryKey: ['push-history'],
    queryFn: async () => {
      const { data } = await supabase
        .from('push_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (testMode: boolean) => {
      const { data, error } = await supabase.functions.invoke('push-send', {
        body: {
          title,
          body,
          url: url || undefined,
          image_url: imageUrl || undefined,
          city: city || undefined,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
          test_mode: testMode,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data, testMode) => {
      queryClient.invalidateQueries({ queryKey: ['push-history'] });
      queryClient.invalidateQueries({ queryKey: ['push-stats'] });
      toast.success(data.message || (testMode ? 'Teste enviado!' : 'Push enviado!'));
      if (!testMode) {
        setTitle('');
        setBody('');
        setUrl('');
        setImageUrl('');
      }
    },
    onError: (error) => {
      console.error('Push send error:', error);
      toast.error('Erro ao enviar push notification');
    },
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const canSend = title.trim() && body.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Push Notifications</h1>
          <p className="text-sm text-muted-foreground">Envie notificações para os assinantes do site</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats?.totalSubs ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Assinantes ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Send className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats?.totalSent ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Notificações enviadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compose */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Criar Notificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Nova matéria publicada!" maxLength={80} />
          </div>
          <div>
            <label className="text-sm font-medium">Mensagem *</label>
            <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Corpo da notificação..." maxLength={200} rows={3} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">URL (opcional)</label>
              <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://conexaonacidade.com.br/noticia/..." />
            </div>
            <div>
              <label className="text-sm font-medium">Imagem (opcional)</label>
              <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="URL da imagem" />
            </div>
          </div>

          {/* Segmentation */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3">Segmentação (opcional)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Cidade</label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Categorias</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {CATEGORIES.map(cat => (
                    <Badge
                      key={cat}
                      variant={selectedCategories.includes(cat) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => sendMutation.mutate(true)}
              disabled={!canSend || sendMutation.isPending}
            >
              <TestTube className="w-4 h-4 mr-1.5" />
              Enviar teste
            </Button>
            <Button
              onClick={() => sendMutation.mutate(false)}
              disabled={!canSend || sendMutation.isPending}
            >
              <Send className="w-4 h-4 mr-1.5" />
              {sendMutation.isPending ? 'Enviando...' : 'Enviar agora'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          {!history?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma notificação enviada ainda</p>
          ) : (
            <div className="space-y-3">
              {history.map((n: any) => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Bell className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {n.created_at ? format(new Date(n.created_at), "dd/MM/yy HH:mm", { locale: ptBR }) : '—'}
                      </span>
                      <span className="text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-primary" /> {n.sent_count || 0}
                      </span>
                      {(n.failed_count || 0) > 0 && (
                        <span className="text-xs flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-destructive" /> {n.failed_count}
                        </span>
                      )}
                      <Badge variant="outline" className="text-[10px]">{n.target_type}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
