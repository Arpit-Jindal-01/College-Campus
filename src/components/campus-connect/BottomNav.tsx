import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/discover', icon: Search, label: 'Discover' },
  { path: '/matches', icon: MessageCircle, label: 'Matches' },
  { path: '/profile', icon: User, label: 'Profile' },
];

interface BottomNavProps {
  isDatingMode?: boolean;
}

export function BottomNav({ isDatingMode = false }: BottomNavProps) {
  const location = useLocation();
  
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 backdrop-blur-lg border-t transition-colors pb-safe",
      isDatingMode ? "bg-pink-950/95 border-pink-800/50" : "bg-background/95 border-border"
    )}>
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-safe">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path || 
            (path !== '/' && location.pathname.startsWith(path));
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors",
                isActive 
                  ? isDatingMode ? "text-pink-400" : "text-primary"
                  : isDatingMode ? "text-pink-300/60 hover:text-pink-300" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "w-5 h-5", 
                isActive && (isDatingMode ? "fill-pink-400/20" : "fill-primary/20")
              )} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
