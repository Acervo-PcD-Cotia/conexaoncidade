import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBusinessCategories } from "@/hooks/useGuiaComercial";
import { DEFAULT_CATEGORIES, getCategoryUrl } from "@/types/guia-comercial";
import { cn } from "@/lib/utils";

export function GuiaCategoriesSlider() {
  const { data: categories } = useBusinessCategories();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const displayCategories = categories?.length
    ? categories
    : DEFAULT_CATEGORIES.map((c, i) => ({
        ...c,
        id: `default-${i}`,
        tenant_id: null,
        parent_id: null,
        seo_title: null,
        seo_description: null,
        page_content: null,
        sort_order: i,
        is_active: true,
        created_at: new Date().toISOString(),
      }));

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="home-container home-section-spacing">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          Explore o Guia Comercial
        </h2>
        <Link
          to="/guia"
          className="text-sm font-semibold text-primary hover:underline whitespace-nowrap"
        >
          Ver tudo
        </Link>
      </div>

      {/* Slider */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className={cn(
            "absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-10",
            "h-9 w-9 rounded-full bg-card border border-border shadow-md",
            "flex items-center justify-center",
            "transition-opacity duration-200",
            canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className={cn(
            "absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-10",
            "h-9 w-9 rounded-full bg-card border border-border shadow-md",
            "flex items-center justify-center",
            "transition-opacity duration-200",
            canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          aria-label="Próximo"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              to={getCategoryUrl(category)}
              className={cn(
                "flex-shrink-0 flex flex-col items-center justify-center",
                "w-[120px] md:w-[140px] h-[110px] md:h-[120px]",
                "bg-card rounded-xl border border-border",
                "hover:border-primary hover:shadow-lg hover:-translate-y-0.5",
                "transition-all duration-200 group/card"
              )}
            >
              <span className="text-3xl md:text-4xl mb-2">{category.icon}</span>
              <span className="text-xs md:text-sm font-medium text-center leading-tight line-clamp-2 px-2 text-muted-foreground group-hover/card:text-primary transition-colors">
                {category.name}
              </span>
            </Link>
          ))}

          {/* "Ver todas" card */}
          <Link
            to="/guia"
            className={cn(
              "flex-shrink-0 flex flex-col items-center justify-center",
              "w-[120px] md:w-[140px] h-[110px] md:h-[120px]",
              "bg-primary/5 rounded-xl border border-primary/20",
              "hover:bg-primary/10 hover:shadow-lg hover:-translate-y-0.5",
              "transition-all duration-200"
            )}
          >
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <ChevronRight className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs md:text-sm font-semibold text-primary text-center leading-tight px-2">
              Ver todas as opções
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default GuiaCategoriesSlider;
