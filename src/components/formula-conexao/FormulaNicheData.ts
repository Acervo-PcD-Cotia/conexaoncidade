export interface NicheDepoimento {
  nome: string;
  texto: string;
}

export interface NicheData {
  key: string;
  icon: string;
  label: string;
  heroText: string;
  servicos: string[];
  conexaoAI: string;
  depoimentos: NicheDepoimento[];
  cta: string;
}

export const NICHES: NicheData[] = [
  {
    key: "clinica",
    icon: "🏥",
    label: "Clínica / Consultório",
    heroText: "Tecnologia e cuidado que transformam vidas em Cotia.",
    servicos: ["Consultas", "Exames", "Procedimentos", "Telemedicina"],
    conexaoAI: "Agenda consultas, orienta preparos para exames e tira dúvidas 24h pelo WhatsApp.",
    depoimentos: [
      { nome: "Dra. Fernanda L.", texto: "Nossos agendamentos triplicaram em 2 meses com a Conexão AI." },
      { nome: "Dr. Ricardo M.", texto: "Pacientes adoram o atendimento 24h no WhatsApp." },
      { nome: "Clínica Vida+", texto: "Aparecemos no Google antes da concorrência. Resultado imediato." },
    ],
    cta: "Agende agora pelo WhatsApp",
  },
  {
    key: "escola",
    icon: "🎓",
    label: "Escola / Colégio / Curso",
    heroText: "Educação que transforma o futuro em Cotia.",
    servicos: ["Infantil", "Fundamental", "Médio", "Cursos Livres"],
    conexaoAI: "Atende pais, explica processo de matrícula e envia comunicados automaticamente.",
    depoimentos: [
      { nome: "Colégio Progresso", texto: "As matrículas aumentaram 40% com o site e a IA." },
      { nome: "Prof. Ana Paula", texto: "Pais tiram dúvidas no WhatsApp sem sobrecarregar a secretaria." },
      { nome: "Escola Crescer", texto: "O selo verificado trouxe credibilidade imediata." },
    ],
    cta: "Garanta a vaga do seu filho",
  },
  {
    key: "restaurante",
    icon: "🍕",
    label: "Restaurante / Gastronomia",
    heroText: "Uma experiência gastronômica única em Cotia.",
    servicos: ["Almoço", "Jantar", "Delivery", "Eventos"],
    conexaoAI: "Recebe pedidos, mostra cardápio digital e confirma reservas pelo WhatsApp.",
    depoimentos: [
      { nome: "Cantina Bella", texto: "Delivery cresceu 60% depois do site premium." },
      { nome: "Chef Marcos", texto: "A IA responde cardápio e faz reservas sozinha." },
      { nome: "Sabor da Terra", texto: "Clientes encontram a gente no Google Maps facilmente agora." },
    ],
    cta: "Reserve ou peça agora",
  },
  {
    key: "salao",
    icon: "💇",
    label: "Salão / Estética / Barbearia",
    heroText: "Beleza, estilo e autoestima em Cotia.",
    servicos: ["Corte", "Coloração", "Estética", "Manicure"],
    conexaoAI: "Agenda horários, lembra clientes sobre retorno e sugere serviços complementares.",
    depoimentos: [
      { nome: "Studio Bella", texto: "Reduzi faltas em 70% com lembretes automáticos." },
      { nome: "Barbearia Premium", texto: "A agenda online mudou nosso faturamento." },
      { nome: "Espaço Renascer", texto: "Clientes novos chegam todo dia pelo Google." },
    ],
    cta: "Agende seu horário agora",
  },
  {
    key: "comercio",
    icon: "🛒",
    label: "Comércio / Loja",
    heroText: "As melhores ofertas de Cotia na palma da sua mão.",
    servicos: ["Produtos", "Promoções", "Catálogo Digital", "Delivery"],
    conexaoAI: "Mostra estoque, envia link de pagamento e rastreia entregas pelo WhatsApp.",
    depoimentos: [
      { nome: "Loja Casa & Cia", texto: "Vendas online subiram 80% no primeiro mês." },
      { nome: "Pet Shop Amigo", texto: "A IA responde sobre produtos mesmo de madrugada." },
      { nome: "Elétrica Raio", texto: "Catálogo digital eliminou o papel e agilizou tudo." },
    ],
    cta: "Fale com a IA agora",
  },
  {
    key: "advocacia",
    icon: "⚖️",
    label: "Escritório / Advocacia / Contabilidade",
    heroText: "Segurança jurídica e contábil com agilidade.",
    servicos: ["Trabalhista", "Civil", "Fiscal", "Tributário"],
    conexaoAI: "Faz triagem completa do caso, coleta documentos e agenda consultas automaticamente.",
    depoimentos: [
      { nome: "Adv. Silva & Associados", texto: "A triagem automática economiza 3h por dia." },
      { nome: "Contabilidade Exata", texto: "Clientes enviam documentos pelo WhatsApp direto." },
      { nome: "Adv. Marina Costa", texto: "O site premium me posicionou como referência na região." },
    ],
    cta: "Agende sua consulta",
  },
  {
    key: "academia",
    icon: "🏋️",
    label: "Academia / Esporte",
    heroText: "Seu melhor corpo começa aqui.",
    servicos: ["Musculação", "Crossfit", "Yoga", "Spinning"],
    conexaoAI: "Agenda aulas experimentais, envia planos e recupera alunos inativos automaticamente.",
    depoimentos: [
      { nome: "CrossFit Power", texto: "Recuperamos 30 alunos inativos no primeiro mês." },
      { nome: "Studio Zen Yoga", texto: "A agenda inteligente otimizou as turmas." },
      { nome: "Arena Fit", texto: "Leads qualificados chegam todo dia pelo site." },
    ],
    cta: "Agende aula experimental",
  },
  {
    key: "imobiliaria",
    icon: "🏠",
    label: "Imobiliária / Construção",
    heroText: "Conectando você ao imóvel ideal em Cotia.",
    servicos: ["Compra", "Venda", "Locação", "Avaliação"],
    conexaoAI: "Filtra imóveis por perfil, envia vídeos e agenda visitas pelo WhatsApp.",
    depoimentos: [
      { nome: "Imob Cotia Lar", texto: "A IA filtra clientes e só manda lead qualificado." },
      { nome: "Construtora Horizonte", texto: "Vendemos 3 unidades no primeiro mês com o site." },
      { nome: "Corretor João Lima", texto: "O tour do imóvel pelo WhatsApp fecha negócio rápido." },
    ],
    cta: "Veja imóveis agora",
  },
  {
    key: "outro",
    icon: "➕",
    label: "Outro",
    heroText: "Inovação e presença digital para seu negócio em Cotia.",
    servicos: ["Presença Digital", "Atendimento IA", "Marketing", "Fidelização"],
    conexaoAI: "Atende seus clientes 24h, qualifica leads e automatiza processos pelo WhatsApp.",
    depoimentos: [
      { nome: "Empresa Alpha", texto: "Em 30 dias já aparecíamos no topo do Google." },
      { nome: "Studio Beta", texto: "A IA reduziu nosso tempo de resposta para segundos." },
      { nome: "Serviços Gama", texto: "O investimento se pagou no primeiro mês." },
    ],
    cta: "Fale conosco agora",
  },
];

export function getNicheByKey(key: string): NicheData {
  return NICHES.find((n) => n.key === key) || NICHES[NICHES.length - 1];
}
