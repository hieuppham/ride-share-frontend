import { EEntityStatus } from './entity-status';

export interface IRequestUpdateStatusDto {
  id: string;
  status: EEntityStatus;
}
