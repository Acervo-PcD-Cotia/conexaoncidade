import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  requiredCount?: number;
}

interface TagOption {
  id: string;
  name: string;
  slug: string;
}

const REQUIRED_TAG_COUNT = 12;

export function TagSelector({ selectedTags, onChange, requiredCount = REQUIRED_TAG_COUNT }: TagSelectorProps) {
  const [tags, setTags] = useState<TagOption[]>([]);
  const [open, setOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const { data } = await supabase
      .from('tags')
      .select('id, name, slug')
      .order('name');
    
    if (data) {
      setTags(data);
    }
  };

  const availableTags = useMemo(() => {
    return tags.filter(tag => !selectedTags.includes(tag.id));
  }, [tags, selectedTags]);

  const selectedTagDetails = useMemo(() => {
    return selectedTags
      .map(id => tags.find(t => t.id === id))
      .filter(Boolean) as TagOption[];
  }, [selectedTags, tags]);

  const tagCount = selectedTags.length;
  const isExact = tagCount === requiredCount;
  const needsMore = tagCount < requiredCount;
  const hasExcess = tagCount > requiredCount;

  const handleSelect = (tagId: string) => {
    if (tagCount >= requiredCount) {
      // Still allow if already at limit - will show warning
    }
    onChange([...selectedTags, tagId]);
    setOpen(false);
  };

  const handleRemove = (tagId: string) => {
    onChange(selectedTags.filter(id => id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!newTagInput.trim()) return;

    const slug = newTagInput
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('tags')
      .insert({ name: newTagInput.trim(), slug })
      .select()
      .single();

    if (error) {
      console.error('Error creating tag:', error);
      return;
    }

    if (data) {
      setTags([...tags, data]);
      onChange([...selectedTags, data.id]);
      setNewTagInput('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with counter */}
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Tags
        </Label>
        <div className={cn(
          "flex items-center gap-1.5 text-sm font-medium",
          isExact && "text-green-600",
          needsMore && "text-yellow-600",
          hasExcess && "text-red-600"
        )}>
          {isExact ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{tagCount}/{requiredCount}</span>
        </div>
      </div>

      {/* Status message */}
      <div className={cn(
        "text-xs rounded-md px-2 py-1.5",
        isExact && "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
        needsMore && "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
        hasExcess && "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      )}>
        {isExact && "✓ Perfeito! 12 tags selecionadas"}
        {needsMore && `Adicione mais ${requiredCount - tagCount} tag${requiredCount - tagCount > 1 ? 's' : ''}`}
        {hasExcess && `Remova ${tagCount - requiredCount} tag${tagCount - requiredCount > 1 ? 's' : ''}`}
      </div>

      {/* Selected tags */}
      {selectedTagDetails.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTagDetails.map((tag, index) => (
            <Badge 
              key={tag.id} 
              variant={index < requiredCount ? "secondary" : "destructive"}
              className="flex items-center gap-1"
            >
              <span className="text-[10px] text-muted-foreground mr-1">{index + 1}</span>
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemove(tag.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag selector */}
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className={cn(
                "flex-1 justify-start",
                hasExcess && "border-red-300 text-red-600"
              )}
              disabled={hasExcess}
            >
              <Plus className="h-4 w-4 mr-2" />
              {hasExcess ? 'Limite atingido' : 'Adicionar tag'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar tag..." />
              <CommandList>
                <CommandEmpty>
                  <div className="p-2 space-y-2">
                    <p className="text-sm text-muted-foreground">Nenhuma tag encontrada</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nova tag..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        className="h-8"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateTag}
                        disabled={!newTagInput.trim()}
                      >
                        Criar
                      </Button>
                    </div>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {availableTags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => handleSelect(tag.id)}
                    >
                      {tag.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Quick create - only show when we need more tags */}
      {needsMore && (
        <div className="flex gap-2">
          <Input
            placeholder="Criar nova tag..."
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateTag())}
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={handleCreateTag}
            disabled={!newTagInput.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
