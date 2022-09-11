export interface Confirm {
  title: string;
  dismiss: string;
  accept: string;
  action: string;
  target?: string | number | any;
  data?: string | number | boolean | any;
}

export interface Error {
  code: string;
  message: string;
}

export interface ResponseBody {
  code: string;
  message: string;
  data: any;
}

export interface ImageTarget {
  userIdPhotoURL: string | undefined;
  userIdPhotoImage: HTMLInputElement | undefined;
  vehilceImage: VehicleImageTarget[];
}

export interface VehicleImageTarget {
  id: number;
  lpnImageURL: string | undefined;
  imageURL: string | undefined;
  lpnImage: HTMLInputElement | undefined;
  image: HTMLInputElement | undefined;
}

export interface ResponseCode {
  [key: string]: string;
}

export const RESPONSE_CODE: ResponseCode = {
  SUCCESS: '0000',
  ONE_RIDE_ACTIVE: '8888',
};
