import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Check, X, Clock, Users, Loader2, Bell, BellOff, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWaitingGuests, WaitingGuest } from "@/hooks/useWaitingGuests";
import { motion, AnimatePresence } from "framer-motion";

interface WaitingGuestsPanelProps {
  sessionId: string;
  onGuestApproved?: (guest: WaitingGuest) => void;
  onGuestRejected?: (guest: WaitingGuest) => void;
  compact?: boolean;
}

function formatWaitingTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function GuestCard({
  guest,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  guest: WaitingGuest;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const [localWaitingTime, setLocalWaitingTime] = useState(guest.waitingTime || 0);

  // Live-update waiting time
  useEffect(() => {
    setLocalWaitingTime(guest.waitingTime || 0);
    const interval = setInterval(() => {
      setLocalWaitingTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [guest.waitingTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-3 bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 transition-colors">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-zinc-700 flex items-center justify-center text-lg font-bold">
              {guest.avatar_url ? (
                <img
                  src={guest.avatar_url}
                  alt={guest.display_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                guest.display_name.charAt(0).toUpperCase()
              )}
            </div>
            {/* Pulsing indicator for new guests */}
            {localWaitingTime < 30 && (
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{guest.display_name}</p>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Clock className="h-3 w-3" />
              <span>Aguardando {formatWaitingTime(localWaitingTime)}</span>
            </div>
          </div>

          {/* Media status indicators */}
          <div className="flex items-center gap-1">
            {guest.is_camera_off ? (
              <VideoOff className="h-3.5 w-3.5 text-zinc-500" />
            ) : (
              <Video className="h-3.5 w-3.5 text-emerald-500" />
            )}
            {guest.is_muted ? (
              <MicOff className="h-3.5 w-3.5 text-zinc-500" />
            ) : (
              <Mic className="h-3.5 w-3.5 text-emerald-500" />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/50"
                  onClick={onReject}
                  disabled={isApproving || isRejecting}
                >
                  {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Recusar entrada</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className="h-8 w-8 bg-emerald-600 hover:bg-emerald-500"
                  onClick={onApprove}
                  disabled={isApproving || isRejecting}
                >
                  {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Aprovar entrada</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function WaitingGuestsPanel({
  sessionId,
  onGuestApproved,
  onGuestRejected,
  compact = false,
}: WaitingGuestsPanelProps) {
  const {
    waitingGuests,
    isLoading,
    approveGuest,
    rejectGuest,
    isApproving,
    isRejecting,
    newGuestAlert,
    dismissAlert,
  } = useWaitingGuests(sessionId);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<WaitingGuest | null>(null);
  const [rejectMessage, setRejectMessage] = useState("");

  const handleApprove = async (guest: WaitingGuest) => {
    await approveGuest(guest.id);
    onGuestApproved?.(guest);
  };

  const handleRejectClick = (guest: WaitingGuest) => {
    setSelectedGuest(guest);
    setRejectMessage("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (selectedGuest) {
      await rejectGuest(selectedGuest.id, rejectMessage || undefined);
      onGuestRejected?.(selectedGuest);
      setRejectDialogOpen(false);
      setSelectedGuest(null);
    }
  };

  // Dismiss alert when user interacts with panel
  useEffect(() => {
    if (newGuestAlert && waitingGuests.length > 0) {
      dismissAlert();
    }
  }, [newGuestAlert, waitingGuests.length, dismissAlert]);

  if (compact) {
    // Compact mode: just show badge/count
    return (
      <div className="relative">
        {waitingGuests.length > 0 && (
          <Badge
            className={cn(
              "gap-1",
              newGuestAlert ? "bg-amber-600 animate-pulse" : "bg-zinc-700"
            )}
          >
            <Users className="h-3 w-3" />
            {waitingGuests.length}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-zinc-400" />
          <h3 className="font-medium">Aguardando Entrada</h3>
          {waitingGuests.length > 0 && (
            <Badge variant="secondary" className="bg-amber-600/20 text-amber-400">
              {waitingGuests.length}
            </Badge>
          )}
        </div>

        {newGuestAlert && (
          <Button
            size="sm"
            variant="ghost"
            className="gap-1 text-amber-400"
            onClick={dismissAlert}
          >
            <Bell className="h-4 w-4 animate-bounce" />
          </Button>
        )}
      </div>

      {/* Guest List */}
      <ScrollArea className="flex-1 p-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Carregando...
          </div>
        ) : waitingGuests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-500 text-sm">
            <Users className="h-8 w-8 mb-2 opacity-50" />
            <p>Nenhum convidado aguardando</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {waitingGuests.map((guest) => (
                <GuestCard
                  key={guest.id}
                  guest={guest}
                  onApprove={() => handleApprove(guest)}
                  onReject={() => handleRejectClick(guest)}
                  isApproving={isApproving}
                  isRejecting={isRejecting}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* Approve All / Reject All (if multiple) */}
      {waitingGuests.length > 1 && (
        <div className="p-3 border-t border-zinc-800 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1"
            onClick={() => {
              waitingGuests.forEach((g) => approveGuest(g.id));
            }}
            disabled={isApproving}
          >
            <Check className="h-3 w-3" />
            Aprovar Todos
          </Button>
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Recusar Entrada</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {selectedGuest?.display_name} não poderá entrar no estúdio.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <Input
              placeholder="Motivo (opcional)"
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500"
              onClick={handleRejectConfirm}
            >
              Recusar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
