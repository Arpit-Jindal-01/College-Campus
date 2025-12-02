import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  variant?: 'default' | 'trending';
}

export function SkeletonCard({ variant = 'default' }: SkeletonCardProps) {
  if (variant === 'trending') {
    return (
      <div className="glass-card-strong rounded-2xl p-4 min-w-[280px] max-w-[280px]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl animate-shimmer" />
            <div className="space-y-2">
              <div className="h-3 w-16 rounded animate-shimmer" />
              <div className="h-4 w-12 rounded animate-shimmer" />
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg animate-shimmer" />
        </div>
        
        <div className="h-5 w-3/4 rounded mb-2 animate-shimmer" />
        <div className="h-4 w-1/2 rounded mb-3 animate-shimmer" />
        
        <div className="flex items-center gap-2 mb-3">
          <div className="h-3 w-16 rounded animate-shimmer" />
          <div className="h-3 w-20 rounded animate-shimmer" />
        </div>
        
        <div className="flex gap-2">
          <div className="h-5 w-12 rounded animate-shimmer" />
          <div className="h-5 w-14 rounded animate-shimmer" />
          <div className="h-5 w-10 rounded animate-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card-strong rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl animate-shimmer" />
          <div className="space-y-2">
            <div className="h-4 w-20 rounded animate-shimmer" />
            <div className="flex gap-2">
              <div className="h-5 w-14 rounded animate-shimmer" />
              <div className="h-5 w-14 rounded animate-shimmer" />
            </div>
          </div>
        </div>
        <div className="w-9 h-9 rounded-lg animate-shimmer" />
      </div>
      
      <div className="h-6 w-3/4 rounded mb-2 animate-shimmer" />
      <div className="h-4 w-full rounded mb-1 animate-shimmer" />
      <div className="h-4 w-2/3 rounded mb-4 animate-shimmer" />
      
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 rounded animate-shimmer" />
        <div className="h-6 w-20 rounded animate-shimmer" />
        <div className="h-6 w-14 rounded animate-shimmer" />
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex gap-4">
          <div className="h-4 w-16 rounded animate-shimmer" />
          <div className="h-4 w-20 rounded animate-shimmer" />
        </div>
        <div className="h-4 w-24 rounded animate-shimmer" />
      </div>
    </div>
  );
}
