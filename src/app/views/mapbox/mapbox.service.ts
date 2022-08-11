import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IRide } from 'src/app/interface/ride';
import { IRideRequestDto } from 'src/app/interface/ride-request-dto';
import { IRideResponseDto } from '../../interface/ride-reponse-dto';
@Injectable({
  providedIn: 'root',
})
export class MapboxService {
  private API_URL_RIDE: string = environment.apiUrl + '/ride';
  constructor(private http: HttpClient) {}

  createRide(formValue: any): Observable<IRide> {
    const ride: IRide = formValue as IRide;
    return this.http.post<IRide>(`${this.API_URL_RIDE}/create`, ride);
  }

  getRidesByUid(uid: string): Observable<IRide[]> {
    return this.http.get<IRide[]>(`${this.API_URL_RIDE}/${uid}`);
  }

  findRides(rideRequestDto: IRideRequestDto): Observable<IRideResponseDto[]> {
    return this.http.post<IRideResponseDto[]>(
      `${this.API_URL_RIDE}/find`,
      rideRequestDto
    );
  }

  getTimeNow(): string {
    return new Date().toISOString().slice(0, 16);
  }
}
