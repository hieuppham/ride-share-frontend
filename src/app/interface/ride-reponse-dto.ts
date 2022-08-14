import { Feature, Point, LineString, GeoJsonProperties } from 'geojson';
import { EEntityStatus } from './entity-status';
import { IUser } from './user';
import { IVehicle } from './vehicle';
export interface IRideResponseDto {
  _id: string;
  startPoint: Feature<Point, GeoJsonProperties>;
  endPoint: Feature<Point, GeoJsonProperties>;
  path: Feature<LineString, GeoJsonProperties>;
  startTime: Date;
  endTime: Date;
  distance: number;
  user: IUser;
  vehicle: IVehicle;
  note: string;
  status: EEntityStatus;
  criterions: string[];
}
