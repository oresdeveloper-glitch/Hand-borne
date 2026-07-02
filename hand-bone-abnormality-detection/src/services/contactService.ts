import type { ContactMessage } from '../types';

const CONTACTS_KEY = 'hba_contacts';
const FORM_SUBMIT_URL = 'https://formsubmit.co/ajax/rozethdaudi@gmail.com';

const generateId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const contactService = {
  async submitMessage(data: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): Promise<ContactMessage> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('Invalid email address');
    }
    if (!data.subject || data.subject.trim().length < 5) {
      throw new Error('Subject must be at least 5 characters');
    }
    if (!data.message || data.message.trim().length < 20) {
      throw new Error('Message must be at least 20 characters');
    }

    const message: ContactMessage = {
      ...data,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    const messages = this.getAllMessages();
    localStorage.setItem(CONTACTS_KEY, JSON.stringify([message, ...messages]));

    try {
      await fetch(FORM_SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          _subject: `${data.name} - ${data.subject}`,
          _replyto: data.email,
          _template: 'table',
          message: data.message,
        }),
      });
    } catch {
      // silent
    }

    return message;
  },

  getAllMessages(): ContactMessage[] {
    try {
      const stored = localStorage.getItem(CONTACTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  markAsRead(id: string): void {
    const messages = this.getAllMessages();
    const updated = messages.map((m) =>
      m.id === id ? { ...m, status: 'read' as const } : m
    );
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
  },

  deleteMessage(id: string): void {
    const messages = this.getAllMessages().filter((m) => m.id !== id);
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(messages));
  },
};
