import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ChatWindowComponent } from './chat-window/chat-window.component'; // Correct import path
import { NewChatComponent } from './new-chat/new-chat.component'; // Correct import path
import { ChatInterfaceComponent } from './chat-interface/chat-interface.component'; // Correct import path

@NgModule({
  declarations: [
    AppComponent,
    ChatWindowComponent,   // Declare ChatWindowComponent
    NewChatComponent,      // Declare NewChatComponent
    ChatInterfaceComponent // Declare ChatInterfaceComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent] // Bootstrapping AppComponent
})
export class AppModule { }





