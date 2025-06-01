import { Injectable } from '@nestjs/common';
import { firebaseAdmin } from './firebase/firebase.config';

@Injectable()
export class PushNotificationService {
  async sendNotification(token: string, title: string, message: string) {
    try {
      const payload = {
        notification: {
          title,
          body: message,
        },
        token,
      };

      const response = await firebaseAdmin.messaging().send(payload);
      return { success: true, response };
    } catch (error) {
      console.error('FCM Error:', error);
      return { success: false, error };
    }
  }
}
