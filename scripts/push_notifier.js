import { createClient } from '@supabase/supabase-js';
import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync('./firebase-admin.json', 'utf-8'));
initializeApp({
  credential: cert(serviceAccount)
});

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Push Notifier Service Started (Polling Mode)!');
console.log('Listening for new attendance check-ins...');

let lastCheckedTime = new Date().toISOString();

setInterval(async () => {
  try {
    // Poll for Check-Ins
    const { data: checkInRecords, error: inError } = await supabase
      .from('hrms_attendance')
      .select('*')
      .gt('created_at', lastCheckedTime)
      .order('created_at', { ascending: true });

    // Poll for Check-Outs
    const { data: checkOutRecords, error: outError } = await supabase
      .from('hrms_attendance')
      .select('*')
      .not('check_out', 'is', null)
      .gt('check_out', lastCheckedTime)
      .order('check_out', { ascending: true });

    // Poll for Logins
    const { data: loginRecords, error: loginError } = await supabase
      .from('activity_log')
      .select('*')
      .eq('action', 'LOGIN')
      .eq('user_role', 'hrms_employee')
      .gt('created_at', lastCheckedTime)
      .order('created_at', { ascending: true });

    if (inError || outError || loginError) {
      console.error('Error polling database:', inError?.message || outError?.message || loginError?.message);
      return;
    }

    const allEvents = [];
    if (checkInRecords) {
       checkInRecords.forEach(r => allEvents.push({ ...r, eventType: 'CHECK_IN', time: r.created_at, employee_id: r.employee_id }));
    }
    if (checkOutRecords) {
       checkOutRecords.forEach(r => allEvents.push({ ...r, eventType: 'CHECK_OUT', time: r.check_out, employee_id: r.employee_id }));
    }
    if (loginRecords) {
       loginRecords.forEach(r => allEvents.push({ ...r, eventType: 'LOGIN', time: r.created_at, employee_name: r.user_name }));
    }

    // Sort all events chronologically
    allEvents.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    if (allEvents.length > 0) {
      for (const record of allEvents) {
        lastCheckedTime = record.time; // update cursor
        console.log(`New ${record.eventType} record detected:`, record);

        // 1. Get the employee's name & token
        let empName = record.employee_name;
        let empToken = null;
        
        if (record.employee_id) {
          const { data: empData } = await supabase
            .from('hrms_employees')
            .select('name, fcm_token')
            .eq('id', record.employee_id)
            .single();
          empName = empData ? empData.name : empName || 'An employee';
          empToken = empData ? empData.fcm_token : null;
        } else if (record.eventType === 'LOGIN' && record.details?.email) {
          // For LOGIN events, we lookup by email
          const { data: empData } = await supabase
            .from('hrms_employees')
            .select('name, fcm_token')
            .eq('email', record.details.email)
            .single();
          empName = empData ? empData.name : empName || 'An employee';
          empToken = empData ? empData.fcm_token : null;
        }

        // 2. Get the HR Admin's FCM Token
        const { data: adminData } = await supabase
          .from('department_users_settings')
          .select('fcm_token')
          .eq('email', 'hr.admin@kwsb.gov.pk')
          .single();

        if (adminData && adminData.fcm_token) {
          // 3. Send Push Notification via Firebase
          let title = '';
          let body = '';
          if (record.eventType === 'CHECK_IN') {
             title = 'New Check-In 📍';
             body = `${empName} has just checked in!`;
          } else if (record.eventType === 'CHECK_OUT') {
             title = 'Check-Out 🛑';
             body = `${empName} has checked out!`;
          } else if (record.eventType === 'LOGIN') {
             title = 'Employee Login 🔐';
             body = `${empName} has just logged into the system.`;
          }

          const message = {
            notification: {
              title: title,
              body: body,
            },
            token: adminData.fcm_token,
          };

          const response = await getMessaging().send(message);
          console.log(`✅ Successfully sent ${record.eventType} push notification to Admin:`, response);
        } else {
          console.log('⚠️ No FCM Token found for HR Admin. Cannot send notification.');
        }

        // 4. Send Push Notification to the Employee (if attendance or login event)
        if (empToken && (record.eventType === 'CHECK_IN' || record.eventType === 'CHECK_OUT' || record.eventType === 'LOGIN')) {
          let empTitle = '';
          let empBody = '';
          if (record.eventType === 'CHECK_IN') {
             empTitle = 'Attendance Marked ✅';
             empBody = 'Your check-in time has been recorded.';
          } else if (record.eventType === 'CHECK_OUT') {
             empTitle = 'Check-Out Successful 🛑';
             empBody = 'Your check-out time has been recorded.';
          } else if (record.eventType === 'LOGIN') {
             empTitle = 'Login Successful 🔐';
             empBody = 'You have successfully logged into the app.';
          }
          
          const empMessage = {
            notification: {
              title: empTitle,
              body: empBody,
            },
            token: empToken,
          };

          try {
            const empResponse = await getMessaging().send(empMessage);
            console.log(`✅ Successfully sent ${record.eventType} push notification to Employee:`, empResponse);
          } catch (e) {
            console.error('Failed to send notification to Employee:', e);
          }
        }
      }
    }
  } catch (err) {
    console.error('Polling error:', err);
  }
}, 3000); // Poll every 3 seconds
