import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { IUser } from '../interface/user';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API_USER_URL: string = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  upsertUser(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(this.API_USER_URL, user);
  }

  getUserByUID(uid: string): Observable<IUser> {
    return this.http.get<IUser>(`${this.API_USER_URL}/${uid}`);
  }

  searchUser(what: string): Observable<IUser[]> {
    return this.http.get<IUser[]>(`${this.API_USER_URL}/search?what=${what}`);
  }
}
