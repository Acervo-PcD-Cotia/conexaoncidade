import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useCampaignProof, useUpdateCampaignProof } from "@/hooks/useCampaignProofs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save } from "lucide-react";
import ProofDataForm from "@/components/admin/comprovantes/ProofDataForm";
import ProofChannelsList from "@/components/admin/comprovantes/ProofChannelsList";
import ProofAssetUploader from "@/components/admin/comprovantes/ProofAssetUploader";
import ProofAnalyticsForm from "@/components/admin/comprovantes/ProofAnalyticsForm";
import ProofExportPanel from "@/components/admin/comprovantes/ProofExportPanel";

export default function CampaignProofEditor() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNew = id === "novo";
  
  const initialTab = searchParams.get("tab") || "dados";
  const [activeTab, setActiveTab] = useState(initialTab);

  const { data: proof, isLoading } = useCampaignProof(isNew ? undefined : id);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  if (!isNew && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isNew && !isLoading && !proof) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/spah/painel/comprovantes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Comprovante não encontrado</h1>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center space-y-4">
          <p className="text-destructive font-medium">Não foi possível carregar este comprovante.</p>
          <Button variant="outline" onClick={() => navigate("/spah/painel/comprovantes")}>
            Voltar à lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/spah/painel/comprovantes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isNew ? "Novo Comprovante" : proof?.campaign_name || "Editar Comprovante"}
          </h1>
          {proof && (
            <p className="text-muted-foreground">
              PI: {proof.insertion_order} • Cliente: {proof.client_name}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="canais" disabled={isNew}>Canais</TabsTrigger>
          <TabsTrigger value="veiculacao" disabled={isNew}>Veiculação</TabsTrigger>
          <TabsTrigger value="analytics" disabled={isNew}>Analytics</TabsTrigger>
          <TabsTrigger value="exportar" disabled={isNew}>Exportação</TabsTrigger>
        </TabsList>

        <TabsContent value="dados">
          <ProofDataForm 
            proof={proof} 
            onSuccess={(newId) => {
              if (isNew && newId) {
                navigate(`/admin/comprovantes/${newId}`);
              }
            }}
          />
        </TabsContent>

        <TabsContent value="canais">
          {proof && <ProofChannelsList proof={proof} />}
        </TabsContent>

        <TabsContent value="veiculacao">
          {proof && (
            <ProofAssetUploader 
              proof={proof} 
              assetType="VEICULACAO_PRINT" 
              title="Prints de Veiculação"
              description="Capturas de tela mostrando onde os anúncios foram exibidos"
            />
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {proof && (
            <div className="space-y-6">
              <ProofAssetUploader 
                proof={proof} 
                assetType="ANALYTICS_PRINT" 
                title="Prints do Analytics"
                description="Capturas de tela do Google Analytics ou outra ferramenta"
              />
              <ProofAnalyticsForm proof={proof} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="exportar">
          {proof && <ProofExportPanel proof={proof} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
