import { useState, useEffect } from 'react';
import { Bookmark, Filter, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OpportunityCard } from '@/components/skillpulse/OpportunityCard';
import { SkeletonCard } from '@/components/skillpulse/SkeletonCard';
import { useSkillPulse } from '@/contexts/SkillPulseContext';
import { opportunitiesApi } from '@/services/opportunitiesApi';
import { Opportunity, SortOption } from '@/types/skillpulse';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Saved() {
  const { savedOpportunities, isAuthenticated } = useSkillPulse();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    const fetchSaved = async () => {
      setIsLoading(true);
      const all = await Promise.all(
        savedOpportunities.map(id => opportunitiesApi.getById(id))
      );
      let filtered = all.filter((o): o is Opportunity => o !== null);
      
      // Sort
      switch (sortBy) {
        case 'newest':
          filtered.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
          break;
        case 'deadline':
          filtered.sort((a, b) => {
            const deadlineA = a.deadline || a.eventDate || '9999-12-31';
            const deadlineB = b.deadline || b.eventDate || '9999-12-31';
            return new Date(deadlineA).getTime() - new Date(deadlineB).getTime();
          });
          break;
      }
      
      setOpportunities(filtered);
      setIsLoading(false);
    };

    if (savedOpportunities.length > 0) {
      fetchSaved();
    } else {
      setOpportunities([]);
      setIsLoading(false);
    }
  }, [savedOpportunities, sortBy]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl font-semibold mb-2">Sign in to Save</h2>
          <p className="text-muted-foreground mb-4">
            Create an account to save opportunities and access them anywhere.
          </p>
          <Button className="gradient-primary" onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Saved
              </h1>
              <p className="text-sm text-muted-foreground">
                {savedOpportunities.length} opportunities saved
              </p>
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="deadline">Deadline Soon</SelectItem>
                <SelectItem value="relevance">Most Relevant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="px-4 pb-24 pt-4">
        {isLoading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">No Saved Opportunities</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Tap the bookmark icon on any opportunity to save it for later.
            </p>
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {opportunities.map(opp => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
