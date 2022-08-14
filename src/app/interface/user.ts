import { IVehicle } from './vehicle';
import { EEntityStatus } from './entity-status';
export interface IUser {
  id: string | null;
  uid: string;
  gender: string | null;
  photoUrl: string;
  dob: Date | null;
  fullName: string | null;
  phone: string | null;
  email: string;
  vehicles: IVehicle[] | null;
  status: EEntityStatus;
}
