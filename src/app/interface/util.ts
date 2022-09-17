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
  FORM_INVALID: '1111',
  ONE_RIDE_ACTIVE: '8888',
  NOT_FOUND: '0008',
  INTERNAL_SYSTEM_ERROR: '9999',
  START_TIME_MUST_BE_AFTER_10_MINUTES: '7777',
  START_TIME_MUST_BE_AFTER_END_TIME: '7778',
  UPLOAD_IMAGE_FAIL: '9991',
  LOAD_USER_LOCATION_FAIL: '5551',
};

export interface DataTableState {
  id: string;
  state: string;
}
