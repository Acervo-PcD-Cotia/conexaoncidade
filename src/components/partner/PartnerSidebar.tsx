// Sidebar do Publidoor Partner
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Store, 
  Edit, 
  Calendar, 
  BarChart3, 
  Building2, 
  CreditCard,
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PartnerSidebarProps {
  onClose?: () => void;
}

const menuItems = [
  {
    label: 'Minha Vitrine',
    href: '/partner/publidoor',
    icon: Store,
    exact: true,
  },
  {
    label: 'Editar Vitrine',
    href: '/partner/publidoor/editar',
    icon: Edit,
  },
  {
    label: 'Agenda',
    href: '/partner/publidoor/agenda',
    icon: Calendar,
  },
  {
    label: 'Métricas',
    href: '/partner/publidoor/metricas',
    icon: BarChart3,
  },
  {
    label: 'Meu Negócio',
    href: '/partner/publidoor/negocio',
    icon: Building2,
  },
  {
    label: 'Plano',
    href: '/partner/publidoor/plano',
    icon: CreditCard,
  },
];

export function PartnerSidebar({ onClose }: PartnerSidebarProps) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Publidoor</h2>
            <p className="text-xs text-muted-foreground">Partner</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.href
            : location.pathname.startsWith(item.href);
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Presença Digital Urbana
        </p>
      </div>
    </div>
  );
}
