import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampusConnect } from '@/contexts/CampusConnectContext';
import { useDatingMode } from '@/contexts/DatingModeContext';
import { getRequests, joinRequest, getMyRequests, deleteRequest, discoverDatingProfiles, createLike, leaveRequest } from '@/lib/campus-connect/db';
import { RequestWithProfile, REQUEST_CATEGORIES, Profile } from '@/types/campus-connect';
import { RequestCard } from '@/components/campus-connect/RequestCard';
import { CreateRequestSheet } from '@/components/campus-connect/CreateRequestSheet';
import { ProfileCard } from '@/components/campus-connect/ProfileCard';
import { ProfileViewer } from '@/components/campus-connect/ProfileViewer';
import { ReportSheet } from '@/components/campus-connect/ReportSheet';
import { BottomNav } from '@/components/campus-connect/BottomNav';
import { DatingToggle } from '@/components/campus-connect/DatingToggle';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, Plus, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CampusHome() {
  const navigate = useNavigate();
  const { user, profile, loading } = useCampusConnect();
  const { isDatingActive } = useDatingMode();
  const [requests, setRequests] = useState<RequestWithProfile[]>([]);
  const [myRequests, setMyRequests] = useState<RequestWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Dating mode state
  const [datingProfiles, setDatingProfiles] = useState<Profile[]>([]);
  const [currentDatingIndex, setCurrentDatingIndex] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [reportingProfile, setReportingProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/landing', { replace: true });
    } else if (!loading && user && !profile?.onboarding_completed) {
      navigate('/onboarding', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  const loadRequests = async () => {
    if (!user || !profile) return;
    
    setIsLoading(true);
    try {
      const [allRequests, userRequests] = await Promise.all([
        getRequests(user.id, profile, selectedCategory !== 'all' ? selectedCategory : undefined),
        getMyRequests(user.id)
      ]);
      setRequests(allRequests.filter(r => r.user_id !== user.id));
      setMyRequests(userRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast({ title: 'Error loading requests', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDatingProfiles = async () => {
    if (!user || !profile) return;
    
    setIsLoading(true);
    try {
      const profiles = await discoverDatingProfiles(user.id, profile);
      setDatingProfiles(profiles);
      setCurrentDatingIndex(0);
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
        loadRequests();
      }
    }
  }, [profile?.onboarding_completed, selectedCategory, isDatingActive]);

  const handleJoin = async (request: RequestWithProfile) => {
    if (!user) return;
    
    try {
      const result = await joinRequest(request.id, user.id);
      if (result.matchCreated) {
        toast({ 
          title: `Joined "${request.title}"!`,
          description: 'New connection created! Chat now in Matches.'
        });
      } else if (result.existingMatch) {
        toast({ 
          title: `Joined "${request.title}"!`,
          description: 'You already have a connection. Check Matches to chat.'
        });
      } else {
        toast({ title: `Joined "${request.title}"!` });
      }
      loadRequests();
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        toast({ title: 'Already joined', variant: 'destructive' });
      } else {
        console.error('Join error:', error);
        toast({ title: 'Error joining request', variant: 'destructive' });
      }
    }
  };

  const handleDatingAction = async (targetProfile: Profile, action: 'like' | 'pass') => {
    if (!user) return;
    
    try {
      if (action === 'like') {
        const result = await createLike(user.id, targetProfile.id, 'dating');
        if (result.matched) {
          toast({ title: "It's a match! 💕", description: `You matched with ${targetProfile.name}!` });
        } else {
          toast({ title: 'Like sent!' });
        }
      }
      setCurrentDatingIndex(prev => prev + 1);
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleDeleteRequest = async (request: RequestWithProfile) => {
    if (!user) return;
    
    try {
      await deleteRequest(request.id);
      toast({ title: 'Request deleted' });
      loadRequests();
    } catch (error) {
      toast({ title: 'Error deleting request', variant: 'destructive' });
    }
  };

  const handleLeaveRequest = async (request: RequestWithProfile) => {
    if (!user) return;
    
    try {
      await leaveRequest(request.id, user.id);
      toast({ title: 'Left request' });
      loadRequests();
    } catch (error) {
      toast({ title: 'Error leaving request', variant: 'destructive' });
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  const userInterests = [...profile.interests, ...profile.hobbies];
  const currentDatingProfile = datingProfiles[currentDatingIndex];

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
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className={cn(
              "text-xl font-display font-bold",
              isDatingActive && "text-pink-100"
            )}>
              {isDatingActive ? 'Dating' : 'Find Your People'}
            </h1>
            <p className={cn(
              "text-sm",
              isDatingActive ? "text-pink-300/70" : "text-muted-foreground"
            )}>
              {isDatingActive 
                ? `${Math.max(0, datingProfiles.length - currentDatingIndex)} profiles to discover`
                : `${requests.length} active requests`
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={isDatingActive ? loadDatingProfiles : loadRequests}
              className={isDatingActive ? "text-pink-300 hover:text-pink-100 hover:bg-pink-800/50" : ""}
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
            
            <DatingToggle />
            
            {!isDatingActive && (
              <CreateRequestSheet profile={profile} onRequestCreated={loadRequests}>
                <Button size="icon" className="rounded-full">
                  <Plus className="w-5 h-5" />
                </Button>
              </CreateRequestSheet>
            )}
          </div>
        </div>
        
        {/* Category Filter - Only show in non-dating mode */}
        {!isDatingActive && (
          <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
              <Badge
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer whitespace-nowrap press-effect',
                  selectedCategory === 'all' && 'bg-primary'
                )}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Badge>
              {REQUEST_CATEGORIES.map(cat => (
                <Badge
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer whitespace-nowrap press-effect',
                    selectedCategory === cat.value && 'bg-primary'
                  )}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {cat.icon} {cat.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {isDatingActive ? (
          // Dating Mode Content
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            {isLoading ? (
              <Skeleton className="h-96 w-full max-w-sm rounded-3xl bg-pink-800/30" />
            ) : currentDatingProfile ? (
              <div className="w-full max-w-sm">
                <ProfileCard
                  profile={currentDatingProfile}
                  onConnect={() => handleDatingAction(currentDatingProfile, 'like')}
                  onPass={() => handleDatingAction(currentDatingProfile, 'pass')}
                  onViewProfile={() => setSelectedProfile(currentDatingProfile)}
                  isDating={true}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-pink-800/30 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-pink-100 mb-2">No more profiles</h3>
                <p className="text-pink-300/70 mb-4">Check back later for new matches!</p>
                <Button 
                  onClick={loadDatingProfiles}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Non-Dating Content (Requests)
          <>
            {/* My Requests Section */}
            {myRequests.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3">Your Requests</h2>
                <div className="space-y-3">
                  {myRequests.slice(0, 2).map(request => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onJoin={() => {}}
                      onDelete={handleDeleteRequest}
                      currentUserInterests={userInterests}
                      isOwner={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Requests */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                {selectedCategory === 'all' ? 'All Requests' : `${REQUEST_CATEGORIES.find(c => c.value === selectedCategory)?.label || 'Requests'}`}
              </h2>
              
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-40 w-full rounded-xl" />
                  ))}
                </div>
              ) : requests.length > 0 ? (
                <div className="space-y-3">
                  {requests.map(request => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onJoin={handleJoin}
                      onLeave={handleLeaveRequest}
                      currentUserInterests={userInterests}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to create a request!
                  </p>
                  <CreateRequestSheet profile={profile} onRequestCreated={loadRequests}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Request
                    </Button>
                  </CreateRequestSheet>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav isDatingMode={isDatingActive} />

      {/* Profile Viewer Modal */}
      {selectedProfile && (
        <ProfileViewer
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onLike={() => {
            handleDatingAction(selectedProfile, 'like');
            setSelectedProfile(null);
          }}
          onPass={() => {
            handleDatingAction(selectedProfile, 'pass');
            setSelectedProfile(null);
          }}
          onReport={() => {
            setReportingProfile(selectedProfile);
            setSelectedProfile(null);
          }}
          isDatingMode={true}
        />
      )}

      {/* Report Sheet */}
      {reportingProfile && (
        <ReportSheet
          open={!!reportingProfile}
          onOpenChange={(open) => !open && setReportingProfile(null)}
          reportedUserId={reportingProfile.id}
          reportedUserName={reportingProfile.name}
        />
      )}
    </div>
  );
}
