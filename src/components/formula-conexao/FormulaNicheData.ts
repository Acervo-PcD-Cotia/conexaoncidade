export interface NicheDepoimento {
  nome: string;
  texto: string;
}

export interface NicheData {
  key: string;
  icon: string;
  label: string;
  description: string;
  heroText: string;
  servicos: string[];
  servicoIcons: string[];
  conexaoAI: string;
  conexaoAIChatPreview: { role: "user" | "ai"; text: string }[];
  depoimentos: NicheDepoimento[];
  cta: string;
  accentColor: string;
  avatarColors: string[];
}

export const NICHES: NicheData[] = [
  {
    key: "clinica",
    icon: "🏥",
    label: "Clínica / Consultório",
    description: "Saúde e bem-estar",
    heroText: "Tecnologia e cuidado que transformam vidas em Cotia.",
    servicos: ["Consultas", "Exames", "Procedimentos", "Telemedicina"],
    servicoIcons: ["Stethoscope", "TestTube", "HeartPulse", "Video"],
    conexaoAI: "Agenda consultas, orienta preparos para exames e tira dúvidas 24h pelo WhatsApp.",
    conexaoAIChatPreview: [
      { role: "user", text: "Quero agendar uma consulta para amanhã" },
      { role: "ai", text: "Claro! Temos horários às 9h, 14h e 16h. Qual prefere? 😊" },
      { role: "user", text: "14h por favor!" },
    ],
    depoimentos: [
      { nome: "Dra. Fernanda L.", texto: "Nossos agendamentos triplicaram em 2 meses com a Conexão AI." },
      { nome: "Dr. Ricardo M.", texto: "Pacientes adoram o atendimento 24h no WhatsApp." },
      { nome: "Clínica Vida+", texto: "Aparecemos no Google antes da concorrência. Resultado imediato." },
    ],
    cta: "Agende agora pelo WhatsApp",
    accentColor: "199 89% 48%",
    avatarColors: ["#3B82F6", "#06B6D4", "#8B5CF6"],
  },
  {
    key: "escola",
    icon: "🎓",
    label: "Escola / Colégio / Curso",
    description: "Educação e ensino",
    heroText: "Educação que transforma o futuro em Cotia.",
    servicos: ["Infantil", "Fundamental", "Médio", "Cursos Livres"],
    servicoIcons: ["Baby", "BookOpen", "GraduationCap", "Palette"],
    conexaoAI: "Atende pais, explica processo de matrícula e envia comunicados automaticamente.",
    conexaoAIChatPreview: [
      { role: "user", text: "Ainda tem vaga para o 3º ano?" },
      { role: "ai", text: "Sim! Temos vagas para 2025. Posso agendar uma visita para conhecer a escola? 📚" },
      { role: "user", text: "Sim, pode ser sexta-feira!" },
    ],
    depoimentos: [
      { nome: "Colégio Progresso", texto: "As matrículas aumentaram 40% com o site e a IA." },
      { nome: "Prof. Ana Paula", texto: "Pais tiram dúvidas no WhatsApp sem sobrecarregar a secretaria." },
      { nome: "Escola Crescer", texto: "O selo verificado trouxe credibilidade imediata." },
    ],
    cta: "Garanta a vaga do seu filho",
    accentColor: "262 83% 58%",
    avatarColors: ["#8B5CF6", "#A855F7", "#6366F1"],
  },
  {
    key: "restaurante",
    icon: "🍕",
    label: "Restaurante / Gastronomia",
    description: "Gastronomia e delivery",
    heroText: "Uma experiência gastronômica única em Cotia.",
    servicos: ["Almoço", "Jantar", "Delivery", "Eventos"],
    servicoIcons: ["UtensilsCrossed", "Wine", "Truck", "PartyPopper"],
    conexaoAI: "Recebe pedidos, mostra cardápio digital e confirma reservas pelo WhatsApp.",
    conexaoAIChatPreview: [
      { role: "user", text: "Quero ver o cardápio do almoço" },
      { role: "ai", text: "Hoje temos: Filé Parmegiana (R$42), Salmão Grelhado (R$55) e Risoto de Cogumelos (R$48) 🍽️" },
      { role: "user", text: "Quero reservar mesa para 4 pessoas às 20h" },
    ],
    depoimentos: [
      { nome: "Cantina Bella", texto: "Delivery cresceu 60% depois do site premium." },
      { nome: "Chef Marcos", texto: "A IA responde cardápio e faz reservas sozinha." },
      { nome: "Sabor da Terra", texto: "Clientes encontram a gente no Google Maps facilmente agora." },
    ],
    cta: "Reserve ou peça agora",
    accentColor: "38 92% 50%",
    avatarColors: ["#F59E0B", "#EF4444", "#F97316"],
  },
  {
    key: "salao",
    icon: "💇",
    label: "Salão / Estética / Barbearia",
    description: "Beleza e cuidados pessoais",
    heroText: "Beleza, estilo e autoestima em Cotia.",
    servicos: ["Corte", "Coloração", "Estética", "Manicure"],
    servicoIcons: ["Scissors", "Paintbrush", "Sparkles", "Hand"],
    conexaoAI: "Agenda horários, lembra clientes sobre retorno e sugere serviços complementares.",
    conexaoAIChatPreview: [
      { role: "user", text: "Tem horário para corte feminino amanhã?" },
      { role: "ai", text: "Temos às 10h com a Carla e às 15h com a Ana. Qual prefere? ✂️" },
      { role: "user", text: "10h com a Carla!" },
    ],
    depoimentos: [
      { nome: "Studio Bella", texto: "Reduzi faltas em 70% com lembretes automáticos." },
      { nome: "Barbearia Premium", texto: "A agenda online mudou nosso faturamento." },
      { nome: "Espaço Renascer", texto: "Clientes novos chegam todo dia pelo Google." },
    ],
    cta: "Agende seu horário agora",
    accentColor: "330 81% 60%",
    avatarColors: ["#EC4899", "#F472B6", "#A855F7"],
  },
  {
    key: "comercio",
    icon: "🛒",
    label: "Comércio / Loja",
    description: "Varejo e vendas",
    heroText: "As melhores ofertas de Cotia na palma da sua mão.",
    servicos: ["Produtos", "Promoções", "Catálogo Digital", "Delivery"],
    servicoIcons: ["ShoppingBag", "Tag", "LayoutGrid", "Truck"],
    conexaoAI: "Mostra estoque, envia link de pagamento e rastreia entregas pelo WhatsApp.",
    conexaoAIChatPreview: [
      { role: "user", text: "Vocês têm aquele produto em promoção?" },
      { role: "ai", text: "Sim! Está com 30% de desconto até sexta. Posso enviar o link de pagamento? 🛍️" },
      { role: "user", text: "Manda o link!" },
    ],
    depoimentos: [
      { nome: "Loja Casa & Cia", texto: "Vendas online subiram 80% no primeiro mês." },
      { nome: "Pet Shop Amigo", texto: "A IA responde sobre produtos mesmo de madrugada." },
      { nome: "Elétrica Raio", texto: "Catálogo digital eliminou o papel e agilizou tudo." },
    ],
    cta: "Fale com a IA agora",
    accentColor: "142 71% 45%",
    avatarColors: ["#22C55E", "#10B981", "#34D399"],
  },
  {
    key: "advocacia",
    icon: "⚖️",
    label: "Escritório / Advocacia / Contabilidade",
    description: "Serviços jurídicos e contábeis",
    heroText: "Segurança jurídica e contábil com agilidade.",
    servicos: ["Trabalhista", "Civil", "Fiscal", "Tributário"],
    servicoIcons: ["Scale", "FileText", "Calculator", "Receipt"],
    conexaoAI: "Faz triagem completa do caso, coleta documentos e agenda consultas automaticamente.",
    conexaoAIChatPreview: [
      { role: "user", text: "Fui demitido sem justa causa, tenho direitos?" },
      { role: "ai", text: "Sim, você pode ter direito a FGTS, aviso prévio e seguro-desemprego. Posso agendar uma análise gratuita? ⚖️" },
      { role: "user", text: "Quero agendar!" },
    ],
    depoimentos: [
      { nome: "Adv. Silva & Associados", texto: "A triagem automática economiza 3h por dia." },
      { nome: "Contabilidade Exata", texto: "Clientes enviam documentos pelo WhatsApp direto." },
      { nome: "Adv. Marina Costa", texto: "O site premium me posicionou como referência na região." },
    ],
    cta: "Agende sua consulta",
    accentColor: "221 83% 53%",
    avatarColors: ["#3B82F6", "#1D4ED8", "#6366F1"],
  },
  {
    key: "academia",
    icon: "🏋️",
    label: "Academia / Esporte",
    description: "Fitness e saúde",
    heroText: "Seu melhor corpo começa aqui.",
    servicos: ["Musculação", "Crossfit", "Yoga", "Spinning"],
    servicoIcons: ["Dumbbell", "Flame", "PersonStanding", "Bike"],
    conexaoAI: "Agenda aulas experimentais, envia planos e recupera alunos inativos automaticamente.",
    conexaoAIChatPreview: [
      { role: "user", text: "Quero fazer uma aula experimental" },
      { role: "ai", text: "Ótimo! Temos turmas de Crossfit às 7h e Yoga às 18h. Qual te interessa? 💪" },
      { role: "user", text: "Crossfit às 7h!" },
    ],
    depoimentos: [
      { nome: "CrossFit Power", texto: "Recuperamos 30 alunos inativos no primeiro mês." },
      { nome: "Studio Zen Yoga", texto: "A agenda inteligente otimizou as turmas." },
      { nome: "Arena Fit", texto: "Leads qualificados chegam todo dia pelo site." },
    ],
    cta: "Agende aula experimental",
    accentColor: "0 84% 60%",
    avatarColors: ["#EF4444", "#F97316", "#F59E0B"],
  },
  {
    key: "imobiliaria",
    icon: "🏠",
    label: "Imobiliária / Construção",
    description: "Imóveis e construção",
    heroText: "Conectando você ao imóvel ideal em Cotia.",
    servicos: ["Compra", "Venda", "Locação", "Avaliação"],
    servicoIcons: ["Home", "DollarSign", "Key", "ClipboardCheck"],
    conexaoAI: "Filtra imóveis por perfil, envia vídeos e agenda visitas pelo WhatsApp.",
    conexaoAIChatPreview: [
      { role: "user", text: "Procuro casa com 3 quartos em Cotia até 500 mil" },
      { role: "ai", text: "Encontrei 4 opções! A melhor é no Granja Viana, 3 quartos, 120m², R$480mil. Quer agendar visita? 🏠" },
      { role: "user", text: "Quero ver essa!" },
    ],
    depoimentos: [
      { nome: "Imob Cotia Lar", texto: "A IA filtra clientes e só manda lead qualificado." },
      { nome: "Construtora Horizonte", texto: "Vendemos 3 unidades no primeiro mês com o site." },
      { nome: "Corretor João Lima", texto: "O tour do imóvel pelo WhatsApp fecha negócio rápido." },
    ],
    cta: "Veja imóveis agora",
    accentColor: "25 95% 53%",
    avatarColors: ["#F97316", "#EA580C", "#D97706"],
  },
  {
    key: "outro",
    icon: "➕",
    label: "Outro",
    description: "Negócio em geral",
    heroText: "Inovação e presença digital para seu negócio em Cotia.",
    servicos: ["Presença Digital", "Atendimento IA", "Marketing", "Fidelização"],
    servicoIcons: ["Globe", "Bot", "Megaphone", "Heart"],
    conexaoAI: "Atende seus clientes 24h, qualifica leads e automatiza processos pelo WhatsApp.",
    conexaoAIChatPreview: [
      { role: "user", text: "Vocês atendem nessa região?" },
      { role: "ai", text: "Sim! Atendemos Cotia e toda a região. Posso te ajudar com algo específico? 🚀" },
      { role: "user", text: "Quero saber mais sobre os serviços" },
    ],
    depoimentos: [
      { nome: "Empresa Alpha", texto: "Em 30 dias já aparecíamos no topo do Google." },
      { nome: "Studio Beta", texto: "A IA reduziu nosso tempo de resposta para segundos." },
      { nome: "Serviços Gama", texto: "O investimento se pagou no primeiro mês." },
    ],
    cta: "Fale conosco agora",
    accentColor: "24 95% 50%",
    avatarColors: ["#F97316", "#FB923C", "#FBBF24"],
  },
];

export function getNicheByKey(key: string): NicheData {
  return NICHES.find((n) => n.key === key) || NICHES[NICHES.length - 1];
}
