import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CensoPcdStats, TIPOS_DEFICIENCIA, ATENDIMENTOS, PRIORIDADES } from "@/hooks/useCensoPcd";

export function generateCensoPcdExecutiveReport(stats: CensoPcdStats): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  const centerText = (text: string, y: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    doc.text(text, pageWidth / 2, y, { align: "center" });
  };

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  // ==================== CAPA ====================
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 60, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  centerText("RELATÓRIO EXECUTIVO", 30, 24);
  centerText("CENSO PcD COTIA", 45, 18);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  centerText(`Gerado em ${today}`, 80, 12);

  // Resumo Executivo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("RESUMO EXECUTIVO", margin, 100);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const resumoY = 115;
  const col1X = margin;
  const col2X = pageWidth / 2;

  // Indicadores principais
  doc.setFont("helvetica", "bold");
  doc.text("Total de Registros:", col1X, resumoY);
  doc.setFont("helvetica", "normal");
  doc.text(stats.total.toString(), col1X + 45, resumoY);

  doc.setFont("helvetica", "bold");
  doc.text("Registros Hoje:", col2X, resumoY);
  doc.setFont("helvetica", "normal");
  doc.text(stats.hoje.toString(), col2X + 40, resumoY);

  doc.setFont("helvetica", "bold");
  doc.text("Últimos 7 dias:", col1X, resumoY + 10);
  doc.setFont("helvetica", "normal");
  doc.text(stats.semana.toString(), col1X + 45, resumoY + 10);

  doc.setFont("helvetica", "bold");
  doc.text("Pessoas com TEA:", col2X, resumoY + 10);
  doc.setFont("helvetica", "normal");
  doc.text(stats.tea_count.toString(), col2X + 45, resumoY + 10);

  doc.setFont("helvetica", "bold");
  doc.text("Bairros Mapeados:", col1X, resumoY + 20);
  doc.setFont("helvetica", "normal");
  doc.text(stats.bairros.length.toString(), col1X + 45, resumoY + 20);

  doc.setFont("helvetica", "bold");
  doc.text("Downloads eBook:", col2X, resumoY + 20);
  doc.setFont("helvetica", "normal");
  doc.text(stats.downloads.toString(), col2X + 45, resumoY + 20);

  // ==================== DISTRIBUIÇÃO POR BAIRRO ====================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("DISTRIBUIÇÃO POR BAIRRO", margin, 160);

  const bairroData = stats.bairros.slice(0, 15).map(b => [
    b.bairro,
    b.count.toString(),
    ((b.count / stats.total) * 100).toFixed(1) + "%"
  ]);

  autoTable(doc, {
    startY: 165,
    head: [["Bairro", "Quantidade", "Percentual"]],
    body: bairroData,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] }
  });

  // ==================== PÁGINA 2: TIPOS DE DEFICIÊNCIA ====================
  doc.addPage();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TIPOS DE DEFICIÊNCIA IDENTIFICADOS", margin, 30);

  const deficienciaLabels: Record<string, string> = {};
  TIPOS_DEFICIENCIA.forEach(t => {
    deficienciaLabels[t.value] = t.label;
  });

  const deficienciaData = stats.deficiencias.map(d => [
    deficienciaLabels[d.tipo] || d.tipo,
    d.count.toString(),
    ((d.count / stats.total) * 100).toFixed(1) + "%"
  ]);

  autoTable(doc, {
    startY: 35,
    head: [["Tipo de Deficiência", "Quantidade", "Percentual"]],
    body: deficienciaData,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] }
  });

  // Demandas de Saúde
  const currentY = (doc as any).lastAutoTable.finalY + 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("DEMANDAS DE SAÚDE", margin, currentY);

  const atendimentoLabels: Record<string, string> = {};
  ATENDIMENTOS.forEach(a => {
    atendimentoLabels[a.value] = a.label;
  });

  const atendimentoData = stats.atendimentos.map(a => [
    atendimentoLabels[a.tipo] || a.tipo,
    a.count.toString()
  ]);

  autoTable(doc, {
    startY: currentY + 5,
    head: [["Especialidade/Terapia", "Demanda"]],
    body: atendimentoData,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [220, 38, 38] }
  });

  // ==================== PÁGINA 3: PRIORIDADES ====================
  doc.addPage();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PRIORIDADES DECLARADAS", margin, 30);

  const prioridadeLabels: Record<string, string> = {};
  PRIORIDADES.forEach(p => {
    prioridadeLabels[p.value] = p.label;
  });

  const prioridadeData = stats.prioridades.map(p => [
    prioridadeLabels[p.prioridade] || p.prioridade,
    p.count.toString(),
    ((p.count / stats.total) * 100).toFixed(1) + "%"
  ]);

  autoTable(doc, {
    startY: 35,
    head: [["Maior Necessidade", "Quantidade", "Percentual"]],
    body: prioridadeData,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [22, 163, 74] }
  });

  // Situação Educacional
  const eduY = (doc as any).lastAutoTable.finalY + 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SITUAÇÃO EDUCACIONAL", margin, eduY);

  const educacaoLabels: Record<string, string> = {
    municipal: "Escola Municipal",
    estadual: "Escola Estadual",
    particular: "Escola Particular",
    nao_matriculado: "Não Matriculado"
  };

  const educacaoData = stats.educacao.map(e => [
    educacaoLabels[e.status] || e.status,
    e.count.toString()
  ]);

  autoTable(doc, {
    startY: eduY + 5,
    head: [["Situação", "Quantidade"]],
    body: educacaoData,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [147, 51, 234] }
  });

  // Benefícios
  const benY = (doc as any).lastAutoTable.finalY + 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("COBERTURA DE BENEFÍCIOS", margin, benY);

  const beneficioLabels: Record<string, string> = {
    bpc_loas: "BPC/LOAS",
    municipal: "Benefício Municipal",
    nenhum: "Nenhum Benefício"
  };

  const beneficioData = stats.beneficios.map(b => [
    beneficioLabels[b.tipo] || b.tipo,
    b.count.toString()
  ]);

  autoTable(doc, {
    startY: benY + 5,
    head: [["Benefício", "Quantidade"]],
    body: beneficioData,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [234, 88, 12] }
  });

  // ==================== PÁGINA 4: RECOMENDAÇÕES ====================
  doc.addPage();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("RECOMENDAÇÕES", margin, 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const recomendacoes = [
    "1. SAÚDE: Ampliar a oferta de especialistas nas áreas mais demandadas, especialmente neurologistas e terapeutas ocupacionais.",
    "",
    "2. EDUCAÇÃO: Garantir professores de apoio e acompanhantes especializados em todas as escolas municipais.",
    "",
    "3. ASSISTÊNCIA SOCIAL: Realizar busca ativa de famílias que ainda não recebem BPC/LOAS e orientá-las sobre o processo de solicitação.",
    "",
    "4. TRANSPORTE: Avaliar demanda por transporte adaptado nas regiões com maior concentração de PcDs.",
    "",
    "5. MUTIRÕES: Organizar mutirões de atendimento nos bairros com maior número de registros.",
    "",
    "6. CAPACITAÇÃO: Treinar profissionais de saúde e educação para atendimento especializado a pessoas com TEA."
  ];

  let recY = 40;
  recomendacoes.forEach(rec => {
    if (rec === "") {
      recY += 5;
    } else {
      const lines = doc.splitTextToSize(rec, contentWidth);
      doc.text(lines, margin, recY);
      recY += lines.length * 5 + 3;
    }
  });

  // Rodapé
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(37, 99, 235);
  doc.rect(0, pageHeight - 30, pageWidth, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  centerText("Censo PcD Cotia - Relatório Executivo", pageHeight - 18, 9);
  centerText("Portal Conexão na Cidade • Impacto Social PcD Cotia • AB Soluções • Illúmina", pageHeight - 10, 8);

  return doc;
}

export function downloadCensoPcdExecutiveReport(stats: CensoPcdStats): void {
  const doc = generateCensoPcdExecutiveReport(stats);
  const today = new Date().toISOString().split("T")[0];
  doc.save(`Censo-PcD-Cotia-Relatorio-Executivo-${today}.pdf`);
}
