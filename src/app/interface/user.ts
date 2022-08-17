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
  userIdImage: string | null;
}

export interface ITempImage {
  userIdImage: string;
  vehicleImages: ITempVehilceImage[];
}

interface ITempVehilceImage {
  vehicleImage: string;
  lpnImage: string;
}

export interface ITempTarget {
  userIdImage: HTMLInputElement | null;
  vehicleImages: ITempVehicleTarget[];
}

interface ITempVehicleTarget {
  vehicleImage: HTMLInputElement | null;
  lpnImage: HTMLInputElement | null;
}
