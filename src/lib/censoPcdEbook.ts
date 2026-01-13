import jsPDF from "jspdf";

export function generateCensoPcdEbook(): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Helper functions
  const centerText = (text: string, y: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    doc.text(text, pageWidth / 2, y, { align: "center" });
  };

  const addParagraph = (text: string, startY: number, fontSize: number = 11): number => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, startY);
    return startY + lines.length * (fontSize * 0.4) + 5;
  };

  // ==================== PÁGINA 1: CAPA ====================
  doc.setFillColor(37, 99, 235); // Azul
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  centerText("CENSO PcD COTIA", 80, 32);

  doc.setFont("helvetica", "normal");
  centerText("Mapeando a Inclusão", 100, 18);

  doc.setFontSize(12);
  centerText("Um projeto para conhecer e atender", 140, 12);
  centerText("as necessidades das Pessoas com Deficiência", 150, 12);
  centerText("e TEA em Cotia/SP", 160, 12);

  doc.setFontSize(10);
  centerText("Apoio Institucional:", 220, 10);
  centerText("Portal Conexão na Cidade • Impacto Social PcD Cotia", 232, 9);
  centerText("AB Soluções • Illúmina Inovação & Inclusão", 242, 9);

  // ==================== PÁGINA 2: APRESENTAÇÃO ====================
  doc.addPage();
  doc.setTextColor(0, 0, 0);

  doc.setFont("helvetica", "bold");
  centerText("O QUE É O CENSO PcD COTIA?", 30, 18);

  doc.setFont("helvetica", "normal");
  let y = 50;

  y = addParagraph(
    "O Censo PcD Cotia é uma iniciativa pioneira que busca mapear todas as Pessoas com Deficiência (PcD) e pessoas com Transtorno do Espectro Autista (TEA) residentes em Cotia, São Paulo.",
    y
  );

  y = addParagraph(
    "Este levantamento é fundamental para identificar necessidades reais nas áreas de saúde, educação, assistência social, mobilidade e suporte familiar, permitindo o desenvolvimento de políticas públicas mais eficientes e inclusivas.",
    y + 5
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("OBJETIVOS:", margin, y + 15);
  doc.setFont("helvetica", "normal");
  y += 25;

  const objetivos = [
    "✓ Levantar dados reais e atualizados das PcDs e TEA",
    "✓ Identificar necessidades médicas, educacionais e sociais",
    "✓ Gerar relatórios estratégicos para políticas públicas",
    "✓ Criar base estruturada para ações e atendimentos",
    "✓ Fortalecer iniciativas de inclusão e impacto social"
  ];

  objetivos.forEach((obj) => {
    y = addParagraph(obj, y, 11);
  });

  // ==================== PÁGINA 3: IMPORTÂNCIA ====================
  doc.addPage();

  doc.setFont("helvetica", "bold");
  centerText("POR QUE PARTICIPAR?", 30, 18);

  doc.setFont("helvetica", "normal");
  y = 50;

  y = addParagraph(
    "Sua participação é fundamental! Ao responder o Censo PcD Cotia, você contribui diretamente para:",
    y
  );

  const beneficios = [
    "🏥 SAÚDE: Identificação de demandas reprimidas por especialistas como neurologistas, fonoaudiólogos e terapeutas ocupacionais.",
    "📚 EDUCAÇÃO: Mapeamento de necessidades de apoio escolar, professores especializados e tecnologias assistivas.",
    "💼 ASSISTÊNCIA SOCIAL: Identificação de famílias que precisam de benefícios e suporte social.",
    "🚌 MOBILIDADE: Levantamento de demandas por transporte adaptado e acessibilidade urbana.",
    "👨‍👩‍👧‍👦 SUPORTE FAMILIAR: Compreensão das necessidades dos cuidadores e familiares."
  ];

  y += 10;
  beneficios.forEach((ben) => {
    y = addParagraph(ben, y, 10);
    y += 3;
  });

  doc.setFillColor(240, 240, 240);
  doc.roundedRect(margin, y + 5, contentWidth, 35, 3, 3, "F");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  const quote = "\"Cada resposta conta. Cada pessoa importa. Juntos, construímos uma Cotia mais inclusiva.\"";
  const quoteLines = doc.splitTextToSize(quote, contentWidth - 10);
  doc.text(quoteLines, margin + 5, y + 18);

  // ==================== PÁGINA 4: DIREITOS ====================
  doc.addPage();

  doc.setFont("helvetica", "bold");
  centerText("SEUS DIREITOS", 30, 18);

  doc.setFont("helvetica", "normal");
  y = 50;

  y = addParagraph(
    "A Lei Brasileira de Inclusão (Lei nº 13.146/2015) garante diversos direitos às Pessoas com Deficiência:",
    y
  );

  const direitos = [
    "📋 IGUALDADE E NÃO DISCRIMINAÇÃO: Direito a tratamento igualitário em todas as esferas da vida.",
    "🏥 SAÚDE: Atendimento integral no SUS, incluindo reabilitação, órteses, próteses e medicamentos.",
    "📚 EDUCAÇÃO INCLUSIVA: Acesso à educação em todos os níveis, com adaptações necessárias.",
    "💼 TRABALHO: Reserva de vagas em empresas e concursos públicos.",
    "🏠 MORADIA: Prioridade em programas habitacionais.",
    "💰 BPC/LOAS: Benefício de um salário mínimo para quem não possui meios de sustento."
  ];

  y += 10;
  direitos.forEach((dir) => {
    y = addParagraph(dir, y, 10);
    y += 3;
  });

  // ==================== PÁGINA 5: COMPROMISSO ====================
  doc.addPage();

  doc.setFont("helvetica", "bold");
  centerText("NOSSO COMPROMISSO", 30, 18);

  doc.setFont("helvetica", "normal");
  y = 50;

  const compromissos = [
    {
      titulo: "🔒 PROTEÇÃO DE DADOS",
      texto: "Todos os dados coletados são protegidos conforme a LGPD. Suas informações são usadas exclusivamente para fins de políticas públicas e ações sociais."
    },
    {
      titulo: "♿ ACESSIBILIDADE",
      texto: "O Censo foi desenvolvido seguindo as diretrizes WCAG 2.1, garantindo que todas as pessoas possam participar, independentemente de suas limitações."
    },
    {
      titulo: "📊 TRANSPARÊNCIA",
      texto: "Os resultados consolidados serão disponibilizados publicamente, sempre preservando a identidade dos participantes."
    },
    {
      titulo: "🤝 AÇÃO PRÁTICA",
      texto: "Os dados coletados serão utilizados para organizar mutirões de atendimento, programas de capacitação e ações de inclusão."
    }
  ];

  compromissos.forEach((comp) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(comp.titulo, margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    y = addParagraph(comp.texto, y, 10);
    y += 8;
  });

  // ==================== PÁGINA 6: RECURSOS ====================
  doc.addPage();

  doc.setFont("helvetica", "bold");
  centerText("RECURSOS EM COTIA", 30, 18);

  doc.setFont("helvetica", "normal");
  y = 50;

  const recursos = [
    {
      nome: "CRAS - Centro de Referência de Assistência Social",
      descricao: "Atendimento a famílias em situação de vulnerabilidade social."
    },
    {
      nome: "CREAS - Centro de Referência Especializado",
      descricao: "Atendimento especializado a pessoas com direitos violados."
    },
    {
      nome: "Secretaria de Saúde",
      descricao: "Agendamento de consultas, terapias e reabilitação pelo SUS."
    },
    {
      nome: "Secretaria de Educação",
      descricao: "Matrículas, apoio educacional especializado e transporte escolar."
    },
    {
      nome: "INSS - Agência Cotia",
      descricao: "Solicitação de BPC/LOAS e outros benefícios previdenciários."
    },
    {
      nome: "Defensoria Pública",
      descricao: "Orientação jurídica gratuita sobre direitos da pessoa com deficiência."
    }
  ];

  recursos.forEach((rec) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("• " + rec.nome, margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    y = addParagraph("  " + rec.descricao, y, 10);
    y += 5;
  });

  // ==================== PÁGINA 7: CONTATOS ====================
  doc.addPage();

  doc.setFont("helvetica", "bold");
  centerText("CONTATOS ÚTEIS", 30, 18);

  doc.setFont("helvetica", "normal");
  y = 50;

  const contatos = [
    "📞 Prefeitura de Cotia: (11) 4616-0300",
    "📞 Secretaria de Saúde: (11) 4703-8000",
    "📞 Secretaria de Educação: (11) 4703-8500",
    "📞 INSS (Previdência Social): 135",
    "📞 Disque Direitos Humanos: 100",
    "📞 SAMU: 192",
    "",
    "🌐 Portal Conexão na Cidade: conexaonacidade.com.br",
    "🌐 Prefeitura de Cotia: cotia.sp.gov.br"
  ];

  contatos.forEach((cont) => {
    if (cont === "") {
      y += 10;
    } else {
      y = addParagraph(cont, y, 11);
    }
  });

  doc.setFillColor(37, 99, 235);
  doc.roundedRect(margin, y + 20, contentWidth, 40, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  centerText("Precisa de ajuda?", y + 35, 12);
  doc.setFont("helvetica", "normal");
  centerText("Entre em contato com a equipe do Censo PcD Cotia", y + 48, 10);

  // ==================== PÁGINA 8: PARCEIROS ====================
  doc.addPage();
  doc.setTextColor(0, 0, 0);

  doc.setFont("helvetica", "bold");
  centerText("APOIO INSTITUCIONAL", 30, 18);

  doc.setFont("helvetica", "normal");
  y = 60;

  const parceiros = [
    {
      nome: "Portal Conexão na Cidade",
      descricao: "Plataforma de notícias e serviços para a comunidade de Cotia e região."
    },
    {
      nome: "Impacto Social PcD Cotia",
      descricao: "Iniciativa dedicada à promoção dos direitos das pessoas com deficiência."
    },
    {
      nome: "AB Soluções",
      descricao: "Consultoria especializada em tecnologia e acessibilidade."
    },
    {
      nome: "Illúmina Inovação & Inclusão",
      descricao: "Organização focada em inovação social e práticas inclusivas."
    }
  ];

  parceiros.forEach((parc) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(parc.nome, margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    y = addParagraph(parc.descricao, y, 10);
    y += 12;
  });

  // Rodapé
  doc.setFillColor(37, 99, 235);
  doc.rect(0, pageHeight - 40, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  centerText("OBRIGADO POR PARTICIPAR!", pageHeight - 25, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  centerText("Juntos, construímos uma Cotia mais inclusiva.", pageHeight - 12, 10);

  return doc;
}

export function downloadCensoPcdEbook(): void {
  const doc = generateCensoPcdEbook();
  doc.save("Censo-PcD-Cotia-eBook.pdf");
}
