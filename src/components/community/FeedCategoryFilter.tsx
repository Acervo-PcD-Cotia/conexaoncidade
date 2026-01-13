import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Newspaper, 
  Calendar, 
  Briefcase, 
  Accessibility, 
  AlertCircle, 
  Shield,
  LayoutGrid
} from "lucide-react";

const FEED_CATEGORIES = [
  { value: "all", label: "Todos", icon: LayoutGrid },
  { value: "geral", label: "Geral", icon: Newspaper },
  { value: "eventos", label: "Eventos", icon: Calendar },
  { value: "oportunidades", label: "Oportunidades", icon: Briefcase },
  { value: "pcd", label: "PcD", icon: Accessibility },
  { value: "alertas", label: "Alertas", icon: AlertCircle },
  { value: "oficial", label: "Oficiais", icon: Shield },
];

interface FeedCategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function FeedCategoryFilter({ value, onChange }: FeedCategoryFilterProps) {
  return (
    <Tabs value={value} onValueChange={onChange} className="w-full">
      <TabsList className="w-full flex-wrap h-auto gap-1 bg-transparent p-0">
        {FEED_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <TabsTrigger
              key={category.value}
              value={category.value}
              className="flex-1 min-w-fit gap-1 data-[state=active]:bg-pink-600 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{category.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
