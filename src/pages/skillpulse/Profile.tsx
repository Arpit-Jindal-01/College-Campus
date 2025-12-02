import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  MapPin, 
  Bell, 
  Moon, 
  Sun, 
  Monitor, 
  ChevronRight,
  LogOut,
  Settings,
  Bookmark,
  Briefcase,
  Trophy,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useSkillPulse } from '@/contexts/SkillPulseContext';
import { DOMAIN_LABELS, OPPORTUNITY_TYPE_LABELS } from '@/types/skillpulse';
import { cn } from '@/lib/utils';

export default function Profile() {
  const navigate = useNavigate();
  const { 
    user, 
    isAuthenticated, 
    theme, 
    setTheme, 
    updatePreferences, 
    logout,
    savedOpportunities 
  } = useSkillPulse();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-xs">
          <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Welcome to SkillPulse</h2>
          <p className="text-muted-foreground mb-6">
            Sign in to personalize your feed and save opportunities.
          </p>
          <Button 
            className="w-full gradient-primary h-12" 
            onClick={() => navigate('/auth')}
          >
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  // Stats
  const stats = [
    { icon: Bookmark, label: 'Saved', value: savedOpportunities.length, color: 'text-primary' },
    { icon: Briefcase, label: 'Jobs', value: 3, color: 'text-green-500' },
    { icon: Trophy, label: 'Hackathons', value: 5, color: 'text-purple-500' },
    { icon: GraduationCap, label: 'Scholarships', value: 2, color: 'text-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="bg-gradient-hero pt-safe-top">
        <div className="px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-3xl font-display font-bold text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{user.name}</h1>
              <p className="text-muted-foreground flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
              {user.location && (
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {user.location.city}, {user.location.country}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 pb-24 -mt-4">
        {/* Stats */}
        <section className="grid grid-cols-4 gap-3 mb-6">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="glass-card-strong rounded-xl p-3 text-center">
              <Icon className={cn('w-5 h-5 mx-auto mb-1', color)} />
              <p className="font-display font-bold text-lg">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </section>

        {/* Preferences */}
        <section className="glass-card-strong rounded-2xl p-5 mb-4">
          <h2 className="font-display font-semibold text-lg mb-4">Preferences</h2>
          
          {/* Domains */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Interested Domains</p>
            <div className="flex flex-wrap gap-2">
              {user.preferences.domains.length > 0 ? (
                user.preferences.domains.map(domain => (
                  <Badge key={domain} variant="secondary" className="text-xs">
                    {DOMAIN_LABELS[domain]}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Not set</span>
              )}
            </div>
          </div>

          {/* Location Type */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Location Preference</p>
            <div className="flex flex-wrap gap-2">
              {user.preferences.locationType.map(type => (
                <Badge key={type} variant="outline" className="text-xs capitalize">
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => navigate('/onboarding')}>
            Edit Preferences <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </section>

        {/* Notifications */}
        <section className="glass-card-strong rounded-2xl p-5 mb-4">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Remote Opportunities</p>
                <p className="text-sm text-muted-foreground">Get notified about remote jobs</p>
              </div>
              <Switch 
                checked={user.preferences.notifications.newRemote}
                onCheckedChange={(checked) => 
                  updatePreferences({ 
                    notifications: { ...user.preferences.notifications, newRemote: checked } 
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Local Opportunities</p>
                <p className="text-sm text-muted-foreground">Jobs & events near you</p>
              </div>
              <Switch 
                checked={user.preferences.notifications.newLocal}
                onCheckedChange={(checked) => 
                  updatePreferences({ 
                    notifications: { ...user.preferences.notifications, newLocal: checked } 
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Deadline Reminders</p>
                <p className="text-sm text-muted-foreground">2 days before saved deadlines</p>
              </div>
              <Switch 
                checked={user.preferences.notifications.deadlineSoon}
                onCheckedChange={(checked) => 
                  updatePreferences({ 
                    notifications: { ...user.preferences.notifications, deadlineSoon: checked } 
                  })
                }
              />
            </div>
          </div>
        </section>

        {/* Theme */}
        <section className="glass-card-strong rounded-2xl p-5 mb-4">
          <h2 className="font-display font-semibold text-lg mb-4">Appearance</h2>
          <div className="flex gap-2">
            {[
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Monitor, label: 'System' },
            ].map(({ value, icon: Icon, label }) => (
              <Button
                key={value}
                variant={theme === value ? 'default' : 'outline'}
                className={cn(
                  'flex-1 h-12',
                  theme === value && 'gradient-primary'
                )}
                onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </section>

        {/* Sign Out */}
        <Button 
          variant="outline" 
          className="w-full text-destructive border-destructive/50 hover:bg-destructive/10"
          onClick={() => {
            logout();
            navigate('/auth');
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </main>
    </div>
  );
}
