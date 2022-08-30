import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  FindUserByIdRequest,
  FindUserByUidRequest,
  FindUserRequest,
  FindUsersResponse,
  SaveUserRequest,
  UserDto,
} from '../interface/user';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API_USER_URL: string = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  saveUser(uid: string, email: string, photoURL: string): Observable<UserDto> {
    const body: SaveUserRequest = {
      uid: uid,
      email: email,
      photoURL: photoURL,
    };
    return this.http.post<UserDto>(`${this.API_USER_URL}/save`, body);
  }

  findUserByUid(uid: string): Observable<UserDto> {
    const body: FindUserByUidRequest = { uid: uid };
    return this.http.post<UserDto>(`${this.API_USER_URL}/find-by-uid`, body);
  }

  findUsersByText(text: string): Observable<FindUsersResponse[]> {
    const body: FindUserRequest = { text: text };
    return this.http.post<FindUsersResponse[]>(
      `${this.API_USER_URL}/search`,
      body
    );
  }

  findUserById(id: string): Observable<UserDto> {
    const body: FindUserByIdRequest = { id: id };
    return this.http.post<UserDto>(`${this.API_USER_URL}/find-by-id`, body);
  }
}
