import { IVehicle } from './vehicle';
import { Feature, Point, LineString, GeoJsonProperties } from 'geojson';
import { EEntityStatus } from './entity-status';

export interface IRide {
  id: string | null;
  uid: string;
  startPoint: Feature<Point, GeoJsonProperties>;
  endPoint: Feature<Point, GeoJsonProperties>;
  path: Feature<LineString, GeoJsonProperties>;
  distance: number;
  startTime: Date;
  endTime: Date;
  vehicle: IVehicle;
  criterions: string[];
  note: string | null;
  status: EEntityStatus;
}
