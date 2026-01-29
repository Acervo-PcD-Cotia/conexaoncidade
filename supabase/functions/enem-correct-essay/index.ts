import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT_CORRETORA = `Você é uma IA Corretora Técnica do ENEM, com rigor equivalente à banca oficial do INEP.

PAPEL:
- Avalia com frieza técnica
- Não suaviza nota
- Não elogia sem critério
- Não motiva artificialmente
- Seu compromisso é com nota real, não com autoestima

PROCESSO DE CORREÇÃO OBRIGATÓRIO:

1. LEITURA INTEGRAL
- Identificar tema proposto vs tema abordado
- Verificar fuga total (0 em todas competências) ou parcial
- Confirmar presença de tese clara

2. AVALIAÇÃO DAS 5 COMPETÊNCIAS (0-200 cada, níveis 0-5)

Competência 1 - Norma Padrão:
- Erros gramaticais relevantes (ortografia, concordância, regência, pontuação)
- Frequência e gravidade dos erros
- Nível de formalidade adequado

Competência 2 - Compreensão do Tema:
- Aderência total ao tema proposto
- Uso de repertório sociocultural pertinente e produtivo
- Repertório forçado ou decorado = menor nota

Competência 3 - Argumentação:
- Presença e clareza da tese
- Progressão lógica entre parágrafos
- Profundidade analítica (superficial vs aprofundada)
- Uso de dados, exemplos, referências

Competência 4 - Coesão e Coerência:
- Uso adequado de conectivos
- Fluidez entre frases e parágrafos
- Organização textual (I + D1 + D2 + C)

Competência 5 - Proposta de Intervenção (A.A.M.F.D):
- AGENTE: Quem vai executar?
- AÇÃO: O que será feito?
- MEIO: Como será feito?
- FINALIDADE: Para quê?
- DETALHAMENTO: Pelo menos um elemento detalhado

Identificar: genericidade, inviabilidade, falta de elementos

3. DIAGNÓSTICO TÉCNICO
- Ponto forte principal
- Ponto fraco principal
- Erro recorrente que precisa de atenção
- Nível: iniciante (<500) | intermediário (500-799) | avançado (800+)

FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
{
  "competency1": { "score": 0-200, "level": 0-5, "feedback": "...", "errors": [...], "suggestions": [...] },
  "competency2": { "score": 0-200, "level": 0-5, "feedback": "...", "errors": [...], "suggestions": [...] },
  "competency3": { "score": 0-200, "level": 0-5, "feedback": "...", "errors": [...], "suggestions": [...] },
  "competency4": { "score": 0-200, "level": 0-5, "feedback": "...", "errors": [...], "suggestions": [...] },
  "competency5": { "score": 0-200, "level": 0-5, "feedback": "...", "errors": [...], "suggestions": [...] },
  "totalScore": 0-1000,
  "hasFugaTotal": boolean,
  "hasFugaParcial": boolean,
  "proposalAnalysis": {
    "hasAgent": boolean,
    "hasAction": boolean,
    "hasMeans": boolean,
    "hasPurpose": boolean,
    "hasDetail": boolean,
    "isGeneric": boolean,
    "isInviable": boolean,
    "feedback": "..."
  },
  "diagnosis": {
    "level": "iniciante|intermediário|avançado",
    "strongPoint": "...",
    "weakPoint": "...",
    "recurringError": "..."
  },
  "whatPreventsPerfectScore": "...",
  "pointsLostWhere": ["C1: -X pontos por...", "C3: -X pontos por..."]
}

REGRAS:
- Português claro e direto
- Sem emojis
- Sem jargão acadêmico desnecessário
- Sem elogios automáticos
- Notas devem ser múltiplos de 40 (0, 40, 80, 120, 160, 200)`;

const SYSTEM_PROMPT_TUTOR = `Você é a IA Tutor do Conexão Academy ENEM.

PAPEL:
- Acompanha a evolução do aluno entre redações
- Conecta erros atuais com erros de redações anteriores
- Orienta o próximo passo prático e específico
- Traduz correção técnica em ação clara

Você NÃO corrige nota. Você ENSINA a evoluir.

ENTRADA:
- Última redação corrigida (com feedback da IA Corretora)
- Histórico de erros do aluno (se disponível)
- Semana atual do módulo

RESPOSTA OBRIGATÓRIA (JSON):
{
  "evolutionDiagnosis": {
    "repeatingErrors": ["erro que aparece em mais de uma redação"],
    "resolvedErrors": ["erro que foi superado"],
    "stuckAt": "ponto onde o aluno está travando"
  },
  "weeklyFocus": {
    "mainPoint": "UM único ponto para focar esta semana",
    "linkedToModule": "como isso se conecta ao módulo atual"
  },
  "targetedExercise": {
    "title": "nome do exercício",
    "description": "descrição clara do que fazer",
    "estimatedTime": "até 15 minutos",
    "focusArea": "qual competência/erro trabalha"
  },
  "guidance": {
    "toKeep": ["o que manter fazendo"],
    "toStop": ["o que parar de fazer"],
    "toAdjust": ["o que ajustar imediatamente"]
  }
}

REGRAS:
- Português claro
- Tom humano e direto
- Sem emojis
- Sem frases vagas como "continue assim" ou "você consegue"
- Exercícios devem ser executáveis em 15 minutos
- Foco cirúrgico: 1 problema por vez`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submission_id } = await req.json();

    if (!submission_id) {
      return new Response(
        JSON.stringify({ error: "submission_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch submission
    const { data: submission, error: fetchError } = await supabase
      .from("enem_submissions")
      .select("*")
      .eq("id", submission_id)
      .single();

    if (fetchError || !submission) {
      return new Response(
        JSON.stringify({ error: "Submission not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update status to correcting
    await supabase
      .from("enem_submissions")
      .update({ correction_status: "correcting" })
      .eq("id", submission_id);

    // Fetch error history for tutor
    const { data: errorHistory } = await supabase
      .from("enem_error_history")
      .select("*")
      .eq("user_id", submission.user_id)
      .order("created_at", { ascending: false })
      .limit(20);

    // =============================================
    // STEP 1: IA CORRETORA
    // =============================================
    const correctorPrompt = `TEMA: ${submission.theme}

REDAÇÃO DO ALUNO (${submission.word_count} palavras):

${submission.content}

---

Analise esta redação seguindo rigorosamente o processo de correção do ENEM.
Retorne APENAS o JSON conforme especificado.`;

    const correctorResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT_CORRETORA },
            { role: "user", content: correctorPrompt },
          ],
          temperature: 0.3,
        }),
      }
    );

    if (!correctorResponse.ok) {
      const errorText = await correctorResponse.text();
      console.error("Corrector API error:", errorText);
      
      await supabase
        .from("enem_submissions")
        .update({ correction_status: "error" })
        .eq("id", submission_id);
      
      return new Response(
        JSON.stringify({ error: "AI correction failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const correctorData = await correctorResponse.json();
    const correctorContent = correctorData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    let feedbackCorretora;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = correctorContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                        correctorContent.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, correctorContent];
      feedbackCorretora = JSON.parse(jsonMatch[1] || correctorContent);
    } catch (e) {
      console.error("Failed to parse corrector response:", e);
      console.error("Raw content:", correctorContent);
      
      await supabase
        .from("enem_submissions")
        .update({ correction_status: "error" })
        .eq("id", submission_id);
      
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =============================================
    // STEP 2: IA TUTOR
    // =============================================
    const tutorPrompt = `ÚLTIMA REDAÇÃO CORRIGIDA:
Tema: ${submission.theme}
Nota Total: ${feedbackCorretora.totalScore}/1000

FEEDBACK DA CORRETORA:
${JSON.stringify(feedbackCorretora, null, 2)}

HISTÓRICO DE ERROS DO ALUNO:
${errorHistory && errorHistory.length > 0 
  ? errorHistory.map(e => `- C${e.competency}: ${e.error_type} ${e.is_resolved ? '(resolvido)' : ''}`).join('\n')
  : 'Primeira redação do aluno.'}

---

Com base nessas informações, forneça orientação evolutiva.
Retorne APENAS o JSON conforme especificado.`;

    const tutorResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT_TUTOR },
            { role: "user", content: tutorPrompt },
          ],
          temperature: 0.4,
        }),
      }
    );

    let feedbackTutor = null;
    if (tutorResponse.ok) {
      const tutorData = await tutorResponse.json();
      const tutorContent = tutorData.choices?.[0]?.message?.content || "";
      
      try {
        const jsonMatch = tutorContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                          tutorContent.match(/```\s*([\s\S]*?)\s*```/) ||
                          [null, tutorContent];
        feedbackTutor = JSON.parse(jsonMatch[1] || tutorContent);
      } catch (e) {
        console.error("Failed to parse tutor response:", e);
        // Continue without tutor feedback
      }
    }

    // =============================================
    // STEP 3: SAVE RESULTS
    // =============================================
    const { error: updateError } = await supabase
      .from("enem_submissions")
      .update({
        correction_status: "completed",
        corrected_at: new Date().toISOString(),
        score_c1: feedbackCorretora.competency1?.score || 0,
        score_c2: feedbackCorretora.competency2?.score || 0,
        score_c3: feedbackCorretora.competency3?.score || 0,
        score_c4: feedbackCorretora.competency4?.score || 0,
        score_c5: feedbackCorretora.competency5?.score || 0,
        score_total: feedbackCorretora.totalScore || 0,
        feedback_corretora: feedbackCorretora,
        feedback_tutor: feedbackTutor,
        diagnosis_level: feedbackCorretora.diagnosis?.level || "iniciante",
        diagnosis_strong_point: feedbackCorretora.diagnosis?.strongPoint || null,
        diagnosis_weak_point: feedbackCorretora.diagnosis?.weakPoint || null,
        diagnosis_recurring_error: feedbackCorretora.diagnosis?.recurringError || null,
      })
      .eq("id", submission_id);

    if (updateError) {
      console.error("Failed to update submission:", updateError);
      throw updateError;
    }

    // =============================================
    // STEP 4: RECORD ERROR HISTORY
    // =============================================
    const errorsToRecord = [];
    
    for (let i = 1; i <= 5; i++) {
      const comp = feedbackCorretora[`competency${i}`];
      if (comp && comp.errors && comp.errors.length > 0) {
        for (const error of comp.errors) {
          errorsToRecord.push({
            user_id: submission.user_id,
            submission_id: submission_id,
            competency: i,
            error_type: error.substring(0, 100),
            error_description: error,
            is_resolved: false,
          });
        }
      }
    }

    if (errorsToRecord.length > 0) {
      await supabase.from("enem_error_history").insert(errorsToRecord);
    }

    return new Response(
      JSON.stringify({
        success: true,
        submission_id,
        score_total: feedbackCorretora.totalScore,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in enem-correct-essay:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
