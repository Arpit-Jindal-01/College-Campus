import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Globe, FileText, Moon, Info } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useApp();

  return (
    <div className="min-h-screen gradient-dark pb-24 md:pb-8 md:pl-64">
      {/* Header */}
      <header className="p-6 border-b border-border/30">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display text-2xl text-foreground">Settings</h1>
        </div>
      </header>

      <main className="p-6 max-w-md mx-auto">
        <div className="space-y-6">
          {/* Language Settings */}
          <div className="gradient-card border border-border/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Language</h2>
                <p className="text-sm text-muted-foreground">Preferred output language</p>
              </div>
            </div>
            <Select 
              value={settings.preferredLanguage} 
              onValueChange={(value: 'english' | 'hindi' | 'hinglish') => 
                updateSettings({ preferredLanguage: value })
              }
            >
              <SelectTrigger className="bg-card/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="hinglish">Hinglish (Mixed)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Length */}
          <div className="gradient-card border border-border/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Summary Length</h2>
                <p className="text-sm text-muted-foreground">Detail level for summaries</p>
              </div>
            </div>
            <Select 
              value={settings.summaryLength} 
              onValueChange={(value: 'short' | 'medium' | 'detailed') => 
                updateSettings({ summaryLength: value })
              }
            >
              <SelectTrigger className="bg-card/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (5-7 lines)</SelectItem>
                <SelectItem value="medium">Medium (10-15 lines)</SelectItem>
                <SelectItem value="detailed">Detailed (20+ lines)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dark Mode */}
          <div className="gradient-card border border-border/50 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Dark Mode</h2>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
              </div>
              <Switch 
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
              />
            </div>
          </div>

          {/* About */}
          <div className="gradient-card border border-border/50 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Class Whisperer</h2>
                <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              AI-powered lecture transcription and note generation. 
              Supports English, Hindi, and mixed language recordings.
            </p>
          </div>

          {/* API Configuration Notice */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-2">🔑 API Configuration</h3>
            <p className="text-sm text-muted-foreground">
              To enable full transcription and AI features, connect to Lovable Cloud. 
              This will provide speech-to-text and LLM capabilities without manual API setup.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
