import { useVocabulary } from "@/hooks/useVocabulary";
import type { VocabularyKey } from "@/types/portal-templates";

interface VocabTextProps {
  term: VocabularyKey;
  fallback?: string;
}

/**
 * Component that renders translated text based on the current template vocabulary.
 * Prioritizes: vocabulary[term] → fallback → term (key itself)
 * 
 * Usage:
 * <VocabText term="news" /> // Renders "Notícias" or "Mensagens" depending on template
 * <VocabText term="custom_key" fallback="Fallback Label" />
 */
export function VocabText({ term, fallback }: VocabTextProps) {
  const { vocabulary } = useVocabulary();
  return <>{vocabulary[term] || fallback || term}</>;
}
