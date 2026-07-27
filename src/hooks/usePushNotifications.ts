import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const usePushNotifications = (userRole: string | null) => {
  useEffect(() => {
    if (Capacitor.isNativePlatform() && userRole) {
      registerPush(userRole);
    }
  }, [userRole]);

  const registerPush = async (role: string) => {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('User denied push notification permission');
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      // Send this token to Supabase
      if (role) {
        // Upsert logic: first check if token exists to avoid duplicates
        const { data, error } = await supabase
          .from('fcm_tokens')
          .select('id')
          .eq('token', token.value)
          .single();
          
        if (!data) {
          await supabase.from('fcm_tokens').insert({
            user_role: role,
            token: token.value
          });
          console.log("Token saved to Supabase");
        }
      }
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
        toast(notification.title || 'New Notification', {
          description: notification.body,
        });
      },
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      },
    );
  };
};
