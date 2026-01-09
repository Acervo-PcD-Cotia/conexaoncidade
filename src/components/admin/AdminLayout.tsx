import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { Breadcrumb } from "./Breadcrumb";
import { useRequireRole } from "@/hooks/useRequireRole";
import { NewsCreationModal } from "./NewsCreationModal";
import { useNewsCreationModal } from "@/contexts/NewsCreationModalContext";

export function AdminLayout() {
  const { hasAccess, checkingRole } = useRequireRole([
    "super_admin",
    "admin", 
    "editor", 
    "editor_chief", 
    "reporter", 
    "columnist",
    "moderator",
  ]);

  const { isOpen, closeModal } = useNewsCreationModal();

  if (checkingRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 overflow-auto bg-muted/30 p-6">
            <Breadcrumb />
            <Outlet />
          </main>
        </div>
      </div>
      <NewsCreationModal open={isOpen} onOpenChange={(open) => !open && closeModal()} />
    </SidebarProvider>
  );
}
