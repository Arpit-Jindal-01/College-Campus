import { Badge } from '@/components/ui/badge';
import { useSkillPulse } from '@/contexts/SkillPulseContext';
import { OpportunityType, LocationType, OPPORTUNITY_TYPE_LABELS } from '@/types/skillpulse';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const quickFilters: { type: OpportunityType | 'all'; label: string }[] = [
  { type: 'all', label: 'All' },
  { type: 'internship', label: 'Internships' },
  { type: 'job', label: 'Jobs' },
  { type: 'hackathon', label: 'Hackathons' },
  { type: 'contest', label: 'Contests' },
  { type: 'scholarship', label: 'Scholarships' },
];

const locationFilters: { type: LocationType | 'all'; label: string }[] = [
  { type: 'remote', label: '🌍 Remote' },
  { type: 'onsite', label: '📍 On-site' },
  { type: 'hybrid', label: '🔀 Hybrid' },
];

export function FilterChips() {
  const { filters, setFilters } = useSkillPulse();

  const handleTypeClick = (type: OpportunityType | 'all') => {
    if (type === 'all') {
      setFilters({ types: [] });
    } else {
      const newTypes = filters.types.includes(type)
        ? filters.types.filter(t => t !== type)
        : [type]; // Single select for quick filters
      setFilters({ types: newTypes });
    }
  };

  const handleLocationClick = (type: LocationType | 'all') => {
    if (type === 'all') {
      setFilters({ locationTypes: [] });
    } else {
      const newTypes = filters.locationTypes.includes(type)
        ? filters.locationTypes.filter(t => t !== type)
        : [type]; // Single select for quick filters
      setFilters({ locationTypes: newTypes });
    }
  };

  const isTypeActive = (type: OpportunityType | 'all') => {
    if (type === 'all') return filters.types.length === 0;
    return filters.types.includes(type);
  };

  const isLocationActive = (type: LocationType | 'all') => {
    if (type === 'all') return filters.locationTypes.length === 0;
    return filters.locationTypes.includes(type);
  };

  return (
    <div className="space-y-3">
      {/* Type filters */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {quickFilters.map(({ type, label }) => (
            <Badge
              key={type}
              variant={isTypeActive(type) ? 'default' : 'secondary'}
              className={cn(
                'px-4 py-2 text-sm cursor-pointer press-effect transition-all shrink-0',
                isTypeActive(type) && 'gradient-primary text-primary-foreground shadow-glow'
              )}
              onClick={() => handleTypeClick(type)}
            >
              {label}
            </Badge>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-1" />
      </ScrollArea>

      {/* Location filters */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {locationFilters.map(({ type, label }) => (
            <Badge
              key={type}
              variant={isLocationActive(type) ? 'default' : 'outline'}
              className={cn(
                'px-4 py-2 text-sm cursor-pointer press-effect transition-all shrink-0',
                isLocationActive(type) && 'bg-accent text-accent-foreground border-accent'
              )}
              onClick={() => handleLocationClick(type)}
            >
              {label}
            </Badge>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-1" />
      </ScrollArea>
    </div>
  );
}
