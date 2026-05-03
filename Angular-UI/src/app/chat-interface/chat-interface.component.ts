import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../api.service';


@Component({
  selector: 'app-chat-interface',  // Correct selector
  templateUrl: './chat-interface.component.html',
  styleUrls: ['./chat-interface.component.css']
})
export class ChatInterfaceComponent implements OnInit {
  @Input() chatId!: number;
  @Input() chatMessages: string[] = [];

  query: string = '';
  response: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {}

  sendQuery() {
    if (!this.query.trim()) return;

    this.apiService.askAi(this.query).subscribe(response => {
      this.chatMessages.push(`You: ${this.query}`);
      this.chatMessages.push(`AI: ${response}`);
      this.query = '';
    });
  }
}






