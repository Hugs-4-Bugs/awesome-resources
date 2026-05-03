// import { Injectable } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class ApiService {
//   private baseUrl = environment.apiBaseUrl;

//   constructor(private http: HttpClient) {}

//   // Method to ask AI a question
//   askAi(query: string): Observable<string> {
//     const params = new HttpParams().set('query', query);
//     return this.http.get<string>(`${this.baseUrl}/api/v1/ai`, { params });
//   }

//   // Method for streaming AI response
//   streamAi(query: string): Observable<string> {
//     const params = new HttpParams().set('query', query);
//     return this.http.get<string>(`${this.baseUrl}/api/v1/ai/stream`, { params });
//   }
// }





import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  askAi(query: string): Observable<string> {
    return this.http.get<string>(`/api/v1/ai?query=${query}`);
  }

  streamAi(query: string): Observable<string> {
    return this.http.get<string>(`/api/v1/ai/stream?query=${query}`);
  }
}
