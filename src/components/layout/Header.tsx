import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  RefreshCw,
  Bell,
  ChevronDown,
  MapPin,
  Clock,
  LogOut,
  Settings,
  User,
  Check,
} from 'lucide-react';
import { useGlobalStore } from '../../store';
import { STORES } from '../../data/mockData';
import { cn } from '../../utils';

const ROUTE_TITLES: Record<string, string> = {
  '/overview': '门店总览',
  '/queue': '实时排队',
  '/consultant': '咨询师负载',
  '/waiting': '顾客等待分析',
  '/alert': '预警中心',
  '/export': '导出报表',
};

const formatTime = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const statusDotClass = (status: string) => {
  switch (status) {
    case 'critical':
      return 'bg-status-critical shadow-glow-critical';
    case 'warning':
      return 'bg-status-warning shadow-glow-warning';
    default:
      return 'bg-status-success shadow-glow-success';
  }
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    toggleSidebar,
    currentStoreId,
    setCurrentStoreId,
    unhandledAlertsCount,
  } = useGlobalStore();

  const [currentTime, setCurrentTime] = useState<string>(formatTime(new Date()));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const storeDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        storeDropdownRef.current &&
        !storeDropdownRef.current.contains(event.target as Node)
      ) {
        setStoreDropdownOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentStore = STORES.find((s) => s.id === currentStoreId) || STORES[0];

  const pageTitle =
    Object.entries(ROUTE_TITLES).find(([path]) =>
      location.pathname === path || location.pathname.startsWith(path + '/')
    )?.[1] || '首页';

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-gradient-card/80 px-4 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition-all hover:bg-white/5 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden items-center gap-2 text-sm md:flex">
          <span className="text-white/40">运营看板</span>
          <span className="text-white/20">/</span>
          <span className="font-medium text-white/90">{pageTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={storeDropdownRef}>
          <button
            onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
            className="flex min-w-[220px] items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 transition-all hover:border-white/20 hover:bg-white/10"
          >
            <MapPin className="h-4 w-4 text-primary-400 shrink-0" />
            <div className="flex flex-1 flex-col items-start overflow-hidden text-left">
              <span className="flex items-center gap-2 text-sm font-medium text-white/90">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full animate-pulse-slow',
                    statusDotClass(currentStore.status)
                  )}
                />
                {currentStore.name}
              </span>
              <span className="truncate text-[11px] text-white/40">
                {currentStore.city} · 排队 {currentStore.currentWaiting}人
              </span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-white/40 transition-transform',
                storeDropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {storeDropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-dark-800/95 backdrop-blur-xl shadow-xl animate-fade-in-up">
              <div className="max-h-80 overflow-y-auto py-1 scrollbar-thin">
                {STORES.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      setCurrentStoreId(store.id);
                      setStoreDropdownOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5',
                      store.id === currentStoreId && 'bg-primary-500/10'
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        statusDotClass(store.status)
                      )}
                    />
                    <div className="flex flex-1 flex-col items-start text-left">
                      <span className="text-sm text-white/90">{store.name}</span>
                      <span className="text-[11px] text-white/40">
                        {store.city} · 排队{store.currentWaiting}人 · 空闲咨询师
                        {store.freeConsultants}/{store.totalConsultants}
                      </span>
                    </div>
                    {store.id === currentStoreId && (
                      <Check className="h-4 w-4 text-primary-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleRefresh}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition-all hover:bg-white/5 hover:text-white"
          title="刷新数据"
        >
          <RefreshCw
            className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
          />
        </button>

        <button
          onClick={() => navigate('/alert')}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition-all hover:bg-white/5 hover:text-white"
          title="预警中心"
        >
          <Bell className="h-4 w-4" />
          {unhandledAlertsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-status-critical px-1 text-[10px] font-bold text-white shadow-glow-critical">
              {unhandledAlertsCount > 99 ? '99+' : unhandledAlertsCount}
            </span>
          )}
        </button>

        <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 md:flex lg:ml-2">
          <Clock className="h-4 w-4 text-white/40 shrink-0" />
          <span className="font-mono text-sm text-white/70 tabular-nums">
            {currentTime}
          </span>
        </div>

        <div className="relative ml-1" ref={userDropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 rounded-xl p-1 transition-all hover:bg-white/5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rosegold-400 to-rosegold-600 font-bold text-white shadow-lg">
              张
            </div>
            <div className="hidden flex-col items-start lg:flex">
              <span className="text-sm font-medium text-white/90">张明</span>
              <span className="text-[10px] text-white/40">运营经理</span>
            </div>
            <ChevronDown
              className={cn(
                'hidden h-4 w-4 text-white/40 transition-transform lg:block',
                userDropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-dark-800/95 backdrop-blur-xl shadow-xl animate-fade-in-up">
              <div className="border-b border-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-rosegold-400 to-rosegold-600 font-bold text-white">
                    张
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">张明</p>
                    <p className="text-xs text-white/40">zhangming@aesthetic.com</p>
                  </div>
                </div>
              </div>
              <div className="py-1">
                <button className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white">
                  <User className="h-4 w-4" />
                  个人资料
                </button>
                <button className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white">
                  <Settings className="h-4 w-4" />
                  系统设置
                </button>
              </div>
              <div className="border-t border-white/5 py-1">
                <button className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-status-critical transition-colors hover:bg-status-critical/10">
                  <LogOut className="h-4 w-4" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
