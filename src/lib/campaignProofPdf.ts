import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CampaignProofFull } from "@/types/campaign-proofs";

const PRIMARY_COLOR: [number, number, number] = [0, 100, 180];
const DARK_COLOR: [number, number, number] = [30, 30, 30];

/**
 * Generate Veiculação PDF
 */
export async function generateVeiculacaoPdf(proof: CampaignProofFull): Promise<void> {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // === PAGE 1: COVER ===
  addCoverPage(pdf, proof, "COMPROVANTE DE VEICULAÇÃO");

  // === PAGE 2: CHANNELS ===
  pdf.addPage();
  addChannelsPage(pdf, proof);

  // === PAGES 3+: PRINTS ===
  const veiculacaoAssets = proof.assets.filter((a) => a.asset_type === "VEICULACAO_PRINT");
  if (veiculacaoAssets.length > 0) {
    await addPrintPages(pdf, veiculacaoAssets, "Prints de Veiculação");
  }

  // === FOOTER ON ALL PAGES ===
  addFooterToAllPages(pdf, proof);

  // Download
  const filename = `comprovante-veiculacao-${proof.insertion_order}.pdf`;
  pdf.save(filename);
}

/**
 * Generate Analytics PDF
 */
export async function generateAnalyticsPdf(proof: CampaignProofFull): Promise<void> {
  const pdf = new jsPDF("p", "mm", "a4");

  // === PAGE 1: COVER ===
  addCoverPage(pdf, proof, "RELATÓRIO GOOGLE ANALYTICS");

  // === PAGE 2: METRICS (if enabled) ===
  if (proof.analytics?.show_on_pdf) {
    pdf.addPage();
    addMetricsPage(pdf, proof);
  }

  // === PAGES 3+: PRINTS ===
  const analyticsAssets = proof.assets.filter((a) => a.asset_type === "ANALYTICS_PRINT");
  if (analyticsAssets.length > 0) {
    await addPrintPages(pdf, analyticsAssets, "Prints do Analytics");
  }

  // === FOOTER ON ALL PAGES ===
  addFooterToAllPages(pdf, proof);

  // Download
  const filename = `relatorio-analytics-${proof.insertion_order}.pdf`;
  pdf.save(filename);
}

// =========================================
// HELPER FUNCTIONS
// =========================================

function addCoverPage(pdf: jsPDF, proof: CampaignProofFull, title: string) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  // Header bar
  pdf.setFillColor(...PRIMARY_COLOR);
  pdf.rect(0, 0, pageWidth, 50, "F");

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text(title, pageWidth / 2, 32, { align: "center" });

  // Site info
  pdf.setTextColor(...DARK_COLOR);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text(proof.site_name, pageWidth / 2, 80, { align: "center" });

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(proof.site_domain, pageWidth / 2, 90, { align: "center" });

  // Campaign info box
  const boxY = 110;
  const boxHeight = 80;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, boxY, pageWidth - margin * 2, boxHeight, "S");

  let textY = boxY + 15;
  const lineHeight = 12;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("Pedido de Inserção:", margin + 10, textY);
  pdf.setFont("helvetica", "normal");
  pdf.text(proof.insertion_order, margin + 60, textY);

  textY += lineHeight;
  pdf.setFont("helvetica", "bold");
  pdf.text("Campanha:", margin + 10, textY);
  pdf.setFont("helvetica", "normal");
  pdf.text(proof.campaign_name, margin + 45, textY);

  textY += lineHeight;
  pdf.setFont("helvetica", "bold");
  pdf.text("Cliente:", margin + 10, textY);
  pdf.setFont("helvetica", "normal");
  pdf.text(proof.client_name, margin + 35, textY);

  textY += lineHeight;
  pdf.setFont("helvetica", "bold");
  pdf.text("Período:", margin + 10, textY);
  pdf.setFont("helvetica", "normal");
  const periodo = `${format(new Date(proof.start_date), "dd/MM/yyyy", { locale: ptBR })} a ${format(new Date(proof.end_date), "dd/MM/yyyy", { locale: ptBR })}`;
  pdf.text(periodo, margin + 35, textY);

  // Optional fields
  if (proof.internal_number || proof.internal_code) {
    textY += lineHeight;
    if (proof.internal_number) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Número:", margin + 10, textY);
      pdf.setFont("helvetica", "normal");
      pdf.text(proof.internal_number, margin + 35, textY);
    }
    if (proof.internal_code) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Código:", margin + 80, textY);
      pdf.setFont("helvetica", "normal");
      pdf.text(proof.internal_code, margin + 105, textY);
    }
  }
}

function addChannelsPage(pdf: jsPDF, proof: CampaignProofFull) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;

  // Title
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...DARK_COLOR);
  pdf.text("PEDIDOS DE INSERÇÃO - NOSSOS CANAIS", pageWidth / 2, 30, { align: "center" });

  // Table
  if (proof.channels.length > 0) {
    autoTable(pdf, {
      startY: 45,
      head: [["Canal", "Descrição", "Métrica"]],
      body: proof.channels.map((ch) => [
        ch.channel_name,
        ch.channel_value || "-",
        ch.channel_metric || "-",
      ]),
      headStyles: {
        fillColor: PRIMARY_COLOR,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      margin: { left: margin, right: margin },
    });
  } else {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("Nenhum canal cadastrado", pageWidth / 2, 60, { align: "center" });
  }
}

function addMetricsPage(pdf: jsPDF, proof: CampaignProofFull) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const analytics = proof.analytics;

  if (!analytics) return;

  // Title
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...DARK_COLOR);
  pdf.text("MÉTRICAS DO PERÍODO", pageWidth / 2, 30, { align: "center" });

  // Metrics table
  const metricsData: [string, string][] = [];
  
  if (analytics.users) metricsData.push(["Usuários", analytics.users.toLocaleString("pt-BR")]);
  if (analytics.new_users) metricsData.push(["Novos Usuários", analytics.new_users.toLocaleString("pt-BR")]);
  if (analytics.pageviews) metricsData.push(["Visualizações", analytics.pageviews.toLocaleString("pt-BR")]);
  if (analytics.unique_pageviews) metricsData.push(["Visualizações Únicas", analytics.unique_pageviews.toLocaleString("pt-BR")]);
  if (analytics.sessions) metricsData.push(["Sessões", analytics.sessions.toLocaleString("pt-BR")]);
  if (analytics.bounce_rate) metricsData.push(["Taxa de Rejeição", `${analytics.bounce_rate}%`]);
  if (analytics.avg_time) metricsData.push(["Tempo Médio", analytics.avg_time]);
  if (analytics.entrances) metricsData.push(["Entradas", analytics.entrances.toLocaleString("pt-BR")]);

  if (metricsData.length > 0) {
    autoTable(pdf, {
      startY: 45,
      head: [["Métrica", "Valor"]],
      body: metricsData,
      headStyles: {
        fillColor: PRIMARY_COLOR,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 11,
        cellPadding: 8,
      },
      columnStyles: {
        0: { fontStyle: "bold" },
        1: { halign: "right" },
      },
      margin: { left: margin, right: margin },
    });
  }

  // Notes
  if (analytics.notes) {
    const finalY = (pdf as any).lastAutoTable?.finalY || 150;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.text(`Observações: ${analytics.notes}`, margin, finalY + 20, {
      maxWidth: pageWidth - margin * 2,
    });
  }
}

async function addPrintPages(
  pdf: jsPDF,
  assets: CampaignProofFull["assets"],
  sectionTitle: string
) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const maxImageHeight = 100;

  pdf.addPage();

  // Section title
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...DARK_COLOR);
  pdf.text(sectionTitle, pageWidth / 2, 25, { align: "center" });

  let currentY = 40;
  let imagesOnPage = 0;

  for (const asset of assets) {
    if (!asset.file_url) continue;

    try {
      // Check if we need a new page
      if (currentY + maxImageHeight + 20 > pageHeight - 30) {
        pdf.addPage();
        currentY = 30;
        imagesOnPage = 0;
      }

      // Load image
      const img = await loadImage(asset.file_url);
      
      // Calculate dimensions
      const aspectRatio = img.width / img.height;
      let imgWidth = contentWidth;
      let imgHeight = imgWidth / aspectRatio;

      if (imgHeight > maxImageHeight) {
        imgHeight = maxImageHeight;
        imgWidth = imgHeight * aspectRatio;
      }

      // Center image
      const imgX = margin + (contentWidth - imgWidth) / 2;

      // Add image
      pdf.addImage(img, "JPEG", imgX, currentY, imgWidth, imgHeight);

      currentY += imgHeight + 5;

      // Add caption
      if (asset.caption) {
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "italic");
        pdf.text(asset.caption, pageWidth / 2, currentY, { align: "center" });
        currentY += 10;
      }

      currentY += 10;
      imagesOnPage++;
    } catch (error) {
      console.error("Error loading image:", error);
    }
  }
}

function addFooterToAllPages(pdf: jsPDF, proof: CampaignProofFull) {
  const pageCount = pdf.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(150, 150, 150);

    const generatedDate = format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR });
    const footerText = `${proof.site_domain} • Gerado em ${generatedDate} • Página ${i} de ${pageCount}`;

    pdf.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
