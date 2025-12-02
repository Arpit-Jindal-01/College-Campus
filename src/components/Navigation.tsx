import { NavLink } from 'react-router-dom';
import { Home, Mic, Upload, Settings, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/record', icon: Mic, label: 'Record' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border/50 z-50 px-4 py-2 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200",
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function DesktopNavigation() {
  return (
    <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-card/50 backdrop-blur-lg border-r border-border/50 flex-col p-6 z-50">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shadow-glow">
          <BookOpen className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-display text-xl text-foreground">Class Whisperer</span>
      </div>
      
      <div className="flex flex-col gap-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              isActive 
                ? "gradient-gold text-primary-foreground shadow-glow" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
