import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useLectures } from '@/hooks/useLectures';
import { ArrowLeft, Calendar, Clock, User, BookOpen, FileText, Lightbulb, HelpCircle, ListTodo, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function LectureDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lectures, updateTask, loading } = useLectures();

  const lecture = lectures.find(l => l.id === id);

  if (loading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Lecture not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Processing states
  if (lecture.status === 'transcribing' || lecture.status === 'summarizing') {
    return (
      <div className="min-h-screen gradient-dark pb-24 md:pb-8 md:pl-64">
        <header className="p-6 border-b border-border/30">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />Back
            </Button>
            <Badge variant="outline" className="bg-secondary/50 border-border mb-2">{lecture.subject}</Badge>
            <h1 className="font-display text-2xl md:text-3xl text-foreground">{lecture.topic}</h1>
          </div>
        </header>
        <main className="p-6 max-w-4xl mx-auto">
          <div className="text-center py-16">
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {lecture.status === 'transcribing' ? 'Transcribing Audio...' : 'Generating Notes...'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {lecture.status === 'transcribing' 
                ? 'Converting your audio to text. This may take a few minutes.'
                : 'Creating summary, notes, and study materials from your transcript.'}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>This page will update automatically when ready</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Failed state
  if (lecture.status === 'failed') {
    return (
      <div className="min-h-screen gradient-dark pb-24 md:pb-8 md:pl-64">
        <header className="p-6 border-b border-border/30">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />Back
            </Button>
            <Badge variant="outline" className="bg-secondary/50 border-border mb-2">{lecture.subject}</Badge>
            <h1 className="font-display text-2xl md:text-3xl text-foreground">{lecture.topic}</h1>
          </div>
        </header>
        <main className="p-6 max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-destructive/20 mx-auto mb-6 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Processing Failed</h2>
            {lecture.errorMessage ? (
              <div className="max-w-md mx-auto mb-6">
                <p className="text-destructive/90 bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm">
                  {lecture.errorMessage}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground mb-6">We couldn't process your audio. Please try uploading again.</p>
            )}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
              <Button onClick={() => navigate('/upload')}>
                <RefreshCw className="w-4 h-4 mr-2" />Upload Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark pb-24 md:pb-8 md:pl-64">
      <header className="p-6 border-b border-border/30">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
          <Badge variant="outline" className="bg-secondary/50 border-border mb-2">{lecture.subject}</Badge>
          <h1 className="font-display text-2xl md:text-3xl text-foreground mb-4">{lecture.topic}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {lecture.teacherName && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary/70" /><span>{lecture.teacherName}</span>
              </div>
            )}
            {lecture.className && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary/70" /><span>{lecture.className}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary/70" /><span>{formatDate(lecture.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary/70" /><span>{formatDuration(lecture.duration)}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-card/50 border border-border/50 p-1 mb-6">
            <TabsTrigger value="summary" className="gap-2"><FileText className="w-4 h-4" /><span className="hidden sm:inline">Summary</span></TabsTrigger>
            <TabsTrigger value="notes" className="gap-2"><BookOpen className="w-4 h-4" /><span className="hidden sm:inline">Notes</span></TabsTrigger>
            <TabsTrigger value="keypoints" className="gap-2"><Lightbulb className="w-4 h-4" /><span className="hidden sm:inline">Key Points</span></TabsTrigger>
            <TabsTrigger value="questions" className="gap-2"><HelpCircle className="w-4 h-4" /><span className="hidden sm:inline">Questions</span></TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2"><ListTodo className="w-4 h-4" /><span className="hidden sm:inline">Tasks</span></TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="animate-fade-in">
            <div className="gradient-card border border-border/50 rounded-xl p-6">
              <h2 className="font-semibold text-foreground text-lg mb-4">Summary</h2>
              {lecture.summary ? (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{lecture.summary}</p>
              ) : (
                <p className="text-muted-foreground italic">Summary not available yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="animate-fade-in">
            <div className="gradient-card border border-border/50 rounded-xl p-6">
              <h2 className="font-semibold text-foreground text-lg mb-4">Detailed Notes</h2>
              {lecture.detailedNotes ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line" 
                       dangerouslySetInnerHTML={{ 
                         __html: lecture.detailedNotes
                           .replace(/^# (.*$)/gim, '<h1 class="text-xl font-display text-foreground mt-6 mb-3">$1</h1>')
                           .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold text-foreground mt-5 mb-2">$1</h2>')
                           .replace(/^### (.*$)/gim, '<h3 class="text-base font-medium text-foreground mt-4 mb-2">$1</h3>')
                           .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                           .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
                           .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
                       }} 
                  />
                </div>
              ) : (
                <p className="text-muted-foreground italic">Detailed notes not available yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="keypoints" className="animate-fade-in">
            <div className="gradient-card border border-border/50 rounded-xl p-6">
              <h2 className="font-semibold text-foreground text-lg mb-4">Key Points</h2>
              {lecture.keyPoints && lecture.keyPoints.length > 0 ? (
                <ul className="space-y-3">
                  {lecture.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full gradient-gold flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground italic">Key points not available yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="questions" className="animate-fade-in">
            <div className="space-y-4">
              <h2 className="font-semibold text-foreground text-lg">Practice Questions</h2>
              {lecture.questions && lecture.questions.length > 0 ? (
                lecture.questions.map((q, i) => (
                  <div key={q.id} className="gradient-card border border-border/50 rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <Badge variant="outline" className={cn("text-xs shrink-0", q.type === 'mcq' ? "bg-primary/20 text-primary border-primary/30" : "bg-accent/20 text-accent border-accent/30")}>
                        {q.type === 'mcq' ? 'MCQ' : 'Short Answer'}
                      </Badge>
                      <p className="text-foreground font-medium">Q{i + 1}. {q.question}</p>
                    </div>
                    {q.type === 'mcq' && q.options && (
                      <div className="space-y-2 mb-4 ml-8">
                        {q.options.map((option, oi) => (
                          <div key={oi} className={cn("p-3 rounded-lg border transition-colors", option === q.correctAnswer ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-card/50 border-border/30 text-muted-foreground")}>
                            {String.fromCharCode(65 + oi)}. {option}
                            {option === q.correctAnswer && <span className="ml-2 text-xs">(Correct)</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    {q.type === 'short' && (
                      <div className="ml-8">
                        <p className="text-sm text-muted-foreground mb-2">Expected Answer:</p>
                        <p className="text-sm text-foreground/80 bg-card/50 rounded-lg p-3 border border-border/30">{q.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="gradient-card border border-border/50 rounded-xl p-6">
                  <p className="text-muted-foreground italic">Questions not available yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="animate-fade-in">
            <div className="gradient-card border border-border/50 rounded-xl p-6">
              <h2 className="font-semibold text-foreground text-lg mb-4">Study Tasks</h2>
              {lecture.tasks && lecture.tasks.length > 0 ? (
                <div className="space-y-3">
                  {lecture.tasks.map(task => (
                    <div key={task.id} className={cn("flex items-center gap-3 p-3 rounded-lg border transition-all", task.completed ? "bg-green-500/5 border-green-500/20" : "bg-card/50 border-border/30")}>
                      <Checkbox checked={task.completed} onCheckedChange={(checked) => updateTask(lecture.id, task.id, checked as boolean)} className="border-primary data-[state=checked]:bg-primary" />
                      <span className={cn("flex-1 transition-all", task.completed && "line-through text-muted-foreground")}>{task.task}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No tasks available yet</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
