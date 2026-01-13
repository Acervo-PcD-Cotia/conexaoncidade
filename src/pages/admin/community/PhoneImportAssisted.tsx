import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Link2, FileSpreadsheet } from 'lucide-react';
import { useRequireRole } from '@/hooks/useRequireRole';
import { PhoneTextImporter } from '@/components/admin/phone-catalog/PhoneTextImporter';
import { PhoneUrlImporter } from '@/components/admin/phone-catalog/PhoneUrlImporter';
import { PhoneCsvImporter } from '@/components/admin/phone-catalog/PhoneCsvImporter';

export default function PhoneImportAssisted() {
  const navigate = useNavigate();
  const { hasAccess, checkingRole } = useRequireRole(['admin', 'super_admin', 'editor']);
  const [activeTab, setActiveTab] = useState('text');

  if (checkingRole) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/community/phone-catalog')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Cadastro Assistido</h1>
            <p className="text-muted-foreground">
              Cadastre smartphones rapidamente com ajuda da IA
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Importar por Texto
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Importar por URL
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Importar por CSV
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-6">
          <PhoneTextImporter />
        </TabsContent>

        <TabsContent value="url" className="mt-6">
          <PhoneUrlImporter />
        </TabsContent>

        <TabsContent value="csv" className="mt-6">
          <PhoneCsvImporter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
