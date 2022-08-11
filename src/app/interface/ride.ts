import { IVehicle } from './vehicle';
import { FeatureCollection } from 'geojson';

export interface IRide {
  id: string | null;
  uid: string;
  distance: number;
  startTime: string;
  endTime: string;
  vehicle: IVehicle;
  featureCollection: FeatureCollection;
  criterions: ICriteria[];
  note: string;
}

export interface ICriteria {
  name: string;
  value: string;
}
