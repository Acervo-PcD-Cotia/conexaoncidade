import { Link } from "react-router-dom";
import { Play } from "lucide-react";

// Mock data - will be replaced with real data from database
const stories = [
  {
    id: 1,
    title: "Novo parque inaugurado",
    coverImageUrl: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=200&h=200&fit=crop",
    slug: "novo-parque",
  },
  {
    id: 2,
    title: "Festival de música",
    coverImageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=200&fit=crop",
    slug: "festival-musica",
  },
  {
    id: 3,
    title: "Feira gastronômica",
    coverImageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop",
    slug: "feira-gastronomica",
  },
  {
    id: 4,
    title: "Maratona da cidade",
    coverImageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=200&h=200&fit=crop",
    slug: "maratona-cidade",
  },
  {
    id: 5,
    title: "Exposição de arte",
    coverImageUrl: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=200&h=200&fit=crop",
    slug: "exposicao-arte",
  },
  {
    id: 6,
    title: "Nova ciclovia",
    coverImageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&h=200&fit=crop",
    slug: "nova-ciclovia",
  },
];

export function StoriesBar() {
  if (stories.length === 0) return null;

  return (
    <div className="border-b bg-card py-4">
      <div className="container">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {stories.map((story) => (
            <Link
              key={story.id}
              to={`/stories/${story.slug}`}
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              {/* Avatar with gradient ring */}
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-accent via-primary to-news-exclusive opacity-75" />
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-background">
                  <img
                    src={story.coverImageUrl}
                    alt={story.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  />
                  {/* Play indicator */}
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="h-6 w-6 fill-white text-white" />
                  </div>
                </div>
              </div>
              {/* Title */}
              <span className="max-w-[80px] truncate text-center text-xs text-muted-foreground">
                {story.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
