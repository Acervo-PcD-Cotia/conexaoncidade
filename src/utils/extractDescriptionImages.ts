/**
 * Extrator automático de imagens de descrições de notícias.
 * 
 * Detecta URLs de imagens no corpo do texto e captura a linha seguinte
 * como legenda/crédito (se não for outra URL).
 * 
 * Exemplo de entrada:
 * ```
 * https://imagens.ebc.com.br/.../foto.jpg?
 * Moradores denunciam saques - Foto Rovena Rosa/Agência Brasil
 * Texto normal da descrição.
 * ```
 * 
 * Retorno: { cleanDescription, images: [{ url, caption, credit }] }
 */

export interface ExtractedImage {
  url: string;
  caption: string;
  credit: string;
}

export interface ExtractionResult {
  cleanDescription: string;
  images: ExtractedImage[];
}

// Regex: linha que é uma URL de imagem (com ou sem query string)
const IMAGE_URL_REGEX = /^(https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif|bmp)(\?[^\s]*)?)$/i;

// Regex mais flexível: URL que contém extensão de imagem em qualquer parte do path
const IMAGE_URL_LOOSE_REGEX = /^(https?:\/\/[^\s]+(\/[^\s]*\.(jpg|jpeg|png|webp|gif|bmp))[^\s]*)$/i;

// Regex para detectar crédito na legenda (ex: "Foto Fulano/Agência Brasil")
const CREDIT_REGEX = /(?:foto|crédito|imagem|reprodução|divulgação)\s*[:\-]?\s*(.+)/i;

function isImageUrl(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return IMAGE_URL_REGEX.test(trimmed) || IMAGE_URL_LOOSE_REGEX.test(trimmed);
}

function isUrl(line: string): boolean {
  return /^https?:\/\//i.test(line.trim());
}

function extractCredit(caption: string): string {
  const match = caption.match(CREDIT_REGEX);
  return match ? match[1].trim() : '';
}

export function extractImagesFromDescription(text: string): ExtractionResult {
  if (!text || typeof text !== 'string') {
    return { cleanDescription: text || '', images: [] };
  }

  const lines = text.split('\n');
  const images: ExtractedImage[] = [];
  const cleanLines: string[] = [];
  const skipNextLine = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    if (skipNextLine.has(i)) continue;

    const line = lines[i].trim();

    if (isImageUrl(line)) {
      // This line is an image URL
      let caption = '';
      let credit = '';

      // Check if next line is a caption (not another URL and not empty)
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      if (nextLine && !isUrl(nextLine)) {
        caption = nextLine;
        credit = extractCredit(nextLine);
        skipNextLine.add(i + 1);
      }

      images.push({ url: line, caption, credit });
    } else {
      cleanLines.push(lines[i]);
    }
  }

  // Remove leading/trailing empty lines from clean description
  const cleanDescription = cleanLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { cleanDescription, images };
}
