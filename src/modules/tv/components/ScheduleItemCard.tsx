import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, Clock, MoreVertical, Pencil, Copy, Trash2, Video, Radio } from "lucide-react";
import { TvScheduleItem } from "../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScheduleItemCardProps {
  item: TvScheduleItem;
  onEdit?: (item: TvScheduleItem) => void;
  onDuplicate?: (item: TvScheduleItem) => void;
  onDelete?: (item: TvScheduleItem) => void;
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function ScheduleItemCard({ item, onEdit, onDuplicate, onDelete }: ScheduleItemCardProps) {
  const startDate = new Date(item.startAt);
  const endDate = new Date(item.endAt);
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className="w-24 h-16 rounded bg-muted flex-shrink-0 overflow-hidden">
            {item.thumbnailUrl ? (
              <img 
                src={item.thumbnailUrl} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {item.source === "live" ? (
                  <Radio className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <Video className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(item)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate?.(item)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(item)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <Badge variant={item.source === "live" ? "default" : "secondary"}>
                {item.source === "live" ? "Ao Vivo" : "VOD"}
              </Badge>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {format(startDate, "dd/MM/yyyy", { locale: ptBR })}
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
              </div>

              {item.isRecurring && item.recurringPattern && (
                <Badge variant="outline">
                  Recorrente: {item.recurringPattern.days.map(d => dayNames[d]).join(", ")}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
