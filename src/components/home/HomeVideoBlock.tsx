import { Link } from "react-router-dom";
import { TV_CONFIG } from "@/config/tv";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ChevronRight, Tv } from "lucide-react";

export function HomeVideoBlock() {
  return (
    <section className="container py-6" aria-label="WebTV Conexão">
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Tv className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{TV_CONFIG.TITLE}</CardTitle>
            </div>
            <Badge variant="destructive" className="gap-1.5 animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              {TV_CONFIG.STATUS_LABEL}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Video Player 16:9 */}
          <div className="relative aspect-video bg-muted">
            <iframe
              src={TV_CONFIG.EMBED_URL}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={TV_CONFIG.TITLE}
              loading="lazy"
            />
          </div>
          
          {/* CTA Button */}
          <div className="p-4 bg-gradient-to-r from-muted/50 to-transparent">
            <Button asChild className="w-full gap-2 h-11" size="lg">
              <Link to={TV_CONFIG.CTA_URL}>
                <Play className="h-4 w-4" />
                {TV_CONFIG.CTA_TEXT}
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
