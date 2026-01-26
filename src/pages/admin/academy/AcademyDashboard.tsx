import { useState } from "react";
import { Search, GraduationCap, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAcademyCategories, useAcademyCourses, useContinueWatching, useAcademyProgress } from "@/hooks/useAcademy";
import { AcademyCarousel } from "@/components/academy/AcademyCarousel";
import { AcademyContinueWatching } from "@/components/academy/AcademyContinueWatching";
import { AcademyCourseGrid } from "@/components/academy/AcademyCourseGrid";
import { AcademyEmptyState } from "@/components/academy/AcademyEmptyState";
import type { AcademyCourse, AcademyProgress } from "@/types/academy";

export default function AcademyDashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories, isLoading: loadingCategories } = useAcademyCategories();
  const { data: allCourses, isLoading: loadingCourses, refetch } = useAcademyCourses();
  const { data: continueWatching, isLoading: loadingContinue } = useContinueWatching();
  const { data: progressData } = useAcademyProgress();

  const isLoading = loadingCategories || loadingCourses;

  // Build progress map: courseId -> percent
  const buildCourseProgressMap = (
    courses: AcademyCourse[],
    progress: AcademyProgress[]
  ): Record<string, number> => {
    const map: Record<string, number> = {};
    
    // Group lessons by course
    courses.forEach(course => {
      const courseLessons = course.lessons || [];
      if (courseLessons.length === 0) return;

      const completedLessons = progress.filter(
        p => courseLessons.some(l => l.id === p.lesson_id) && p.progress_percent >= 100
      ).length;

      map[course.id] = Math.round((completedLessons / courseLessons.length) * 100);
    });

    return map;
  };

  const progressMap = allCourses && progressData 
    ? buildCourseProgressMap(allCourses, progressData) 
    : {};

  // Filter courses by search
  const filteredCourses = allCourses?.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Only published courses
  const publishedCourses = filteredCourses.filter(c => c.is_published);

  // Group courses by category
  const coursesByCategory = categories?.map(category => ({
    category,
    courses: publishedCourses.filter(c => c.category_id === category.id),
  })).filter(group => group.courses.length > 0) || [];

  // Courses without category (main operational training courses)
  const uncategorizedCourses = publishedCourses.filter(c => !c.category_id);

  // New courses (last 30 days)
  const newCourses = publishedCourses.filter(c => {
    const createdAt = new Date(c.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdAt > thirtyDaysAgo;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Conexão Academy</h1>
                <p className="text-sm text-muted-foreground">
                  Treinamentos operacionais para WebRádio e WebTV
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6 space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : publishedCourses.length === 0 ? (
          <AcademyEmptyState onRefresh={() => refetch()} />
        ) : (
          <>
            {/* Continue Watching */}
            {!loadingContinue && continueWatching && continueWatching.length > 0 && (
              <AcademyContinueWatching items={continueWatching} />
            )}

            {/* Main Operational Training - Uncategorized courses first */}
            {uncategorizedCourses.length > 0 && (
              <AcademyCourseGrid
                title="🎯 Treinamentos Operacionais"
                courses={uncategorizedCourses}
                progressMap={progressMap}
              />
            )}

            {/* New Courses */}
            {newCourses.length > 0 && newCourses.length !== uncategorizedCourses.length && (
              <AcademyCarousel
                title="Novos Treinamentos"
                courses={newCourses}
                progressMap={progressMap}
              />
            )}

            {/* Courses by Category */}
            {coursesByCategory.map(({ category, courses }) => (
              <AcademyCarousel
                key={category.id}
                title={category.name}
                courses={courses}
                progressMap={progressMap}
              />
            ))}

            {/* Empty search state */}
            {searchQuery && filteredCourses.length === 0 && (
              <div className="text-center py-20">
                <GraduationCap className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-muted-foreground mb-2">
                  Nenhum curso encontrado
                </h2>
                <p className="text-muted-foreground">
                  Tente buscar por outro termo
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
