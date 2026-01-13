import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParsedPhone {
  name: string;
  brand: string;
  price_detected: number | null;
  specs: {
    ram: string;
    storage: string;
    display: string;
    battery: string;
    camera: string;
    processor: string;
  };
  suggested_scores: {
    camera: number;
    battery: number;
    gaming: number;
  };
  price_range: 'budget' | 'mid' | 'premium' | 'flagship';
  ideal_for: string;
  strengths: string[];
  considerations: string[];
  use_cases: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Conteúdo é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const systemPrompt = `Você é um especialista em smartphones que analisa especificações técnicas.
Analise o texto fornecido e extraia informações do smartphone.
Retorne APENAS um JSON válido (sem markdown, sem explicações) com esta estrutura:

{
  "name": "Nome completo do modelo (ex: Samsung Galaxy S24 Ultra 256GB)",
  "brand": "Marca (Samsung, Apple, Motorola, Xiaomi, Realme, OnePlus, Oppo, Google, etc)",
  "price_detected": número ou null se não encontrado,
  "specs": {
    "ram": "ex: 8GB",
    "storage": "ex: 256GB",
    "display": "ex: 6.7 AMOLED 120Hz",
    "battery": "ex: 5000mAh",
    "camera": "ex: 200MP principal + 12MP ultra + 10MP tele",
    "processor": "ex: Snapdragon 8 Gen 3"
  },
  "suggested_scores": {
    "camera": 1-5,
    "battery": 1-5,
    "gaming": 1-5
  },
  "price_range": "budget" (<R$1000), "mid" (R$1000-2500), "premium" (R$2500-5000), ou "flagship" (>R$5000),
  "ideal_for": "Frase curta sobre público-alvo ideal",
  "strengths": ["3-5 pontos fortes principais"],
  "considerations": ["1-3 pontos de atenção"],
  "use_cases": ["social", "photography", "games", "work", "streaming"] - selecione os aplicáveis
}

Regras:
- Se informações não estiverem claras, faça inferências razoáveis baseadas no modelo
- Marcas como Redmi, Poco são da Xiaomi; Galaxy é Samsung; iPhone é Apple
- Scores devem refletir a categoria do aparelho (flagships geralmente 4-5, entrada 2-3)
- Seja consistente com o padrão de nomes: Marca + Modelo + RAM/Storage quando aplicável`;

    const userPrompt = type === 'url' 
      ? `Analise este conteúdo extraído de uma página de produto:\n\n${content}`
      : `Analise este texto de especificações de smartphone:\n\n${content}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes para análise IA." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao analisar especificações");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("Resposta vazia da IA");
    }

    // Parse the JSON response, handling potential markdown wrapping
    let parsed: ParsedPhone;
    try {
      let jsonStr = aiResponse.trim();
      // Remove markdown code blocks if present
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      parsed = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new Error("Não foi possível interpretar a resposta da IA");
    }

    // Validate and normalize the response
    const result: ParsedPhone = {
      name: parsed.name || "Smartphone não identificado",
      brand: normalizeBrand(parsed.brand || ""),
      price_detected: typeof parsed.price_detected === 'number' ? parsed.price_detected : null,
      specs: {
        ram: parsed.specs?.ram || "",
        storage: parsed.specs?.storage || "",
        display: parsed.specs?.display || "",
        battery: parsed.specs?.battery || "",
        camera: parsed.specs?.camera || "",
        processor: parsed.specs?.processor || "",
      },
      suggested_scores: {
        camera: Math.min(5, Math.max(1, parsed.suggested_scores?.camera || 3)),
        battery: Math.min(5, Math.max(1, parsed.suggested_scores?.battery || 3)),
        gaming: Math.min(5, Math.max(1, parsed.suggested_scores?.gaming || 3)),
      },
      price_range: validatePriceRange(parsed.price_range),
      ideal_for: parsed.ideal_for || "Uso geral",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
      considerations: Array.isArray(parsed.considerations) ? parsed.considerations.slice(0, 3) : [],
      use_cases: validateUseCases(parsed.use_cases),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in phone-parse-specs:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function normalizeBrand(brand: string): string {
  const brandMap: Record<string, string> = {
    'apple': 'Apple',
    'iphone': 'Apple',
    'samsung': 'Samsung',
    'galaxy': 'Samsung',
    'motorola': 'Motorola',
    'moto': 'Motorola',
    'xiaomi': 'Xiaomi',
    'redmi': 'Xiaomi',
    'poco': 'Xiaomi',
    'realme': 'Realme',
    'oppo': 'Oppo',
    'oneplus': 'OnePlus',
    'one plus': 'OnePlus',
    'google': 'Google',
    'pixel': 'Google',
    'asus': 'Asus',
    'tcl': 'TCL',
    'lg': 'LG',
    'huawei': 'Huawei',
    'honor': 'Honor',
    'nothing': 'Nothing',
    'infinix': 'Infinix',
    'tecno': 'Tecno',
  };

  const normalized = brand.toLowerCase().trim();
  return brandMap[normalized] || brand.charAt(0).toUpperCase() + brand.slice(1);
}

function validatePriceRange(range: string): 'budget' | 'mid' | 'premium' | 'flagship' {
  const valid = ['budget', 'mid', 'premium', 'flagship'];
  return valid.includes(range) ? range as any : 'mid';
}

function validateUseCases(useCases: any): string[] {
  const valid = ['social', 'photography', 'games', 'work', 'streaming'];
  if (!Array.isArray(useCases)) return ['social'];
  return useCases.filter(uc => valid.includes(uc));
}
