import { useSiteConfig } from "@/hooks/useSiteConfig";
import { DynamicHomeSection } from "@/components/home/DynamicHomeSection";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { homeSections, isLoading } = useSiteConfig();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {homeSections.map((section, index) => (
        <DynamicHomeSection 
          key={`${section.type}-${section.order}-${index}`} 
          section={section} 
        />
      ))}
    </div>
  );
};

export default Index;
