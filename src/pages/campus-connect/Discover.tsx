import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampusConnect } from '@/contexts/CampusConnectContext';
import { useDatingMode } from '@/contexts/DatingModeContext';
import { discoverProfiles, discoverDatingProfiles, createLike } from '@/lib/campus-connect/db';
import { Profile, DiscoverFilters, INTERESTS, HOBBIES, GOALS, BRANCHES, YEARS } from '@/types/campus-connect';
import { ProfileCard } from '@/components/campus-connect/ProfileCard';
import { BottomNav } from '@/components/campus-connect/BottomNav';
import { DatingToggle } from '@/components/campus-connect/DatingToggle';
import { ChipSelect } from '@/components/campus-connect/ChipSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Search, SlidersHorizontal, X, Heart, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProfileWithMeta = Profile & { compatibility: number; sharedInterests: string[] };

export default function CampusDiscover() {
  const navigate = useNavigate();
  const { user, profile, loading } = useCampusConnect();
  const { isDatingActive } = useDatingMode();
  const [profiles, setProfiles] = useState<ProfileWithMeta[]>([]);
  const [datingProfiles, setDatingProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<DiscoverFilters>({
    interests: [],
    hobbies: [],
    goals: [],
    datingOnly: false,
    socialRange: [0, 10],
    activityRange: [0, 10],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/landing', { replace: true });
    } else if (!loading && user && !profile?.onboarding_completed) {
      navigate('/onboarding', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  const loadProfiles = async () => {
    if (!user || !profile) return;
    
    setIsLoading(true);
    try {
      const data = await discoverProfiles(user.id, profile, filters, 50);
      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast({ title: 'Error loading profiles', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDatingProfiles = async () => {
    if (!user || !profile) return;
    
    setIsLoading(true);
    try {
      const data = await discoverDatingProfiles(user.id, profile);
      setDatingProfiles(data);
    } catch (error) {
      console.error('Error loading dating profiles:', error);
      toast({ title: 'Error loading profiles', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.onboarding_completed) {
      if (isDatingActive) {
        loadDatingProfiles();
      } else {
        loadProfiles();
      }
    }
  }, [profile?.onboarding_completed, filters, isDatingActive]);

  const handleConnect = async (targetProfile: ProfileWithMeta | Profile) => {
    if (!user) return;
    
    try {
      const likeType = isDatingActive ? 'dating' : 'friend';
      const result = await createLike(user.id, targetProfile.id, likeType);
      
      if (result.matched) {
        toast({ 
          title: isDatingActive ? "It's a match! 💕" : "It's a match! 🎉",
          description: `You and ${targetProfile.name} are now connected!`
        });
      } else {
        toast({ title: isDatingActive ? 'Like sent!' : 'Interest sent!' });
      }
      
      // Remove from list
      if (isDatingActive) {
        setDatingProfiles(prev => prev.filter(p => p.id !== targetProfile.id));
      } else {
        setProfiles(prev => prev.filter(p => p.id !== targetProfile.id));
      }
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        toast({ title: 'Already connected', variant: 'destructive' });
      } else {
        toast({ title: 'Error connecting', variant: 'destructive' });
      }
    }
  };

  const filteredProfiles = profiles.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.branch?.toLowerCase().includes(query) ||
      p.interests.some(i => i.toLowerCase().includes(query)) ||
      p.hobbies.some(h => h.toLowerCase().includes(query))
    );
  });

  const filteredDatingProfiles = datingProfiles.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.branch?.toLowerCase().includes(query) ||
      p.interests.some(i => i.toLowerCase().includes(query)) ||
      p.hobbies.some(h => h.toLowerCase().includes(query))
    );
  });

  const clearFilters = () => {
    setFilters({
      interests: [],
      hobbies: [],
      goals: [],
      datingOnly: false,
      socialRange: [0, 10],
      activityRange: [0, 10],
    });
  };

  const hasActiveFilters = filters.interests.length > 0 || 
    filters.hobbies.length > 0 || 
    filters.goals.length > 0 || 
    filters.branch || 
    filters.year;

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen pb-24 transition-colors duration-300",
      isDatingActive ? "dating-gradient" : "bg-background"
    )}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-40 backdrop-blur-lg border-b transition-colors",
        isDatingActive ? "bg-pink-950/95 border-pink-800/50" : "bg-background/95 border-border/50"
      )}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className={cn(
              "text-xl font-display font-bold",
              isDatingActive && "text-pink-100"
            )}>
              {isDatingActive ? 'Discover Dates' : 'Discover'}
            </h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={isDatingActive ? loadDatingProfiles : loadProfiles}
                className={isDatingActive ? "text-pink-300 hover:text-pink-100 hover:bg-pink-800/50" : ""}
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              <DatingToggle />
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                isDatingActive ? "text-pink-400" : "text-muted-foreground"
              )} />
              <Input
                placeholder="Search by name, branch, interests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-10",
                  isDatingActive && "bg-pink-900/30 border-pink-800/50 text-pink-100 placeholder:text-pink-400/50"
                )}
              />
            </div>
            
            {!isDatingActive && (
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <SlidersHorizontal className="w-4 h-4" />
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center justify-between">
                      Filters
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          <X className="w-4 h-4 mr-1" />
                          Clear all
                        </Button>
                      )}
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="space-y-6 py-6">
                    {/* Branch & Year */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Branch</Label>
                        <Select 
                          value={filters.branch || ''} 
                          onValueChange={(v) => setFilters(f => ({ ...f, branch: v || undefined }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any</SelectItem>
                            {BRANCHES.map(b => (
                              <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Year</Label>
                        <Select 
                          value={filters.year?.toString() || ''} 
                          onValueChange={(v) => setFilters(f => ({ ...f, year: v ? parseInt(v) : undefined }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any</SelectItem>
                            {YEARS.map(y => (
                              <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Interests */}
                    <div className="space-y-2">
                      <Label>Interests</Label>
                      <ChipSelect
                        options={INTERESTS}
                        selected={filters.interests}
                        onChange={(v) => setFilters(f => ({ ...f, interests: v }))}
                      />
                    </div>
                    
                    {/* Hobbies */}
                    <div className="space-y-2">
                      <Label>Hobbies</Label>
                      <ChipSelect
                        options={HOBBIES}
                        selected={filters.hobbies}
                        onChange={(v) => setFilters(f => ({ ...f, hobbies: v }))}
                      />
                    </div>
                    
                    {/* Goals */}
                    <div className="space-y-2">
                      <Label>Goals</Label>
                      <ChipSelect
                        options={GOALS}
                        selected={filters.goals}
                        onChange={(v) => setFilters(f => ({ ...f, goals: v }))}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Apply Filters
                  </Button>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className={cn(
                "h-48 rounded-xl",
                isDatingActive && "bg-pink-800/30"
              )} />
            ))}
          </div>
        ) : isDatingActive ? (
          filteredDatingProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDatingProfiles.map(p => (
                <ProfileCard
                  key={p.id}
                  profile={p}
                  onConnect={() => handleConnect(p)}
                  compact
                  showActions
                  isDating={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-pink-800/30 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-pink-100 mb-2">No profiles found</h3>
              <p className="text-pink-300/70">Check back later for new people!</p>
            </div>
          )
        ) : filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProfiles.map(p => (
              <ProfileCard
                key={p.id}
                profile={p}
                onConnect={() => handleConnect(p)}
                compact
                showActions
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No profiles found</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      <BottomNav isDatingMode={isDatingActive} />
    </div>
  );
}
