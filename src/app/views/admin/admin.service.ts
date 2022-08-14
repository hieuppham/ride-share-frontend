import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { IUser } from '../../interface/user';
import { IRideResponseDto } from 'src/app/interface/ride-reponse-dto';
import { IRideRequestDto } from 'src/app/interface/ride-request-dto';
import { IRequestUpdateStatusDto } from '../../interface/request-update-status-dto';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private API_URL_ADMIN: string = `${environment.apiUrl}/admin`;
  constructor(private http: HttpClient) {}

  // getUserByUID(uid: string): Observable<IUser> {
  //   return this.http.get<IUser>(this.API_URL_USER + `/${uid}`);
  // }

  getAllUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.API_URL_ADMIN + '/user/get-all');
  }

  getAllRides(): Observable<IRideResponseDto[]> {
    return this.http.get<IRideResponseDto[]>(
      this.API_URL_ADMIN + '/ride/get-all'
    );
  }

  updateUserStatus(
    requestUpdateStatus: IRequestUpdateStatusDto
  ): Observable<boolean> {
    return this.http.put<boolean>(
      this.API_URL_ADMIN + '/user/update-status',
      requestUpdateStatus
    );
  }

  updateRideStatus(
    requestUpdateStatus: IRequestUpdateStatusDto
  ): Observable<boolean> {
    return this.http.put<boolean>(
      this.API_URL_ADMIN + '/ride/update-status',
      requestUpdateStatus
    );
  }
}
