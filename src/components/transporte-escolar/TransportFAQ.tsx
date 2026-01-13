import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Como funciona este serviço?",
    answer: "Este é um diretório gratuito que conecta pais e responsáveis a transportadores escolares na região de Cotia/SP. Você pode buscar por escola, bairro ou turno desejado e entrar em contato diretamente com os transportadores."
  },
  {
    question: "O portal verifica os transportadores?",
    answer: "Fazemos uma verificação básica de cadastro, mas recomendamos que os pais sempre verifiquem documentação, licenças (Alvará, ANTT quando aplicável), seguro do veículo e referências antes de contratar qualquer serviço."
  },
  {
    question: "O que significam os níveis de verificação?",
    answer: "• Não verificado: cadastro recente, ainda não analisado.\n• Verificado: documentação básica conferida pela equipe.\n• Recomendado: possui boas avaliações e histórico positivo.\n• Premium: parceiro oficial com verificação completa."
  },
  {
    question: "Como faço para cadastrar meu serviço de transporte?",
    answer: "Clique no botão 'Cadastrar Transporte' e preencha o formulário com suas informações, escolas atendidas e áreas de cobertura. Após análise da nossa equipe, seu cadastro será aprovado e aparecerá nas buscas."
  },
  {
    question: "O cadastro é gratuito?",
    answer: "Sim! O cadastro básico é totalmente gratuito tanto para pais quanto para transportadores. Oferecemos planos premium com destaque nas buscas para transportadores interessados."
  },
  {
    question: "Como denunciar um problema?",
    answer: "Em cada card de transportador há um link 'Denunciar problema'. Você também pode entrar em contato conosco diretamente. Investigamos todas as denúncias e tomamos as medidas necessárias."
  },
  {
    question: "Minha escola não aparece na lista. O que fazer?",
    answer: "Se sua escola não aparecer no autocomplete, clique em 'Não encontrei minha escola' e preencha os dados. Nossa equipe irá verificar e adicionar ao catálogo oficial."
  },
  {
    question: "Os transportadores atendem pessoas com deficiência?",
    answer: "Alguns transportadores possuem veículos adaptados ou experiência com passageiros com necessidades especiais. Use o filtro de acessibilidade na busca para encontrar opções adequadas."
  },
];

export function TransportFAQ() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Perguntas Frequentes</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqItems.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground whitespace-pre-line">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
