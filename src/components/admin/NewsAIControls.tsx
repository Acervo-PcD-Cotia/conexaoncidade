import { useState } from 'react';
import { Volume2, FileText, Share2, Loader2, Check, AlertCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGenerateNewsAudio, useGenerateNewsSummary } from '@/hooks/useNewsAudio';

interface NewsAIControlsProps {
  newsId: string;
  audioUrl?: string | null;
  audioStatus?: string | null;
  audioDuration?: number | null;
  audioType?: string | null;
  aiSummaryBullets?: string[] | null;
  showAudioPlayer: boolean;
  showSummaryButton: boolean;
  distributeAudio: boolean;
  onSettingsChange: (settings: {
    show_audio_player?: boolean;
    show_summary_button?: boolean;
    distribute_audio?: boolean;
  }) => void;
}

const VOICE_OPTIONS = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'Masculino' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'Feminino' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'Masculino' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', gender: 'Feminino' },
];

const AUDIO_TYPE_OPTIONS = [
  { value: 'full', label: 'Leitura Integral' },
  { value: 'summary', label: 'Leitura Resumida' },
  { value: 'editorial', label: 'Estilo Editorial' },
];

export function NewsAIControls({
  newsId,
  audioUrl,
  audioStatus,
  audioDuration,
  audioType,
  aiSummaryBullets,
  showAudioPlayer,
  showSummaryButton,
  distributeAudio,
  onSettingsChange,
}: NewsAIControlsProps) {
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [selectedAudioType, setSelectedAudioType] = useState(audioType || 'full');
  const [customSummary, setCustomSummary] = useState('');

  const generateAudio = useGenerateNewsAudio();
  const generateSummary = useGenerateNewsSummary();

  const isGeneratingAudio = generateAudio.isPending || audioStatus === 'generating';
  const isGeneratingSummary = generateSummary.isPending;
  const hasAudio = audioUrl && audioStatus === 'ready';
  const hasSummary = aiSummaryBullets && aiSummaryBullets.length > 0;

  const handleGenerateAudio = () => {
    generateAudio.mutate({
      newsId,
      audioType: selectedAudioType,
      voiceId: selectedVoice,
    });
  };

  const handleGenerateSummary = () => {
    generateSummary.mutate(newsId);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    switch (audioStatus) {
      case 'ready':
        return <Badge variant="default" className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Pronto</Badge>;
      case 'generating':
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Gerando...</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Erro</Badge>;
      default:
        return <Badge variant="outline">Não gerado</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-xl">🧠</span>
          NOTÍCIAS AI
        </CardTitle>
        <CardDescription>
          Configure áudio e resumo automático para esta notícia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ÁUDIO Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Volume2 className="h-4 w-4" />
            <span>ÁUDIO</span>
            {getStatusBadge()}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Voz</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name} ({voice.gender})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Leitura</Label>
              <Select value={selectedAudioType} onValueChange={setSelectedAudioType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIO_TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Button
              onClick={handleGenerateAudio}
              disabled={isGeneratingAudio}
              size="sm"
            >
              {isGeneratingAudio ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4 mr-2" />
              )}
              {hasAudio ? 'Regenerar Áudio' : 'Gerar Áudio'}
            </Button>

            {hasAudio && audioDuration && (
              <span className="text-sm text-muted-foreground">
                Duração: {formatDuration(audioDuration)}
              </span>
            )}

            {hasAudio && audioUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={audioUrl} target="_blank" rel="noopener noreferrer">
                  <Play className="h-4 w-4 mr-2" />
                  Ouvir
                </a>
              </Button>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showAudioPlayer"
                checked={showAudioPlayer}
                onCheckedChange={(checked) => 
                  onSettingsChange({ show_audio_player: checked as boolean })
                }
              />
              <Label htmlFor="showAudioPlayer" className="text-sm">
                Exibir player no site
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="distributeAudio"
                checked={distributeAudio}
                onCheckedChange={(checked) => 
                  onSettingsChange({ distribute_audio: checked as boolean })
                }
              />
              <Label htmlFor="distributeAudio" className="text-sm">
                Enviar para plataformas de áudio
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* RESUMO Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4" />
            <span>RESUMO</span>
            {hasSummary && (
              <Badge variant="default" className="bg-green-500">
                <Check className="h-3 w-3 mr-1" /> {aiSummaryBullets?.length} tópicos
              </Badge>
            )}
          </div>

          <Button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
            size="sm"
          >
            {isGeneratingSummary ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            {hasSummary ? 'Regenerar Resumo' : 'Gerar Resumo'}
          </Button>

          {hasSummary && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <Label className="text-xs text-muted-foreground">Resumo gerado:</Label>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {aiSummaryBullets?.map((bullet, index) => (
                  <li key={index}>{bullet}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Editar resumo manualmente (opcional):
            </Label>
            <Textarea
              value={customSummary}
              onChange={(e) => setCustomSummary(e.target.value)}
              placeholder="Digite um resumo personalizado..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showSummaryButton"
              checked={showSummaryButton}
              onCheckedChange={(checked) => 
                onSettingsChange({ show_summary_button: checked as boolean })
              }
            />
            <Label htmlFor="showSummaryButton" className="text-sm">
              Exibir botão "Ler resumo"
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
