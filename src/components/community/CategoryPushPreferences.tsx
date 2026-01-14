import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Preference {
  category_id: string;
  is_enabled: boolean;
}

export function CategoryPushPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localPreferences, setLocalPreferences] = useState<Record<string, boolean>>({});

  // Fetch categories
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories-for-push'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    },
  });

  // Fetch user preferences
  const { data: preferences, isLoading: loadingPreferences } = useQuery({
    queryKey: ['user-push-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_push_preferences')
        .select('category_id, is_enabled')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as Preference[];
    },
    enabled: !!user?.id,
  });

  // Initialize local state from fetched preferences
  useEffect(() => {
    if (preferences && categories) {
      const prefMap: Record<string, boolean> = {};
      
      // Default all categories to disabled
      categories.forEach(cat => {
        prefMap[cat.id] = false;
      });
      
      // Apply saved preferences
      preferences.forEach(pref => {
        prefMap[pref.category_id] = pref.is_enabled;
      });
      
      setLocalPreferences(prefMap);
    }
  }, [preferences, categories]);

  // Mutation to update preferences
  const updatePreference = useMutation({
    mutationFn: async ({ categoryId, enabled }: { categoryId: string; enabled: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_push_preferences')
        .upsert({
          user_id: user.id,
          category_id: categoryId,
          is_enabled: enabled,
        }, {
          onConflict: 'user_id,category_id',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-push-preferences'] });
    },
    onError: (error) => {
      toast.error('Erro ao salvar preferência');
      console.error('Error updating preference:', error);
    },
  });

  const handleToggle = (categoryId: string, enabled: boolean) => {
    setLocalPreferences(prev => ({ ...prev, [categoryId]: enabled }));
    updatePreference.mutate({ categoryId, enabled });
  };

  const enableAll = () => {
    categories?.forEach(cat => {
      handleToggle(cat.id, true);
    });
    toast.success('Todas as categorias ativadas');
  };

  const disableAll = () => {
    categories?.forEach(cat => {
      handleToggle(cat.id, false);
    });
    toast.success('Todas as categorias desativadas');
  };

  if (loadingCategories || loadingPreferences) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const enabledCount = Object.values(localPreferences).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações por Categoria
        </CardTitle>
        <CardDescription>
          Receba alertas quando novas notícias forem publicadas nas categorias selecionadas.
          {enabledCount > 0 && (
            <span className="ml-1 font-medium text-primary">
              ({enabledCount} ativa{enabledCount !== 1 ? 's' : ''})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick actions */}
        <div className="flex gap-2 pb-2 border-b">
          <Button variant="outline" size="sm" onClick={enableAll}>
            <Bell className="h-4 w-4 mr-1" />
            Ativar Todas
          </Button>
          <Button variant="outline" size="sm" onClick={disableAll}>
            <BellOff className="h-4 w-4 mr-1" />
            Desativar Todas
          </Button>
        </div>

        {/* Category list */}
        <div className="space-y-3">
          {categories?.map(category => (
            <div
              key={category.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium">{category.name}</span>
              <Switch
                checked={localPreferences[category.id] ?? false}
                onCheckedChange={(checked) => handleToggle(category.id, checked)}
              />
            </div>
          ))}
        </div>

        {categories?.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma categoria disponível.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
