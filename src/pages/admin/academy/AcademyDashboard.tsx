import { useState } from "react";
import { Search, GraduationCap, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAcademyCategories, useAcademyCourses, useContinueWatching, useAcademyProgress } from "@/hooks/useAcademy";
import { AcademyCarousel } from "@/components/academy/AcademyCarousel";
import { AcademyContinueWatching } from "@/components/academy/AcademyContinueWatching";
import type { AcademyCourse, AcademyProgress } from "@/types/academy";

export default function AcademyDashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories, isLoading: loadingCategories } = useAcademyCategories();
  const { data: allCourses, isLoading: loadingCourses } = useAcademyCourses();
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

  // Group courses by category
  const coursesByCategory = categories?.map(category => ({
    category,
    courses: filteredCourses.filter(c => c.category_id === category.id && c.is_published),
  })).filter(group => group.courses.length > 0) || [];

  // Courses without category
  const uncategorizedCourses = filteredCourses.filter(
    c => !c.category_id && c.is_published
  );

  // New courses (last 30 days)
  const newCourses = filteredCourses.filter(c => {
    if (!c.is_published) return false;
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
                  Treinamentos e cursos para sua equipe
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
        ) : (
          <>
            {/* Continue Watching */}
            {!loadingContinue && continueWatching && continueWatching.length > 0 && (
              <AcademyContinueWatching items={continueWatching} />
            )}

            {/* New Courses */}
            {newCourses.length > 0 && (
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

            {/* Uncategorized Courses */}
            {uncategorizedCourses.length > 0 && (
              <AcademyCarousel
                title="Outros Cursos"
                courses={uncategorizedCourses}
                progressMap={progressMap}
              />
            )}

            {/* Empty State */}
            {filteredCourses.length === 0 && (
              <div className="text-center py-20">
                <GraduationCap className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-muted-foreground mb-2">
                  {searchQuery ? "Nenhum curso encontrado" : "Nenhum curso disponível"}
                </h2>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Tente buscar por outro termo"
                    : "Os cursos aparecerão aqui quando forem publicados"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
