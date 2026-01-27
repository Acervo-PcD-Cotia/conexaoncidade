// Layout do Publidoor Partner
import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { PartnerSidebar } from '@/components/partner/PartnerSidebar';
import { PartnerHeader } from '@/components/partner/PartnerHeader';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';

export default function PartnerLayout() {
  const { user, advertiser, isPartner, isLoading } = usePartnerAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/partner/login" replace />;
  }

  // Redirect if not a partner
  if (!isPartner) {
    return <Navigate to="/partner/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <PartnerSidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        <PartnerHeader
          advertiser={advertiser}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
