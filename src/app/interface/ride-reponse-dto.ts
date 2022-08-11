import { Point, LineString } from 'geojson';
import { EEntityStatus } from './entity-status';
import { ICriteria } from './ride';
import { IUser } from './user';
import { IVehicle } from './vehicle';
export interface IRideResponseDto {
  _id: string;
  startPoint: Point;
  endPoint: Point;
  path: LineString;
  startTime: string;
  endTime: string;
  distance: number;
  user: IUser;
  vehicle: IVehicle;
  note: string;
  criterions: ICriteria[];
  status: EEntityStatus;
}
