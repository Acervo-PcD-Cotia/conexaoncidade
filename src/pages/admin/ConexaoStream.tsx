import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Satellite, Radio, Tv, Video, Play } from "lucide-react";
import { BroadcastTabContent } from "@/components/admin/stream/BroadcastTabContent";
import { StudioTabContent } from "@/components/admin/stream/StudioTabContent";
import { RadioTabContent } from "@/components/admin/stream/RadioTabContent";
import { TvTabContent } from "@/components/admin/stream/TvTabContent";

export default function ConexaoStream() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "aovivo";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Satellite className="h-6 w-6 text-primary" />
          Conexão Stream
        </h1>
        <p className="text-muted-foreground">
          Central unificada de transmissões, rádio e TV
        </p>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger 
            value="aovivo" 
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Ao Vivo</span>
          </TabsTrigger>
          <TabsTrigger 
            value="studio" 
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Studio</span>
          </TabsTrigger>
          <TabsTrigger 
            value="radio" 
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Radio className="h-4 w-4" />
            <span className="hidden sm:inline">Rádio Web</span>
          </TabsTrigger>
          <TabsTrigger 
            value="tv" 
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Tv className="h-4 w-4" />
            <span className="hidden sm:inline">TV Web</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aovivo" className="mt-6">
          <BroadcastTabContent />
        </TabsContent>
        
        <TabsContent value="studio" className="mt-6">
          <StudioTabContent />
        </TabsContent>
        
        <TabsContent value="radio" className="mt-6">
          <RadioTabContent />
        </TabsContent>
        
        <TabsContent value="tv" className="mt-6">
          <TvTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
