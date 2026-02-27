import { Mic, Podcast } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VoiceSelector } from "./VoiceSelector";

export function DefaultVoicePanel() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Mic className="h-5 w-5 text-primary" />
          Narradores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Configure vozes independentes para leitura de notícias e geração de podcasts.
        </p>

        <VoiceSelector
          storageKeyVoice="news_voice_id"
          storageKeySettings="news_voice_settings"
          label="📰 Narrador de Notícias"
        />

        <Separator />

        <VoiceSelector
          storageKeyVoice="podcast_voice_id"
          storageKeySettings="podcast_voice_settings"
          label="🎙️ Narrador de Podcast"
        />
      </CardContent>
    </Card>
  );
}
