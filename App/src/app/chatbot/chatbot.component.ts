import { Component } from '@angular/core';
import { ChatbotService } from '../services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {

  // Floating UI state
  isOpen = false;
  showHint = true;
  loading = false;

  userMessage = '';

  messages: { sender: 'bot' | 'user'; text: string }[] = [
    {
      sender: 'bot',
      text: 'Hi! How can I help you today?'
    }
  ];

  constructor(private chatbotService: ChatbotService) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.showHint = false; // hide the hint once the user interacts
  }

  sendMessage() {
    if (!this.userMessage.trim() || this.loading) {
      return;
    }

    if (!localStorage.getItem('authToken')) {
      this.messages.push({
        sender: 'bot',
        text: 'Your sign-in session needs to be refreshed. Please log out and sign in again, then retry.'
      });
      this.userMessage = '';
      return;
    }

    const message = this.userMessage.trim();

    // Take the last few messages as history BEFORE adding the new one
    const history = this.messages
      .slice(-6)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));
    const today = this.localDateKey(new Date());
    const events = this.getTodayEvents(today);

    // Add user message
    this.messages.push({ sender: 'user', text: message });

    // Clear input and show loading
    this.userMessage = '';
    this.loading = true;

    this.chatbotService.sendMessage({ message, history, today, events }).subscribe({

      next: (response) => {
        let text = 'I received your message, but got an empty reply.';
        if (typeof response?.reply === 'string') {
          text = response.reply;
        } else if (response?.reply && typeof response.reply === 'object') {
          text = response.reply.message || response.reply.text || response.reply.content || JSON.stringify(response.reply);
        } else if (typeof response?.message === 'string') {
          text = response.message;
        } else if (typeof response === 'string') {
          text = response;
        }
        this.messages.push({ sender: 'bot', text });
        this.loading = false;
      },

      error: (error) => {
        console.error(error);
        let errorText = 'Sorry, something went wrong.';
        if (typeof error?.error === 'string') {
          errorText = error.error;
        } else if (typeof error?.error?.error === 'string') {
          errorText = error.error.error;
        } else if (typeof error?.error?.message === 'string') {
          errorText = error.error.message;
        } else if (typeof error?.error?.error?.message === 'string') {
          errorText = error.error.error.message;
        } else if (typeof error?.message === 'string') {
          errorText = error.message;
        }
        this.messages.push({
          sender: 'bot',
          text: errorText
        });
        this.loading = false;
      }

    });
  }

  private localDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getTodayEvents(today: string): { title: string; date: string }[] {
    const savedEvents = localStorage.getItem('events');
    if (!savedEvents) return [];

    try {
      const parsedEvents: unknown = JSON.parse(savedEvents);
      if (!Array.isArray(parsedEvents)) {
        console.error('Saved calendar events are not a list.');
        return [];
      }

      return parsedEvents
        .filter((event: any) => String(event?.date ?? event?.Date ?? '').slice(0, 10) === today)
        .map((event: any) => ({
          title: String(event?.title ?? event?.Title ?? event?.name ?? event?.Name ?? 'Untitled event').slice(0, 250),
          date: today
        }))
        .slice(0, 50);
    } catch (error) {
      console.error('Failed to read saved calendar events for chatbot:', error);
      return [];
    }
  }
}