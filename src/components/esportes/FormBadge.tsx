import { cn } from "@/lib/utils";

interface FormBadgeProps {
  form?: string;
  showCount?: number;
}

export function FormBadge({ form, showCount = 5 }: FormBadgeProps) {
  if (!form) return null;

  const results = form.slice(-showCount).split("");

  return (
    <div className="flex gap-0.5">
      {results.map((result, index) => (
        <span
          key={index}
          className={cn(
            "w-5 h-5 rounded text-xs font-bold flex items-center justify-center",
            result === "W" && "bg-green-500/20 text-green-600 dark:text-green-400",
            result === "D" && "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
            result === "L" && "bg-red-500/20 text-red-600 dark:text-red-400"
          )}
          title={result === "W" ? "Vitória" : result === "D" ? "Empate" : "Derrota"}
        >
          {result === "W" ? "V" : result === "D" ? "E" : "D"}
        </span>
      ))}
    </div>
  );
}
