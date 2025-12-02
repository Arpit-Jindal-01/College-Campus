import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useSkillPulse } from '@/contexts/SkillPulseContext';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onFilterClick?: () => void;
  placeholder?: string;
  showFilter?: boolean;
}

export function SearchBar({ onFilterClick, placeholder = 'Search opportunities...', showFilter = true }: SearchBarProps) {
  const { filters, setFilters } = useSkillPulse();
  const [isFocused, setIsFocused] = useState(false);

  const hasActiveFilters = 
    filters.types.length > 0 || 
    filters.locationTypes.length > 0 || 
    filters.domains.length > 0;

  return (
    <div className={cn(
      'flex items-center gap-2 p-2 rounded-2xl transition-all duration-300',
      'bg-secondary/50 border border-border/50',
      isFocused && 'bg-card border-primary/50 shadow-glow'
    )}>
      <Search className="w-5 h-5 text-muted-foreground ml-2" />
      <Input
        type="text"
        placeholder={placeholder}
        value={filters.query}
        onChange={(e) => setFilters({ query: e.target.value })}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
      />
      {filters.query && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setFilters({ query: '' })}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      {showFilter && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-10 w-10 shrink-0 rounded-xl',
            hasActiveFilters && 'bg-primary text-primary-foreground'
          )}
          onClick={onFilterClick}
        >
          <SlidersHorizontal className="w-5 h-5" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {filters.types.length + filters.locationTypes.length + filters.domains.length}
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
