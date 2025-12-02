import { Home, Compass, Bookmark, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSkillPulse } from '@/contexts/SkillPulseContext';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/saved', icon: Bookmark, label: 'Saved' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNavigation() {
  const location = useLocation();
  const { savedOpportunities } = useSkillPulse();

  // Don't show on auth/onboarding screens
  if (['/auth', '/onboarding', '/location'].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 tab-bar-blur border-t border-border/50 safe-bottom">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          const showBadge = path === '/saved' && savedOpportunities.length > 0;
          
          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    'w-6 h-6 transition-transform',
                    isActive && 'scale-110'
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {savedOpportunities.length > 9 ? '9+' : savedOpportunities.length}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-xs font-medium transition-colors',
                isActive && 'text-primary'
              )}>
                {label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
