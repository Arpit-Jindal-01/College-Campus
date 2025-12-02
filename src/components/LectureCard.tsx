import { Lecture } from '@/types/lecture';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, User, BookOpen, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LectureCardProps {
  lecture: Lecture;
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const statusConfig = {
  transcribing: {
    label: 'Transcribing',
    icon: Loader2,
    className: 'bg-accent/20 text-accent border-accent/30',
    iconClass: 'animate-spin',
  },
  summarizing: {
    label: 'Summarizing',
    icon: Loader2,
    className: 'bg-primary/20 text-primary border-primary/30',
    iconClass: 'animate-spin',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
    iconClass: '',
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    className: 'bg-destructive/20 text-destructive border-destructive/30',
    iconClass: '',
  },
};

export function LectureCard({ lecture }: LectureCardProps) {
  const navigate = useNavigate();
  const status = statusConfig[lecture.status];
  const StatusIcon = status.icon;

  return (
    <Card
      onClick={() => lecture.status === 'completed' && navigate(`/lecture/${lecture.id}`)}
      className={cn(
        "gradient-card border-border/50 p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-elevated",
        lecture.status === 'completed' && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs bg-secondary/50 border-border">
              {lecture.subject}
            </Badge>
            <Badge className={cn("text-xs border", status.className)}>
              <StatusIcon className={cn("w-3 h-3 mr-1", status.iconClass)} />
              {status.label}
            </Badge>
          </div>
          
          <h3 className="font-semibold text-foreground text-lg mb-3 truncate">
            {lecture.topic}
          </h3>
          
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary/70" />
              <span className="truncate">{lecture.teacherName}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary/70" />
              <span className="truncate">{lecture.className}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary/70" />
              <span>{formatDate(lecture.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary/70" />
              <span>{formatDuration(lecture.duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
