import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampusConnect } from '@/contexts/CampusConnectContext';
import { updateProfile, getProfileStats, getBlockedUsers, unblockUser, uploadAvatar } from '@/lib/campus-connect/db';
import { Profile, INTERESTS, HOBBIES, GOALS, GOAL_LABELS, BRANCHES, YEARS } from '@/types/campus-connect';
import { BottomNav } from '@/components/campus-connect/BottomNav';
import { ChipSelect } from '@/components/campus-connect/ChipSelect';
import { PhotoUpload } from '@/components/campus-connect/PhotoUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Settings, LogOut, Users, Heart, Briefcase, BookOpen, Shield, Camera, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function CampusProfile() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile, loading } = useCampusConnect();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState({
    totalMatches: 0,
    friendMatches: 0,
    projectMatches: 0,
    studyMatches: 0,
    datingMatches: 0,
  });
  const [blockedUsers, setBlockedUsers] = useState<Profile[]>([]);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    branch: '',
    year: undefined as number | undefined,
    interests: [] as string[],
    hobbies: [] as string[],
    goals: [] as string[],
    personality_social_level: 5,
    personality_activity_level: 5,
    personality_communication: 'text' as 'text' | 'vc' | 'in-person',
    personality_wake_cycle: 'flexible' as 'early-bird' | 'night-owl' | 'flexible',
    dating_mode: false,
    gender: '',
    prompt_good_at: '',
    prompt_care_about: '',
    prompt_looking_for: '',
    photos: [] as string[],
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/landing', { replace: true });
    } else if (!loading && user && !profile?.onboarding_completed) {
      navigate('/onboarding', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name,
        bio: profile.bio || '',
        branch: profile.branch || '',
        year: profile.year,
        interests: profile.interests,
        hobbies: profile.hobbies,
        goals: profile.goals,
        personality_social_level: profile.personality_social_level,
        personality_activity_level: profile.personality_activity_level,
        personality_communication: profile.personality_communication,
        personality_wake_cycle: profile.personality_wake_cycle,
        dating_mode: profile.dating_mode,
        gender: profile.gender || '',
        prompt_good_at: profile.prompt_good_at || '',
        prompt_care_about: profile.prompt_care_about || '',
        prompt_looking_for: profile.prompt_looking_for || '',
        photos: profile.photos || [],
      });
    }
  }, [profile]);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      try {
        const data = await getProfileStats(user.id);
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    
    const loadBlocked = async () => {
      if (!user) return;
      try {
        const data = await getBlockedUsers(user.id);
        setBlockedUsers(data);
      } catch (error) {
        console.error('Error loading blocked users:', error);
      }
    };

    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!data);
    };

    if (user) {
      loadStats();
      loadBlocked();
      checkAdmin();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateProfile(user.id, editForm);
      await refreshProfile();
      toast({ title: 'Profile updated!' });
    } catch (error: any) {
      toast({ title: 'Error saving profile', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/landing');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please select an image file', variant: 'destructive' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image must be less than 5MB', variant: 'destructive' });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const avatarUrl = await uploadAvatar(user.id, file);
      await updateProfile(user.id, { avatar_url: avatarUrl });
      await refreshProfile();
      toast({ title: 'Profile photo updated!' });
    } catch (error: any) {
      toast({ title: 'Error uploading photo', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-display font-bold">Profile</h1>
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Settings</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-4">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Blocked Users</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {blockedUsers.length} blocked user{blockedUsers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/admin')}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                  )}
                  <Button
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            accept="image/*"
            className="hidden"
          />
          <div className="relative inline-block">
            <Avatar 
              className="h-24 w-24 mx-auto ring-4 ring-primary/20 cursor-pointer"
              onClick={() => profile.avatar_url ? setIsPhotoDialogOpen(true) : handleAvatarClick()}
            >
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            >
              {isUploadingAvatar ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {profile.avatar_url ? 'Tap photo to view, camera to change' : 'Tap to add photo'}
          </p>
          
          {/* Full-screen photo dialog */}
          <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black/90 border-none">
              <button
                onClick={() => setIsPhotoDialogOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              {profile.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-full h-full object-contain max-h-[85vh]"
                />
              )}
            </DialogContent>
          </Dialog>
          <h2 className="text-2xl font-display font-bold mt-2">{profile.name}</h2>
          <p className="text-muted-foreground">
            {profile.branch && `${profile.branch}`}
            {profile.year && ` • Year ${profile.year}`}
          </p>
          {profile.dating_mode && (
            <Badge className="mt-2 bg-pink-500/20 text-pink-400 border-pink-500/30">
              <Heart className="w-3 h-3 mr-1" />
              Dating mode on
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Users, label: 'Total', value: stats.totalMatches },
            { icon: Users, label: 'Friends', value: stats.friendMatches },
            { icon: Briefcase, label: 'Project', value: stats.projectMatches },
            { icon: BookOpen, label: 'Study', value: stats.studyMatches },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="text-center py-3">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </Card>
          ))}
        </div>

        {/* Edit/View Tabs */}
        <Tabs defaultValue="view" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">View</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="space-y-4 mt-4">
            {profile.bio && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Bio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{profile.bio}</p>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {profile.interests.map(i => (
                    <Badge key={i} variant="secondary">{i}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Hobbies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {profile.hobbies.map(h => (
                    <Badge key={h} variant="outline">{h}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
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
          </TabsContent>
          
          <TabsContent value="edit" className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(f => ({ ...f, bio: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select 
                    value={editForm.branch} 
                    onValueChange={(v) => setEditForm(f => ({ ...f, branch: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select 
                    value={editForm.year?.toString()} 
                    onValueChange={(v) => setEditForm(f => ({ ...f, year: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map(y => (
                        <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Interests</Label>
                <ChipSelect
                  options={INTERESTS}
                  selected={editForm.interests}
                  onChange={(v) => setEditForm(f => ({ ...f, interests: v }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Hobbies</Label>
                <ChipSelect
                  options={HOBBIES}
                  selected={editForm.hobbies}
                  onChange={(v) => setEditForm(f => ({ ...f, hobbies: v }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Goals</Label>
                <ChipSelect
                  options={GOALS}
                  selected={editForm.goals}
                  onChange={(v) => setEditForm(f => ({ ...f, goals: v }))}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl border">
                <div>
                  <p className="font-medium">Dating Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Show you're open to dating
                  </p>
                </div>
                <Switch
                  checked={editForm.dating_mode}
                  onCheckedChange={(v) => setEditForm(f => ({ ...f, dating_mode: v }))}
                />
              </div>

              {/* Dating Photos Section */}
              {editForm.dating_mode && (
                <div className="space-y-2 p-4 rounded-xl border border-pink-500/30 bg-pink-500/5">
                  <Label className="flex items-center gap-2 text-pink-400">
                    <Heart className="w-4 h-4" />
                    Add Photos
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Add up to 6 photos to your dating profile
                  </p>
                  <PhotoUpload
                    photos={editForm.photos}
                    onPhotosChange={(photos) => setEditForm(f => ({ ...f, photos }))}
                    maxPhotos={6}
                  />
                </div>
              )}
              
              <Button 
                className="w-full"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
