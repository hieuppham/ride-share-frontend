import { Feature, LineString, GeoJsonProperties } from 'geojson';
import { Route } from './route';

export interface RideDto {
  id: string | null;
  userId: string;
  route: Route;
  startTime: Date;
  endTime: Date;
  vehicle: VehicleDto;
  criterions: string[];
  note: string;
  status: string;
}

export interface FindRidesAdminResponse {
  id: string;
  startPointTitle: string;
  endPointTitle: string;
  startTime: Date;
  endTime: Date;
  distance: number;
  status: string;
}
export interface FindRideDetailResponse {
  id: string;
  startTime: Date;
  endTime: Date;
  startPointTitle: string;
  endPointTitle: string;
  distance: number;
  status: string;
  note: string;
  criterions: string[];
  vehicle: VehicleDto;
  user: UserDto;
}

export interface FindByIdRequest {
  id: string;
}

export interface SaveRideRequest {
  uid: string;
  startTime: Date;
  endTime: Date;
  note: string;
  criterions: string[];
  vehicleId: number;
  route: Route;
}

export interface FindByIdRequest {
  id: string;
}

export interface FindRidesByBoundRequest {
  bottomLeft: number[];
  upperRight: number[];
}

export interface FindRidesResponse {
  id: string;
  startTime: Date;
  endTime: Date;
  note: string;
  criterions: string[];
  vehicleType: string;
  photoURL: string;
  status: string;
  fullName: string;
  distance: number;
  path: Feature<LineString, GeoJsonProperties>;
}

export interface VehicleDto {
  id: number;
  type: string;
  name: string;
  lpn: string;
}

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  photoURL: string;
}
