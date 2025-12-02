import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCampusConnect } from '@/contexts/CampusConnectContext';
import { supabase } from '@/integrations/supabase/client';
import { getChatByMatchId, getMessages, sendMessage, markMessagesAsRead, getProfile, unmatch } from '@/lib/campus-connect/db';
import { Message, Profile, Chat } from '@/types/campus-connect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Send, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CampusChat() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useCampusConnect();
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showUnmatchDialog, setShowUnmatchDialog] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadChat = async () => {
      if (!matchId || !user) return;
      
      setIsLoading(true);
      try {
        // Get match details
        const { data: match } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single();
        
        if (!match) {
          navigate('/matches');
          return;
        }
        
        // Get other user's profile
        const otherUserId = match.user_a === user.id ? match.user_b : match.user_a;
        const profile = await getProfile(otherUserId);
        setOtherProfile(profile);
        
        // Get chat
        const chatData = await getChatByMatchId(matchId);
        setChat(chatData);
        
        if (chatData) {
          // Get messages
          const messagesData = await getMessages(chatData.id);
          setMessages(messagesData);
          
          // Mark as read
          await markMessagesAsRead(chatData.id, user.id);
        }
      } catch (error) {
        console.error('Error loading chat:', error);
        toast({ title: 'Error loading chat', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    loadChat();
  }, [matchId, user]);

  // Realtime subscription
  useEffect(() => {
    if (!chat) return;

    const channel = supabase
      .channel(`messages-${chat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chat.id}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
          
          // Mark as read if from other user
          if (newMsg.sender_id !== user?.id) {
            markMessagesAsRead(chat.id, user!.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !chat || !user) return;
    
    setIsSending(true);
    try {
      await sendMessage(chat.id, user.id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      toast({ title: 'Error sending message', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const handleUnmatch = async () => {
    if (!matchId) return;
    
    try {
      await unmatch(matchId);
      toast({ title: 'Unmatched successfully' });
      navigate('/matches');
    } catch (error) {
      toast({ title: 'Error unmatching', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  const initials = otherProfile?.name.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/matches')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <button 
            className="flex items-center gap-3 flex-1"
            onClick={() => navigate(`/user/${otherProfile?.id}`)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherProfile?.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="font-semibold">{otherProfile?.name}</p>
              <p className="text-xs text-muted-foreground">
                {otherProfile?.branch && `${otherProfile.branch}`}
                {otherProfile?.year && ` • Year ${otherProfile.year}`}
              </p>
            </div>
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/user/${otherProfile?.id}`)}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => setShowUnmatchDialog(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Unmatch
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Say hi to {otherProfile?.name}! 👋
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.sender_id === user?.id;
            const showTimestamp = i === 0 || 
              new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() > 300000;
            
            return (
              <div key={msg.id}>
                {showTimestamp && (
                  <p className="text-xs text-muted-foreground text-center mb-2">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                )}
                <div className={cn(
                  "flex",
                  isOwn ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[80%] px-4 py-2 rounded-2xl",
                    isOwn 
                      ? "bg-primary text-primary-foreground rounded-br-md" 
                      : "bg-muted rounded-bl-md"
                  )}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4 safe-bottom">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!newMessage.trim() || isSending}
            className="bg-gradient-to-r from-primary to-accent"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Unmatch Dialog */}
      <AlertDialog open={showUnmatchDialog} onOpenChange={setShowUnmatchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unmatch {otherProfile?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your connection and delete all messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnmatch} className="bg-destructive text-destructive-foreground">
              Unmatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
