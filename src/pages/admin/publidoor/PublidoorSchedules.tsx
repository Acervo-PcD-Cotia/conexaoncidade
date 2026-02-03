import { useState } from "react";
import { Calendar, Clock, Plus, Pencil, Trash2, Loader2, CalendarDays, Sun, Moon, PartyPopper, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  useAllPublidoorSchedules, 
  useCreatePublidoorSchedule, 
  useUpdatePublidoorSchedule, 
  useDeletePublidoorSchedule,
  usePublidoorItems
} from "@/hooks/usePublidoor";
import { PUBLIDOOR_SCHEDULE_TYPE_LABELS, PublidoorScheduleType, PublidoorSchedule } from "@/types/publidoor";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const SCHEDULE_ICONS: Record<PublidoorScheduleType, React.ReactNode> = {
  specific_dates: <CalendarDays className="h-4 w-4" />,
  weekdays: <Calendar className="h-4 w-4" />,
  time_range: <Clock className="h-4 w-4" />,
  business_hours: <Sun className="h-4 w-4" />,
  weekends: <Moon className="h-4 w-4" />,
  holidays: <PartyPopper className="h-4 w-4" />,
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type ScheduleWithPublidoor = PublidoorSchedule & { publidoor?: { id: string; internal_name: string; status: string } | null };

const defaultFormData = {
  publidoor_id: "",
  schedule_type: "weekdays" as PublidoorScheduleType,
  days_of_week: [1, 2, 3, 4, 5] as number[],
  time_start: "08:00",
  time_end: "18:00",
  specific_dates: [] as string[],
  is_active: true,
};

export default function PublidoorSchedules() {
  const { data: schedules = [], isLoading } = useAllPublidoorSchedules();
  const { data: publidoorItems = [] } = usePublidoorItems();
  const createSchedule = useCreatePublidoorSchedule();
  const updateSchedule = useUpdatePublidoorSchedule();
  const deleteSchedule = useDeletePublidoorSchedule();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleWithPublidoor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingPublidoorId, setDeletingPublidoorId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  const handleOpenCreate = () => {
    setFormData(defaultFormData);
    setEditingSchedule(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (schedule: ScheduleWithPublidoor) => {
    setFormData({
      publidoor_id: schedule.publidoor_id,
      schedule_type: schedule.schedule_type,
      days_of_week: schedule.days_of_week || [1, 2, 3, 4, 5],
      time_start: schedule.time_start || "08:00",
      time_end: schedule.time_end || "18:00",
      specific_dates: schedule.specific_dates || [],
      is_active: schedule.is_active,
    });
    setEditingSchedule(schedule);
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (id: string, publidoorId: string) => {
    setDeletingId(id);
    setDeletingPublidoorId(publidoorId);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async () => {
    if (editingSchedule) {
      await updateSchedule.mutateAsync({ 
        id: editingSchedule.id, 
        publidoor_id: editingSchedule.publidoor_id,
        ...formData 
      });
    } else {
      await createSchedule.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    setEditingSchedule(null);
  };

  const handleDelete = async () => {
    if (deletingId && deletingPublidoorId) {
      await deleteSchedule.mutateAsync({ id: deletingId, publidoor_id: deletingPublidoorId });
      setIsDeleteOpen(false);
      setDeletingId(null);
      setDeletingPublidoorId(null);
    }
  };

  const toggleDayOfWeek = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day].sort()
    }));
  };

  const getScheduleDescription = (schedule: ScheduleWithPublidoor) => {
    switch (schedule.schedule_type) {
      case "weekdays":
        const days = schedule.days_of_week?.map(d => WEEKDAYS[d]).join(", ") || "Seg-Sex";
        return `${days} • ${schedule.time_start || "00:00"} - ${schedule.time_end || "23:59"}`;
      case "time_range":
        return `${schedule.time_start || "00:00"} - ${schedule.time_end || "23:59"}`;
      case "business_hours":
        return "08:00 - 18:00 (dias úteis)";
      case "weekends":
        return "Sábados e Domingos";
      case "specific_dates":
        const dates = schedule.specific_dates?.slice(0, 2).join(", ") || "";
        return dates + (schedule.specific_dates?.length > 2 ? ` +${schedule.specific_dates.length - 2}` : "");
      case "holidays":
        return "Feriados e datas comemorativas";
      default:
        return schedule.schedule_type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda & Programação</h1>
          <p className="text-muted-foreground">
            Gerencie quando seus Publidoors devem ser exibidos
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Agendamentos</CardDescription>
            <CardTitle className="text-2xl">{schedules.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ativos</CardDescription>
            <CardTitle className="text-2xl">{schedules.filter(s => s.is_active).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Publidoors com Agenda</CardDescription>
            <CardTitle className="text-2xl">{new Set(schedules.map(s => s.publidoor_id)).size}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Inativos</CardDescription>
            <CardTitle className="text-2xl">{schedules.filter(s => !s.is_active).length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Schedule List */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos</CardTitle>
          <CardDescription>Lista de todas as programações configuradas</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Nenhum agendamento cadastrado</p>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Agendamento
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Publidoor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Programação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{schedule.publidoor?.internal_name || "Publidoor"}</p>
                        <Badge variant="outline" className="text-xs">
                          {schedule.publidoor?.status || "draft"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {SCHEDULE_ICONS[schedule.schedule_type]}
                        <span>{PUBLIDOOR_SCHEDULE_TYPE_LABELS[schedule.schedule_type]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {getScheduleDescription(schedule)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {schedule.is_active ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <X className="h-3 w-3 mr-1" />Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(schedule)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleOpenDelete(schedule.id, schedule.publidoor_id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
            <DialogDescription>Configure quando o Publidoor deve ser exibido</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Publidoor</Label>
              <Select
                value={formData.publidoor_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, publidoor_id: value }))}
                disabled={!!editingSchedule}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um Publidoor" />
                </SelectTrigger>
                <SelectContent>
                  {publidoorItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>{item.internal_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Programação</Label>
              <Select
                value={formData.schedule_type}
                onValueChange={(value: PublidoorScheduleType) => setFormData(prev => ({ ...prev, schedule_type: value }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PUBLIDOOR_SCHEDULE_TYPE_LABELS).map(([type, label]) => (
                    <SelectItem key={type} value={type}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.schedule_type === "weekdays" && (
              <div className="space-y-2">
                <Label>Dias da Semana</Label>
                <div className="flex gap-2 flex-wrap">
                  {WEEKDAYS.map((day, index) => (
                    <Button key={index} type="button" size="sm" variant={formData.days_of_week.includes(index) ? "default" : "outline"} onClick={() => toggleDayOfWeek(index)}>{day}</Button>
                  ))}
                </div>
              </div>
            )}

            {(formData.schedule_type === "weekdays" || formData.schedule_type === "time_range") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hora Início</Label>
                  <Input type="time" value={formData.time_start} onChange={(e) => setFormData(prev => ({ ...prev, time_start: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Hora Fim</Label>
                  <Input type="time" value={formData.time_end} onChange={(e) => setFormData(prev => ({ ...prev, time_end: e.target.value }))} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createSchedule.isPending || updateSchedule.isPending || !formData.publidoor_id}>
              {(createSchedule.isPending || updateSchedule.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingSchedule ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Agendamento</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este agendamento?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {deleteSchedule.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}