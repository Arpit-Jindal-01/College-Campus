import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LectureCard } from '@/components/LectureCard';
import { StatsCard } from '@/components/StatsCard';
import { Navigation } from '@/components/Navigation';
import { useLectures } from '@/hooks/useLectures';
import { Mic, Upload, BookOpen, Clock, CheckCircle, Search, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function Dashboard() {
  const { lectures, loading } = useLectures();
  const [searchQuery, setSearchQuery] = useState('');

  const totalLectures = lectures.length;
  const totalHours = Math.round(lectures.reduce((acc, l) => acc + l.duration, 0) / 3600 * 10) / 10;
  const completedLectures = lectures.filter(l => l.status === 'completed').length;

  const filteredLectures = useMemo(() => {
    if (!searchQuery) return lectures;
    const query = searchQuery.toLowerCase();
    return lectures.filter(
      l =>
        l.subject.toLowerCase().includes(query) ||
        l.topic.toLowerCase().includes(query) ||
        l.teacherName.toLowerCase().includes(query)
    );
  }, [lectures, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark pb-24 md:pb-8 md:pl-64">
      <Navigation />
      
      <header className="p-6 border-b border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2 md:hidden">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shadow-glow">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl text-foreground">Class Whisperer</span>
          </div>
          <h1 className="font-display text-3xl text-foreground mt-4">Your Lectures</h1>
          <p className="text-muted-foreground mt-1">Record, transcribe, and learn smarter</p>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link to="/record">
            <Button size="lg" className="w-full h-auto py-6 flex-col gap-2">
              <Mic className="w-6 h-6" />
              <span>Record Lecture</span>
            </Button>
          </Link>
          <Link to="/upload">
            <Button size="lg" variant="glass" className="w-full h-auto py-6 flex-col gap-2">
              <Upload className="w-6 h-6" />
              <span>Upload Audio</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatsCard title="Total Lectures" value={totalLectures} icon={BookOpen} />
          <StatsCard title="Hours Recorded" value={totalHours} icon={Clock} />
          <StatsCard title="Completed" value={completedLectures} icon={CheckCircle} />
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by subject, topic, or teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-card/50 border-border/50"
          />
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-foreground text-lg">Recent Lectures</h2>
          {filteredLectures.length > 0 ? (
            <div className="grid gap-4 stagger-children">
              {filteredLectures.map(lecture => (
                <LectureCard key={lecture.id} lecture={lecture} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No lectures found</p>
              <p className="text-sm">Start by recording your first lecture!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
