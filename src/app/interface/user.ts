export interface UserDto {
  id: string;
  uid: string;
  email: string;
  phone: string;
  dob: Date;
  photoURL: string;
  fullName: string;
  userIdPhotoURL: string;
  vehicles: VehicleDto[];
  status: string;
  gender: string;
}

export interface SaveUserRequest {
  uid: string;
  email: string;
  photoURL: string;
}

export interface UpdateUserRequest {
  id: string;
  dob: Date;
  fullName: string;
  gender: string;
  phone: string;
  userIdPhotoURL: string;
  vehicles: VehicleDto[];
}

export interface VehicleDto {
  id: number;
  type: string;
  name: string;
  lpn: string;
  image: string;
  lpnImage: string;
}

export interface FindUserRequest {
  text: string;
}

export interface UpdateStatusRequest {
  id: string;
  status: string;
  sendEmail: boolean;
}

export interface FindUserByUidRequest {
  uid: string;
}

export interface FindShortUserInfoResponse {
  id: string;
  photoURL: string;
}

export interface FindUsersResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  photoURL: string;
}

export interface FindUsersAdminResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  photoURL: string;
  status: string;
}

export interface ITempImage {
  userIdImage: string;
  vehicleImages: TempVehicleImage[];
}

export interface TempVehicleImage {
  id: number;
  image: string;
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
