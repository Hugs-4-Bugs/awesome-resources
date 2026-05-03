// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent {
//   title = 'Angular-UI';
// }









// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ChatWindowComponent } from './chat-window/chat-window.component';
// import { NewChatComponent } from './new-chat/new-chat.component';

// @Component({
//   selector: 'app-root',
//   standalone: true, // <-- Add this line
//   imports: [CommonModule, ChatWindowComponent, NewChatComponent], // <-- Import the components here
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent {
//   title = 'AI Chat Interface';
// }







import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,  // Marked as standalone component
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'AI Chat Interface';
}
