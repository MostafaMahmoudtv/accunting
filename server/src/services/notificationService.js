import { Notification } from '../models/Notification.js';

export const createNotification = async ({ recipient, title, body, type = 'general', link, relatedEntity }) => {
  try {
    if (!recipient) return;
    await Notification.create({ recipient, title, body, type, link, relatedEntity });
  } catch (err) {
    console.error('Failed to create notification', err.message);
  }
};
