import { HttpClient, HttpContext } from '@angular/common/http';
import { Component } from '@angular/core';
import { SKIP_GLOBAL_LOADING } from '../services/loading.interceptor';

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

  constructor(private http: HttpClient) {}

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

    this.http.post<any>(
      '/api/chat',
      { message, history, today, events },
      { context: new HttpContext().set(SKIP_GLOBAL_LOADING, true) }
    ).subscribe({

      next: (response) => {
        this.messages.push({ sender: 'bot', text: response.reply });
        this.loading = false;
      },

      error: (error) => {
        console.error(error);
        this.messages.push({
          sender: 'bot',
          text: error.error?.error || 'Sorry, something went wrong.'
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