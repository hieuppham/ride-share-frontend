import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { FindUsersAdminResponse, UserDto } from '../../interface/user';
import { FindRidesAdminResponse } from 'src/app/interface/ride';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private API_URL_ADMIN: string = `${environment.apiUrl}/admin`;
  constructor(private http: HttpClient) {}

  findAllUsers(): Observable<FindUsersAdminResponse[]> {
    return this.http.post<FindUsersAdminResponse[]>(
      `${this.API_URL_ADMIN}/user/find-all`,
      {}
    );
  }

  findAllRides(): Observable<FindRidesAdminResponse[]> {
    return this.http.post<FindRidesAdminResponse[]>(
      `${this.API_URL_ADMIN}/ride/find-all`,
      {}
    );
  }
}
