import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

interface TagOption {
  id: string;
  name: string;
  slug: string;
}

export function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
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

  const handleSelect = (tagId: string) => {
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
      <Label className="flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Tags
      </Label>

      {/* Selected tags */}
      {selectedTagDetails.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTagDetails.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
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
            <Button type="button" variant="outline" size="sm" className="flex-1 justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar tag
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

      {/* Quick create */}
      {selectedTags.length === 0 && (
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
