import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useGlobalStore } from '../../store';
import { cn } from '../../lib/utils';

export default function AppLayout() {
  const { sidebarCollapsed } = useGlobalStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-dark text-white">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main
          className={cn(
            'flex-1 overflow-y-auto transition-all duration-300 scrollbar-thin',
            'p-4 md:p-6 lg:p-8'
          )}
        >
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
