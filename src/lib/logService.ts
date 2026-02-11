import { supabase } from "@/integrations/supabase/client";

interface LogEntry {
  modulo: string;
  erro: string;
  metadata?: Record<string, unknown>;
}

class LogService {
  private queue: LogEntry[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  async log(entry: LogEntry) {
    this.queue.push(entry);
    
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), 2000);
    }
  }

  private async flush() {
    this.flushTimer = null;
    if (this.queue.length === 0) return;

    const entries = [...this.queue];
    this.queue = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const rows = entries.map(e => ({
        modulo: e.modulo,
        erro: e.erro,
        usuario_id: user?.id || null,
        metadata: e.metadata || {},
      }));

      const { error } = await supabase
        .from("system_logs" as any)
        .insert(rows);

      if (error) {
        console.warn("[LogService] Failed to persist logs:", error.message);
      }
    } catch (err) {
      console.warn("[LogService] Error flushing logs:", err);
    }
  }

  error(modulo: string, erro: string | Error, metadata?: Record<string, unknown>) {
    const errorMessage = erro instanceof Error ? erro.message : erro;
    const errorMeta = erro instanceof Error 
      ? { ...metadata, stack: erro.stack }
      : metadata;

    console.error(`[${modulo}]`, errorMessage);
    this.log({ modulo, erro: errorMessage, metadata: errorMeta });
  }

  warn(modulo: string, message: string, metadata?: Record<string, unknown>) {
    console.warn(`[${modulo}]`, message);
    this.log({ modulo, erro: `[WARN] ${message}`, metadata });
  }
}

export const logService = new LogService();
