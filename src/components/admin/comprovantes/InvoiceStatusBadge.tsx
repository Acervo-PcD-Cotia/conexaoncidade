import { Badge } from "@/components/ui/badge";
import { FileCheck, FilePen } from "lucide-react";
import type { InvoiceStatus } from "@/types/billing";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export default function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  if (status === "issued") {
    return (
      <Badge variant="default" className="gap-1 bg-green-600">
        <FileCheck className="h-3 w-3" />
        Emitida
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1">
      <FilePen className="h-3 w-3" />
      Rascunho
    </Badge>
  );
}
