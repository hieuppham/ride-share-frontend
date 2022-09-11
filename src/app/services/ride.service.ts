import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import {
  FindRidesByBoundRequest,
  FindRidesResponse,
  RideDto,
  SaveRideRequest,
  FindByIdRequest,
  FindRideDetailResponse,
} from '../interface/ride';
import { UpdateStatusRequest } from '../interface/user';
import { ResponseBody } from '../interface/util';
@Injectable({
  providedIn: 'root',
})
export class RideService {
  private API_URL_RIDE: string = environment.apiUrl + '/ride';
  constructor(private http: HttpClient) {}

  saveRide(request: SaveRideRequest): Observable<ResponseBody> {
    return this.http.post<ResponseBody>(`${this.API_URL_RIDE}/save`, request);
  }

  updateRideStatus(request: UpdateStatusRequest): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.API_URL_RIDE}/update-status`,
      request
    );
  }

  findRideById(id: string): Observable<RideDto> {
    const request: FindByIdRequest = { id: id };
    return this.http.post<RideDto>(`${this.API_URL_RIDE}/find-by-id`, request);
  }

  findRidesByUserId(id: string): Observable<FindRideDetailResponse[]> {
    const request: FindByIdRequest = { id: id };
    return this.http.post<FindRideDetailResponse[]>(
      `${this.API_URL_RIDE}/find-by-user-id`,
      request
    );
  }

  findAllRides(): Observable<FindRidesResponse[]> {
    return this.http.post<FindRidesResponse[]>(
      `${this.API_URL_RIDE}/find-all`,
      {}
    );
  }

  findRideDetailById(id: string): Observable<FindRideDetailResponse> {
    const request: FindByIdRequest = { id: id };
    return this.http.post<FindRideDetailResponse>(
      `${this.API_URL_RIDE}/find-detail-by-id`,
      request
    );
  }

  findSingleRideById(id: string): Observable<FindRidesResponse> {
    const request: FindByIdRequest = { id: id };
    return this.http.post<FindRidesResponse>(
      `${this.API_URL_RIDE}/find-single-ride-by-id`,
      request
    );
  }

  findRidesByBound(
    bottomLeft: number[],
    upperRight: number[]
  ): Observable<FindRidesResponse[]> {
    const boundRequest = {
      bottomLeft: bottomLeft,
      upperRight: upperRight,
    } as FindRidesByBoundRequest;
    return this.http.post<FindRidesResponse[]>(
      `${this.API_URL_RIDE}/find-by-bound`,
      boundRequest
    );
  }
}
