import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  FindShortUserInfoResponse,
  FindUserByUidRequest,
  FindUserRequest,
  FindUsersResponse,
  SaveUserRequest,
  UpdateStatusRequest,
  UpdateUserRequest,
  UserDto,
} from '../interface/user';
import { Observable } from 'rxjs';
import { FindByIdRequest } from '../interface/ride';
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

  updateUser(body: UpdateUserRequest): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.API_USER_URL}/update`, body);
  }

  updateUserStatus(body: UpdateStatusRequest): Observable<boolean> {
    return this.http.post<boolean>(`${this.API_USER_URL}/update-status`, body);
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
    const body: FindByIdRequest = { id: id };
    return this.http.post<UserDto>(`${this.API_USER_URL}/find-by-id`, body);
  }

  findShortUserInfo(id: string): Observable<FindShortUserInfoResponse> {
    const body: FindByIdRequest = { id: id };
    return this.http.post<FindShortUserInfoResponse>(
      `${this.API_USER_URL}/find-short-info-by-id`,
      body
    );
  }
}
