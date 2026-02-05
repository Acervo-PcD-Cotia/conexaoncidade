import { useState, useRef, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading2, 
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Minus,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useSanitizedHtml } from '@/hooks/useSanitizedHtml';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = 'Escreva o conteúdo da notícia...' }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showHtml, setShowHtml] = useState(false);
  const sanitizedPreview = useSanitizedHtml(content);

  const insertTag = useCallback((openTag: string, closeTag: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    const newContent = beforeText + openTag + selectedText + (closeTag || openTag.replace('<', '</')) + afterText;
    onChange(newContent);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + openTag.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, onChange]);

  const wrapSelection = useCallback((tag: string) => {
    insertTag(`<${tag}>`, `</${tag}>`);
  }, [insertTag]);

  const insertElement = useCallback((element: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = content.substring(0, start);
    const afterText = content.substring(start);

    onChange(beforeText + element + afterText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + element.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, onChange]);

  const addLink = useCallback(() => {
    const url = window.prompt('URL do link:');
    if (url) {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end) || 'texto do link';
      const beforeText = content.substring(0, start);
      const afterText = content.substring(end);

      const newContent = beforeText + `<a href="${url}">${selectedText}</a>` + afterText;
      onChange(newContent);
    }
  }, [content, onChange]);

  const addImage = useCallback(() => {
    const url = window.prompt('URL da imagem:');
    if (url) {
      const alt = window.prompt('Texto alternativo (alt):') || '';
      insertElement(`<img src="${url}" alt="${alt}" class="w-full rounded-lg" />`);
    }
  }, [insertElement]);

  return (
    <div className="border rounded-lg bg-background">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => wrapSelection('strong')}
          aria-label="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => wrapSelection('em')}
          aria-label="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => wrapSelection('h2')}
          aria-label="Título 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => wrapSelection('h3')}
          aria-label="Título 3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => insertElement('<ul>\n  <li>Item</li>\n</ul>')}
          aria-label="Lista"
        >
          <List className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => insertElement('<ol>\n  <li>Item</li>\n</ol>')}
          aria-label="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => wrapSelection('blockquote')}
          aria-label="Citação"
        >
          <Quote className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className="h-8 w-8 p-0"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          className="h-8 w-8 p-0"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertElement('<hr />')}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <Toggle
          size="sm"
          pressed={showHtml}
          onPressedChange={setShowHtml}
          aria-label="Ver HTML"
        >
          <Code className="h-4 w-4" />
        </Toggle>
      </div>

      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`min-h-[300px] border-0 rounded-t-none focus-visible:ring-0 resize-y ${showHtml ? 'font-mono text-sm' : ''}`}
      />
      
      {!showHtml && content && (
        <div className="border-t p-4 bg-muted/20">
          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedPreview }}
          />
        </div>
      )}
    </div>
  );
}
