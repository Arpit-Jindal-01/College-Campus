import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Flag, Ban, Clock, ArrowLeft, Trash2, FileText } from 'lucide-react';
import { useCampusConnect } from '@/contexts/CampusConnectContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user, profile, loading } = useCampusConnect();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkAdminStatus();
    }
  }, [user, loading, navigate]);

  const checkAdminStatus = async () => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id)
        .eq('role', 'admin')
        .single();

      if (!data) {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges.',
          variant: 'destructive'
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      loadAdminData();
    } catch (error) {
      console.error('Admin check error:', error);
      navigate('/');
    }
  };

  const loadAdminData = async () => {
    try {
      setLoadingData(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const [usersResponse, reportsResponse, requestsResponse] = await Promise.all([
        supabase.functions.invoke('admin-operations', {
          body: { action: 'getAllUsers' },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }),
        supabase.functions.invoke('admin-operations', {
          body: { action: 'getAllReports' },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }),
        supabase.functions.invoke('admin-operations', {
          body: { action: 'getAllRequests' },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })
      ]);

      if (usersResponse.data?.profiles) {
        setUsers(usersResponse.data.profiles);
      }

      if (reportsResponse.data?.reports) {
        setReports(reportsResponse.data.reports);
      }

      if (requestsResponse.data?.requests) {
        setRequests(requestsResponse.data.requests);
      }
    } catch (error) {
      console.error('Load admin data error:', error);
      toast({
        title: 'Error loading data',
        description: 'Could not load admin panel data.',
        variant: 'destructive'
      });
    } finally {
      setLoadingData(false);
    }
  };

  const performAdminAction = async (action: string, payload: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { error } = await supabase.functions.invoke('admin-operations', {
        body: { action, ...payload },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: 'Action completed',
        description: 'Admin action performed successfully.'
      });

      loadAdminData();
    } catch (error: any) {
      console.error('Admin action error:', error);
      toast({
        title: 'Action failed',
        description: error.message || 'Could not perform action.',
        variant: 'destructive'
      });
    }
  };

  if (loading || loadingData || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Campus Connect Administration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              <FileText className="w-4 h-4 mr-2" />
              Requests ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="reports">
              <Flag className="w-4 h-4 mr-2" />
              Reports ({reports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {users.map((u) => (
              <Card key={u.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={u.avatar_url || u.photos?.[0]} />
                      <AvatarFallback>{u.name[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{u.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {u.branch} • Year {u.year}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {u.is_banned && <Badge variant="destructive">Banned</Badge>}
                        {u.is_suspended && <Badge variant="outline">Suspended</Badge>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {u.is_banned ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => performAdminAction('unbanUser', { userId: u.id })}
                        >
                          Unban
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => performAdminAction('banUser', { userId: u.id })}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Ban
                        </Button>
                      )}
                      
                      {u.is_suspended ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => performAdminAction('unsuspendUser', { userId: u.id })}
                        >
                          Unsuspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => performAdminAction('suspendUser', {
                            userId: u.id,
                            data: { suspensionUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
                          })}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Suspend 7d
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => performAdminAction('deleteUser', { userId: u.id })}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={request.user?.avatar_url} />
                        <AvatarFallback>{request.user?.name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{request.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          By {request.user?.name} • {request.category}
                        </p>
                        {request.description && (
                          <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                            {request.description}
                          </p>
                        )}
                        <Badge variant="outline" className="mt-2">
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => performAdminAction('deleteRequest', { requestId: request.id })}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {requests.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No requests found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={report.reported.avatar_url} />
                          <AvatarFallback>{report.reported.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{report.reported.name}</h3>
                          <p className="text-sm text-muted-foreground">Reported by {report.reporter.name}</p>
                          <Badge variant="outline" className="mt-2">
                            {report.reason}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => performAdminAction('deleteReport', { reportId: report.id })}
                      >
                        Dismiss
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => performAdminAction('banUser', { userId: report.reported_id })}
                      >
                        Ban User
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => performAdminAction('suspendUser', {
                          userId: report.reported_id,
                          data: { suspensionUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
                        })}
                      >
                        Suspend 7d
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {reports.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Flag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No reports to review</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}