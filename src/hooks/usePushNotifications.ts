import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export function usePushNotifications() {
  const { userRole, userName, isAdmin } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const registerPushNotifications = async () => {
      // Push notifications only work on actual Native devices, not on the web
      if (!Capacitor.isNativePlatform()) {
        console.log('Push notifications are only available on Native Android/iOS devices.');
        return;
      }

      // We only care about sending notifications to the HR Admin (for attendance)
      // If the user isn't an admin, we might not need to register their token yet, 
      // but registering it is fine. For now, let's register for everyone, but 
      // especially important for Admins.
      
      try {
        const permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          const requested = await PushNotifications.requestPermissions();
          if (requested.receive !== 'granted') {
            console.log('User denied push notification permissions.');
            return;
          }
        } else if (permStatus.receive !== 'granted') {
          console.log('Push notification permissions are denied.');
          return;
        }

        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();

        PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token: ' + token.value);
          if (isMounted) setFcmToken(token.value);
          
          // Save this token to Supabase for the current user so we can message them
          if (isAdmin || userRole === 'hr_admin') {
             const authData = JSON.parse(localStorage.getItem('kwsb_local_auth') || '{}');
             const adminEmail = authData.email || authData.user?.email;
             if (adminEmail) {
                // Update the token in department_users_settings table
                await supabase
                  .from('department_users_settings')
                  .update({ fcm_token: token.value })
                  .eq('email', adminEmail);
             }
          } else {
             // For standard HRMS employees
             const empId = localStorage.getItem('kwsb_hrms_emp_id');
             if (empId) {
                await supabase
                  .from('hrms_employees')
                  .update({ fcm_token: token.value })
                  .eq('id', empId);
             }
          }
        });

        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Error on registration: ', JSON.stringify(error));
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received: ' + JSON.stringify(notification));
          // We can show a local toast here if the app is already open
          toast({
            title: notification.title || 'New Notification',
            description: notification.body || '',
            duration: 5000,
          });
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed: ' + JSON.stringify(notification));
          // Handle clicking on the notification
        });

      } catch (e) {
        console.error('Push notification registration failed', e);
      }
    };

    registerPushNotifications();

    return () => {
      isMounted = false;
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
  }, [isAdmin, userRole, userName]);

  return { fcmToken };
}
