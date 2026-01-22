import { useVocabulary } from "@/hooks/useVocabulary";
import type { VocabularyKey } from "@/types/portal-templates";

interface VocabTextProps {
  term: VocabularyKey;
  fallback?: string;
}

/**
 * Component that renders translated text based on the current template vocabulary.
 * 
 * Usage:
 * <VocabText term="news" /> // Renders "Notícias" or "Mensagens" depending on template
 */
export function VocabText({ term, fallback }: VocabTextProps) {
  const { t } = useVocabulary();
  return <>{t(term) || fallback || term}</>;
}
