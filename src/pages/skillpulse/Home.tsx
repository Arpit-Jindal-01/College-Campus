import { useState, useEffect } from 'react';
import { MapPin, Bell, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { SearchBar } from '@/components/skillpulse/SearchBar';
import { FilterChips } from '@/components/skillpulse/FilterChips';
import { FilterSheet } from '@/components/skillpulse/FilterSheet';
import { OpportunityCard } from '@/components/skillpulse/OpportunityCard';
import { SkeletonCard } from '@/components/skillpulse/SkeletonCard';
import { useSkillPulse } from '@/contexts/SkillPulseContext';
import { opportunitiesApi } from '@/services/opportunitiesApi';
import { Opportunity } from '@/types/skillpulse';
import { useUserLocation } from '@/hooks/useUserLocation';

export default function Home() {
  const { user, filters, sort, clearFilters } = useSkillPulse();
  const { location: storedLocation } = useUserLocation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [trending, setTrending] = useState<Opportunity[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Get effective location with coordinates - prefer context, fallback to localStorage
  const effectiveLocation = user?.location?.coordinates ? {
    lat: user.location.coordinates.lat,
    lng: user.location.coordinates.lng,
    city: user.location.city,
    country: user.location.country,
  } : storedLocation ? {
    lat: storedLocation.lat,
    lng: storedLocation.lng,
    city: storedLocation.city,
    country: storedLocation.country,
  } : undefined;

  // Fetch trending
  useEffect(() => {
    opportunitiesApi.getTrending(6).then(setTrending);
  }, []);

  // Fetch opportunities with filters
  useEffect(() => {
    setIsLoading(true);
    setPage(1);

    opportunitiesApi.getOpportunities(filters, sort, 1, 10, effectiveLocation).then(result => {
      setOpportunities(result.data);
      setHasMore(result.hasMore);
      setIsLoading(false);
    });
  }, [filters, sort, effectiveLocation?.lat, effectiveLocation?.lng]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    const result = await opportunitiesApi.getOpportunities(filters, sort, nextPage, 10, effectiveLocation);
    setOpportunities(prev => [...prev, ...result.data]);
    setHasMore(result.hasMore);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">{getGreeting()}</p>
              <h1 className="font-display text-xl font-bold text-foreground">
                {user?.name || 'Explorer'} 👋
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {effectiveLocation && (
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  {effectiveLocation.city}
                </Button>
              )}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </div>
          </div>
          
          <SearchBar onFilterClick={() => setIsFilterOpen(true)} />
        </div>
      </header>

      <main className="px-4 pb-24">
        {/* Filter chips */}
        <section className="py-4">
          <FilterChips />
        </section>

        {/* Trending section */}
        {trending.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Trending Now
              </h2>
              <Button variant="ghost" size="sm" className="text-primary">
                See all <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 pb-4">
                {trending.map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp} variant="trending" />
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="h-1" />
            </ScrollArea>
          </section>
        )}

        {/* Main feed */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-4">
            For You
          </h2>
          
          <div className="space-y-4 stagger-children">
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : opportunities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No opportunities found</p>
                <Button 
                  variant="link" 
                  className="text-primary mt-2"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              opportunities.map(opp => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))
            )}
          </div>

          {/* Load more */}
          {hasMore && !isLoading && (
            <div className="flex justify-center mt-6">
              <Button 
                variant="outline" 
                onClick={loadMore}
                disabled={isLoadingMore}
                className="w-full max-w-xs"
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </section>
      </main>

      <FilterSheet open={isFilterOpen} onOpenChange={setIsFilterOpen} />
    </div>
  );
}
