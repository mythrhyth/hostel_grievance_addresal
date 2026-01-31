import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  AlertCircle,
  Megaphone,
  Search,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface SidebarProps {
  className?: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Issues', href: '/issues', icon: AlertCircle },
  { name: 'Announcements', href: '/announcements', icon: Megaphone },
  { name: 'Lost & Found', href: '/lost-found', icon: Search },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const managementNav: { name: string; href: string; icon: any }[] = [];

export function Sidebar({
  className,
  mobileOpen,
  onMobileClose
}: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isManagement = user?.role === 'MANAGEMENT';

  // Auto close on route change (mobile)
  useEffect(() => {
    onMobileClose();
  }, [location.pathname]);

  return (
    <>
      {/* ===== Mobile Overlay ===== */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* ===== Sidebar ===== */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-transform duration-300',
          // Width
          collapsed ? 'lg:w-16' : 'lg:w-64',
          'w-64',
          // Mobile slide
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          className
        )}
      >
        {/* ===== Logo / Header ===== */}
        <div
          className={cn(
            'flex items-center gap-3 px-4 h-16 border-b border-gray-200',
            collapsed && 'lg:justify-center'
          )}
        >
          <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">
                Hostel Grievance
              </span>
              <span className="text-xs text-gray-500">
                Issue Management
              </span>
            </div>
          )}

          {/* Mobile close */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="ml-auto lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* ===== Navigation ===== */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/dashboard' &&
                location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  collapsed && 'lg:justify-center'
                )}
              >
                <item.icon className="w-5 h-5" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}

          {isManagement && (
            <>
              {!collapsed && (
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <span className="px-3 text-xs font-semibold text-gray-500 uppercase">
                    Management
                  </span>
                </div>
              )}

              {managementNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    location.pathname === item.href
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    collapsed && 'lg:justify-center'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* ===== Desktop Collapse Toggle ===== */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 rounded-full border border-gray-200 bg-white shadow"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </Button>

        {/* ===== User Footer ===== */}
        <div className={cn('p-4 border-t border-gray-200', collapsed && 'lg:px-2')}>
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {user?.name?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-gray-500 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="w-full text-gray-500 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
