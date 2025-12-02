import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RequestWithProfile, REQUEST_CATEGORIES } from '@/types/campus-connect';
import { Users, Clock, Check, Trash2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface RequestCardProps {
  request: RequestWithProfile;
  onJoin: (request: RequestWithProfile) => void;
  onLeave?: (request: RequestWithProfile) => void;
  onDelete?: (request: RequestWithProfile) => void;
  currentUserInterests?: string[];
  isOwner?: boolean;
}

export function RequestCard({ request, onJoin, onLeave, onDelete, currentUserInterests = [], isOwner = false }: RequestCardProps) {
  const navigate = useNavigate();
  const category = REQUEST_CATEGORIES.find(c => c.value === request.category);
  const sharedInterests = request.related_interests.filter(i => 
    currentUserInterests.includes(i)
  );
  const members = request.members || [];
  
  return (
    <Card className="overflow-hidden border-border/50 bg-card hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={request.profile.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {request.profile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{request.profile.name}</span>
              {request.profile.branch && (
                <span className="text-xs text-muted-foreground">
                  {request.profile.branch} • Y{request.profile.year}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
            </div>
          </div>
          
          {category && (
            <Badge variant="secondary" className="shrink-0">
              <span className="mr-1">{category.icon}</span>
              {category.label}
            </Badge>
          )}
        </div>
        
        {/* Title */}
        <h3 className="font-display font-semibold text-lg mb-2">{request.title}</h3>
        
        {/* Description */}
        {request.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {request.description}
          </p>
        )}
        
        {/* Shared Interests */}
        {sharedInterests.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {sharedInterests.map(interest => (
              <Badge 
                key={interest} 
                variant="outline" 
                className="text-xs bg-primary/5 border-primary/20 text-primary"
              >
                {interest}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Members who joined (only for owner) */}
        {isOwner && members.length > 0 && (
          <div className="mb-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {members.length} {members.length === 1 ? 'person' : 'people'} joined:
            </p>
            <div className="space-y-2">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                    onClick={() => navigate(`/user/${member.id}`)}
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{member.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => navigate(`/matches`)}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{request.memberCount || 0} joined</span>
            {request.max_participants && (
              <span className="text-muted-foreground/60">
                / {request.max_participants}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isOwner && onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(request)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            
            {!isOwner && !request.hasJoined && (
              <Button size="sm" onClick={() => onJoin(request)}>
                Join
              </Button>
            )}
            
            {!isOwner && request.hasJoined && onLeave && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onLeave(request)}
              >
                Leave
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
