import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Star, Accessibility, Loader2, Trash2, Flag, BadgeCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StarRating } from "./StarRating";
import { ReportReviewDialog } from "./ReportReviewDialog";
import { LocationPhotosGallery } from "./LocationPhotosGallery";
import { useLocationReviews, LocationReview } from "@/hooks/useLocationReviews";
import { useAuth } from "@/contexts/AuthContext";
import { CommunityLocation } from "@/hooks/useCommunityLocations";

interface LocationReviewsDialogProps {
  location: CommunityLocation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationReviewsDialog({
  location,
  open,
  onOpenChange,
}: LocationReviewsDialogProps) {
  const { user } = useAuth();
  const { reviews, isLoading, stats, userReview, submitReview, deleteReview } =
    useLocationReviews(location?.id || "");

  const [rating, setRating] = useState(userReview?.rating || 0);
  const [accessibilityRating, setAccessibilityRating] = useState(
    userReview?.accessibility_rating || 0
  );
  const [comment, setComment] = useState(userReview?.comment || "");
  const [showForm, setShowForm] = useState(!userReview);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reviewToReport, setReviewToReport] = useState<LocationReview | null>(null);

  const handleReportClick = (review: LocationReview) => {
    setReviewToReport(review);
    setReportDialogOpen(true);
  };

  // Update form when user review changes
  useState(() => {
    if (userReview) {
      setRating(userReview.rating);
      setAccessibilityRating(userReview.accessibility_rating || 0);
      setComment(userReview.comment || "");
      setShowForm(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    submitReview.mutate(
      {
        rating,
        comment: comment.trim() || undefined,
        accessibility_rating: accessibilityRating > 0 ? accessibilityRating : undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteReview.mutate(undefined, {
      onSuccess: () => {
        setRating(0);
        setAccessibilityRating(0);
        setComment("");
        setShowForm(true);
      },
    });
  };

  const handleEdit = () => {
    if (userReview) {
      setRating(userReview.rating);
      setAccessibilityRating(userReview.accessibility_rating || 0);
      setComment(userReview.comment || "");
    }
    setShowForm(true);
  };

  if (!location) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            {location.name}
            {location.is_verified && (
              <Badge className="bg-green-100 text-green-700 border-green-300">
                <BadgeCheck className="h-3 w-3 mr-1" />
                Verificado
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>{location.address || location.neighborhood || "Guia Na Cidade"}</DialogDescription>
        </DialogHeader>

        {/* Stats */}
        <div className="flex items-center gap-4 py-3 border-y">
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <StarRating rating={stats.avgRating} size="sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {stats.count} {stats.count === 1 ? "avaliação" : "avaliações"}
            </p>
            {stats.avgAccessibilityRating > 0 && (
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <Accessibility className="h-3 w-3" />
                <span>Acessibilidade: {stats.avgAccessibilityRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Photos Gallery */}
        <LocationPhotosGallery locationId={location.id} locationName={location.name} />

        <Separator />

        <ScrollArea className="flex-1 min-h-0">
          {/* Reviews List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-4 py-2">
              {reviews.map((review) => (
                <div key={review.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                      <AvatarFallback>
                        {review.reviewer?.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {review.reviewer?.full_name || "Usuário"}
                          </span>
                          {review.user_id === user?.id && (
                            <Badge variant="secondary" className="text-xs">
                              Você
                            </Badge>
                          )}
                        </div>
                        {user && review.user_id !== user.id && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReportClick(review);
                                  }}
                                >
                                  <Flag className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Denunciar avaliação</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(review.created_at), "d MMM yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm mt-1 text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
                      {review.accessibility_rating && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Accessibility className="h-3 w-3" />
                          <span>Acessibilidade: {review.accessibility_rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma avaliação ainda</p>
              <p className="text-sm">Seja o primeiro a avaliar!</p>
            </div>
          )}
        </ScrollArea>

        {/* User Review Section */}
        {user && (
          <div className="border-t pt-4 space-y-4">
            {userReview && !showForm ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sua avaliação</p>
                  <StarRating rating={userReview.rating} size="sm" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover avaliação?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sua avaliação será excluída permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Sua avaliação *</Label>
                  <StarRating
                    rating={rating}
                    size="lg"
                    interactive
                    onChange={setRating}
                  />
                </div>

                {location.is_accessible && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Accessibility className="h-4 w-4" />
                      Nota para acessibilidade (opcional)
                    </Label>
                    <StarRating
                      rating={accessibilityRating}
                      size="md"
                      interactive
                      onChange={setAccessibilityRating}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Comentário (opcional)</Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Conte sua experiência..."
                    maxLength={500}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {comment.length}/500
                  </p>
                </div>

                <div className="flex gap-2">
                  {userReview && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={rating === 0 || submitReview.isPending}
                    className="flex-1 bg-pink-600 hover:bg-pink-700"
                  >
                    {submitReview.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : userReview ? (
                      "Atualizar"
                    ) : (
                      "Avaliar"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {!user && (
          <div className="border-t pt-4">
            <p className="text-sm text-center text-muted-foreground">
              Faça login para avaliar este local
            </p>
          </div>
        )}
      </DialogContent>

      {/* Report Dialog */}
      <ReportReviewDialog
        review={reviewToReport}
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
      />
    </Dialog>
  );
}
