import { IVehicle } from './vehicle';
import { EEntityStatus } from './entity-status';
export interface IUser {
  id: string | null;
  uid: string | null;
  gender: string | null;
  photoUrl: string | null;
  dob: Date | null;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  vehicles: IVehicle[] | null;
  status: EEntityStatus;
}
