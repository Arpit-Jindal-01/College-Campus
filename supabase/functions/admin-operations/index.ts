import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify admin status
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error('Forbidden: Admin access required');
    }

    const { action, userId, requestId, reportId, data } = await req.json();

    console.log('Admin action:', action, { userId, requestId, reportId });

    switch (action) {
      case 'banUser': {
        const { error } = await supabase
          .from('profiles')
          .update({ is_banned: true })
          .eq('id', userId);
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'unbanUser': {
        const { error } = await supabase
          .from('profiles')
          .update({ is_banned: false })
          .eq('id', userId);
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'suspendUser': {
        const suspensionUntil = data?.suspensionUntil;
        const { error } = await supabase
          .from('profiles')
          .update({ 
            is_suspended: true,
            suspension_until: suspensionUntil 
          })
          .eq('id', userId);
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'unsuspendUser': {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            is_suspended: false,
            suspension_until: null 
          })
          .eq('id', userId);
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'deleteUser': {
        // Delete user's profile and related data
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'deleteRequest': {
        const { error } = await supabase
          .from('requests')
          .delete()
          .eq('id', requestId);
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'deleteReport': {
        const { error } = await supabase
          .from('reports')
          .delete()
          .eq('id', reportId);
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'getAllUsers': {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return new Response(JSON.stringify({ profiles }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'getAllReports': {
        const { data: reports, error } = await supabase
          .from('reports')
          .select(`
            *,
            reporter:reporter_id(id, name, avatar_url),
            reported:reported_id(id, name, avatar_url)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return new Response(JSON.stringify({ reports }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'getAllRequests': {
        const { data: requests, error } = await supabase
          .from('requests')
          .select(`
            *,
            user:user_id(id, name, avatar_url)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return new Response(JSON.stringify({ requests }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Admin operation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: errorMessage.includes('Forbidden') ? 403 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});