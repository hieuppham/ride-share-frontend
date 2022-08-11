import { EEntityStatus } from './entity-status';
import { ICriteria } from './ride';

export interface IRideRequestDto {
  startCoordinates: number[] | null;
  endCoordinates: number[] | null;
  maxDistance: number | null;
  startTime: string | null;
  vehicleType: string | null;
  criterions: ICriteria[] | null;
  status: EEntityStatus;
}
