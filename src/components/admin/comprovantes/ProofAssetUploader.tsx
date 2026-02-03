import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadProofAsset, useDeleteProofAsset, useUpdateAssetCaption } from "@/hooks/useCampaignProofAssets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import type { CampaignProofFull, CampaignProofAssetType } from "@/types/campaign-proofs";

interface ProofAssetUploaderProps {
  proof: CampaignProofFull;
  assetType: CampaignProofAssetType;
  title: string;
  description: string;
}

export default function ProofAssetUploader({
  proof,
  assetType,
  title,
  description,
}: ProofAssetUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const uploadMutation = useUploadProofAsset();
  const deleteMutation = useDeleteProofAsset();
  const captionMutation = useUpdateAssetCaption();

  const assets = proof.assets.filter((a) => a.asset_type === assetType);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const fileId = `${Date.now()}-${i}`;

        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

        try {
          await uploadMutation.mutateAsync({
            campaignProofId: proof.id,
            assetType,
            file,
            sortOrder: assets.length + i,
          });
          setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));
        } catch (error) {
          console.error("Upload error:", error);
        } finally {
          setTimeout(() => {
            setUploadProgress((prev) => {
              const next = { ...prev };
              delete next[fileId];
              return next;
            });
          }, 1000);
        }
      }
    },
    [proof.id, assetType, assets.length, uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    multiple: true,
  });

  const handleDelete = (assetId: string, filePath: string) => {
    deleteMutation.mutate({
      id: assetId,
      campaignProofId: proof.id,
      filePath,
    });
  };

  const handleCaptionChange = (assetId: string, caption: string) => {
    captionMutation.mutate({
      id: assetId,
      campaignProofId: proof.id,
      caption,
    });
  };

  const hasUploading = Object.keys(uploadProgress).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          {isDragActive ? (
            <p className="text-primary">Solte as imagens aqui...</p>
          ) : (
            <>
              <p className="text-muted-foreground">
                Arraste imagens aqui ou clique para selecionar
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                PNG, JPG ou WEBP
              </p>
            </>
          )}
        </div>

        {/* Upload Progress */}
        {hasUploading && (
          <div className="space-y-2">
            {Object.entries(uploadProgress).map(([id, progress]) => (
              <div key={id} className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <Progress value={progress} className="flex-1" />
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Assets Grid */}
        {assets.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <div key={asset.id} className="relative group rounded-lg border overflow-hidden">
                {/* Image */}
                <div className="aspect-video bg-muted relative">
                  {asset.file_url ? (
                    <img
                      src={asset.file_url}
                      alt={asset.caption || "Print"}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src = "";
                        e.currentTarget.className = "hidden";
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Delete Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(asset.id, asset.file_path)}
                    disabled={deleteMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Caption */}
                <div className="p-2">
                  <Input
                    placeholder="Legenda (opcional)"
                    defaultValue={asset.caption || ""}
                    onBlur={(e) => {
                      if (e.target.value !== (asset.caption || "")) {
                        handleCaptionChange(asset.id, e.target.value);
                      }
                    }}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {assets.length === 0 && !hasUploading && (
          <p className="text-center text-muted-foreground py-4">
            Nenhuma imagem adicionada
          </p>
        )}
      </CardContent>
    </Card>
  );
}
