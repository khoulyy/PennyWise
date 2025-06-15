import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot-modal',
  standalone: true,
  imports:[CommonModule,FormsModule],
  templateUrl: './chatbot-modal.component.html',
  styleUrl: './chatbot-modal.component.css',
})
export class ChatbotModalComponent {
  isOpen = false;
  messages: { role: string; content: string }[] = [];
  userInput = '';
  loading = false;

  // Common preloaded questions
  commonQuestions = [
    'How can I track my expenses effectively?',
    'What’s the best way to save money each month?',
    'Give me budgeting tips for students.',
    'How can I reduce unnecessary spending?',
    'What’s the 50/30/20 rule in budgeting?',
  ];

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  sendCommonQuestion(question: string) {
    this.userInput = question;
    this.sendMessage();
  }

  async sendMessage() {
    if (!this.userInput.trim()) return;

    const userMessage = { role: 'USER', content: this.userInput };
    this.messages.push(userMessage);
    this.userInput = '';
    this.loading = true;

    try {
      const response = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer djwltfUdLPlDovgZIcbHkBEjLEokWqW3xCXW8zDg', // Replace this with your key
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'command-r-plus',
          message: userMessage.content,
          chat_history: this.messages.map(msg => ({
            role: msg.role,
            message: msg.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.text) {
        throw new Error(data.message || 'Failed to get a response');
      }

      this.messages.push({ role: 'CHATBOT', content: data.text.trim() });
    } catch (err: any) {
      console.error(err);
      const message =
        err?.message || (typeof err === 'object' ? JSON.stringify(err) : 'Unknown error');
      this.messages.push({ role: 'CHATBOT', content: '❌ ' + message });
    } finally {
      this.loading = false;
    }
  }
}

