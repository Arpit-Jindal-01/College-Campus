import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSkillPulse } from '@/contexts/SkillPulseContext';
import { OpportunityType, LocationType, Domain, OPPORTUNITY_TYPE_LABELS, DOMAIN_LABELS } from '@/types/skillpulse';
import { cn } from '@/lib/utils';
import { X, Check } from 'lucide-react';

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const opportunityTypes: OpportunityType[] = ['internship', 'job', 'hackathon', 'contest', 'event', 'scholarship', 'fellowship', 'conference'];
const locationTypes: LocationType[] = ['remote', 'onsite', 'hybrid'];
const domains: Domain[] = ['web-dev', 'ai-ml', 'cybersecurity', 'design', 'mobile', 'data-science', 'blockchain', 'cloud', 'devops', 'product', 'business'];

export function FilterSheet({ open, onOpenChange }: FilterSheetProps) {
  const { filters, setFilters, clearFilters } = useSkillPulse();

  const toggleType = (type: OpportunityType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    setFilters({ types: newTypes });
  };

  const toggleLocationType = (type: LocationType) => {
    const newTypes = filters.locationTypes.includes(type)
      ? filters.locationTypes.filter(t => t !== type)
      : [...filters.locationTypes, type];
    setFilters({ locationTypes: newTypes });
  };

  const toggleDomain = (domain: Domain) => {
    const newDomains = filters.domains.includes(domain)
      ? filters.domains.filter(d => d !== domain)
      : [...filters.domains, domain];
    setFilters({ domains: newDomains });
  };

  const totalFilters = filters.types.length + filters.locationTypes.length + filters.domains.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl">Filters</SheetTitle>
            {totalFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all ({totalFilters})
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100%-120px)] py-6 space-y-8">
          {/* Opportunity Type */}
          <section>
            <h3 className="font-display font-semibold text-foreground mb-3">Opportunity Type</h3>
            <div className="flex flex-wrap gap-2">
              {opportunityTypes.map(type => (
                <Badge
                  key={type}
                  variant={filters.types.includes(type) ? 'default' : 'outline'}
                  className={cn(
                    'px-4 py-2 text-sm cursor-pointer press-effect transition-all',
                    filters.types.includes(type) && 'bg-primary text-primary-foreground'
                  )}
                  onClick={() => toggleType(type)}
                >
                  {filters.types.includes(type) && <Check className="w-3 h-3 mr-1" />}
                  {OPPORTUNITY_TYPE_LABELS[type]}
                </Badge>
              ))}
            </div>
          </section>

          {/* Location Type */}
          <section>
            <h3 className="font-display font-semibold text-foreground mb-3">Location Type</h3>
            <div className="flex flex-wrap gap-2">
              {locationTypes.map(type => (
                <Badge
                  key={type}
                  variant={filters.locationTypes.includes(type) ? 'default' : 'outline'}
                  className={cn(
                    'px-4 py-2 text-sm cursor-pointer press-effect transition-all capitalize',
                    filters.locationTypes.includes(type) && 'bg-accent text-accent-foreground'
                  )}
                  onClick={() => toggleLocationType(type)}
                >
                  {filters.locationTypes.includes(type) && <Check className="w-3 h-3 mr-1" />}
                  {type}
                </Badge>
              ))}
            </div>
          </section>

          {/* Domain */}
          <section>
            <h3 className="font-display font-semibold text-foreground mb-3">Domain</h3>
            <div className="flex flex-wrap gap-2">
              {domains.map(domain => (
                <Badge
                  key={domain}
                  variant={filters.domains.includes(domain) ? 'default' : 'outline'}
                  className={cn(
                    'px-4 py-2 text-sm cursor-pointer press-effect transition-all',
                    filters.domains.includes(domain) && 'bg-secondary text-secondary-foreground border-primary'
                  )}
                  onClick={() => toggleDomain(domain)}
                >
                  {filters.domains.includes(domain) && <Check className="w-3 h-3 mr-1" />}
                  {DOMAIN_LABELS[domain]}
                </Badge>
              ))}
            </div>
          </section>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border/50 safe-bottom">
          <Button 
            className="w-full h-12 font-medium gradient-primary"
            onClick={() => onOpenChange(false)}
          >
            Show Results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
