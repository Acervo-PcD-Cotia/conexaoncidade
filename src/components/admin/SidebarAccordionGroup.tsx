import { LucideIcon, ChevronDown } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  action?: boolean;
}

interface SidebarAccordionGroupProps {
  id: string;
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
  isOpen: boolean;
  onToggle: () => void;
  collapsed: boolean;
  onItemClick?: (item: MenuItem, e: React.MouseEvent) => void;
  isGroupActive?: boolean;
}

export function SidebarAccordionGroup({
  id,
  title,
  icon: Icon,
  items,
  isOpen,
  onToggle,
  collapsed,
  onItemClick,
  isGroupActive = false,
}: SidebarAccordionGroupProps) {
  // When collapsed, show icon with tooltip
  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggle}
              className={cn(
                "flex w-full items-center justify-center p-2 rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isGroupActive && "bg-primary/10 text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            <p>{title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-colors",
          "text-muted-foreground hover:text-foreground hover:bg-accent/50",
          isOpen && "text-foreground",
          isGroupActive && "bg-primary/5 text-primary"
        )}
      >
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{title}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-2 pt-1">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                {item.action ? (
                  <button
                    onClick={(e) => onItemClick?.(item, e)}
                    className="flex w-full items-center gap-2 text-left text-sm"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </button>
                ) : (
                  <NavLink
                    to={item.url}
                    end={item.url.endsWith("/admin") || item.url.endsWith("-escolar")}
                    className="flex items-center gap-2 text-sm"
                    activeClassName="bg-primary/10 text-primary font-medium"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </CollapsibleContent>
    </Collapsible>
  );
}
