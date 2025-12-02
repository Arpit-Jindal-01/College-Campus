import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampusConnect } from '@/contexts/CampusConnectContext';
import { useDatingMode } from '@/contexts/DatingModeContext';
import { getMatches } from '@/lib/campus-connect/db';
import { MatchWithProfile } from '@/types/campus-connect';
import { BottomNav } from '@/components/campus-connect/BottomNav';
import { DatingToggle } from '@/components/campus-connect/DatingToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, RefreshCw, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CampusMatches() {
  const navigate = useNavigate();
  const { user, profile, loading } = useCampusConnect();
  const { isDatingActive } = useDatingMode();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/landing', { replace: true });
    } else if (!loading && user && !profile?.onboarding_completed) {
      navigate('/onboarding', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  const loadMatches = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await getMatches(user.id);
      setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  // Filter matches based on dating mode
  const filteredMatches = matches.filter(match => 
    isDatingActive ? match.is_dating_match : !match.is_dating_match
  );

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
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className={cn(
              "text-xl font-display font-bold",
              isDatingActive && "text-pink-100"
            )}>
              {isDatingActive ? 'Dating Matches' : 'Matches'}
            </h1>
            <p className={cn(
              "text-sm",
              isDatingActive ? "text-pink-300/70" : "text-muted-foreground"
            )}>
              {filteredMatches.length} connection{filteredMatches.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={loadMatches}
              className={isDatingActive ? "text-pink-300 hover:text-pink-100 hover:bg-pink-800/50" : ""}
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
            <DatingToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className={cn(
                "h-20 rounded-xl",
                isDatingActive && "bg-pink-800/30"
              )} />
            ))}
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="space-y-2">
            {filteredMatches.map(match => {
              const initials = match.profile.name.split(' ').map(n => n[0]).join('').toUpperCase();
              const lastMessageTime = match.lastMessage?.created_at 
                ? formatDistanceToNow(new Date(match.lastMessage.created_at), { addSuffix: true })
                : formatDistanceToNow(new Date(match.created_at), { addSuffix: true });
              
              return (
                <button
                  key={match.id}
                  onClick={() => navigate(`/chat/${match.id}`)}
                  className={cn(
                    "w-full p-4 rounded-xl border transition-colors text-left flex items-center gap-4",
                    isDatingActive 
                      ? "bg-pink-900/30 border-pink-800/50 hover:bg-pink-800/40" 
                      : "bg-card/50 border-border/50 hover:bg-accent/50"
                  )}
                >
                  <Avatar className={cn(
                    "h-14 w-14 ring-2",
                    isDatingActive ? "ring-pink-500/30" : "ring-primary/20"
                  )}>
                    <AvatarImage src={match.profile.avatar_url || ''} />
                    <AvatarFallback className={cn(
                      "font-bold",
                      isDatingActive 
                        ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white"
                        : "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                    )}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "font-semibold truncate block",
                      isDatingActive && "text-pink-100"
                    )}>
                      {match.profile.name}
                    </span>
                    
                    {match.lastMessage ? (
                      <p className={cn(
                        "text-sm truncate",
                        isDatingActive ? "text-pink-300/70" : "text-muted-foreground"
                      )}>
                        {match.lastMessage.content}
                      </p>
                    ) : (
                      <p className={cn(
                        "text-sm italic",
                        isDatingActive ? "text-pink-300/70" : "text-muted-foreground"
                      )}>
                        No messages yet
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={cn(
                        "text-xs",
                        isDatingActive && "bg-pink-800/50 text-pink-200"
                      )}>
                        {match.compatibility_score}% match
                      </Badge>
                      <span className={cn(
                        "text-xs",
                        isDatingActive ? "text-pink-400/70" : "text-muted-foreground"
                      )}>
                        {lastMessageTime}
                      </span>
                    </div>
                  </div>
                  
                  <MessageCircle className={cn(
                    "w-5 h-5",
                    isDatingActive ? "text-pink-400" : "text-muted-foreground"
                  )} />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
              isDatingActive ? "bg-pink-800/30" : "bg-muted"
            )}>
              {isDatingActive ? (
                <Heart className="w-10 h-10 text-pink-400" />
              ) : (
                <MessageCircle className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <h3 className={cn(
              "text-lg font-semibold mb-2",
              isDatingActive && "text-pink-100"
            )}>
              No {isDatingActive ? 'dating ' : ''}matches yet
            </h3>
            <p className={isDatingActive ? "text-pink-300/70" : "text-muted-foreground"}>
              {isDatingActive 
                ? 'Start swiping to find your match!' 
                : 'Start discovering people to make your first connection!'
              }
            </p>
          </div>
        )}
      </div>

      <BottomNav isDatingMode={isDatingActive} />
    </div>
  );
}
