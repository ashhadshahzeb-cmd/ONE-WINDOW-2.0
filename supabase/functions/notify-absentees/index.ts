import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// This function checks for absentees and sends FCM push notifications.
// Note: You need to set FCM_SERVER_KEY in your Supabase edge function secrets.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Verify user is HR admin
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Fetch yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // If Sunday, move back to Saturday or Friday. Simple fallback for now:
    if (yesterday.getDay() === 0) yesterday.setDate(yesterday.getDate() - 1);
    
    const dateStr = yesterday.toISOString().split('T')[0];

    // Find employees who didn't check in yesterday
    const { data: employees } = await supabaseClient
      .from('hrms_employees')
      .select('id, name, fcm_token');

    const { data: attendance } = await supabaseClient
      .from('hrms_attendance')
      .select('employee_id')
      .eq('date', dateStr);

    const attendedIds = new Set((attendance || []).map(a => a.employee_id));
    const absentees = (employees || []).filter(e => !attendedIds.has(e.id) && e.fcm_token);

    let sentCount = 0;
    const serverKey = Deno.env.get('FCM_SERVER_KEY');
    
    if (!serverKey) {
       throw new Error("FCM_SERVER_KEY secret is not set in Supabase.");
    }

    // Send notifications to all absentees
    for (const emp of absentees) {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=${serverKey}`
        },
        body: JSON.stringify({
          to: emp.fcm_token,
          notification: {
            title: 'Attendance Reminder',
            body: `Hi ${emp.name}, you missed attendance yesterday. Please open the app to submit a reason.`,
            sound: 'default'
          },
          data: { type: 'missed_attendance' }
        })
      });
      if (response.ok) sentCount++;
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, absentees: absentees.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
