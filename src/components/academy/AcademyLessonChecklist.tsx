import { useState, useEffect } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcademyChecklistItem } from "@/types/academy";

interface AcademyLessonChecklistProps {
  items: AcademyChecklistItem[];
  lessonId: string;
  onAllCompleted?: () => void;
}

export function AcademyLessonChecklist({ items, lessonId, onAllCompleted }: AcademyLessonChecklistProps) {
  // Use localStorage to persist checklist state
  const storageKey = `academy-checklist-${lessonId}`;
  
  const [completedItems, setCompletedItems] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    return new Set();
  });

  // Sort items by order
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify([...completedItems]));
    
    // Check if all completed
    if (completedItems.size === items.length && items.length > 0) {
      onAllCompleted?.();
    }
  }, [completedItems, storageKey, items.length, onAllCompleted]);

  const toggleItem = (order: number) => {
    setCompletedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(order)) {
        newSet.delete(order);
      } else {
        newSet.add(order);
      }
      return newSet;
    });
  };

  const completedCount = completedItems.size;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (items.length === 0) return null;

  return (
    <div className="bg-card rounded-lg border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Checklist</h3>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{totalCount} concluídos ({progressPercent}%)
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="space-y-2">
        {sortedItems.map((item) => {
          const isCompleted = completedItems.has(item.order);
          return (
            <button
              key={item.order}
              onClick={() => toggleItem(item.order)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                "hover:bg-accent/50",
                isCompleted && "bg-primary/5"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <span
                className={cn(
                  "text-sm",
                  isCompleted && "text-muted-foreground line-through"
                )}
              >
                {item.item}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
