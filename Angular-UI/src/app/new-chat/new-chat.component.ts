import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-new-chat',  // Correct selector
  templateUrl: './new-chat.component.html',
  styleUrls: ['./new-chat.component.css']
})
export class NewChatComponent {
  chatName: string = '';

  @Output() newChat = new EventEmitter<string>();

  createChat() {
    if (this.chatName.trim()) {
      this.newChat.emit(this.chatName);
      this.chatName = '';
    }
  }
}




