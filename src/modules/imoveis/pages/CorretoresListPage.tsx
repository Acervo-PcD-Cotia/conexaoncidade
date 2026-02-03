import { Helmet } from "react-helmet-async";
import { Loader2, Users } from "lucide-react";
import { useAnunciantes } from "../hooks/useAnunciantes";
import { AnuncianteCard } from "../components/AnuncianteCard";

export default function CorretoresListPage() {
  const { data: anunciantes, isLoading } = useAnunciantes();

  return (
    <>
      <Helmet>
        <title>Corretores e Imobiliárias em Cotia | Conexão na Cidade</title>
        <meta 
          name="description" 
          content="Encontre os melhores corretores de imóveis e imobiliárias em Cotia e região. Profissionais verificados com CRECI para ajudar você a comprar, vender ou alugar seu imóvel."
        />
      </Helmet>

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Users className="h-8 w-8 text-primary" />
            Corretores e Imobiliárias
          </h1>
          <p className="mt-2 text-muted-foreground">
            Profissionais qualificados para ajudar você a encontrar o imóvel ideal
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : anunciantes && anunciantes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {anunciantes.map((anunciante) => (
              <AnuncianteCard key={anunciante.id} anunciante={anunciante} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">Nenhum corretor cadastrado</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Em breve teremos profissionais disponíveis
            </p>
          </div>
        )}
      </div>
    </>
  );
}
