// Header do Publidoor Partner
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import type { PublidoorAdvertiser } from '@/types/publidoor';

interface PartnerHeaderProps {
  advertiser: PublidoorAdvertiser | null;
  onMenuToggle: () => void;
}

export function PartnerHeader({ advertiser, onMenuToggle }: PartnerHeaderProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/partner/login');
  };

  const initials = advertiser?.company_name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'PP';

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Title - Mobile */}
        <h1 className="font-bold text-lg lg:hidden">Publidoor Partner</h1>

        {/* Spacer for desktop */}
        <div className="hidden lg:block" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium max-w-[150px] truncate">
                {advertiser?.company_name || 'Parceiro'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/partner/publidoor/negocio')}>
              <User className="h-4 w-4 mr-2" />
              Meu Negócio
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
