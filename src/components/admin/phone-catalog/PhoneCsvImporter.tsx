import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, XCircle, Loader2, Download } from 'lucide-react';
import { usePhoneImport } from '@/hooks/usePhoneImport';
import * as XLSX from 'xlsx';

interface CsvRow {
  name: string;
  brand: string;
  price_min?: number;
  price_max?: number;
  price_range?: string;
  ram?: string;
  storage?: string;
  camera_score?: number;
  battery_score?: number;
  gaming_score?: number;
  ideal_for?: string;
  offer_store?: string;
  affiliate_url?: string;
  offer_price?: number;
  offer_priority?: number;
}

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

const REQUIRED_COLUMNS = ['name', 'brand'];
const OPTIONAL_COLUMNS = [
  'price_min', 'price_max', 'price_range', 
  'camera_score', 'battery_score', 'gaming_score',
  'ideal_for', 'offer_store', 'affiliate_url', 
  'offer_price', 'offer_priority'
];

export function PhoneCsvImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { isImporting, importCsv } = usePhoneImport();

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setResult(null);
    setValidationErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

        if (jsonData.length === 0) {
          setValidationErrors(['Arquivo vazio ou sem dados válidos']);
          return;
        }

        // Get columns
        const cols = Object.keys(jsonData[0]).map(c => c.toLowerCase().trim());
        setColumns(cols);

        // Validate required columns
        const missingCols = REQUIRED_COLUMNS.filter(c => !cols.includes(c));
        if (missingCols.length > 0) {
          setValidationErrors([`Colunas obrigatórias ausentes: ${missingCols.join(', ')}`]);
          return;
        }

        // Map data to CsvRow format
        const mappedRows: CsvRow[] = jsonData.map((row) => {
          const mapped: CsvRow = {
            name: String(row.name || row.Name || '').trim(),
            brand: String(row.brand || row.Brand || '').trim(),
          };

          // Map optional fields
          if (row.price_min) mapped.price_min = Number(row.price_min);
          if (row.price_max) mapped.price_max = Number(row.price_max);
          if (row.price_range) mapped.price_range = String(row.price_range);
          if (row.camera_score) mapped.camera_score = Number(row.camera_score);
          if (row.battery_score) mapped.battery_score = Number(row.battery_score);
          if (row.gaming_score) mapped.gaming_score = Number(row.gaming_score);
          if (row.ideal_for) mapped.ideal_for = String(row.ideal_for);
          if (row.offer_store) mapped.offer_store = String(row.offer_store);
          if (row.affiliate_url) mapped.affiliate_url = String(row.affiliate_url);
          if (row.offer_price) mapped.offer_price = Number(row.offer_price);
          if (row.offer_priority) mapped.offer_priority = Number(row.offer_priority);

          return mapped;
        });

        // Validate rows
        const errors: string[] = [];
        mappedRows.forEach((row, index) => {
          if (!row.name) errors.push(`Linha ${index + 2}: nome é obrigatório`);
          if (!row.brand) errors.push(`Linha ${index + 2}: marca é obrigatória`);
        });

        if (errors.length > 0) {
          setValidationErrors(errors.slice(0, 5)); // Show first 5 errors
          if (errors.length > 5) {
            setValidationErrors(prev => [...prev, `...e mais ${errors.length - 5} erros`]);
          }
        }

        setRows(mappedRows.filter(r => r.name && r.brand));
      } catch (err) {
        setValidationErrors(['Erro ao processar arquivo. Verifique o formato.']);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  }, []);

  const handleImport = async () => {
    if (rows.length === 0) return;

    const importResult = await importCsv(rows, updateExisting);
    setResult(importResult);
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Samsung Galaxy S24 Ultra 256GB',
        brand: 'Samsung',
        price_min: 6500,
        price_max: 8000,
        price_range: 'flagship',
        camera_score: 5,
        battery_score: 4,
        gaming_score: 5,
        ideal_for: 'Quem busca o melhor em câmera e performance',
        offer_store: 'Amazon',
        affiliate_url: 'https://amzn.to/xxx',
        offer_price: 6999,
        offer_priority: 1,
      },
      {
        name: 'Xiaomi Redmi Note 13 Pro 8GB/256GB',
        brand: 'Xiaomi',
        price_min: 1500,
        price_max: 2000,
        price_range: 'mid',
        camera_score: 4,
        battery_score: 4,
        gaming_score: 3,
        ideal_for: 'Excelente custo-benefício para fotografia',
        offer_store: 'Magazine Luiza',
        affiliate_url: 'https://magalu.io/xxx',
        offer_price: 1699,
        offer_priority: 1,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Smartphones');
    XLSX.writeFile(wb, 'modelo-importacao-smartphones.xlsx');
  };

  const resetForm = () => {
    setFile(null);
    setRows([]);
    setColumns([]);
    setResult(null);
    setValidationErrors([]);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!file && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Importar por CSV/Excel
            </CardTitle>
            <CardDescription>
              Faça upload de um arquivo CSV ou Excel para importar múltiplos smartphones de uma vez.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => document.getElementById('csv-upload')?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Arraste um arquivo ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground">
                Suporta CSV, XLSX, XLS
              </p>
              <input
                id="csv-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Baixar Modelo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Preview */}
      {file && rows.length > 0 && !result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Preview da Importação</CardTitle>
                <CardDescription>
                  {file.name} - {rows.length} smartphones encontrados
                </CardDescription>
              </div>
              <Button variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Columns detected */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium">Colunas detectadas:</span>
              {columns.map(col => (
                <Badge 
                  key={col} 
                  variant={REQUIRED_COLUMNS.includes(col) ? 'default' : 'secondary'}
                >
                  {col}
                </Badge>
              ))}
            </div>

            {/* Preview table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Oferta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 5).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.brand}</TableCell>
                      <TableCell>
                        {row.price_min && row.price_max 
                          ? `R$ ${row.price_min} - ${row.price_max}`
                          : row.price_range || '-'}
                      </TableCell>
                      <TableCell>
                        {row.offer_store ? (
                          <Badge variant="outline">{row.offer_store}</Badge>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {rows.length > 5 && (
                <div className="text-center py-2 bg-muted text-sm text-muted-foreground">
                  ...e mais {rows.length - 5} smartphones
                </div>
              )}
            </div>

            {/* Options */}
            <div className="flex items-center gap-2">
              <Switch
                id="update-existing"
                checked={updateExisting}
                onCheckedChange={setUpdateExisting}
              />
              <Label htmlFor="update-existing">
                Atualizar smartphones existentes (duplicados serão atualizados em vez de ignorados)
              </Label>
            </div>

            {/* Import button */}
            <div className="flex justify-end">
              <Button onClick={handleImport} disabled={isImporting}>
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    Importar {rows.length} Smartphones
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Importação Concluída
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{result.created}</p>
                <p className="text-sm text-muted-foreground">Criados</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
                <p className="text-sm text-muted-foreground">Atualizados</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">{result.skipped}</p>
                <p className="text-sm text-muted-foreground">Ignorados</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Erros encontrados:</p>
                  <ul className="list-disc list-inside text-sm">
                    {result.errors.slice(0, 5).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>...e mais {result.errors.length - 5} erros</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button onClick={resetForm}>
                Nova Importação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
