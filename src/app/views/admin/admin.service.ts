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
  private API_URL_ADMIN_USER: string = `${environment.apiUrl}/user/admin`;
  private API_URL_USER: string = `${environment.apiUrl}/user`;
  private API_URL_RIDE: string = `${environment.apiUrl}/ride`;
  constructor(private http: HttpClient) {}

  getUserByUID(uid: string): Observable<IUser> {
    return this.http.get<IUser>(this.API_URL_USER + `/${uid}`);
  }

  getAllUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.API_URL_ADMIN_USER);
  }

  getAllRides(rideRequestDto: IRideRequestDto): Observable<IRideResponseDto[]> {
    return this.http.post<IRideResponseDto[]>(
      this.API_URL_RIDE + '/find',
      rideRequestDto
    );
  }

  updateUserStatus(
    requestUpdateStatus: IRequestUpdateStatusDto
  ): Observable<boolean> {
    return this.http.put<boolean>(
      this.API_URL_USER + '/status',
      requestUpdateStatus
    );
  }

  updateRideStatus(
    requestUpdateStatus: IRequestUpdateStatusDto
  ): Observable<boolean> {
    return this.http.put<boolean>(
      this.API_URL_RIDE + '/status',
      requestUpdateStatus
    );
  }
}
