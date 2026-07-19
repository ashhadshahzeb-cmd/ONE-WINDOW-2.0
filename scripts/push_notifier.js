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

    // Poll for New Files
    const { data: fileRecords, error: fileError } = await supabase
      .from('file_tracking_records')
      .select('*')
      .gt('created_at', lastCheckedTime)
      .order('created_at', { ascending: true });

    // Poll for Announcements
    const { data: announcementRecords, error: annError } = await supabase
      .from('hrms_announcements')
      .select('*')
      .gt('created_at', lastCheckedTime)
      .order('created_at', { ascending: true });

    if (inError || outError || loginError || fileError || annError) {
      console.error('Error polling database:', inError?.message || outError?.message || loginError?.message || fileError?.message || annError?.message);
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
    if (fileRecords) {
       fileRecords.forEach(r => allEvents.push({ ...r, eventType: 'NEW_FILE', time: r.created_at }));
    }
    if (announcementRecords) {
       announcementRecords.forEach(r => allEvents.push({ ...r, eventType: 'NEW_ANNOUNCEMENT', time: r.created_at }));
    }

    // Sort all events chronologically
    allEvents.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    if (allEvents.length > 0) {
      for (const record of allEvents) {
        lastCheckedTime = record.time; // update cursor
        console.log(`New ${record.eventType} record detected:`, record);

        if (record.eventType === 'NEW_ANNOUNCEMENT') {
           console.log('Processing NEW_ANNOUNCEMENT event...');
           // Fetch all employees' FCM tokens
           const { data: emps } = await supabase.from('hrms_employees').select('fcm_token').not('fcm_token', 'is', null);
           
           if (emps && emps.length > 0) {
              const tokens = emps.map(e => e.fcm_token).filter(t => t && t.trim() !== '');
              
              // Add Admin tokens as well
              const { data: admins } = await supabase.from('department_users_settings').select('fcm_token').not('fcm_token', 'is', null);
              if (admins && admins.length > 0) {
                 const adminTokens = admins.map(a => a.fcm_token).filter(t => t && t.trim() !== '');
                 tokens.push(...adminTokens);
              }

              if (tokens.length > 0) {
                 const message = {
                    notification: {
                       title: `📢 New Announcement: ${record.title}`,
                       body: record.message
                    },
                    tokens: tokens
                 };
                 try {
                    const response = await getMessaging().sendMulticast(message);
                    console.log(`✅ Successfully sent NEW_ANNOUNCEMENT to ${response.successCount} users. Failed: ${response.failureCount}`);
                 } catch (e) {
                    console.error('Failed to send multicast:', e);
                 }
              } else {
                 console.log('⚠️ No valid FCM tokens found for employees.');
              }
           } else {
              console.log('⚠️ No employees with FCM tokens found.');
           }
           continue; // Skip the rest of the loop for announcements
        }

        if (record.eventType === 'NEW_FILE') {
          // Send push to System Admin
          const { data: adminData } = await supabase
            .from('department_users_settings')
            .select('fcm_token')
            .eq('email', 'admin@kwsb.gov.pk')
            .single();

          if (adminData && adminData.fcm_token) {
            const message = {
              notification: {
                title: `New File Entry 📄`,
                body: `File ${record.receiving_number || 'N/A'} was entered by ${record.received_from || 'User'}`,
              },
              token: adminData.fcm_token,
            };
            try {
              const response = await getMessaging().send(message);
              console.log(`✅ Successfully sent NEW_FILE push notification to Admin:`, response);
            } catch (e) {
              console.error('Failed to send notification to Admin:', e);
            }
          }
          
          // Send push to CFO as well
          const { data: cfoData } = await supabase
            .from('department_users_settings')
            .select('fcm_token')
            .eq('email', 'cfo@kwsb.gov.pk')
            .single();

          if (cfoData && cfoData.fcm_token) {
            const message = {
              notification: {
                title: `New File Entry 📄`,
                body: `File ${record.receiving_number || 'N/A'} was entered by ${record.received_from || 'User'}`,
              },
              token: cfoData.fcm_token,
            };
            try {
              const response = await getMessaging().send(message);
              console.log(`✅ Successfully sent NEW_FILE push notification to CFO:`, response);
            } catch (e) {
              console.error('Failed to send notification to CFO:', e);
            }
          }

          continue; // Skip the rest for HRMS events
        }

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

          try {
            const response = await getMessaging().send(message);
            console.log(`✅ Successfully sent ${record.eventType} push notification to Admin:`, response);
          } catch (e) {
            console.error('Failed to send notification to Admin:', e);
          }
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
