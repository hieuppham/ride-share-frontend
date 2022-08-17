import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IRideResponseDto } from 'src/app/interface/ride-reponse-dto';
import { IRide } from 'src/app/interface/ride';
import { IBoundRequestDto } from '../../interface/bound-request-dto';
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

  getAllRides(): Observable<IRideResponseDto[]> {
    return this.http.get<IRideResponseDto[]>(this.API_URL_RIDE + '/find');
  }

  getTimeNow(): string {
    return new Date().toISOString().slice(0, 16);
  }

  getByBound(
    bottomLeft: number[],
    upperRight: number[]
  ): Observable<IRideResponseDto[]> {
    const boundRequest = {
      bottomLeft: bottomLeft,
      upperRight: upperRight,
    } as IBoundRequestDto;
    return this.http.post<IRideResponseDto[]>(
      this.API_URL_RIDE + '/find-by-bound',
      boundRequest
    );
  }
}
