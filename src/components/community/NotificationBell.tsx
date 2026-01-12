import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, CheckCheck, Trash2, MessageSquare, AtSign, Reply, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNotifications, CommunityNotification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const typeIcons = {
  new_post: MessageSquare,
  mention: AtSign,
  reply: Reply,
  like: Heart,
};

const typeColors = {
  new_post: "text-blue-500",
  mention: "text-purple-500",
  reply: "text-green-500",
  like: "text-red-500",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleNotificationClick = (notification: CommunityNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setOpen(false);
  };

  const getNotificationLink = (notification: CommunityNotification) => {
    if (notification.reference_type === "post" && notification.reference_id) {
      return `/comunidade#post-${notification.reference_id}`;
    }
    return "/comunidade";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 min-w-[20px] p-0 flex items-center justify-center text-[10px] bg-destructive"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {unreadCount} notificações não lidas
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => markAllAsRead()}
            >
              <CheckCheck className="h-3 w-3" />
              Marcar todas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Carregando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type] || Bell;
                const iconColor = typeColors[notification.type] || "text-muted-foreground";

                return (
                  <div
                    key={notification.id}
                    className={`relative group ${
                      !notification.is_read ? "bg-primary/5" : ""
                    }`}
                  >
                    <Link
                      to={getNotificationLink(notification)}
                      onClick={() => handleNotificationClick(notification)}
                      className="flex gap-3 p-3 hover:bg-muted/50 transition-colors"
                    >
                      {/* Icon or Avatar */}
                      <div className="flex-shrink-0">
                        {notification.actor ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={notification.actor.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {notification.actor.full_name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center ${iconColor}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">
                          {notification.title}
                        </p>
                        {notification.body && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.body}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {!notification.is_read && (
                        <div className="flex-shrink-0 mt-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                      )}
                    </Link>

                    {/* Actions - visible on hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.preventDefault();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t">
          <Link to="/comunidade">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Ver todas as notificações
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
