import { EEntityStatus } from './entity-status';

export interface IRideRequestDto {
  startCoordinates: number[] | null;
  endCoordinates: number[] | null;
  maxDistance: number | null;
  startTime: string | null;
  vehicleType: string | null;
  status: EEntityStatus;
}
