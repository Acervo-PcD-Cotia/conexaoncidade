import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ImportRecord {
  id: string;
  title: string;
  source_url: string;
  source_name: string;
  source_badge: string;
  import_type: string;
  status: string;
  format_corrected: boolean;
  news_id: string;
  created_at: string;
}

interface Stats {
  total: number;
  success: number;
  successRate: number;
  corrected: number;
  correctedRate: number;
  avgDaily: number;
  bySource: { name: string; count: number }[];
  byType: { type: string; count: number }[];
}

const TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  batch: 'Lote',
  json: 'JSON',
};

export function exportHistoryToPDF(imports: ImportRecord[], period: string) {
  const doc = new jsPDF();
  const now = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Importações - Notícias AI', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${now}`, 14, 28);
  doc.text(`Período: ${period}`, 14, 34);
  
  // Summary
  const successCount = imports.filter(i => i.status === 'success').length;
  const errorCount = imports.filter(i => i.status !== 'success').length;
  const correctedCount = imports.filter(i => i.format_corrected).length;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo:', 14, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total: ${imports.length} | Sucesso: ${successCount} | Erros: ${errorCount} | Auto-corrigidos: ${correctedCount}`, 14, 54);
  
  // Table
  const tableData = imports.map(record => [
    format(new Date(record.created_at), 'dd/MM/yy HH:mm'),
    (record.title || 'Sem título').substring(0, 40) + (record.title?.length > 40 ? '...' : ''),
    record.source_badge || '-',
    TYPE_LABELS[record.import_type] || record.import_type,
    record.status === 'success' ? 'Sucesso' : 'Erro',
    record.format_corrected ? 'Sim' : 'Não',
  ]);
  
  autoTable(doc, {
    startY: 62,
    head: [['Data', 'Título', 'Fonte', 'Tipo', 'Status', 'Corrigido']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 8 },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 10);
  }
  
  doc.save(`noticias-ai-historico-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function exportHistoryToExcel(imports: ImportRecord[], period: string) {
  // Main data sheet
  const data = imports.map(record => ({
    'Data': format(new Date(record.created_at), 'dd/MM/yyyy HH:mm'),
    'Título': record.title || 'Sem título',
    'Fonte': record.source_badge || '-',
    'URL Fonte': record.source_url || '-',
    'Tipo': TYPE_LABELS[record.import_type] || record.import_type,
    'Status': record.status === 'success' ? 'Sucesso' : 'Erro',
    'Auto-corrigido': record.format_corrected ? 'Sim' : 'Não',
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Histórico');
  
  // Stats sheet
  const successCount = imports.filter(i => i.status === 'success').length;
  const errorCount = imports.filter(i => i.status !== 'success').length;
  
  const statsData = [
    { 'Métrica': 'Total de Importações', 'Valor': imports.length },
    { 'Métrica': 'Sucesso', 'Valor': successCount },
    { 'Métrica': 'Erros', 'Valor': errorCount },
    { 'Métrica': 'Taxa de Sucesso', 'Valor': `${imports.length > 0 ? Math.round((successCount / imports.length) * 100) : 0}%` },
    { 'Métrica': 'Auto-corrigidos', 'Valor': imports.filter(i => i.format_corrected).length },
    { 'Métrica': 'Período', 'Valor': period },
    { 'Métrica': 'Data do Relatório', 'Valor': format(new Date(), 'dd/MM/yyyy HH:mm') },
  ];
  
  const wsStats = XLSX.utils.json_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, wsStats, 'Resumo');
  
  XLSX.writeFile(wb, `noticias-ai-historico-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

export function exportStatsToPDF(stats: Stats, period: string) {
  const doc = new jsPDF();
  const now = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Estatísticas - Notícias AI', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${now}`, 14, 28);
  doc.text(`Período: ${period}`, 14, 34);
  
  // Summary cards
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Métricas Gerais:', 14, 50);
  
  const metrics = [
    ['Total Importado', String(stats.total)],
    ['Taxa de Sucesso', `${stats.successRate}%`],
    ['Auto-corrigidos', `${stats.correctedRate}% (${stats.corrected})`],
    ['Média Diária', String(stats.avgDaily)],
  ];
  
  autoTable(doc, {
    startY: 56,
    head: [['Métrica', 'Valor']],
    body: metrics,
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold' } },
  });
  
  // Sources table
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Por Fonte:', 14, finalY + 15);
  
  autoTable(doc, {
    startY: finalY + 21,
    head: [['Fonte', 'Quantidade']],
    body: stats.bySource.map(s => [s.name, String(s.count)]),
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
    styles: { fontSize: 10 },
  });
  
  // Types table
  const finalY2 = (doc as any).lastAutoTable.finalY || 150;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Por Tipo:', 14, finalY2 + 15);
  
  autoTable(doc, {
    startY: finalY2 + 21,
    head: [['Tipo', 'Quantidade']],
    body: stats.byType.map(t => [TYPE_LABELS[t.type] || t.type, String(t.count)]),
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22] },
    styles: { fontSize: 10 },
  });
  
  doc.save(`noticias-ai-estatisticas-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function exportStatsToExcel(stats: Stats, period: string) {
  const wb = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    { 'Métrica': 'Total Importado', 'Valor': stats.total },
    { 'Métrica': 'Sucesso', 'Valor': stats.success },
    { 'Métrica': 'Taxa de Sucesso', 'Valor': `${stats.successRate}%` },
    { 'Métrica': 'Auto-corrigidos', 'Valor': stats.corrected },
    { 'Métrica': 'Taxa Auto-correção', 'Valor': `${stats.correctedRate}%` },
    { 'Métrica': 'Média Diária', 'Valor': stats.avgDaily },
    { 'Métrica': 'Período', 'Valor': period },
  ];
  
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');
  
  // Sources sheet
  const sourcesData = stats.bySource.map(s => ({
    'Fonte': s.name,
    'Quantidade': s.count,
  }));
  
  const wsSources = XLSX.utils.json_to_sheet(sourcesData);
  XLSX.utils.book_append_sheet(wb, wsSources, 'Por Fonte');
  
  // Types sheet
  const typesData = stats.byType.map(t => ({
    'Tipo': TYPE_LABELS[t.type] || t.type,
    'Quantidade': t.count,
  }));
  
  const wsTypes = XLSX.utils.json_to_sheet(typesData);
  XLSX.utils.book_append_sheet(wb, wsTypes, 'Por Tipo');
  
  XLSX.writeFile(wb, `noticias-ai-estatisticas-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}
