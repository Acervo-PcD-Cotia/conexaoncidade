import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UseReadingTrackerParams {
  contentType: 'news' | 'edition';
  contentId: string;
  minimumTimeSeconds?: number;
  completionThreshold?: number;
}

interface ReadingProgress {
  progress: number;
  timeSpent: number;
  isCompleted: boolean;
  pointsAwarded: number;
}

export function useReadingTracker({
  contentType,
  contentId,
  minimumTimeSeconds = 45,
  completionThreshold = 85
}: UseReadingTrackerParams) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const hasAwardedRef = useRef(false);
  const savedProgressRef = useRef(false);

  // Validate contentId - must be a valid UUID
  const isValidId = contentId && contentId.length > 0 && contentId !== '';

  // Points based on content type
  const pointsForCompletion = contentType === 'news' ? 3 : 5;

  // Load existing progress on mount
  useEffect(() => {
    if (!user || !isValidId) return;

    const loadProgress = async () => {
      const { data } = await supabase
        .from('community_reading_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .maybeSingle();

      if (data) {
        setProgress(data.scroll_percentage || 0);
        setTimeSpent(data.time_spent_seconds || 0);
        setIsCompleted(!!data.completed_at);
        setPointsAwarded(data.points_awarded || 0);
        hasAwardedRef.current = !!data.completed_at;
      }
    };

    loadProgress();
  }, [user, contentType, contentId, isValidId]);

  // Track time spent
  useEffect(() => {
    if (!user || !isValidId || isCompleted) return;

    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [user, isValidId, isCompleted]);

  // Save progress periodically
  useEffect(() => {
    if (!user || !isValidId || savedProgressRef.current) return;

    const saveProgress = async () => {
      const { error } = await supabase
        .from('community_reading_progress')
        .upsert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          scroll_percentage: progress,
          time_spent_seconds: timeSpent,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,content_type,content_id'
        });

      if (error) console.error('Error saving reading progress:', error);
    };

    const debounce = setTimeout(saveProgress, 2000);
    return () => clearTimeout(debounce);
  }, [user, contentType, contentId, progress, timeSpent, isValidId]);

  // Check for completion and award points
  const checkCompletion = useCallback(async () => {
    if (!user || hasAwardedRef.current) return;
    if (progress >= completionThreshold && timeSpent >= minimumTimeSeconds) {
      hasAwardedRef.current = true;
      savedProgressRef.current = true;

      // Mark as completed and award points
      const { error: progressError } = await supabase
        .from('community_reading_progress')
        .upsert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          scroll_percentage: progress,
          time_spent_seconds: timeSpent,
          completed_at: new Date().toISOString(),
          points_awarded: pointsForCompletion,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,content_type,content_id'
        });

      if (progressError) {
        console.error('Error saving completion:', progressError);
        hasAwardedRef.current = false;
        return;
      }

      // Check if user is a community member
      const { data: member } = await supabase
        .from('community_members')
        .select('id, points')
        .eq('user_id', user.id)
        .single();

      if (member) {
        // Add points to member
        await supabase
          .from('community_members')
          .update({ points: (member.points || 0) + pointsForCompletion })
          .eq('user_id', user.id);

        // Record in points history
        await supabase.from('community_points_history').insert({
          user_id: user.id,
          action_type: `reading_${contentType}`,
          points: pointsForCompletion,
          description: `Leitura completa de ${contentType === 'news' ? 'notícia' : 'edição'}`,
          reference_id: contentId
        });

        setIsCompleted(true);
        setPointsAwarded(pointsForCompletion);
        
        toast.success(`📖 Leitura completa! +${pointsForCompletion} pontos`, {
          description: 'Continue lendo para ganhar mais pontos!'
        });
      }
    }
  }, [user, progress, timeSpent, completionThreshold, minimumTimeSeconds, contentType, contentId, pointsForCompletion]);

  // Track scroll position
  const trackScroll = useCallback((scrollPercentage: number) => {
    if (isCompleted) return;
    
    const newProgress = Math.min(100, Math.max(progress, scrollPercentage));
    setProgress(newProgress);

    // Check for completion when reaching threshold
    if (newProgress >= completionThreshold) {
      checkCompletion();
    }
  }, [progress, isCompleted, completionThreshold, checkCompletion]);

  return {
    progress,
    timeSpent,
    isCompleted,
    pointsAwarded,
    trackScroll,
    completionThreshold,
    minimumTimeSeconds
  };
}
