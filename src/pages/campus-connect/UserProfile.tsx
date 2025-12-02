import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCampusConnect } from '@/contexts/CampusConnectContext';
import { getProfile, createLike, blockUser, reportUser, getMatches } from '@/lib/campus-connect/db';
import { calculateCompatibility, getSharedInterests, getSharedHobbies } from '@/lib/campus-connect/matching';
import { Profile, GOAL_LABELS, MatchWithProfile } from '@/types/campus-connect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Heart, MessageCircle, MoreVertical, Flag, UserX } from 'lucide-react';

export default function CampusUserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, profile: currentProfile } = useCampusConnect();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [compatibility, setCompatibility] = useState(0);
  const [sharedInterests, setSharedInterests] = useState<string[]>([]);
  const [sharedHobbies, setSharedHobbies] = useState<string[]>([]);
  const [existingMatch, setExistingMatch] = useState<MatchWithProfile | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const data = await getProfile(userId);
        setProfile(data);
        
        if (data && currentProfile) {
          setCompatibility(calculateCompatibility(currentProfile, data));
          setSharedInterests(getSharedInterests(currentProfile, data));
          setSharedHobbies(getSharedHobbies(currentProfile, data));
        }
        
        // Check if already matched
        if (user) {
          const matches = await getMatches(user.id);
          const match = matches.find(m => m.profile.id === userId);
          setExistingMatch(match || null);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({ title: 'Error loading profile', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, user, currentProfile]);

  const handleConnect = async () => {
    if (!user || !profile || !currentProfile) return;
    
    try {
      const likeType = currentProfile.dating_mode && profile.dating_mode ? 'dating' : 'friend';
      const result = await createLike(user.id, profile.id, likeType);
      
      if (result.matched) {
        toast({ 
          title: "It's a match! 🎉",
          description: `You and ${profile.name} are now connected!`
        });
        // Reload to show message button
        const matches = await getMatches(user.id);
        const match = matches.find(m => m.profile.id === userId);
        setExistingMatch(match || null);
      } else {
        toast({ title: 'Interest sent!' });
      }
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        toast({ title: 'Already sent interest' });
      } else {
        toast({ title: 'Error connecting', variant: 'destructive' });
      }
    }
  };

  const handleBlock = async () => {
    if (!user || !profile) return;
    
    try {
      await blockUser(user.id, profile.id);
      toast({ title: 'User blocked' });
      navigate(-1);
    } catch (error) {
      toast({ title: 'Error blocking user', variant: 'destructive' });
    }
  };

  const handleReport = async () => {
    if (!user || !profile || !reportReason.trim()) return;
    
    try {
      await reportUser(user.id, profile.id, reportReason);
      toast({ title: 'Report submitted' });
      setShowReportDialog(false);
      setReportReason('');
    } catch (error) {
      toast({ title: 'Error submitting report', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground">Profile not found</p>
        <Button variant="link" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                <Flag className="w-4 h-4 mr-2" />
                Report
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => setShowBlockDialog(true)}
              >
                <UserX className="w-4 h-4 mr-2" />
                Block
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="text-center">
          <Avatar className="h-28 w-28 mx-auto ring-4 ring-primary/20">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-3xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-2xl font-display font-bold mt-4">{profile.name}</h2>
          <p className="text-muted-foreground">
            {profile.branch && `${profile.branch}`}
            {profile.year && ` • Year ${profile.year}`}
          </p>
          
          <Badge className="mt-2 text-sm" variant="secondary">
            {compatibility}% match
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {existingMatch ? (
            <Button 
              className="flex-1 bg-gradient-to-r from-primary to-accent"
              onClick={() => navigate(`/chat/${existingMatch.id}`)}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Message
            </Button>
          ) : (
            <Button 
              className="flex-1 bg-gradient-to-r from-primary to-accent"
              onClick={handleConnect}
            >
              <Heart className="w-5 h-5 mr-2" />
              Connect
            </Button>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Shared Interests */}
        {sharedInterests.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Shared Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {sharedInterests.map(i => (
                  <Badge key={i} className="bg-primary/20 text-primary border-0">{i}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Interests */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {profile.interests.map(i => (
                <Badge 
                  key={i} 
                  variant={sharedInterests.includes(i) ? "default" : "secondary"}
                  className={sharedInterests.includes(i) ? "bg-primary/20 text-primary border-0" : ""}
                >
                  {i}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hobbies */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Hobbies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {profile.hobbies.map(h => (
                <Badge 
                  key={h} 
                  variant={sharedHobbies.includes(h) ? "default" : "outline"}
                  className={sharedHobbies.includes(h) ? "bg-accent/20 text-accent-foreground border-0" : ""}
                >
                  {h}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Looking for</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {profile.goals.map(g => (
                <Badge key={g} variant="secondary">{GOAL_LABELS[g] || g}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Personality */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Personality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Social</span>
              <span>
                {profile.personality_social_level <= 3 ? 'Introvert' : 
                 profile.personality_social_level >= 7 ? 'Extrovert' : 'Ambivert'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Energy</span>
              <span>
                {profile.personality_activity_level <= 3 ? 'Chill' : 
                 profile.personality_activity_level >= 7 ? 'Energetic' : 'Balanced'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Communication</span>
              <span className="capitalize">{profile.personality_communication}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Schedule</span>
              <span className="capitalize">{profile.personality_wake_cycle.replace('-', ' ')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Block Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {profile.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They won't be able to see your profile or message you. You can unblock them later in settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock} className="bg-destructive">
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report {profile.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Please describe the issue. Your report will be reviewed by our team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Describe the issue..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="my-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReport} 
              disabled={!reportReason.trim()}
            >
              Submit Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
