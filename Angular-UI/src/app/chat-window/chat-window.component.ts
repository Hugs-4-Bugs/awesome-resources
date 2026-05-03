import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';


interface Chat {
  id: number;
  name: string;
  messages: string[];
}

// @Component({
//   selector: 'app-chat-window',  // Ensure correct selector
//   templateUrl: './chat-window.component.html',
//   styleUrls: ['./chat-window.component.css']
// })

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
  chats: Chat[] = [];
  currentChatId: number = -1;
  newChatName: string = '';
  query: string = '';
  response: string = '';
  searchResults: string[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {}

  // Start a new chat
  createNewChat() {
    const newChat: Chat = {
      id: Date.now(),
      name: this.newChatName || `Chat ${this.chats.length + 1}`,
      messages: []
    };
    this.chats.push(newChat);
    this.currentChatId = newChat.id;
    this.newChatName = '';
  }

  // Rename the current chat
  renameChat(newName: string) {
    const chat = this.chats.find(c => c.id === this.currentChatId);
    if (chat) {
      chat.name = newName;
    }
  }

  // Send a query to the AI and receive a response
  sendQuery() {
    if (!this.query) return;

    this.apiService.askAi(this.query).subscribe(response => {
      this.response = response;
      const chat = this.chats.find(c => c.id === this.currentChatId);
      if (chat) {
        chat.messages.push(`You: ${this.query}`);
        chat.messages.push(`AI: ${response}`);
      }
    });
  }

  // Search the web (just for illustration, can integrate with an actual search API)
  searchWeb() {
    if (!this.query) return;
    this.apiService.streamAi(this.query).subscribe(response => {
      this.searchResults.push(response);
    });
  }
}
