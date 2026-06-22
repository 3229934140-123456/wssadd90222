import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UsersRound,
  UserCheck,
  Hourglass,
  AlertTriangle,
  FileSpreadsheet,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useGlobalStore } from '../../store';
import { cn } from '../../lib/utils';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ElementType;
  showBadge?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { path: '/overview', label: '门店总览', icon: LayoutDashboard },
  { path: '/queue', label: '实时排队', icon: UsersRound },
  { path: '/consultant', label: '咨询师负载', icon: UserCheck },
  { path: '/waiting', label: '顾客等待分析', icon: Hourglass },
  { path: '/alert', label: '预警中心', icon: AlertTriangle, showBadge: true },
  { path: '/export', label: '导出报表', icon: FileSpreadsheet },
];

export default function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, unhandledAlertsCount } = useGlobalStore();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-white/10 bg-gradient-card backdrop-blur-xl transition-all duration-300',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-primary">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="whitespace-nowrap">
              <h1 className="text-base font-bold text-gradient-primary">医美运营看板</h1>
              <p className="text-[10px] text-white/40">Medical Aesthetic Ops</p>
            </div>
          )}
        </div>
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white/80"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {sidebarCollapsed && (
        <div className="flex items-center justify-center py-3 border-b border-white/5">
          <button
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white/80"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <ul className="space-y-1.5">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'nav-item relative',
                    active && 'nav-item-active',
                    sidebarCollapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', active && 'text-primary-400')} />
                  {!sidebarCollapsed && <span className="flex-1">{item.label}</span>}
                  {!sidebarCollapsed && item.showBadge && unhandledAlertsCount > 0 && (
                    <span className="badge badge-critical min-w-[22px] justify-center">
                      {unhandledAlertsCount > 99 ? '99+' : unhandledAlertsCount}
                    </span>
                  )}
                  {sidebarCollapsed && item.showBadge && unhandledAlertsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-status-critical text-[10px] font-bold text-white shadow-glow-critical">
                      {unhandledAlertsCount > 9 ? '9+' : unhandledAlertsCount}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/5 p-4">
        <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rosegold-400 to-rosegold-600 font-bold text-white shadow-lg">
            张
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="truncate text-sm font-semibold text-white/90">张明</p>
              <p className="truncate text-xs text-white/40">区域运营经理</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
