import { ReactNode } from 'react';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';
import { useUserRole } from '@/hooks/useRequireRole';
import MaintenancePage from '@/pages/MaintenancePage';
import { Loader2 } from 'lucide-react';

interface MaintenanceGuardProps {
  children: ReactNode;
}

export function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const { isMaintenanceMode, message, estimatedEnd, isLoading: maintenanceLoading } = useMaintenanceMode();
  const { isSuperAdmin, isAdmin, loading: roleLoading } = useUserRole();

  // Show minimal loading state
  if (maintenanceLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Admins and super_admins can bypass maintenance mode
  const canBypass = isSuperAdmin || isAdmin;

  if (isMaintenanceMode && !canBypass) {
    return <MaintenancePage message={message} estimatedEnd={estimatedEnd} />;
  }

  return <>{children}</>;
}
