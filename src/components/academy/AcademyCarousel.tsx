import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AcademyCourseCard } from "./AcademyCourseCard";
import type { AcademyCourse } from "@/types/academy";

interface AcademyCarouselProps {
  title: string;
  courses: AcademyCourse[];
  progressMap?: Record<string, number>;
  className?: string;
}

export function AcademyCarousel({ title, courses, progressMap = {}, className }: AcademyCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const scrollAmount = 300;
    const newScrollLeft =
      direction === "left"
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;

    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  if (courses.length === 0) return null;

  return (
    <section className={cn("relative group/carousel", className)}>
      {/* Title */}
      <h2 className="text-xl font-bold text-zinc-100 mb-4 px-1">{title}</h2>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full rounded-none bg-gradient-to-r from-background/80 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-background/60"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full rounded-none bg-gradient-to-l from-background/80 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-background/60"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px]"
            style={{ scrollSnapAlign: "start" }}
          >
            <AcademyCourseCard
              course={course}
              progress={progressMap[course.id] || 0}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
