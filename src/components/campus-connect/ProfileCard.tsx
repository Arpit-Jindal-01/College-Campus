import { Profile } from '@/types/campus-connect';
import { GOAL_LABELS } from '@/types/campus-connect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, X, MessageCircle, Users, Briefcase, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  profile: Profile & { compatibility?: number; sharedInterests?: string[] };
  onConnect?: () => void;
  onPass?: () => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
  showActions?: boolean;
  isMatch?: boolean;
  compact?: boolean;
  isDating?: boolean;
}

const goalIcons: Record<string, React.ReactNode> = {
  'friends': <Users className="w-3 h-3" />,
  'project partner': <Briefcase className="w-3 h-3" />,
  'hackathon team': <Sparkles className="w-3 h-3" />,
  'study group': <BookOpen className="w-3 h-3" />,
  'collab': <Users className="w-3 h-3" />,
  'dating': <Heart className="w-3 h-3" />
};

export function ProfileCard({ 
  profile, 
  onConnect, 
  onPass, 
  onMessage,
  onViewProfile,
  showActions = true,
  isMatch = false,
  compact = false,
  isDating = false
}: ProfileCardProps) {
  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  return (
    <Card className={cn(
      "overflow-hidden backdrop-blur-sm",
      compact ? "p-3" : "",
      isDating 
        ? "border-pink-200/50 dark:border-pink-900/50 bg-gradient-to-br from-card to-pink-50/30 dark:to-pink-950/10"
        : "border-border/50 bg-card/80"
    )}>
      <CardContent className={cn("p-0", compact && "p-0")}>
        <div 
          className={cn("p-4", compact && "p-2", onViewProfile && "cursor-pointer")}
          onClick={onViewProfile}
        >
          {/* Header with avatar and basic info */}
          <div className="flex items-start gap-4">
            <Avatar className={cn("ring-2 ring-primary/20", compact ? "h-12 w-12" : "h-20 w-20")}>
              <AvatarImage src={profile.avatar_url || ''} alt={profile.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={cn("font-bold truncate", compact ? "text-base" : "text-xl")}>
                  {profile.name}
                </h3>
                {profile.verified && (
                  <span className="text-primary">✓</span>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {profile.branch && `${profile.branch}`}
                {profile.year && ` • Year ${profile.year}`}
              </p>
              
              {profile.compatibility !== undefined && (
                <div className="mt-1 flex items-center gap-1">
                  <span className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    profile.compatibility >= 80 ? "bg-green-500/20 text-green-400" :
                    profile.compatibility >= 60 ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {profile.compatibility}% match
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Bio */}
          {!compact && profile.bio && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {profile.bio}
            </p>
          )}
          
          {/* Shared interests */}
          {profile.sharedInterests && profile.sharedInterests.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1">Shared interests</p>
              <div className="flex flex-wrap gap-1">
                {profile.sharedInterests.slice(0, compact ? 2 : 4).map(interest => (
                  <Badge key={interest} variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                    {interest}
                  </Badge>
                ))}
                {profile.sharedInterests.length > (compact ? 2 : 4) && (
                  <Badge variant="secondary" className="text-xs">
                    +{profile.sharedInterests.length - (compact ? 2 : 4)}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Goals */}
          {!compact && profile.goals && profile.goals.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {profile.goals.slice(0, 4).map(goal => (
                <Badge 
                  key={goal} 
                  variant="outline" 
                  className={cn(
                    "text-xs flex items-center gap-1",
                    goal === 'dating' && "border-pink-500/50 text-pink-400"
                  )}
                >
                  {goalIcons[goal]}
                  {GOAL_LABELS[goal] || goal}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* Actions */}
        {showActions && (
          <div className={cn(
            "p-4 pt-0 flex gap-2",
            isDating && "border-t border-pink-200/50 dark:border-pink-900/30 pt-4 mt-2"
          )}>
            {onPass && (
              <Button 
                variant="outline" 
                size="lg"
                className={cn(
                  "flex-1",
                  isDating 
                    ? "border-pink-200 hover:bg-pink-50 dark:border-pink-900 dark:hover:bg-pink-950"
                    : "border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                )}
                onClick={onPass}
              >
                <X className="w-5 h-5 mr-1" />
                Pass
              </Button>
            )}
            {onConnect && !isMatch && (
              <Button 
                size="lg"
                className={cn(
                  "flex-1",
                  isDating 
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                    : "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                )}
                onClick={onConnect}
              >
                <Heart className={cn("w-5 h-5 mr-1", isDating && "fill-white")} />
                {isDating ? 'Like' : 'Connect'}
              </Button>
            )}
            {onMessage && isMatch && (
              <Button 
                size="lg"
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                onClick={onMessage}
              >
                <MessageCircle className="w-5 h-5 mr-1" />
                Message
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
