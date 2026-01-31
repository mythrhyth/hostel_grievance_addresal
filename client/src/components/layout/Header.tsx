import { cn } from '@/lib/utils';
import { Bell, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  onMenuToggle?: () => void;
  showSearch?: boolean;
}

export function Header({
  title,
  subtitle,
  className,
  onMenuToggle,
  showSearch = true,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          'h-16 border-b border-gray-200 bg-white sticky top-0 z-30',
          className
        )}
      >
        <div className="flex items-center justify-between h-full px-4 sm:px-6">
          {/* LEFT */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuToggle}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="hidden sm:block text-sm text-gray-500 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-3">
            {showSearch && (
              <div className="hidden md:block w-56">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search…" className="pl-9" />
                </div>
              </div>
            )}

            {showSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
              </Button>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full" />
            </Button>

            {/* USER MENU */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Badge className="text-xs">
                    {user?.role}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* MOBILE SEARCH */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSearchOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="ml-3 flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input autoFocus placeholder="Search…" className="pl-9" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
