import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChipSelect } from '@/components/campus-connect/ChipSelect';
import { useCampusConnect } from '@/contexts/CampusConnectContext';
import { createProfile, updateProfile } from '@/lib/campus-connect/db';
import { INTERESTS, HOBBIES, GOALS, BRANCHES, YEARS, GOAL_LABELS } from '@/types/campus-connect';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, User, Target, Sliders, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = ['basic', 'interests', 'goals', 'personality', 'dating'] as const;
type Step = typeof STEPS[number];

export default function CampusOnboarding() {
  const navigate = useNavigate();
  const { user, profile, loading, profileLoading, refreshProfile } = useCampusConnect();
  
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect logic - wait for profile to load
  useEffect(() => {
    if (!loading && !profileLoading) {
      if (!user) {
        navigate('/auth', { replace: true });
      } else if (profile?.onboarding_completed) {
        navigate('/', { replace: true });
      }
    }
  }, [user, profile, loading, profileLoading, navigate]);
  
  // Form state - use profile data if available
  const [name, setName] = useState(profile?.name || user?.user_metadata?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [branch, setBranch] = useState(profile?.branch || '');
  const [year, setYear] = useState<number | undefined>(profile?.year);
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [hobbies, setHobbies] = useState<string[]>(profile?.hobbies || []);
  const [goals, setGoals] = useState<string[]>(profile?.goals || []);
  const [socialLevel, setSocialLevel] = useState(profile?.personality_social_level || 5);
  const [activityLevel, setActivityLevel] = useState(profile?.personality_activity_level || 5);
  const [communication, setCommunication] = useState<'text' | 'vc' | 'in-person'>(
    profile?.personality_communication || 'text'
  );
  const [wakeCycle, setWakeCycle] = useState<'early-bird' | 'night-owl' | 'flexible'>(
    profile?.personality_wake_cycle || 'flexible'
  );
  const [datingMode, setDatingMode] = useState(profile?.dating_mode || false);
  const [gender, setGender] = useState(profile?.gender || '');
  const [datingPreference, setDatingPreference] = useState<'male' | 'female' | 'everyone'>(
    profile?.dating_preference || 'everyone'
  );
  
  // Update form state when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || user?.user_metadata?.name || '');
      setBio(profile.bio || '');
      setBranch(profile.branch || '');
      setYear(profile.year ?? undefined);
      setInterests(profile.interests || []);
      setHobbies(profile.hobbies || []);
      setGoals(profile.goals || []);
      setSocialLevel(profile.personality_social_level || 5);
      setActivityLevel(profile.personality_activity_level || 5);
      setCommunication(profile.personality_communication as any || 'text');
      setWakeCycle(profile.personality_wake_cycle as any || 'flexible');
      setDatingMode(profile.dating_mode || false);
      setGender(profile.gender || '');
      setDatingPreference(profile.dating_preference || 'everyone');
    }
  }, [profile, user?.user_metadata?.name]);
  
  const stepIndex = STEPS.indexOf(currentStep);
  
  // Show loading while checking auth/profile
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }
  
  const canProceed = () => {
    switch (currentStep) {
      case 'basic':
        return name.trim().length > 0;
      case 'interests':
        return interests.length > 0 || hobbies.length > 0;
      case 'goals':
        return goals.length > 0;
      case 'personality':
        return true;
      case 'dating':
        return true;
      default:
        return false;
    }
  };
  
  const handleNext = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };
  
  const handleBack = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };
  
  const handleComplete = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const profileData = {
        id: user.id,
        name,
        bio,
        branch,
        year,
        interests,
        hobbies,
        goals,
        personality_social_level: socialLevel,
        personality_activity_level: activityLevel,
        personality_communication: communication,
        personality_wake_cycle: wakeCycle,
        dating_mode: datingMode,
        gender: datingMode ? gender : undefined,
        dating_preference: datingMode ? datingPreference : undefined,
        onboarding_completed: true,
      };
      
      if (profile) {
        await updateProfile(user.id, profileData);
      } else {
        await createProfile(profileData);
      }
      
      await refreshProfile();
      toast({ title: 'Profile created! Welcome to Campus Connect.' });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error saving profile',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-6 animate-scale-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold">Let's set up your profile</h2>
              <p className="text-muted-foreground mt-1">Basic info to get started</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell others about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select value={branch} onValueChange={setBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
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
                  <Select value={year?.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map(y => (
                        <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'interests':
        return (
          <div className="space-y-6 animate-scale-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold">What are you into?</h2>
              <p className="text-muted-foreground mt-1">Select your interests and hobbies</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-base mb-3 block">Interests (Tech & Skills)</Label>
                <ChipSelect
                  options={INTERESTS}
                  selected={interests}
                  onChange={setInterests}
                />
              </div>
              
              <div>
                <Label className="text-base mb-3 block">Hobbies</Label>
                <ChipSelect
                  options={HOBBIES}
                  selected={hobbies}
                  onChange={setHobbies}
                />
              </div>
            </div>
          </div>
        );
        
      case 'goals':
        return (
          <div className="space-y-6 animate-scale-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold">What are you looking for?</h2>
              <p className="text-muted-foreground mt-1">Select your goals on Campus Connect</p>
            </div>
            
            <div className="space-y-3">
              {GOALS.map(goal => (
                <button
                  key={goal}
                  onClick={() => {
                    if (goals.includes(goal)) {
                      setGoals(goals.filter(g => g !== goal));
                    } else {
                      setGoals([...goals, goal]);
                    }
                  }}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all press-effect",
                    goals.includes(goal)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{GOAL_LABELS[goal]}</span>
                    {goals.includes(goal) && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
        
      case 'personality':
        return (
          <div className="space-y-6 animate-scale-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-4">
                <Sliders className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold">Tell us about yourself</h2>
              <p className="text-muted-foreground mt-1">Help us find your best matches</p>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Social Level</Label>
                  <span className="text-sm text-muted-foreground">
                    {socialLevel <= 3 ? 'Introvert' : socialLevel >= 7 ? 'Extrovert' : 'Ambivert'}
                  </span>
                </div>
                <Slider
                  value={[socialLevel]}
                  onValueChange={([v]) => setSocialLevel(v)}
                  min={0}
                  max={10}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Introvert</span>
                  <span>Extrovert</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Activity Level</Label>
                  <span className="text-sm text-muted-foreground">
                    {activityLevel <= 3 ? 'Chill' : activityLevel >= 7 ? 'Energetic' : 'Balanced'}
                  </span>
                </div>
                <Slider
                  value={[activityLevel]}
                  onValueChange={([v]) => setActivityLevel(v)}
                  min={0}
                  max={10}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Chill</span>
                  <span>Hyper-energetic</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Preferred Communication</Label>
                <Select value={communication} onValueChange={(v: any) => setCommunication(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text / Chat</SelectItem>
                    <SelectItem value="vc">Voice / Video Call</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Wake Cycle</Label>
                <Select value={wakeCycle} onValueChange={(v: any) => setWakeCycle(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="early-bird">Early Bird 🌅</SelectItem>
                    <SelectItem value="night-owl">Night Owl 🌙</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
        
      case 'dating':
        return (
          <div className="space-y-6 animate-scale-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold">One more thing...</h2>
              <p className="text-muted-foreground mt-1">Optional: Enable dating mode</p>
            </div>
            
            <div className="p-4 rounded-xl border border-pink-200/50 dark:border-pink-900/30 bg-gradient-to-br from-card to-pink-50/20 dark:to-pink-950/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dating Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Find romantic connections on campus
                  </p>
                </div>
                <Switch
                  checked={datingMode}
                  onCheckedChange={setDatingMode}
                />
              </div>
              
              {datingMode && (
                <div className="space-y-4 pt-4 border-t border-pink-200/30 dark:border-pink-900/20">
                  <div className="space-y-2">
                    <Label>Your Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>I want to see</Label>
                    <Select value={datingPreference} onValueChange={(v: any) => setDatingPreference(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Men</SelectItem>
                        <SelectItem value="female">Women</SelectItem>
                        <SelectItem value="everyone">Everyone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              You can always change this in your profile settings later.
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col safe-top safe-bottom">
      {/* Progress */}
      <div className="px-6 pt-6">
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full flex-1 transition-all",
                i <= stepIndex ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 px-6 py-8 overflow-auto">
        {renderStep()}
      </div>
      
      {/* Navigation */}
      <div className="px-6 pb-6 flex gap-3">
        {stepIndex > 0 && (
          <Button
            variant="outline"
            size="lg"
            className="h-14"
            onClick={handleBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        
        <Button
          className="flex-1 h-14 font-semibold bg-gradient-to-r from-primary to-accent"
          onClick={stepIndex === STEPS.length - 1 ? handleComplete : handleNext}
          disabled={!canProceed() || isSubmitting}
        >
          {isSubmitting 
            ? 'Saving...' 
            : stepIndex === STEPS.length - 1 
              ? 'Complete Setup' 
              : 'Continue'}
          {!isSubmitting && stepIndex < STEPS.length - 1 && (
            <ArrowRight className="w-5 h-5 ml-2" />
          )}
        </Button>
      </div>
    </div>
  );
}
