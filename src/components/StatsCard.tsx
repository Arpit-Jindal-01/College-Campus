import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, className }: StatsCardProps) {
  return (
    <div className={cn(
      "gradient-card border border-border/50 rounded-xl p-4 flex items-center gap-4",
      className
    )}>
      <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center shadow-glow">
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm">{title}</p>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
