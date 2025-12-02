import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lecture, Question, Task } from '@/types/lecture';
import { toast } from 'sonner';

function mapDbToLecture(db: any): Lecture {
  return {
    id: db.id,
    subject: db.subject,
    topic: db.topic,
    teacherName: db.teacher_name || '',
    className: db.class_name || '',
    date: new Date(db.date),
    duration: db.duration,
    status: db.status as Lecture['status'],
    audioUrl: db.audio_url || undefined,
    transcript: db.transcript || undefined,
    summary: db.summary || undefined,
    detailedNotes: db.detailed_notes || undefined,
    keyPoints: db.key_points as string[] | undefined,
    questions: db.questions as Question[] | undefined,
    tasks: db.tasks as Task[] | undefined,
    errorMessage: db.error_message || undefined,
  };
}

export function useLectures() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLectures = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('lectures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setLectures((data || []).map(mapDbToLecture));
    } catch (error) {
      console.error('Error fetching lectures:', error);
      toast.error('Failed to load lectures');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLectures();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('lectures-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lectures' },
        (payload) => {
          console.log('Realtime update:', payload);
          if (payload.eventType === 'INSERT') {
            setLectures(prev => [mapDbToLecture(payload.new), ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setLectures(prev => 
              prev.map(l => l.id === (payload.new as any).id ? mapDbToLecture(payload.new) : l)
            );
          } else if (payload.eventType === 'DELETE') {
            setLectures(prev => prev.filter(l => l.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLectures]);

  const createLecture = async (details: {
    subject: string;
    topic: string;
    teacherName: string;
    className: string;
    duration: number;
    audioBase64: string;
  }): Promise<string | null> => {
    try {
      // First, create the lecture record
      const { data: lecture, error: insertError } = await supabase
        .from('lectures')
        .insert({
          subject: details.subject,
          topic: details.topic,
          teacher_name: details.teacherName || null,
          class_name: details.className || null,
          duration: details.duration,
          status: 'transcribing',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Then, trigger the processing edge function (fire and forget)
      fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-lecture`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            lectureId: lecture.id,
            audioBase64: details.audioBase64,
            subject: details.subject,
            topic: details.topic,
            teacherName: details.teacherName,
            className: details.className,
          }),
        }
      ).catch(err => console.error('Edge function error:', err));

      return lecture.id;
    } catch (error) {
      console.error('Error creating lecture:', error);
      toast.error('Failed to create lecture');
      return null;
    }
  };

  const deleteLecture = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lectures')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Lecture deleted');
    } catch (error) {
      console.error('Error deleting lecture:', error);
      toast.error('Failed to delete lecture');
    }
  };

  const updateTask = async (lectureId: string, taskId: string, completed: boolean) => {
    try {
      const lecture = lectures.find(l => l.id === lectureId);
      if (!lecture?.tasks) return;

      const updatedTasks = lecture.tasks.map(t => 
        t.id === taskId ? { ...t, completed } : t
      );

      const { error } = await supabase
        .from('lectures')
        .update({ tasks: updatedTasks as any })
        .eq('id', lectureId);

      if (error) throw error;
      
      // Optimistic update
      setLectures(prev => prev.map(l => 
        l.id === lectureId ? { ...l, tasks: updatedTasks } : l
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const retryProcessing = async (lectureId: string) => {
    toast.error('Please re-upload the audio file to retry processing');
  };

  return {
    lectures,
    loading,
    createLecture,
    deleteLecture,
    updateTask,
    retryProcessing,
    refetch: fetchLectures,
  };
}
